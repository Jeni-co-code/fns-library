import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { AuthBackground, AuthCard, AuthLogo, AUTH_COLORS } from "../components/AuthBackground";
import LegalFooter from "../components/LegalFooter";

export default function ForgotPassword() {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { ink, goldSoft, gold } = AUTH_COLORS;

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const { error } = await resetPassword(email);
    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    setSent(true);
  }

  return (
    <AuthBackground>
      <AuthCard>
        <AuthLogo tagline="Te ayudamos a volver a entrar." />

        {sent ? (
          <p className="text-sm text-center" style={{ color: `${ink}90` }}>
            Si <strong>{email}</strong> tiene una cuenta con nosotros, te llegará un enlace
            para crear una nueva contraseña.
          </p>
        ) : (
          <form onSubmit={handleSubmit}>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Correo"
              className="w-full rounded-xl px-4 py-3 mb-2 text-sm focus:outline-none"
              style={{ background: "white", color: ink, border: "1px solid rgba(0,0,0,0.08)" }}
            />
            {error && <p className="text-sm mt-1 mb-2" style={{ color: "#B8494F" }}>{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="relative w-full rounded-full py-3 font-semibold text-sm overflow-hidden disabled:opacity-60 mt-3"
              style={{ background: `linear-gradient(135deg, ${goldSoft}, ${gold})`, color: "white", boxShadow: `0 8px 20px ${gold}40` }}
            >
              {loading ? "Enviando…" : "Enviar enlace"}
            </button>
          </form>
        )}

        <p className="text-center text-sm mt-6" style={{ color: `${ink}90` }}>
          <Link to="/entrar" className="font-medium" style={{ color: gold }}>
            Volver a entrar
          </Link>
        </p>

        <LegalFooter />
      </AuthCard>
    </AuthBackground>
  );
}
