import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { AuthBackground, AuthCard, AuthLogo, AUTH_COLORS } from "../components/AuthBackground";

export default function ResetPassword() {
  const { updatePassword } = useAuth();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);
  const { ink, goldSoft, gold } = AUTH_COLORS;

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.");
      return;
    }
    setLoading(true);
    const { error } = await updatePassword(password);
    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    setDone(true);
    setTimeout(() => navigate("/"), 1500);
  }

  return (
    <AuthBackground>
      <AuthCard>
        <AuthLogo tagline="Elige algo que recuerdes y que solo tú sepas." />

        {done ? (
          <p className="text-sm text-center" style={{ color: `${ink}90` }}>
            Tu contraseña se actualizó. Entrando a tu biblioteca…
          </p>
        ) : (
          <form onSubmit={handleSubmit}>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Nueva contraseña (mínimo 6 caracteres)"
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
              {loading ? "Guardando…" : "Guardar contraseña"}
            </button>
          </form>
        )}
      </AuthCard>
    </AuthBackground>
  );
}
