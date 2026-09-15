// Traduz erros comuns do Supabase/Postgres em mensagens que a pessoa
// realmente consegue entender e resolver sozinha, em vez de um genérico
// "erro ao salvar".
interface PostgrestLikeError {
  code?: string;
  message?: string;
}

function isPostgrestError(error: unknown): error is PostgrestLikeError {
  return typeof error === "object" && error !== null;
}

export function describeSupabaseError(error: unknown, fallback: string): string {
  if (!isPostgrestError(error)) return fallback;

  const code = error.code || "";
  const message = (error.message || "").toLowerCase();

  // RLS bloqueou a escrita: o login está autenticado, mas não existe uma
  // linha correspondente em public.profiles (equipe da loja).
  if (code === "42501" || message.includes("row-level security")) {
    return "Este usuário não está cadastrado como equipe no Supabase (tabela profiles). Peça para quem administra o projeto adicionar seu usuário lá — veja o exemplo comentado no final do supabase/schema.sql.";
  }

  // Tabela ainda não existe: o schema.sql nunca foi rodado nesse projeto.
  if (code === "42P01" || message.includes("does not exist")) {
    return "As tabelas do banco de dados ainda não foram criadas neste projeto do Supabase. Rode o arquivo supabase/schema.sql no SQL Editor do Supabase.";
  }

  // Erros lançados de propósito no código (ex: checagens de permissão antes
  // do upload) já vêm com uma mensagem clara — usa ela em vez do fallback
  // genérico.
  if (error instanceof Error && error.message) return error.message;

  return fallback;
}
