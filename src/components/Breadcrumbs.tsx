// Trilha de navegacao usada nas paginas de estoque e detalhe do veiculo.
// Ajuda tanto o usuario quanto o Google a entenderem a hierarquia do site.
import React from "react";
import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export const Breadcrumbs: React.FC<{ items: BreadcrumbItem[] }> = ({
  items,
}) => {
  return (
    <nav
      aria-label="Trilha de navegação"
      className="mb-6 flex flex-wrap items-center gap-1.5 text-xs uppercase tracking-wide text-dark-400"
    >
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        return (
          <span key={`${item.label}-${index}`} className="flex items-center gap-1.5">
            {index > 0 && (
              <ChevronRight size={12} className="text-dark-600" aria-hidden="true" />
            )}
            {item.href && !isLast ? (
              <Link to={item.href} className="transition-colors hover:text-white">
                {item.label}
              </Link>
            ) : (
              <span aria-current={isLast ? "page" : undefined} className={isLast ? "text-white" : ""}>
                {item.label}
              </span>
            )}
          </span>
        );
      })}
    </nav>
  );
};
