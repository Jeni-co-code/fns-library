import BookSpine from "./BookSpine";

export default function ShelfRow({ folder, books, isMagica, onOpenBook }) {
  const color = folder?.color || "#8AA98C";
  const character = folder?.characterDisplay || folder?.character_emoji || "📚";

  return (
    <div className="mb-6">
      <div className="flex items-center gap-2.5 mb-3 px-1">
        {typeof character === "string" ? (
          <span className="text-xl">{character}</span>
        ) : (
          <img src={character} alt="" className="w-6 h-6 rounded-full object-cover" />
        )}
        <span
          className={isMagica ? "text-base font-extrabold" : "text-base font-semibold"}
          style={{ fontFamily: isMagica ? "'Fraunces', serif" : "Georgia, serif", color: isMagica ? "#5B3A8E" : "#FFE29A" }}
        >
          {folder?.name || "Sin estantería"}
        </span>
        <span className="text-xs opacity-50" style={{ color: isMagica ? "#5B3A8E" : "#FBF6EC" }}>
          ({books.length})
        </span>
        <div className="flex-1 h-px" style={{ background: isMagica ? "transparent" : "linear-gradient(90deg, #E8B65A40, transparent)" }} />
      </div>

      <div
        className={`flex items-end gap-2 px-5 overflow-x-auto ${isMagica ? "pt-8 pb-4 rounded-[28px]" : "pt-6 rounded-t-md"}`}
        style={{
          background: isMagica ? "linear-gradient(180deg, #FFFFFF60, #FFFFFF20)" : "linear-gradient(180deg, #2E1D12, #1D120A)",
          minHeight: 250,
          border: isMagica ? "3px dashed #FFFFFF80" : "none",
          boxShadow: isMagica ? "inset 0 0 0 1px rgba(255,255,255,0.3)" : "inset 0 12px 24px rgba(0,0,0,0.5)",
        }}
      >
        {books.map((book) => (
          <BookSpine key={book.id} book={book} color={color} isMagica={isMagica} onOpen={onOpenBook} />
        ))}
      </div>

      {!isMagica && (
        <div className="h-5 rounded-b-md" style={{ background: "linear-gradient(180deg, #6B4426, #4A2F1C 45%, #1D120A)", boxShadow: "0 6px 12px rgba(0,0,0,0.6)" }} />
      )}
    </div>
  );
}
