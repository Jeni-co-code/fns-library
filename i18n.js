import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import es from "./locales/es.json";
import en from "./locales/en.json";
import de from "./locales/de.json";
import fr from "./locales/fr.json";
import pt from "./locales/pt.json";

const savedLang = localStorage.getItem("fns-lang");
const browserLang = navigator.language?.slice(0, 2);
const supported = ["es", "en", "de", "fr", "pt"];
const initialLang = savedLang || (supported.includes(browserLang) ? browserLang : "es");

i18n.use(initReactI18next).init({
  resources: {
    es: { translation: es },
    en: { translation: en },
    de: { translation: de },
    fr: { translation: fr },
    pt: { translation: pt },
  },
  lng: initialLang,
  fallbackLng: "es",
  interpolation: { escapeValue: false },
});

export function setLanguage(lang) {
  i18n.changeLanguage(lang);
  localStorage.setItem("fns-lang", lang);
}

export const LANGUAGES = [
  { code: "es", label: "Español" },
  { code: "en", label: "English" },
  { code: "de", label: "Deutsch" },
  { code: "fr", label: "Français" },
  { code: "pt", label: "Português" },
];

export default i18n;
