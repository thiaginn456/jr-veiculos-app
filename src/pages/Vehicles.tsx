// Pagina publica de estoque com filtros e resultados paginados de veiculos.
import React, { useState, useEffect } from "react";
import {
  ChevronDown,
  RotateCcw,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react";
import { useVehicles } from "@/hooks";
import { vehicleService } from "@/services/vehicleService";
import { VehicleFilters } from "@/types";
import { VehicleCard, Breadcrumbs } from "@/components";
import { useSeo } from "@/lib/seo";

const filterSelectClass =
  "w-full appearance-none rounded-md bg-primary-900 px-4 py-3 font-bold uppercase tracking-wide text-white focus:outline-none focus:ring-2 focus:ring-primary-600";
const filterInputClass =
  "w-full rounded-md bg-primary-900 px-4 py-3 text-sm font-bold text-white placeholder:text-primary-200 focus:outline-none focus:ring-2 focus:ring-primary-600";

const fuelLabels: Record<string, string> = {
  gasolina: "Gasolina",
  diesel: "Diesel",
  etanol: "Etanol",
  flex: "Flex",
  hibrido: "Híbrido",
  eletrico: "Elétrico",
};

const transmissionLabels: Record<string, string> = {
  manual: "Manual",
  automatico: "Automático",
  cvt: "CVT",
};

const categoryLabels: Record<string, string> = {
  sedan: "Sedan",
  hatch: "Hatch",
  suv: "SUV",
  pickup: "Picape",
  utilitario: "Utilitário",
};

export const Vehicles: React.FC = () => {
  const [filters, setFilters] = useState<VehicleFilters>({});
  const { vehicles, isLoading, error, paginacao, fetchVehicles } =
    useVehicles();
  const [filterOptions, setFilterOptions] = useState<{
    marcas: string[];
    modelos: string[];
    modelosPorMarca: Record<string, string[]>;
    anos: number[];
    categorias: string[];
    combustiveis: string[];
    cambios: string[];
  }>({
    marcas: [],
    modelos: [],
    modelosPorMarca: {},
    anos: [],
    categorias: [],
    combustiveis: [],
    cambios: [],
  });
  const [filtersOpen, setFiltersOpen] = useState(false);

  const updateFilter = (changes: Partial<VehicleFilters>) => {
    setFilters((current) => ({ ...current, ...changes, pagina: 1 }));
  };

  const clearFilters = () => setFilters({});

  const modelsForSelectedBrand = filters.marca
    ? filterOptions.modelosPorMarca[
        filters.marca.trim().toLocaleLowerCase("pt-BR")
      ] || []
    : filterOptions.modelos;

  const activeFilters = [
    filters.marca && { key: "marca", label: filters.marca },
    filters.modelo && { key: "modelo", label: filters.modelo },
    filters.ano_min && {
      key: "ano_min",
      label: `A partir de ${filters.ano_min}`,
    },
    filters.ano_max && { key: "ano_max", label: `Até ${filters.ano_max}` },
    filters.categoria && {
      key: "categoria",
      label: categoryLabels[filters.categoria] || filters.categoria,
    },
    filters.combustivel && {
      key: "combustivel",
      label: fuelLabels[filters.combustivel] || filters.combustivel,
    },
    filters.cambio && {
      key: "cambio",
      label: transmissionLabels[filters.cambio] || filters.cambio,
    },
  ].filter(Boolean) as { key: keyof VehicleFilters; label: string }[];

  useEffect(() => {
    fetchVehicles(filters);
  }, [filters]);

  useEffect(() => {
    vehicleService.getFilterOptions().then((options) =>
      setFilterOptions({
        marcas: options.marcas,
        modelos: options.modelos,
        modelosPorMarca: options.modelosPorMarca,
        anos: options.anos,
        categorias: options.categorias,
        combustiveis: options.combustiveis,
        cambios: options.cambios,
      }),
    );
  }, []);

  useSeo({
    title: "Estoque de Carros Seminovos | JR Veículos - Salto do Itararé",
    description:
      "Veja o estoque de carros seminovos da JR Veículos em Salto do Itararé - PR. Filtre por marca, modelo e ano e fale pelo WhatsApp.",
    path: "/estoque",
  });

  return (
    <div className="vehicle-detail-glow min-h-screen pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4">
        <Breadcrumbs
          items={[{ label: "Início", href: "/" }, { label: "Estoque" }]}
        />
        <h1 className="mb-1 text-2xl font-black uppercase text-white md:text-3xl">
          Estoque de <span className="text-primary-500">carros seminovos</span>
        </h1>
        <p className="mb-8 max-w-2xl text-sm text-dark-300">
          Carros usados e seminovos em Salto do Itararé - PR. Use os filtros
          para encontrar o veículo ideal e fale direto com a JR Veículos pelo
          WhatsApp.
        </p>
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2 text-sm text-dark-300">
            <span className="font-bold text-white">
              {paginacao?.total ?? 0}
            </span>
            veículos disponíveis
          </div>
          <button
            type="button"
            onClick={() => setFiltersOpen((open) => !open)}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-dark-700 bg-dark-850 px-4 py-2.5 text-sm font-bold text-white transition-colors hover:border-primary-500 lg:hidden"
          >
            <SlidersHorizontal size={16} />
            {filtersOpen ? "Ocultar filtros" : "Filtrar estoque"}
            <ChevronDown
              size={16}
              className={filtersOpen ? "rotate-180" : ""}
            />
          </button>
        </div>

        <div className="mb-6 flex flex-wrap items-center gap-2">
          {activeFilters.map((filter) => (
            <button
              type="button"
              key={filter.key}
              onClick={() =>
                setFilters((current) => ({
                  ...current,
                  [filter.key]: undefined,
                  pagina: 1,
                }))
              }
              className="inline-flex items-center gap-1.5 rounded-full border border-primary-500/40 bg-primary-500/10 px-3 py-1.5 text-xs font-semibold text-primary-300 transition-colors hover:bg-primary-500/20"
            >
              {filter.label}
              <X size={13} />
            </button>
          ))}
          {activeFilters.length > 0 && (
            <button
              type="button"
              onClick={clearFilters}
              className="px-2 py-1 text-xs font-semibold text-dark-400 hover:text-white"
            >
              Limpar tudo
            </button>
          )}
        </div>

        <div className="grid gap-8 lg:grid-cols-5">
          <aside
            className={`${filtersOpen ? "block" : "hidden"} space-y-4 lg:col-span-1 lg:block`}
          >
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-base font-black uppercase text-white">
                  Encontrar veículo
                </h2>
                <p className="mt-1 text-xs text-dark-400">Refine sua busca</p>
              </div>
              {activeFilters.length > 0 && (
                <button
                  type="button"
                  onClick={clearFilters}
                  aria-label="Limpar filtros"
                  className="text-dark-400 hover:text-white"
                >
                  <RotateCcw size={16} />
                </button>
              )}
            </div>

            <div className="space-y-4">
              <label className="relative block">
                <span className="sr-only">Buscar marca ou modelo</span>
                <Search
                  size={16}
                  className="absolute left-3 top-3 text-dark-400"
                />
                <input
                  value={filters.marca || filters.modelo || ""}
                  onChange={(e) =>
                    updateFilter({
                      marca: e.target.value || undefined,
                      modelo: undefined,
                    })
                  }
                  placeholder="Buscar marca ou modelo"
                  className={`${filterInputClass} pl-9`}
                />
              </label>

              <select
                value={filters.marca || ""}
                onChange={(e) =>
                  updateFilter({
                    marca: e.target.value || undefined,
                    modelo: undefined,
                  })
                }
                className={filterSelectClass}
              >
                <option value="">Todas as marcas</option>
                {filterOptions.marcas.map((marca) => (
                  <option key={marca} value={marca}>
                    {marca}
                  </option>
                ))}
              </select>

              <select
                value={filters.modelo || ""}
                onChange={(e) =>
                  updateFilter({ modelo: e.target.value || undefined })
                }
                className={filterSelectClass}
              >
                <option value="">Todos os modelos</option>
                {modelsForSelectedBrand.map((modelo) => (
                  <option key={modelo} value={modelo}>
                    {modelo}
                  </option>
                ))}
              </select>

              <div className="grid grid-cols-2 gap-2">
                <select
                  value={filters.ano_min || ""}
                  onChange={(e) =>
                    updateFilter({
                      ano_min: e.target.value
                        ? Number(e.target.value)
                        : undefined,
                    })
                  }
                  className={filterSelectClass}
                >
                  <option value="">Ano mín.</option>
                  {filterOptions.anos.map((ano) => (
                    <option key={ano} value={ano}>
                      {ano}
                    </option>
                  ))}
                </select>
                <select
                  value={filters.ano_max || ""}
                  onChange={(e) =>
                    updateFilter({
                      ano_max: e.target.value
                        ? Number(e.target.value)
                        : undefined,
                    })
                  }
                  className={filterSelectClass}
                >
                  <option value="">Ano máx.</option>
                  {filterOptions.anos.map((ano) => (
                    <option key={ano} value={ano}>
                      {ano}
                    </option>
                  ))}
                </select>
              </div>

              <select
                value={filters.categoria || ""}
                onChange={(e) =>
                  updateFilter({ categoria: e.target.value || undefined })
                }
                className={filterSelectClass}
              >
                <option value="">Todas as carrocerias</option>
                {filterOptions.categorias.map((categoria) => (
                  <option key={categoria} value={categoria}>
                    {categoryLabels[categoria] || categoria}
                  </option>
                ))}
              </select>
              <select
                value={filters.combustivel || ""}
                onChange={(e) =>
                  updateFilter({ combustivel: e.target.value || undefined })
                }
                className={filterSelectClass}
              >
                <option value="">Todos os combustíveis</option>
                {filterOptions.combustiveis.map((combustivel) => (
                  <option key={combustivel} value={combustivel}>
                    {fuelLabels[combustivel] || combustivel}
                  </option>
                ))}
              </select>
              <select
                value={filters.cambio || ""}
                onChange={(e) =>
                  updateFilter({ cambio: e.target.value || undefined })
                }
                className={filterSelectClass}
              >
                <option value="">Todos os câmbios</option>
                {filterOptions.cambios.map((cambio) => (
                  <option key={cambio} value={cambio}>
                    {transmissionLabels[cambio] || cambio}
                  </option>
                ))}
              </select>
            </div>
          </aside>

          {/* Vehicles Grid */}
          <div className="lg:col-span-4">
            <div className="mb-4 flex justify-end">
              <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-dark-400">
                Ordenar por
                <select
                  value={filters.ordem || "recentes"}
                  onChange={(e) =>
                    updateFilter({
                      ordem: e.target.value as VehicleFilters["ordem"],
                    })
                  }
                  className="rounded-lg border border-dark-700 bg-dark-850 px-3 py-2 text-xs font-bold normal-case tracking-normal text-white focus:border-primary-500 focus:outline-none"
                >
                  <option value="recentes">Mais recentes</option>
                  <option value="preco_baixo">Menor preço</option>
                  <option value="preco_alto">Maior preço</option>
                  <option value="km_baixo">Menor quilometragem</option>
                </select>
              </label>
            </div>
            {error && (
              <div className="bg-red-500/10 border border-red-500 text-red-400 px-4 py-3 rounded mb-6">
                {error}
              </div>
            )}

            {isLoading ? (
              <div className="grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-4">
                {[1, 2, 3, 4].map((item) => (
                  <div
                    key={item}
                    className="aspect-[4/3] animate-pulse rounded-lg bg-dark-800"
                  />
                ))}
              </div>
            ) : vehicles.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-2 py-20 text-center">
                <p className="text-dark-300">Nenhum veículo encontrado</p>
                <button
                  onClick={() => setFilters({})}
                  className="text-primary-500 hover:text-primary-400 font-semibold"
                >
                  Limpar filtros
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-4">
                {vehicles.map((vehicle) => (
                  <VehicleCard key={vehicle.id} vehicle={vehicle} />
                ))}
              </div>
            )}

            {/* Paginação */}
            {paginacao && paginacao.total_paginas > 1 && (
              <div className="flex justify-center gap-2 mt-12">
                {Array.from(
                  { length: paginacao.total_paginas },
                  (_, i) => i + 1,
                ).map((page) => (
                  <button
                    key={page}
                    onClick={() => setFilters({ ...filters, pagina: page })}
                    className={`w-10 h-10 rounded font-semibold transition-colors ${
                      page === (filters.pagina || 1)
                        ? "bg-primary-600 text-white"
                        : "bg-dark-800 text-dark-300 hover:text-white"
                    }`}
                  >
                    {page}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
