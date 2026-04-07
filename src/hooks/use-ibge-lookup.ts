import { useState, useEffect } from "react";

interface IBGEState {
  id: number;
  sigla: string;
  nome: string;
}

interface IBGECity {
  id: number;
  nome: string;
}

const STATES: { sigla: string; nome: string }[] = [
  { sigla: "AC", nome: "Acre" },
  { sigla: "AL", nome: "Alagoas" },
  { sigla: "AP", nome: "Amapá" },
  { sigla: "AM", nome: "Amazonas" },
  { sigla: "BA", nome: "Bahia" },
  { sigla: "CE", nome: "Ceará" },
  { sigla: "DF", nome: "Distrito Federal" },
  { sigla: "ES", nome: "Espírito Santo" },
  { sigla: "GO", nome: "Goiás" },
  { sigla: "MA", nome: "Maranhão" },
  { sigla: "MT", nome: "Mato Grosso" },
  { sigla: "MS", nome: "Mato Grosso do Sul" },
  { sigla: "MG", nome: "Minas Gerais" },
  { sigla: "PA", nome: "Pará" },
  { sigla: "PB", nome: "Paraíba" },
  { sigla: "PR", nome: "Paraná" },
  { sigla: "PE", nome: "Pernambuco" },
  { sigla: "PI", nome: "Piauí" },
  { sigla: "RJ", nome: "Rio de Janeiro" },
  { sigla: "RN", nome: "Rio Grande do Norte" },
  { sigla: "RS", nome: "Rio Grande do Sul" },
  { sigla: "RO", nome: "Rondônia" },
  { sigla: "RR", nome: "Roraima" },
  { sigla: "SC", nome: "Santa Catarina" },
  { sigla: "SP", nome: "São Paulo" },
  { sigla: "SE", nome: "Sergipe" },
  { sigla: "TO", nome: "Tocantins" },
];

export function useIBGEStates() {
  return STATES;
}

export function useIBGECities(uf: string) {
  const [cities, setCities] = useState<IBGECity[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!uf) {
      setCities([]);
      return;
    }

    setIsLoading(true);
    fetch(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${uf}/municipios?orderBy=nome`)
      .then((res) => res.json())
      .then((data: IBGECity[]) => {
        setCities(data);
      })
      .catch(() => setCities([]))
      .finally(() => setIsLoading(false));
  }, [uf]);

  return { cities, isLoading };
}

export interface ViaCEPStreetResult {
  cep: string;
  logradouro: string;
  complemento: string;
  bairro: string;
  localidade: string;
  uf: string;
}

export async function searchStreetByName(
  uf: string,
  city: string,
  street: string
): Promise<ViaCEPStreetResult[]> {
  if (!uf || !city || !street || street.length < 3) return [];
  try {
    const encodedCity = encodeURIComponent(city);
    const encodedStreet = encodeURIComponent(street);
    const res = await fetch(
      `https://viacep.com.br/ws/${uf}/${encodedCity}/${encodedStreet}/json/`
    );
    if (!res.ok) return [];
    const data = await res.json();
    if (!Array.isArray(data)) return [];
    return data as ViaCEPStreetResult[];
  } catch {
    return [];
  }
}

const SEARCH_TERMS = ["Rua", "Avenida", "Travessa", "Alameda", "Estrada", "Rodovia", "Praça"];

export async function fetchAllNeighborhoods(
  uf: string,
  city: string
): Promise<string[]> {
  if (!uf || !city) return [];
  try {
    const results = await Promise.all(
      SEARCH_TERMS.map((term) => searchStreetByName(uf, city, term))
    );
    const allBairros = results.flat().map((r) => r.bairro).filter(Boolean);
    const unique = [...new Set(allBairros)].sort((a, b) =>
      a.localeCompare(b, "pt-BR")
    );
    return unique;
  } catch {
    return [];
  }
}
