import { useState, useEffect } from "react";
import { getSignedUrl } from "../lib/library";

const STATUSES = [
  { value: "por_leer", label: "Por leer" },
  { value: "leyendo", label: "Leyendo" },
  { value: "terminado", label: "Terminado" },
];

export default function BookMenu({ book, folders, onClose, onSetStatus, onSetFolders, onDelete }) {
  const [selected, setSelected] = useState(
    book.book_folders?.map((bf) => bf.folder_id) || []
  );
  const [downloadUrl, setDownloadUrl] = useState(null);

  useEffect(() => {
    getSignedUrl(book.file_path).then(setDownloadUrl).catch(() => {});
  }, [book.file_path]);

  function toggleFolder(id) {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]
    );
  }

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 px-4" onClick={onClose}>
      <div
        className="bg-paper-50 rounded-2xl w-full max-w-sm p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="font-display text-xl text-ink mb-1">{book.title}</h3>
        <p className="text-ink/50 text-sm mb-5">{book.author}</p>

        <p className="text-xs font-medium text-ink/60 uppercase tracking-wide mb-2">Estado</p>
        <div className="flex gap-2 mb-5">
          {STATUSES.map((s) => (
            <button
              key={s.value}
              onClick={() => onSetStatus(book.id, s.value)}
              className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                book.status === s.value
                  ? "bg-berry-500 text-paper-50 border-berry-500"
                  : "border-nook-900/15 text-ink/60 hover:bg-nook-900/5"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>

        <p className="text-xs font-medium text-ink/60 uppercase tracking-wide mb-2">Estanterías</p>
        <div className="flex flex-wrap gap-2 mb-6 max-h-32 overflow-y-auto">
          {folders.length === 0 && (
            <p className="text-ink/40 text-sm">Aún no tienes estanterías creadas.</p>
          )}
          {folders.map((f) => (
            <button
              key={f.id}
              onClick={() => toggleFolder(f.id)}
              className={`text-xs px-3 py-1.5 rounded-full border flex items-center gap-1.5 transition-colors ${
                selected.includes(f.id)
                  ? "border-transparent text-white"
                  : "border-nook-900/15 text-ink/60 hover:bg-nook-900/5"
              }`}
              style={selected.includes(f.id) ? { backgroundColor: f.color } : {}}
            >
              {f.name}
            </button>
          ))}
        </div>

        <div className="flex justify-between items-center pt-2 border-t border-nook-900/10">
          <button
            onClick={() => onDelete(book)}
            className="text-sm text-berry-600 hover:underline"
          >
            Eliminar libro
          </button>
          <div className="flex items-center gap-3">
            {downloadUrl && (
              <a href={downloadUrl} download className="text-sm text-ink/60 hover:text-ink" title="Descargar archivo">
                ⬇️ Descargar
              </a>
            )}
            <button
              onClick={() => {
                onSetFolders(book.id, selected);
                onClose();
              }}
              className="btn-primary text-sm px-4 py-2"
            >
              Guardar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
