import { useTranslation } from "react-i18next";
import { LANGUAGES, setLanguage } from "../i18n";

export default function LanguageSwitcher({ className = "", light = false }) {
  const { i18n } = useTranslation();

  return (
    <select
      value={i18n.language}
      onChange={(e) => setLanguage(e.target.value)}
      className={`text-xs rounded-full px-2.5 py-1 focus:outline-none ${className}`}
      style={
        light
          ? { background: "rgba(255,255,255,0.08)", color: "#FBF6EC", border: "1px solid rgba(255,255,255,0.15)" }
          : { background: "white", color: "#3A2E22", border: "1px solid rgba(0,0,0,0.1)" }
      }
    >
      {LANGUAGES.map((l) => (
        <option key={l.code} value={l.code}>
          {l.label}
        </option>
      ))}
    </select>
  );
}
