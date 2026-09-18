function hashSize(id, isMagica) {
  const n = id.split("-").reduce((acc, part) => acc + parseInt(part.slice(0, 4), 16) || 0, 0);
  const width = (isMagica ? 50 : 44) + (n % 28);
  const height = (isMagica ? 195 : 200) + (n % 26);
  return { width, height };
}

export default function BookSpine({ book, color, isMagica, onOpen }) {
  const { width, height } = hashSize(book.id, isMagica);

  if (isMagica) {
    return (
      <button
        onClick={() => onOpen(book)}
        className="group relative shrink-0 flex flex-col items-center justify-between rounded-2xl transition-all duration-300 ease-out hover:-translate-y-4 hover:scale-110 focus:outline-none"
        style={{
          width,
          height,
          background: `linear-gradient(160deg, ${color}cc, ${color})`,
          boxShadow: `0 6px 0 ${color}aa, 0 10px 16px rgba(0,0,0,0.18)`,
          border: "3px solid white",
        }}
        title={book.title}
      >
        <div className="pt-3 flex gap-2">
          <div className="w-2 h-2 rounded-full bg-white/90" />
          <div className="w-2 h-2 rounded-full bg-white/90" />
        </div>
        <div
          className="flex-1 flex items-center justify-center px-1 text-center"
          style={{ writingMode: "vertical-rl", transform: "rotate(180deg)", color: "white", fontFamily: "'Fraunces', serif", fontWeight: 700, fontSize: 13 }}
        >
          {book.title}
        </div>
        <div className="pb-3">
          <div className="w-4 h-2 rounded-b-full border-b-2 border-white/90" />
        </div>
        {book.status === "terminado" && <div className="absolute -top-3 -right-2 text-xl rotate-12">⭐</div>}
        {book.progress_percent > 0 && book.status !== "terminado" && (
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 text-[10px] font-bold px-2 py-0.5 rounded-full bg-white shadow" style={{ color }}>
            {book.progress_percent}%
          </div>
        )}
      </button>
    );
  }

  return (
    <button
      onClick={() => onOpen(book)}
      className="group relative shrink-0 flex flex-col items-center justify-between rounded-t-[3px] transition-all duration-300 hover:-translate-y-5 hover:scale-[1.04] focus:outline-none"
      style={{
        width,
        height,
        background: `linear-gradient(90deg, rgba(0,0,0,0.5), rgba(255,255,255,0.12) 8%, transparent 16%, transparent 84%, rgba(0,0,0,0.5)), linear-gradient(160deg, ${color}, ${color}bb 60%)`,
        boxShadow: "3px 6px 10px rgba(0,0,0,0.5)",
        borderTop: "2px solid #E8B65A80",
      }}
      title={book.title}
    >
      <div className="w-full flex justify-center pt-2.5">
        <div style={{ width: "60%", height: 2, background: "linear-gradient(90deg, transparent, #FFE29A, transparent)" }} />
      </div>
      <div
        className="flex-1 flex items-center justify-center px-1 text-center"
        style={{ writingMode: "vertical-rl", transform: "rotate(180deg)", color: "#FFE29A", fontFamily: "Georgia, serif", fontWeight: 600, fontSize: 12 }}
      >
        {book.title}
      </div>
      <div className="w-full flex justify-center pb-2.5">
        <div style={{ width: "60%", height: 2, background: "linear-gradient(90deg, transparent, #FFE29A, transparent)" }} />
      </div>
      {book.status === "terminado" && <div className="absolute -top-1.5 right-2 w-3.5 h-3.5 rounded-full" style={{ background: "#6F9271" }} />}
      {book.progress_percent > 0 && book.status !== "terminado" && (
        <div
          className="absolute -top-1.5 right-2 w-3 rounded-b-sm"
          style={{ height: 16 + (book.progress_percent / 100) * 16, background: "linear-gradient(180deg, #FFE29A, #E8B65A)" }}
        />
      )}
    </button>
  );
}
