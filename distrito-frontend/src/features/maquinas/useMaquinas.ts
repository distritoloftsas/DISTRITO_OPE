import { useQuery } from "@tanstack/react-query";
import { api } from "../../lib/api";
import type { MaquinaResponse } from "../../types/maquina";

export function useMaquinas() {
  return useQuery({
    queryKey: ["maquinas"],
    queryFn: async () => {
      const { data } = await api.get<MaquinaResponse[]>("/maquinas");
      return data;
    },
    refetchInterval: 5000,
  });
}
