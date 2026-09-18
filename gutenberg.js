const GUTENDEX_BASE = "https://gutendex.com/books";

// Busca libros gratuitos de dominio público. query puede ser título, autor o tema.
export async function searchGutenberg(query, page = 1) {
  const url = query
    ? `${GUTENDEX_BASE}/?search=${encodeURIComponent(query)}&page=${page}`
    : `${GUTENDEX_BASE}/?page=${page}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("No se pudo buscar en el catálogo gratuito");
  const data = await res.json();
  return {
    count: data.count,
    hasNext: Boolean(data.next),
    results: data.results
      .filter((b) => b.formats["application/epub+zip"])
      .map((b) => ({
        id: b.id,
        title: b.title,
        author: b.authors?.[0]?.name || "Autor desconocido",
        coverUrl: b.formats["image/jpeg"] || null,
        subjects: b.subjects?.slice(0, 2) || [],
      })),
  };
}
