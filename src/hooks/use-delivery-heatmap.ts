import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { startOfDay, endOfDay } from "date-fns";
import { useEffect, useState } from "react";

export interface CEPData {
  zipCode: string;
  neighborhood: string;
  city: string;
  state: string;
  orderCount: number;
  revenue: number;
  averageTicket: number;
  percentOfTotal: number;
}

export interface HeatmapPoint {
  lat: number;
  lng: number;
  intensity: number;
  zipCode: string;
  neighborhood: string;
}

interface GeoCache {
  [cep: string]: { lat: number; lng: number } | null;
}

const geocodeCache: GeoCache = {};

async function geocodeCEP(cep: string): Promise<{ lat: number; lng: number } | null> {
  const clean = cep.replace(/\D/g, "");
  if (geocodeCache[clean] !== undefined) return geocodeCache[clean];

  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?postalcode=${clean}&country=BR&format=json&limit=1`,
      { headers: { "User-Agent": "VelaraPDV/1.0" } }
    );
    const data = await res.json();
    if (data && data.length > 0) {
      const result = { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
      geocodeCache[clean] = result;
      return result;
    }
    geocodeCache[clean] = null;
    return null;
  } catch {
    geocodeCache[clean] = null;
    return null;
  }
}

export const useDeliveryHeatmapData = (userId: string, startDate: Date, endDate: Date) => {
  return useQuery({
    queryKey: ["delivery-heatmap-data", userId, startDate, endDate],
    queryFn: async () => {
      const { data: orders, error } = await supabase
        .from("delivery_orders")
        .select("id, total, delivery_address_id")
        .eq("user_id", userId)
        .neq("status", "cancelled")
        .gte("created_at", startOfDay(startDate).toISOString())
        .lte("created_at", endOfDay(endDate).toISOString());

      if (error) throw error;

      const addressIds = [...new Set(orders.filter(o => o.delivery_address_id).map(o => o.delivery_address_id!))];
      if (addressIds.length === 0) return { cepData: [] as CEPData[], totalOrders: 0 };

      const { data: addresses, error: addrError } = await supabase
        .from("delivery_addresses")
        .select("id, zip_code, neighborhood, city, state")
        .in("id", addressIds);

      if (addrError) throw addrError;

      const addressMap = new Map(addresses.map(a => [a.id, a]));

      const cepStats = new Map<string, { neighborhood: string; city: string; state: string; count: number; revenue: number }>();

      orders.forEach(order => {
        if (!order.delivery_address_id) return;
        const addr = addressMap.get(order.delivery_address_id);
        if (!addr || !addr.zip_code) return;

        const cep = addr.zip_code.replace(/\D/g, "");
        const current = cepStats.get(cep) || {
          neighborhood: addr.neighborhood || "",
          city: addr.city || "",
          state: addr.state || "",
          count: 0,
          revenue: 0,
        };
        cepStats.set(cep, {
          ...current,
          count: current.count + 1,
          revenue: current.revenue + Number(order.total),
        });
      });

      const totalOrders = orders.length;

      const cepData: CEPData[] = Array.from(cepStats.entries())
        .map(([zipCode, stats]) => ({
          zipCode,
          neighborhood: stats.neighborhood,
          city: stats.city,
          state: stats.state,
          orderCount: stats.count,
          revenue: stats.revenue,
          averageTicket: stats.count > 0 ? stats.revenue / stats.count : 0,
          percentOfTotal: totalOrders > 0 ? (stats.count / totalOrders) * 100 : 0,
        }))
        .sort((a, b) => b.orderCount - a.orderCount);

      return { cepData, totalOrders };
    },
  });
};

export const useGeocodedPoints = (cepData: CEPData[]) => {
  const [points, setPoints] = useState<HeatmapPoint[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (cepData.length === 0) {
      setPoints([]);
      return;
    }

    let cancelled = false;
    setIsLoading(true);

    async function resolve() {
      const results: HeatmapPoint[] = [];
      for (const item of cepData) {
        if (cancelled) return;
        const coords = await geocodeCEP(item.zipCode);
        if (coords) {
          results.push({ lat: coords.lat, lng: coords.lng, intensity: item.orderCount, zipCode: item.zipCode, neighborhood: item.neighborhood });
        }
        // rate limit
        await new Promise(r => setTimeout(r, 300));
      }
      if (!cancelled) {
        setPoints(results);
        setIsLoading(false);
      }
    }

    resolve();
    return () => { cancelled = true; };
  }, [cepData]);

  return { points, isLoading };
};
