import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../contexts/AuthContext";
import { AuthBackground, AuthCard, AuthLogo, AUTH_COLORS } from "../components/AuthBackground";
import GoogleButton from "../components/GoogleButton";
import LegalFooter from "../components/LegalFooter";
import LanguageSwitcher from "../components/LanguageSwitcher";

export default function Login() {
  const { t } = useTranslation();
  const { signIn, signInWithGoogle } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { ink, goldSoft, gold } = AUTH_COLORS;

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const { error } = await signIn(email, password);
    setLoading(false);
    if (error) {
      setError(
        error.message.includes("Invalid")
          ? "Correo o contraseña incorrectos."
          : error.message
      );
      return;
    }
    navigate("/");
  }

  async function handleGoogle() {
    setError("");
    const { error } = await signInWithGoogle();
    if (error) setError(error.message);
  }

  return (
    <AuthBackground>
      <div className="absolute top-4 right-4 z-20">
        <LanguageSwitcher />
      </div>
      <AuthCard>
        <AuthLogo tagline={t("login.tagline")} />

        <GoogleButton onClick={handleGoogle} label={t("login.google")} />

        <div className="flex items-center gap-3 my-4">
          <div className="h-px flex-1" style={{ background: `${goldSoft}30` }} />
          <span className="text-[10px] uppercase tracking-wide" style={{ color: `${ink}55` }}>{t("login.or")}</span>
          <div className="h-px flex-1" style={{ background: `${goldSoft}30` }} />
        </div>

        <form onSubmit={handleSubmit}>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={t("login.email")}
            className="w-full rounded-xl px-4 py-3 mb-3 text-sm focus:outline-none"
            style={{ background: "white", color: ink, border: "1px solid rgba(0,0,0,0.08)" }}
          />

          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={t("login.password")}
            className="w-full rounded-xl px-4 py-3 mb-1 text-sm focus:outline-none"
            style={{ background: "white", color: ink, border: "1px solid rgba(0,0,0,0.08)" }}
          />
          <div className="text-right mb-4">
            <Link to="/olvide-contrasena" className="text-xs" style={{ color: gold }}>
              {t("login.forgotPassword")}
            </Link>
          </div>

          {error && <p className="text-sm mb-3" style={{ color: "#B8494F" }}>{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="relative w-full rounded-full py-3 font-semibold text-sm overflow-hidden disabled:opacity-60"
            style={{
              background: `linear-gradient(135deg, ${goldSoft}, ${gold})`,
              color: "white",
              boxShadow: `0 8px 20px ${gold}40`,
            }}
          >
            <span className="relative z-10">{loading ? t("login.entering") : t("login.enter")}</span>
            {!loading && (
              <span
                className="absolute inset-0"
                style={{ background: "linear-gradient(120deg, transparent, rgba(255,255,255,0.5), transparent)", animation: "shimmerSweep 3s ease-in-out infinite" }}
              />
            )}
          </button>
        </form>

        <p className="text-center text-sm mt-6" style={{ color: `${ink}90` }}>
          {t("login.noAccount")}{" "}
          <Link to="/crear-cuenta" className="font-medium" style={{ color: gold }}>
            {t("login.createOne")}
          </Link>
        </p>

        <LegalFooter />
      </AuthCard>
    </AuthBackground>
  );
}
