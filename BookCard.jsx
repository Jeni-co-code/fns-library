import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getSignedUrl } from "../lib/library";

const STATUS_LABEL = {
  por_leer: "Por leer",
  leyendo: "Leyendo",
  terminado: "Terminado",
};

const STATUS_COLOR = {
  por_leer: "bg-nook-900/10 text-ink/60",
  leyendo: "bg-marigold-400/20 text-marigold-600",
  terminado: "bg-sage-400/20 text-sage-600",
};

export default function BookCard({ book, onOpenMenu }) {
  const [coverUrl, setCoverUrl] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    let active = true;
    if (book.cover_path) {
      getSignedUrl(book.cover_path)
        .then((url) => active && setCoverUrl(url))
        .catch(() => {});
    }
    return () => {
      active = false;
    };
  }, [book.cover_path]);

  return (
    <div className="group relative">
      <button
        onClick={() => navigate(`/leer/${book.id}`)}
        className="w-full aspect-[2/3] rounded-lg overflow-hidden bg-paper-200 shadow-sm group-hover:shadow-lg group-hover:-translate-y-1 transition-all duration-200 relative"
      >
        {coverUrl ? (
          <img src={coverUrl} alt={book.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-nook-800 to-nook-950 text-paper-100 p-3 text-center">
            <span className="font-display text-sm leading-tight">{book.title}</span>
          </div>
        )}
        {book.progress_percent > 0 && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/20">
            <div
              className="h-full bg-marigold-400"
              style={{ width: `${book.progress_percent}%` }}
            />
          </div>
        )}
      </button>

      <button
        onClick={() => onOpenMenu(book)}
        className="absolute top-1.5 right-1.5 w-7 h-7 rounded-full bg-black/40 text-white text-sm opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm"
      >
        ⋯
      </button>

      <div className="mt-2">
        <p className="font-body font-medium text-sm text-ink truncate">{book.title}</p>
        {book.author && <p className="text-xs text-ink/50 truncate">{book.author}</p>}
        <span
          className={`inline-block mt-1 text-[10px] font-medium px-2 py-0.5 rounded-full ${STATUS_COLOR[book.status]}`}
        >
          {STATUS_LABEL[book.status]}
        </span>
      </div>
    </div>
  );
}
