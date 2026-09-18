import { useState } from "react";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "./LanguageSwitcher";
import ShelfStyleModal from "./ShelfStyleModal";

const PALETTE = ["#E29A21", "#6F9271", "#AE4166", "#4F86C6", "#8A6FB0", "#C2452B"];

export default function Sidebar({
  folders,
  activeFolder,
  onSelectFolder,
  onCreateFolder,
  onDeleteFolder,
  onStyleFolder,
  userName,
  onSignOut,
  onOpenManual,
  totalBooks,
  themeMode,
  onToggleTheme,
}) {
  const { t } = useTranslation();
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState("");
  const [color, setColor] = useState(PALETTE[0]);
  const [stylingFolder, setStylingFolder] = useState(null);

  function submit(e) {
    e.preventDefault();
    if (!name.trim()) return;
    onCreateFolder(name.trim(), color);
    setName("");
    setColor(PALETTE[0]);
    setCreating(false);
  }

  return (
    <aside className="w-full md:w-64 shrink-0 bg-nook-950 text-paper-100 flex flex-col md:h-screen md:sticky md:top-0">
      <div className="px-6 pt-6 pb-4">
        <div className="font-display text-xl">FNS Library</div>
        <div className="text-paper-100/40 text-xs mt-0.5">{userName}</div>
        {onToggleTheme && (
          <div className="flex items-center rounded-full p-0.5 gap-0.5 mt-3 w-fit" style={{ background: "rgba(255,255,255,0.08)" }}>
            <button
              onClick={() => themeMode !== "magica" && onToggleTheme()}
              className={`text-[11px] font-bold px-2.5 py-1 rounded-full transition-colors ${themeMode === "magica" ? "bg-[#FF6FA5] text-white" : "text-paper-100/50"}`}
            >
              🎨 Mágica
            </button>
            <button
              onClick={() => themeMode !== "clasica" && onToggleTheme()}
              className={`text-[11px] font-bold px-2.5 py-1 rounded-full transition-colors ${themeMode === "clasica" ? "bg-marigold-500 text-nook-950" : "text-paper-100/50"}`}
            >
              📚 Clásica
            </button>
          </div>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto px-3">
        <button
          onClick={() => onSelectFolder(null)}
          className={`w-full text-left px-3 py-2 rounded-lg text-sm mb-1 flex items-center justify-between transition-colors ${
            activeFolder === null ? "bg-paper-100/10 font-medium" : "hover:bg-paper-100/5"
          }`}
        >
          <span>{t("sidebar.allBooks")}</span>
          <span className="text-paper-100/40 text-xs">{totalBooks}</span>
        </button>

        <div className="text-paper-100/40 text-xs font-medium uppercase tracking-wide px-3 mt-4 mb-1.5">
          {t("sidebar.shelves")}
        </div>

        {folders.map((f) => (
          <div
            key={f.id}
            className={`group w-full px-3 py-2 rounded-lg text-sm mb-1 flex items-center justify-between transition-colors ${
              activeFolder === f.id ? "bg-paper-100/10 font-medium" : "hover:bg-paper-100/5"
            }`}
          >
            <button
              onClick={() => onSelectFolder(f.id)}
              className="flex items-center gap-2 flex-1 text-left truncate"
            >
              <span
                className="w-2.5 h-2.5 rounded-full shrink-0"
                style={{ backgroundColor: f.color }}
              />
              <span className="truncate">{f.name}</span>
            </button>
            <button
              onClick={() => setStylingFolder(f)}
              className="opacity-0 group-hover:opacity-100 text-paper-100/40 hover:text-marigold-400 text-xs px-1 transition-opacity"
              title="Personalizar color y personaje"
            >
              🎨
            </button>
            <button
              onClick={() => onDeleteFolder(f.id)}
              className="opacity-0 group-hover:opacity-100 text-paper-100/40 hover:text-berry-400 text-xs px-1 transition-opacity"
              title="Eliminar estantería"
            >
              ✕
            </button>
          </div>
        ))}

        {creating ? (
          <form onSubmit={submit} className="px-3 py-2">
            <input
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nombre de la estantería"
              className="w-full bg-paper-100/10 text-paper-50 placeholder:text-paper-100/40 rounded-lg px-2.5 py-1.5 text-sm mb-2 focus:outline-none focus:ring-1 focus:ring-marigold-400"
            />
            <div className="flex items-center gap-1.5 mb-2">
              {PALETTE.map((c) => (
                <button
                  type="button"
                  key={c}
                  onClick={() => setColor(c)}
                  className={`w-5 h-5 rounded-full ${color === c ? "ring-2 ring-paper-50" : ""}`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
            <div className="flex gap-2">
              <button type="submit" className="text-xs bg-marigold-500 hover:bg-marigold-600 px-3 py-1.5 rounded-full font-medium text-nook-950">
                Crear
              </button>
              <button
                type="button"
                onClick={() => setCreating(false)}
                className="text-xs text-paper-100/50 hover:text-paper-100 px-2"
              >
                Cancelar
              </button>
            </div>
          </form>
        ) : (
          <button
            onClick={() => setCreating(true)}
            className="w-full text-left px-3 py-2 rounded-lg text-sm text-paper-100/60 hover:text-paper-100 hover:bg-paper-100/5 transition-colors"
          >
            + Nueva estantería
          </button>
        )}
      </nav>

      <div className="px-3 py-4 border-t border-paper-100/10">
        <div className="mb-3">
          <LanguageSwitcher light />
        </div>
        <button
          onClick={onOpenManual}
          className="w-full text-left px-3 py-2 rounded-lg text-sm text-paper-100/60 hover:text-paper-100 hover:bg-paper-100/5 transition-colors"
        >
          {t("sidebar.manual")}
        </button>
        <button
          onClick={onSignOut}
          className="w-full text-left px-3 py-2 rounded-lg text-sm text-paper-100/60 hover:text-paper-100 hover:bg-paper-100/5 transition-colors"
        >
          {t("sidebar.signOut")}
        </button>
        <p className="text-[10px] text-paper-100/25 text-center mt-3">
          Un proyecto de Fraag Nizam Studio
        </p>
      </div>

      {stylingFolder && (
        <ShelfStyleModal
          initialColor={stylingFolder.color}
          initialCharacter={stylingFolder.character_emoji}
          onClose={() => setStylingFolder(null)}
          onSave={(style) => {
            onStyleFolder(stylingFolder.id, style);
            setStylingFolder(null);
          }}
        />
      )}
    </aside>
  );
}
