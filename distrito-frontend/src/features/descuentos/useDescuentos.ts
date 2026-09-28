import { useQuery } from "@tanstack/react-query";
import { api } from "../../lib/api";
import type { Descuento } from "../../types/descuento";

export function useDescuentos() {
  return useQuery<Descuento[]>({
    queryKey: ["descuentos"],
    queryFn: async () => {
      const { data } = await api.get<Descuento[]>("/descuentos");
      return data;
    },
    staleTime: 1000 * 60 * 10,
  });
}
