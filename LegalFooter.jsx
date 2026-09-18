import { Link } from "react-router-dom";

export default function LegalFooter() {
  return (
    <div className="mt-10 text-center">
      <div className="flex items-center justify-center gap-4 text-xs text-ink/40">
        <Link to="/manual" className="hover:text-ink/70 hover:underline">
          Manual de uso
        </Link>
        <span>·</span>
        <Link to="/privacidad" className="hover:text-ink/70 hover:underline">
          Privacidad
        </Link>
        <span>·</span>
        <Link to="/terminos" className="hover:text-ink/70 hover:underline">
          Términos
        </Link>
      </div>
      <p className="text-[11px] text-ink/30 mt-3">
        Un proyecto de <span className="font-medium text-ink/45">Fraag Nizam Studio</span>
      </p>
    </div>
  );
}
