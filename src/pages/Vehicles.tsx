// Pagina publica de estoque com filtros e resultados paginados de veiculos.
import React, { useState, useEffect } from "react";
import { useVehicles } from "@/hooks";
import { vehicleService } from "@/services/vehicleService";
import { VehicleFilters } from "@/types";
import { VehicleCard, Breadcrumbs } from "@/components";
import { useSeo } from "@/lib/seo";

const filterSelectClass =
  "w-full appearance-none rounded-md bg-primary-900 px-4 py-3 font-bold uppercase tracking-wide text-white focus:outline-none focus:ring-2 focus:ring-primary-600";

export const Vehicles: React.FC = () => {
  const [filters, setFilters] = useState<VehicleFilters>({});
  const { vehicles, isLoading, error, paginacao, fetchVehicles } =
    useVehicles();
  const [filterOptions, setFilterOptions] = useState<{
    marcas: string[];
    modelos: string[];
    anos: number[];
  }>({ marcas: [], modelos: [], anos: [] });

  useEffect(() => {
    fetchVehicles(filters);
  }, [filters]);

  useEffect(() => {
    vehicleService.getFilterOptions().then((options) =>
      setFilterOptions({
        marcas: options.marcas,
        modelos: options.modelos,
        anos: options.anos,
      }),
    );
  }, []);

  useSeo({
    title: "Estoque de Carros Seminovos em Salto do Itararé - PR | JR Veículos",
    description:
      "Veja carros usados e seminovos disponíveis na JR Veículos, em Salto do Itararé - PR. Filtre por marca, modelo e ano, e negocie direto pelo WhatsApp.",
    path: "/estoque",
  });

  return (
    <div className="vehicle-detail-glow min-h-screen pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4">
        <Breadcrumbs items={[{ label: "Início", href: "/" }, { label: "Estoque" }]} />
        <h1 className="mb-1 text-2xl font-black uppercase text-white md:text-3xl">
          Estoque de <span className="text-primary-500">carros seminovos</span>
        </h1>
        <p className="mb-8 max-w-2xl text-sm text-dark-300">
          Carros usados e seminovos em Salto do Itararé - PR. Use os filtros
          para encontrar o veículo ideal e fale direto com a JR Veículos pelo
          WhatsApp.
        </p>
        <div className="grid gap-8 lg:grid-cols-5">
          {/* Sidebar de Filtros */}
          <aside className="space-y-4 lg:col-span-1">
            <select
              value={filters.marca || ""}
              onChange={(e) =>
                setFilters({
                  ...filters,
                  marca: e.target.value || undefined,
                  pagina: 1,
                })
              }
              className={filterSelectClass}
            >
              <option value="">Marca</option>
              {filterOptions.marcas.map((marca) => (
                <option key={marca} value={marca}>
                  {marca}
                </option>
              ))}
            </select>

            <select
              value={filters.modelo || ""}
              onChange={(e) =>
                setFilters({
                  ...filters,
                  modelo: e.target.value || undefined,
                  pagina: 1,
                })
              }
              className={filterSelectClass}
            >
              <option value="">Modelo</option>
              {filterOptions.modelos.map((modelo) => (
                <option key={modelo} value={modelo}>
                  {modelo}
                </option>
              ))}
            </select>

            <select
              value={filters.ano_min || ""}
              onChange={(e) => {
                const ano = e.target.value
                  ? parseInt(e.target.value)
                  : undefined;
                setFilters({
                  ...filters,
                  ano_min: ano,
                  ano_max: ano,
                  pagina: 1,
                });
              }}
              className={filterSelectClass}
            >
              <option value="">Ano</option>
              {filterOptions.anos.map((ano) => (
                <option key={ano} value={ano}>
                  {ano}
                </option>
              ))}
            </select>

            {(filters.marca || filters.modelo || filters.ano_min) && (
              <button
                onClick={() => setFilters({})}
                className="w-full rounded-md bg-dark-800 py-2 text-sm font-semibold text-white transition-colors hover:bg-dark-700"
              >
                Limpar filtros
              </button>
            )}
          </aside>

          {/* Vehicles Grid */}
          <div className="lg:col-span-4">
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
