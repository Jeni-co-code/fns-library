import { useEffect, useRef, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ePub from "epubjs";
import * as pdfjsLib from "pdfjs-dist";
import pdfWorker from "pdfjs-dist/build/pdf.worker.mjs?url";
import { supabase } from "../supabaseClient";
import { getSignedUrl, updateProgress, translateText } from "../lib/library";
import { getAvailableVoices, speak, pauseSpeech, resumeSpeech, stopSpeech, isSpeechSupported } from "../lib/textToSpeech";

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

const THEMES = {
  claro: { bg: "#FDFBF6", text: "#241D33" },
  sepia: { bg: "#F2E8D5", text: "#3B2F1E" },
  oscuro: { bg: "#1B1729", text: "#E8E3F0" },
};

const TRANSLATE_LANGS = [
  { code: "en", label: "English", flag: "🇬🇧" },
  { code: "de", label: "Deutsch", flag: "🇩🇪" },
  { code: "fr", label: "Français", flag: "🇫🇷" },
  { code: "pt", label: "Português", flag: "🇵🇹" },
  { code: "it", label: "Italiano", flag: "🇮🇹" },
  { code: "ja", label: "日本語", flag: "🇯🇵" },
  { code: "zh", label: "中文", flag: "🇨🇳" },
  { code: "ar", label: "العربية", flag: "🇸🇦" },
  { code: "es", label: "Español", flag: "🇪🇸" },
];

export default function Reader() {
  const { bookId } = useParams();
  const navigate = useNavigate();
  const viewerRef = useRef(null);
  const bookRef = useRef(null);
  const renditionRef = useRef(null);
  const pdfDocRef = useRef(null);
  const canvasRef = useRef(null);

  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fontSize, setFontSize] = useState(100);
  const [theme, setTheme] = useState("claro");
  const [showControls, setShowControls] = useState(true);
  const [pdfPage, setPdfPage] = useState(1);
  const [pdfPageCount, setPdfPageCount] = useState(0);
  const [percent, setPercent] = useState(0);

  // audio (text-to-speech)
  const [voices, setVoices] = useState([]);
  const [selectedVoiceURI, setSelectedVoiceURI] = useState("");
  const [speechState, setSpeechState] = useState("stopped"); // stopped | playing | paused
  const [rate, setRate] = useState(1);
  const [showVoiceMenu, setShowVoiceMenu] = useState(false);

  // translation
  const [translatedText, setTranslatedText] = useState(null);
  const [translating, setTranslating] = useState(false);
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [translateError, setTranslateError] = useState("");

  useEffect(() => {
    load();
    if (isSpeechSupported()) {
      getAvailableVoices().then((v) => {
        setVoices(v);
        const spanish = v.find((voice) => voice.lang?.startsWith("es"));
        setSelectedVoiceURI((spanish || v[0])?.voiceURI || "");
      });
    }
    return () => {
      renditionRef.current?.destroy?.();
      stopSpeech();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookId]);

  async function load() {
    setLoading(true);
    const { data: row, error } = await supabase
      .from("books")
      .select("*")
      .eq("id", bookId)
      .single();
    if (error || !row) {
      navigate("/");
      return;
    }
    const url = await getSignedUrl(row.file_path);
    setBook({ ...row, downloadUrl: url });
    setPercent(row.progress_percent || 0);

    if (row.file_type === "epub") {
      await initEpub(url, row.progress_location);
    } else {
      await initPdf(url, row.progress_location);
    }
    setLoading(false);
  }

  async function initEpub(url, savedLocation) {
    const epubBook = ePub(url);
    bookRef.current = epubBook;
    const rendition = epubBook.renderTo(viewerRef.current, {
      width: "100%",
      height: "100%",
      flow: "paginated",
      spread: "auto",
    });
    renditionRef.current = rendition;

    Object.entries(THEMES).forEach(([name, colors]) => {
      rendition.themes.register(name, {
        body: { background: colors.bg, color: colors.text },
      });
    });
    rendition.themes.select("claro");
    rendition.themes.fontSize("100%");

    await rendition.display(savedLocation || undefined);

    epubBook.locations.generate(1600).then(() => {
      // locations ready for percentage calculation
    });

    rendition.on("relocated", (loc) => {
      stopSpeech();
      setSpeechState("stopped");
      setTranslatedText(null);
      setTranslateError("");
      const cfi = loc.start.cfi;
      let pct = 0;
      try {
        pct = Math.round((epubBook.locations.percentageFromCfi(cfi) || 0) * 100);
      } catch {
        pct = 0;
      }
      setPercent(pct);
      updateProgress(bookId, {
        location: cfi,
        percent: pct,
        status: pct >= 98 ? "terminado" : "leyendo",
      });
    });
  }

  async function initPdf(url, savedLocation) {
    const pdf = await pdfjsLib.getDocument(url).promise;
    pdfDocRef.current = pdf;
    setPdfPageCount(pdf.numPages);
    const startPage = savedLocation ? parseInt(savedLocation, 10) : 1;
    setPdfPage(startPage || 1);
    await renderPdfPage(startPage || 1, pdf);
  }

  const renderPdfPage = useCallback(async (pageNum, pdfOverride) => {
    const pdf = pdfOverride || pdfDocRef.current;
    if (!pdf || !canvasRef.current) return;
    const page = await pdf.getPage(pageNum);
    const containerWidth = viewerRef.current?.clientWidth || 800;
    const baseViewport = page.getViewport({ scale: 1 });
    const scale = Math.min((containerWidth * 0.9) / baseViewport.width, 1.8);
    const viewport = page.getViewport({ scale });
    const canvas = canvasRef.current;
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    const ctx = canvas.getContext("2d");
    await page.render({ canvasContext: ctx, viewport }).promise;
  }, []);

  async function goToPdfPage(num) {
    if (num < 1 || num > pdfPageCount) return;
    setPdfPage(num);
    await renderPdfPage(num);
    const pct = Math.round((num / pdfPageCount) * 100);
    setPercent(pct);
    updateProgress(bookId, {
      location: String(num),
      percent: pct,
      status: pct >= 98 ? "terminado" : "leyendo",
    });
  }

  function getCurrentEpubText() {
    const contents = renditionRef.current?.getContents?.();
    if (!contents || !contents.length) return "";
    return contents.map((c) => c.content?.innerText || "").join(" ");
  }

  async function getCurrentPdfText() {
    const pdf = pdfDocRef.current;
    if (!pdf) return "";
    const page = await pdf.getPage(pdfPage);
    const textContent = await page.getTextContent();
    return textContent.items.map((item) => item.str).join(" ");
  }

  async function toggleSpeech() {
    if (speechState === "playing") {
      pauseSpeech();
      setSpeechState("paused");
      return;
    }
    if (speechState === "paused") {
      resumeSpeech();
      setSpeechState("playing");
      return;
    }
    const text = isEpub ? getCurrentEpubText() : await getCurrentPdfText();
    if (!text.trim()) return;
    const voice = voices.find((v) => v.voiceURI === selectedVoiceURI);
    speak(text, {
      voice,
      rate,
      onEnd: () => setSpeechState("stopped"),
    });
    setSpeechState("playing");
  }

  function stopReading() {
    stopSpeech();
    setSpeechState("stopped");
  }

  async function handleTranslate(targetLang) {
    setShowLangMenu(false);
    setTranslating(true);
    setTranslateError("");
    try {
      const text = isEpub ? getCurrentEpubText() : await getCurrentPdfText();
      if (!text.trim()) throw new Error("No hay texto en esta página para traducir");
      const translated = await translateText(text, targetLang);
      setTranslatedText(translated);
    } catch (err) {
      setTranslateError(err.message);
    } finally {
      setTranslating(false);
    }
  }

  function clearTranslation() {
    setTranslatedText(null);
    setTranslateError("");
  }

  // if the reader turns the page while audio is playing, restart reading on the new page
  useEffect(() => {
    if (speechState !== "stopped") {
      stopReading();
    }
    clearTranslation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pdfPage]);

  function changeFontSize(delta) {
    const next = Math.min(180, Math.max(70, fontSize + delta));
    setFontSize(next);
    renditionRef.current?.themes.fontSize(`${next}%`);
  }

  function changeTheme(name) {
    setTheme(name);
    renditionRef.current?.themes.select(name);
  }

  const isEpub = book?.file_type === "epub";
  const themeColors = THEMES[theme];

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{ background: isEpub ? themeColors.bg : "#2A2438" }}
    >
      <header
        className={`flex items-center justify-between px-4 py-3 shrink-0 ${
          showControls ? "" : "hidden"
        }`}
        style={{ background: isEpub ? themeColors.bg : "#2A2438", color: isEpub ? themeColors.text : "#F0EAF7" }}
      >
        <button onClick={() => navigate("/")} className="text-sm opacity-70 hover:opacity-100">
          ← Mi biblioteca
        </button>
        <span className="font-display text-sm truncate max-w-[30%]">{book?.title}</span>
        <div className="flex items-center gap-3">
          <a
            href={book?.downloadUrl}
            download
            className="text-sm opacity-70 hover:opacity-100"
            title="Descargar archivo original"
          >
            ⬇️
          </a>
          <span className="text-xs opacity-50">{percent}%</span>
        </div>
      </header>

      <div
        className="flex-1 relative overflow-hidden"
        onClick={() => setShowControls((s) => !s)}
      >
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center text-ink/40">
            Abriendo tu libro…
          </div>
        )}
        {isEpub ? (
          <div ref={viewerRef} className="w-full h-full" onClick={(e) => e.stopPropagation()} />
        ) : (
          <div
            ref={viewerRef}
            className="w-full h-full flex items-center justify-center overflow-auto py-6"
            onClick={(e) => e.stopPropagation()}
          >
            <canvas ref={canvasRef} className="shadow-2xl rounded" />
          </div>
        )}

        {(translating || translatedText || translateError) && (
          <div
            className="absolute inset-0 overflow-y-auto p-6 md:p-10"
            style={{ background: isEpub ? themeColors.bg : "#FDFBF6", color: isEpub ? themeColors.text : "#241D33" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="max-w-xl mx-auto">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs uppercase tracking-wide opacity-50">Traducción automática</span>
                <button onClick={clearTranslation} className="text-xs underline opacity-70 hover:opacity-100">
                  Ver texto original
                </button>
              </div>
              {translating ? (
                <p className="opacity-50 text-sm">Traduciendo…</p>
              ) : translateError ? (
                <p className="text-sm" style={{ color: "#B8494F" }}>{translateError}</p>
              ) : (
                <p style={{ fontFamily: "Georgia, serif", fontSize: `${fontSize}%`, lineHeight: 1.8 }}>
                  {translatedText}
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      {showControls && (
        <footer
          className="shrink-0 px-4 py-3 flex items-center justify-center gap-6 border-t"
          style={{
            background: isEpub ? themeColors.bg : "#2A2438",
            borderColor: "rgba(128,128,128,0.2)",
            color: isEpub ? themeColors.text : "#F0EAF7",
          }}
        >
          {isEpub ? (
            <>
              <div className="flex items-center gap-2">
                <button onClick={() => changeFontSize(-10)} className="w-8 h-8 rounded-full border border-current/20 text-sm">
                  A-
                </button>
                <button onClick={() => changeFontSize(10)} className="w-8 h-8 rounded-full border border-current/20 text-sm">
                  A+
                </button>
              </div>
              <div className="flex items-center gap-1.5">
                {Object.keys(THEMES).map((name) => (
                  <button
                    key={name}
                    onClick={() => changeTheme(name)}
                    className={`w-6 h-6 rounded-full border-2 ${theme === name ? "border-marigold-400" : "border-transparent"}`}
                    style={{ background: THEMES[name].bg }}
                    title={name}
                  />
                ))}
              </div>
              {isSpeechSupported() && (
                <div className="relative flex items-center gap-1.5">
                  <button
                    onClick={toggleSpeech}
                    className="w-9 h-9 rounded-full border border-current/20 text-sm flex items-center justify-center"
                    title="Escuchar este capítulo"
                  >
                    {speechState === "playing" ? "⏸" : "🔊"}
                  </button>
                  {speechState !== "stopped" && (
                    <button onClick={stopReading} className="text-xs opacity-70 hover:opacity-100">
                      ■
                    </button>
                  )}
                  <button
                    onClick={() => setShowVoiceMenu((s) => !s)}
                    className="text-xs opacity-60 hover:opacity-100"
                    title="Elegir voz"
                  >
                    ⚙️
                  </button>
                  {showVoiceMenu && (
                    <div
                      className="absolute bottom-12 left-1/2 -translate-x-1/2 bg-white text-ink rounded-xl shadow-xl p-3 w-64 z-20"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <label className="block text-xs font-medium text-ink/60 mb-1">Voz</label>
                      <select
                        value={selectedVoiceURI}
                        onChange={(e) => setSelectedVoiceURI(e.target.value)}
                        className="w-full text-xs border border-nook-900/15 rounded-lg px-2 py-1.5 mb-3"
                      >
                        {voices.map((v) => (
                          <option key={v.voiceURI} value={v.voiceURI}>
                            {v.name} ({v.lang})
                          </option>
                        ))}
                      </select>
                      <label className="block text-xs font-medium text-ink/60 mb-1">
                        Velocidad: {rate.toFixed(1)}x
                      </label>
                      <input
                        type="range"
                        min="0.5"
                        max="1.8"
                        step="0.1"
                        value={rate}
                        onChange={(e) => setRate(parseFloat(e.target.value))}
                        className="w-full"
                      />
                    </div>
                  )}
                </div>
              )}
              <div className="relative">
                <button
                  onClick={() => setShowLangMenu((s) => !s)}
                  className="w-9 h-9 rounded-full border border-current/20 text-sm flex items-center justify-center"
                  title="Traducir esta página"
                >
                  🌐
                </button>
                {showLangMenu && (
                  <div
                    className="absolute bottom-12 left-1/2 -translate-x-1/2 bg-white text-ink rounded-xl shadow-xl p-2 w-40 z-20"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {TRANSLATE_LANGS.map((l) => (
                      <button
                        key={l.code}
                        onClick={() => handleTranslate(l.code)}
                        className="w-full text-left text-xs px-2 py-1.5 rounded-lg hover:bg-nook-900/5"
                      >
                        {l.flag} {l.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <button
                onClick={() => renditionRef.current?.prev()}
                className="text-sm opacity-70 hover:opacity-100"
              >
                ← Anterior
              </button>
              <button
                onClick={() => renditionRef.current?.next()}
                className="text-sm opacity-70 hover:opacity-100"
              >
                Siguiente →
              </button>
            </>
          ) : (
            <>
              <button onClick={() => goToPdfPage(pdfPage - 1)} className="text-sm opacity-70 hover:opacity-100">
                ← Anterior
              </button>
              <span className="text-sm">
                Página {pdfPage} de {pdfPageCount}
              </span>
              <button onClick={() => goToPdfPage(pdfPage + 1)} className="text-sm opacity-70 hover:opacity-100">
                Siguiente →
              </button>
              {isSpeechSupported() && (
                <button
                  onClick={toggleSpeech}
                  className="w-9 h-9 rounded-full border border-current/20 text-sm flex items-center justify-center"
                  title="Escuchar esta página"
                >
                  {speechState === "playing" ? "⏸" : "🔊"}
                </button>
              )}
              <div className="relative">
                <button
                  onClick={() => setShowLangMenu((s) => !s)}
                  className="w-9 h-9 rounded-full border border-current/20 text-sm flex items-center justify-center"
                  title="Traducir esta página"
                >
                  🌐
                </button>
                {showLangMenu && (
                  <div
                    className="absolute bottom-12 left-1/2 -translate-x-1/2 bg-white text-ink rounded-xl shadow-xl p-2 w-40 z-20"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {TRANSLATE_LANGS.map((l) => (
                      <button
                        key={l.code}
                        onClick={() => handleTranslate(l.code)}
                        className="w-full text-left text-xs px-2 py-1.5 rounded-lg hover:bg-nook-900/5"
                      >
                        {l.flag} {l.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </footer>
      )}
    </div>
  );
}
