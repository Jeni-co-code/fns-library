import { useState, useEffect, useRef } from "react";
import { searchGutenberg } from "../lib/gutenberg";
import { importGutenbergBook } from "../lib/library";

export default function CatalogModal({ folders, onClose, onImported }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [importingId, setImportingId] = useState(null);
  const [selectedFolders, setSelectedFolders] = useState([]);
  const [pickingFoldersFor, setPickingFoldersFor] = useState(null);
  const debounceRef = useRef();

  useEffect(() => {
    runSearch("");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function onQueryChange(value) {
    setQuery(value);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => runSearch(value), 450);
  }

  async function runSearch(q) {
    setLoading(true);
    setError("");
    try {
      const { results } = await searchGutenberg(q || "aventura");
      setResults(results);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function toggleFolder(id) {
    setSelectedFolders((prev) => (prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]));
  }

  async function confirmImport(book) {
    setImportingId(book.id);
    setError("");
    try {
      const saved = await importGutenbergBook(book.id, selectedFolders);
      onImported(saved, selectedFolders);
      setPickingFoldersFor(null);
      setSelectedFolders([]);
    } catch (err) {
      setError(err.message);
    } finally {
      setImportingId(null);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 px-4" onClick={onClose}>
      <div
        className="bg-paper-50 rounded-2xl w-full max-w-3xl p-6 shadow-xl max-h-[85vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-1">
          <h3 className="font-display text-xl text-ink">Explorar libros gratis</h3>
          <button onClick={onClose} className="text-ink/40 hover:text-ink text-sm">✕</button>
        </div>
        <p className="text-ink/50 text-sm mb-4">
          Miles de libros de dominio público, legales y gratis, vía Project Gutenberg.
        </p>

        <input
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder="Busca por título, autor o tema…"
          className="input-field mb-4"
          autoFocus
        />

        {error && <p className="text-berry-600 text-sm mb-3">{error}</p>}

        <div className="overflow-y-auto flex-1 -mx-1 px-1">
          {loading ? (
            <p className="text-ink/40 text-sm py-8 text-center">Buscando…</p>
          ) : results.length === 0 ? (
            <p className="text-ink/40 text-sm py-8 text-center">No encontramos nada con eso.</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {results.map((book) => (
                <div key={book.id} className="text-center">
                  <div className="aspect-[2/3] rounded-lg overflow-hidden bg-paper-200 mb-1.5">
                    {book.coverUrl ? (
                      <img src={book.coverUrl} alt={book.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-nook-900 text-paper-100 p-2 text-xs">
                        {book.title}
                      </div>
                    )}
                  </div>
                  <p className="text-xs font-medium text-ink truncate">{book.title}</p>
                  <p className="text-[11px] text-ink/50 truncate mb-1.5">{book.author}</p>

                  {pickingFoldersFor === book.id ? (
                    <div className="text-left bg-white border border-nook-900/10 rounded-lg p-2">
                      <div className="flex flex-wrap gap-1 mb-2 max-h-16 overflow-y-auto">
                        {folders.map((f) => (
                          <button
                            key={f.id}
                            onClick={() => toggleFolder(f.id)}
                            className="text-[10px] px-2 py-0.5 rounded-full border"
                            style={
                              selectedFolders.includes(f.id)
                                ? { background: f.color, borderColor: f.color, color: "white" }
                                : { borderColor: "#00000020", color: "#00000090" }
                            }
                          >
                            {f.name}
                          </button>
                        ))}
                      </div>
                      <button
                        onClick={() => confirmImport(book)}
                        disabled={importingId === book.id}
                        className="btn-primary w-full text-xs py-1.5 disabled:opacity-60"
                      >
                        {importingId === book.id ? "Añadiendo…" : "Confirmar"}
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        setPickingFoldersFor(book.id);
                        setSelectedFolders([]);
                      }}
                      className="text-xs w-full py-1.5 rounded-full border border-nook-900/15 hover:bg-nook-900/5 transition-colors"
                    >
                      + Añadir a mi biblioteca
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
