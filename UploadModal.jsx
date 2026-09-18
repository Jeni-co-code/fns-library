import { useState, useRef } from "react";
import { extractMeta } from "../lib/bookMeta";

export default function UploadModal({ folders, onClose, onUpload }) {
  const [file, setFile] = useState(null);
  const [meta, setMeta] = useState(null);
  const [coverBlob, setCoverBlob] = useState(null);
  const [selectedFolders, setSelectedFolders] = useState([]);
  const [step, setStep] = useState("pick"); // pick | reading | confirm | uploading
  const [error, setError] = useState("");
  const inputRef = useRef();

  async function handleFile(f) {
    if (!f) return;
    setError("");
    setFile(f);
    setStep("reading");
    try {
      const m = await extractMeta(f);
      setMeta(m);
      setCoverBlob(m.coverBlob);
      setStep("confirm");
    } catch (err) {
      setError(err.message);
      setStep("pick");
    }
  }

  function toggleFolder(id) {
    setSelectedFolders((prev) =>
      prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]
    );
  }

  async function handleConfirm() {
    setStep("uploading");
    try {
      await onUpload({ file, coverBlob, meta, folderIds: selectedFolders });
      onClose();
    } catch (err) {
      setError(err.message);
      setStep("confirm");
    }
  }

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 px-4" onClick={onClose}>
      <div
        className="bg-paper-50 rounded-2xl w-full max-w-md p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="font-display text-xl text-ink mb-4">Subir un libro</h3>

        {step === "pick" && (
          <div
            onClick={() => inputRef.current.click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              handleFile(e.dataTransfer.files[0]);
            }}
            className="border-2 border-dashed border-nook-900/20 rounded-xl py-14 text-center cursor-pointer hover:border-marigold-400 hover:bg-marigold-400/5 transition-colors"
          >
            <p className="text-ink/60 text-sm">
              Arrastra un archivo aquí, o haz clic para elegirlo
            </p>
            <p className="text-ink/40 text-xs mt-1">Formatos: EPUB o PDF</p>
            <input
              ref={inputRef}
              type="file"
              accept=".epub,.pdf"
              className="hidden"
              onChange={(e) => handleFile(e.target.files[0])}
            />
          </div>
        )}

        {step === "reading" && (
          <div className="py-14 text-center text-ink/60 text-sm">
            Leyendo el archivo y extrayendo portada…
          </div>
        )}

        {(step === "confirm" || step === "uploading") && meta && (
          <div>
            <div className="flex gap-4 mb-5">
              <div className="w-20 h-28 rounded bg-nook-900 shrink-0 overflow-hidden">
                {coverBlob && (
                  <img
                    src={URL.createObjectURL(coverBlob)}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <label className="block text-xs font-medium text-ink/50 mb-1">Título</label>
                <input
                  value={meta.title}
                  onChange={(e) => setMeta({ ...meta, title: e.target.value })}
                  className="input-field text-sm py-2 mb-2"
                />
                <label className="block text-xs font-medium text-ink/50 mb-1">Autor</label>
                <input
                  value={meta.author}
                  onChange={(e) => setMeta({ ...meta, author: e.target.value })}
                  className="input-field text-sm py-2"
                />
              </div>
            </div>

            <label className="block text-xs font-medium text-ink/50 mb-2">
              Añadir a estanterías (opcional)
            </label>
            <div className="flex flex-wrap gap-2 mb-6">
              {folders.map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => toggleFolder(f.id)}
                  className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                    selectedFolders.includes(f.id)
                      ? "border-transparent text-white"
                      : "border-nook-900/15 text-ink/60 hover:bg-nook-900/5"
                  }`}
                  style={selectedFolders.includes(f.id) ? { backgroundColor: f.color } : {}}
                >
                  {f.name}
                </button>
              ))}
            </div>

            {error && <p className="text-berry-600 text-sm mb-3">{error}</p>}

            <div className="flex justify-end gap-2">
              <button onClick={onClose} className="btn-ghost text-sm">
                Cancelar
              </button>
              <button
                onClick={handleConfirm}
                disabled={step === "uploading"}
                className="btn-primary text-sm px-5 disabled:opacity-60"
              >
                {step === "uploading" ? "Subiendo…" : "Añadir a mi biblioteca"}
              </button>
            </div>
          </div>
        )}

        {error && step === "pick" && <p className="text-berry-600 text-sm mt-3">{error}</p>}
      </div>
    </div>
  );
}
