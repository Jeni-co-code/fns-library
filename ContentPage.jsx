import { Link } from "react-router-dom";

export default function ContentPage({ title, updated, children }) {
  return (
    <div className="min-h-screen bg-paper-50">
      <div className="max-w-2xl mx-auto px-6 py-14">
        <Link to="/entrar" className="text-sm text-berry-600 hover:underline">
          ← Volver
        </Link>
        <h1 className="font-display text-4xl text-ink mt-4 mb-1">{title}</h1>
        {updated && <p className="text-ink/40 text-sm mb-10">Actualizado: {updated}</p>}
        <div className="prose-custom space-y-5 text-ink/80 leading-relaxed">
          {children}
        </div>
      </div>
    </div>
  );
}
