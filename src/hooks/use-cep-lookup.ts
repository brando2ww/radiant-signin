import { useState } from "react";
import { toast } from "sonner";

interface CEPData {
  cep: string;
  logradouro: string;
  complemento: string;
  bairro: string;
  localidade: string;
  uf: string;
  ibge: string;
  erro?: boolean;
}

export function useCEPLookup() {
  const [isLoading, setIsLoading] = useState(false);

  const formatCEP = (cep: string) => {
    return cep.replace(/\D/g, '');
  };

  const lookupCEP = async (cep: string): Promise<CEPData | null> => {
    const cleanCEP = formatCEP(cep);
    
    if (cleanCEP.length !== 8) {
      toast.error("CEP deve conter 8 dígitos");
      return null;
    }

    setIsLoading(true);
    
    try {
      const response = await fetch(`https://viacep.com.br/ws/${cleanCEP}/json/`);
      
      if (!response.ok) {
        throw new Error("Erro ao buscar CEP");
      }

      const data: CEPData = await response.json();
      
      if (data.erro) {
        toast.error("CEP não encontrado");
        return null;
      }

      return data;
    } catch (error) {
      console.error("Erro ao buscar CEP:", error);
      toast.error("Erro ao buscar CEP. Verifique sua conexão.");
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    lookupCEP,
    isLoading,
  };
}
