import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import type {
  GeneralSettings,
  FinancialSettings,
  NotificationsSettings,
  SecuritySettings,
} from "@/lib/validations/settings";

interface UserSettings {
  general: GeneralSettings;
  financial: FinancialSettings;
  notifications: NotificationsSettings;
  security: SecuritySettings;
}

const defaultSettings: UserSettings = {
  general: {
    language: "pt-BR",
    date_format: "DD/MM/YYYY",
    time_format: "24h",
    timezone: "America/Sao_Paulo",
    currency: "BRL",
    theme: "system",
    density: "normal",
    sidebar_expanded: false,
  },
  financial: {
    default_payment_method: "credit_card",
    budget_alert_percentage: 80,
    rounding: "nearest",
    credit_card_due_day: 10,
    credit_card_closing_day: 5,
    monthly_budget: 0,
  },
  notifications: {
    transactions: {
      new_income: true,
      new_expense: true,
      edited: false,
      daily_summary: true,
    },
    credit_cards: {
      due_date_days: 3,
      limit_percentage: 80,
      invoice_closed: true,
    },
    tasks: {
      reminder_minutes: 30,
      events: true,
      overdue: true,
    },
    reports: {
      weekly: false,
      monthly: true,
      trends: true,
    },
  },
  security: {
    two_factor_enabled: false,
    auto_logout_minutes: 30,
    hide_values: false,
    require_password_sensitive: true,
  },
};

export function useSettings() {
  const { user } = useAuth();
  const [settings, setSettings] = useState<UserSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const loadSettings = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("user_settings")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setSettings({
          general: {
            language: (data.language as GeneralSettings["language"]) || defaultSettings.general.language,
            date_format: (data.date_format as GeneralSettings["date_format"]) || defaultSettings.general.date_format,
            time_format: (data.time_format as GeneralSettings["time_format"]) || defaultSettings.general.time_format,
            timezone: data.timezone || defaultSettings.general.timezone,
            currency: (data.currency as GeneralSettings["currency"]) || defaultSettings.general.currency,
            theme: (data.theme as GeneralSettings["theme"]) || defaultSettings.general.theme,
            density: (data.density as GeneralSettings["density"]) || defaultSettings.general.density,
            sidebar_expanded: data.sidebar_expanded ?? defaultSettings.general.sidebar_expanded,
          },
          financial: (data.financial_settings as FinancialSettings) || defaultSettings.financial,
          notifications: (data.notifications as NotificationsSettings) || defaultSettings.notifications,
          security: (data.security_settings as SecuritySettings) || defaultSettings.security,
        });
      }
    } catch (error) {
      console.error("Erro ao carregar configurações:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar suas configurações.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [user]);

  const saveSettings = useCallback(
    async (updates: Partial<UserSettings>) => {
      if (!user) return;

      setSaving(true);
      try {
        const newSettings = { ...settings, ...updates };
        setSettings(newSettings);

        const { error } = await supabase.from("user_settings").upsert(
          {
            user_id: user.id,
            language: newSettings.general.language,
            date_format: newSettings.general.date_format,
            time_format: newSettings.general.time_format,
            timezone: newSettings.general.timezone,
            currency: newSettings.general.currency,
            theme: newSettings.general.theme,
            density: newSettings.general.density,
            sidebar_expanded: newSettings.general.sidebar_expanded,
            notifications: newSettings.notifications,
            financial_settings: newSettings.financial,
            security_settings: newSettings.security,
          },
          { onConflict: 'user_id' }
        );

        if (error) throw error;

        toast({
          title: "Salvo com sucesso",
          description: "Suas configurações foram atualizadas.",
        });
      } catch (error) {
        console.error("Erro ao salvar configurações:", error);
        toast({
          title: "Erro",
          description: "Não foi possível salvar suas configurações.",
          variant: "destructive",
        });
      } finally {
        setSaving(false);
      }
    },
    [user, settings]
  );

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  return {
    settings,
    loading,
    saving,
    saveSettings,
    refreshSettings: loadSettings,
  };
}
