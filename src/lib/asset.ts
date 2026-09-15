// Resolve caminhos de arquivos estaticos (pasta public/) levando em conta o
// "base" configurado no Vite. Necessario porque o GitHub Pages de projeto
// serve o site num subcaminho (https://usuario.github.io/repo/), entao um
// caminho fixo como "/images/foo.png" quebraria — o arquivo real fica em
// "/repo/images/foo.png". Em qualquer outro host, BASE_URL e "/" e o
// caminho fica igual a antes.
export function asset(path: string): string {
  const base = import.meta.env.BASE_URL; // sempre termina com "/"
  return `${base}${path.replace(/^\//, "")}`;
}
