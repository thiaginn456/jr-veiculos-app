// Utilitarios para gerar URLs amigaveis de veiculo (marca-modelo-ano-id)
// mantendo compatibilidade com links antigos que usam so o id.
import { Vehicle } from "@/types";

export function slugify(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const UUID_RE =
  /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i;

/** Extrai o UUID de um parametro de rota que pode ser "id" ou "slug-id". */
export function extractVehicleId(param: string): string | null {
  const match = param.match(UUID_RE);
  return match ? match[0] : null;
}

/** Monta o caminho amigavel /veiculo/marca-modelo-ano-id para um veiculo. */
export function vehiclePath(
  vehicle: Pick<Vehicle, "id" | "marca" | "modelo" | "ano">,
): string {
  const slug = slugify(`${vehicle.marca}-${vehicle.modelo}-${vehicle.ano}`);
  return slug ? `/veiculo/${slug}-${vehicle.id}` : `/veiculo/${vehicle.id}`;
}
