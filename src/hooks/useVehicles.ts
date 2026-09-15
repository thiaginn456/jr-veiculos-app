// Hook que coordena filtros, carregamento, erros e paginacao de veiculos.
import { useState, useEffect } from 'react';
import { Vehicle, VehicleFilters, PaginatedResponse } from '@/types';
import { vehicleService } from '@/services/vehicleService';

interface UseVehiclesReturn {
  vehicles: Vehicle[];
  isLoading: boolean;
  error: string | null;
  paginacao: PaginatedResponse<Vehicle>['paginacao'] | null;
  fetchVehicles: (filters?: VehicleFilters) => Promise<void>;
  refetch: () => Promise<void>;
}

export function useVehicles(initialFilters?: VehicleFilters): UseVehiclesReturn {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [paginacao, setPaginacao] = useState<PaginatedResponse<Vehicle>['paginacao'] | null>(null);
  const [filters, setFilters] = useState(initialFilters);

  const fetchVehicles = async (newFilters?: VehicleFilters) => {
    try {
      setIsLoading(true);
      setError(null);

      const filterToUse = newFilters || filters;
      const response = await vehicleService.getVehicles(filterToUse);

      setVehicles(response.dados);
      setPaginacao(response.paginacao);
      setFilters(filterToUse);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao buscar veículos';
      setError(message);
      console.error(message, err);
    } finally {
      setIsLoading(false);
    }
  };

  const refetch = async () => {
    await fetchVehicles(filters);
  };

  useEffect(() => {
    fetchVehicles(initialFilters);
  }, []);

  return {
    vehicles,
    isLoading,
    error,
    paginacao,
    fetchVehicles,
    refetch,
  };
}
