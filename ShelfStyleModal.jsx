import { useState, useRef } from "react";

export const COLOR_PALETTE = [
  { name: "Rubí", value: "#AE4166" },
  { name: "Zafiro", value: "#4F86C6" },
  { name: "Esmeralda", value: "#6F9271" },
  { name: "Amatista", value: "#8A6FB0" },
  { name: "Oro", value: "#E29A21" },
  { name: "Coral", value: "#C2452B" },
  { name: "Medianoche", value: "#3D3260" },
  { name: "Bosque", value: "#587459" },
  { name: "Chicle", value: "#F0AF3D" },
];

const CHARACTER_OPTIONS = ["🦉", "🐉", "🧚", "🚀", "🦄", "🐺", "🧙", "🐲", "🦋", "🐧"];

export default function ShelfStyleModal({ initialColor, initialCharacter, onClose, onSave }) {
  const [color, setColor] = useState(initialColor || COLOR_PALETTE[0].value);
  const [customHex, setCustomHex] = useState(initialColor || "#AE4166");
  const [showCustom, setShowCustom] = useState(false);
  const [character, setCharacter] = useState(initialCharacter || "🦉");
  const [customImage, setCustomImage] = useState(null);
  const fileRef = useRef();

  function handleFile(file) {
    if (!file) return;
    setCustomImage(file);
    setCharacter(null);
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4" onClick={onClose}>
      <div
        className="rounded-3xl p-7 max-w-md w-full text-center"
        style={{ background: "radial-gradient(ellipse at top, #2E1D12, #140D08)", border: "1px solid rgba(232,182,90,0.35)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="text-2xl mb-1">🪄</div>
        <h3 className="text-lg font-semibold mb-1" style={{ fontFamily: "Georgia, serif", color: "#FFE29A" }}>
          Personaliza esta estantería
        </h3>
        <p className="text-xs mb-5" style={{ color: "#FBF6EC80" }}>
          Elige un color y un personaje para esta saga.
        </p>

        <p className="text-xs font-medium mb-2 text-left" style={{ color: "#FBF6EC90" }}>Color</p>
        {!showCustom ? (
          <>
            <div className="grid grid-cols-3 gap-3 mb-3">
              {COLOR_PALETTE.map((c) => (
                <button
                  key={c.name}
                  onClick={() => setColor(c.value)}
                  className="flex flex-col items-center gap-1"
                >
                  <div
                    className="w-10 h-10 rounded-full"
                    style={{
                      background: c.value,
                      boxShadow: color === c.value ? `0 0 14px ${c.value}` : "none",
                      border: "2px solid rgba(255,255,255,0.25)",
                    }}
                  />
                  <span className="text-[10px]" style={{ color: "#FBF6ECaa" }}>{c.name}</span>
                </button>
              ))}
            </div>
            <button onClick={() => setShowCustom(true)} className="text-xs mb-5" style={{ color: "#FFE29A" }}>
              🖌️ Color personalizado (Hex)
            </button>
          </>
        ) : (
          <div className="flex items-center justify-center gap-3 mb-5">
            <input
              type="color"
              value={customHex}
              onChange={(e) => {
                setCustomHex(e.target.value);
                setColor(e.target.value);
              }}
              className="w-10 h-10 rounded-lg cursor-pointer bg-transparent"
            />
            <input
              type="text"
              value={customHex}
              onChange={(e) => {
                setCustomHex(e.target.value);
                setColor(e.target.value);
              }}
              className="text-sm px-3 py-2 rounded-lg w-28 text-center font-mono"
              style={{ background: "rgba(255,255,255,0.08)", color: "#FBF6EC" }}
            />
            <button onClick={() => setShowCustom(false)} className="text-xs" style={{ color: "#FBF6EC70" }}>
              ← Volver
            </button>
          </div>
        )}

        <p className="text-xs font-medium mb-2 text-left" style={{ color: "#FBF6EC90" }}>
          Personaje que sale al abrir un libro
        </p>
        <div className="grid grid-cols-5 gap-2 mb-3">
          {CHARACTER_OPTIONS.map((emoji) => (
            <button
              key={emoji}
              onClick={() => {
                setCharacter(emoji);
                setCustomImage(null);
              }}
              className="text-2xl rounded-xl py-2 transition-transform hover:scale-110"
              style={{
                background: character === emoji && !customImage ? "rgba(255,255,255,0.15)" : "rgba(255,255,255,0.05)",
                border: character === emoji && !customImage ? "1px solid #FFE29A" : "1px solid transparent",
              }}
            >
              {emoji}
            </button>
          ))}
        </div>

        <button
          onClick={() => fileRef.current.click()}
          className="text-xs px-3 py-1.5 rounded-full mb-5"
          style={{ background: "rgba(255,255,255,0.08)", color: "#FFE29A", border: "1px dashed rgba(232,182,90,0.5)" }}
        >
          {customImage ? `✓ ${customImage.name}` : "🖼️ Subir mi propio personaje"}
        </button>
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleFile(e.target.files[0])} />

        <div className="flex justify-center gap-3">
          <button onClick={onClose} className="text-xs" style={{ color: "#FBF6EC60" }}>
            Cancelar
          </button>
          <button
            onClick={() => onSave({ color, character, customImage })}
            className="text-sm px-5 py-2 rounded-full font-semibold"
            style={{ background: "linear-gradient(135deg, #FFE29A, #E8B65A)", color: "#140D08" }}
          >
            Guardar ✨
          </button>
        </div>
      </div>
    </div>
  );
}
