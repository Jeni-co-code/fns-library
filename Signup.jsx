import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { AuthBackground, AuthCard, AuthLogo, AUTH_COLORS } from "../components/AuthBackground";
import GoogleButton from "../components/GoogleButton";
import LegalFooter from "../components/LegalFooter";

export default function Signup() {
  const { signUp, signInWithGoogle } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [confirmSent, setConfirmSent] = useState(false);
  const { ink, goldSoft, gold } = AUTH_COLORS;

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.");
      return;
    }
    setLoading(true);
    const { data, error } = await signUp(email, password, name);
    setLoading(false);
    if (error) {
      setError(error.message);
      return;
    }
    if (data.session) {
      navigate("/");
    } else {
      setConfirmSent(true);
    }
  }

  async function handleGoogle() {
    setError("");
    const { error } = await signInWithGoogle();
    if (error) setError(error.message);
  }

  return (
    <AuthBackground>
      <AuthCard>
        {confirmSent ? (
          <div className="text-center">
            <AuthLogo />
            <h2 className="font-display text-xl mb-2" style={{ color: ink }}>Revisa tu correo</h2>
            <p className="text-sm" style={{ color: `${ink}90` }}>
              Te enviamos un enlace de confirmación a <strong>{email}</strong>. Ábrelo para
              activar tu cuenta y luego entra normalmente.
            </p>
          </div>
        ) : (
          <>
            <AuthLogo tagline="Crea tu propia estantería mágica." />

            <GoogleButton onClick={handleGoogle} label="Registrarse con Google" />

            <div className="flex items-center gap-3 my-4">
              <div className="h-px flex-1" style={{ background: `${goldSoft}30` }} />
              <span className="text-[10px] uppercase tracking-wide" style={{ color: `${ink}55` }}>o con tu correo</span>
              <div className="h-px flex-1" style={{ background: `${goldSoft}30` }} />
            </div>

            <form onSubmit={handleSubmit}>
              <input
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="¿Cómo te llamas?"
                className="w-full rounded-xl px-4 py-3 mb-3 text-sm focus:outline-none"
                style={{ background: "white", color: ink, border: "1px solid rgba(0,0,0,0.08)" }}
              />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Correo"
                className="w-full rounded-xl px-4 py-3 mb-3 text-sm focus:outline-none"
                style={{ background: "white", color: ink, border: "1px solid rgba(0,0,0,0.08)" }}
              />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mínimo 6 caracteres"
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
                <span className="relative z-10">{loading ? "Creando…" : "Crear mi cuenta"}</span>
                {!loading && (
                  <span
                    className="absolute inset-0"
                    style={{ background: "linear-gradient(120deg, transparent, rgba(255,255,255,0.5), transparent)", animation: "shimmerSweep 3s ease-in-out infinite" }}
                  />
                )}
              </button>
            </form>

            <p className="text-center text-sm mt-6" style={{ color: `${ink}90` }}>
              ¿Ya tienes cuenta?{" "}
              <Link to="/entrar" className="font-medium" style={{ color: gold }}>
                Entra aquí
              </Link>
            </p>

            <p className="text-center text-xs mt-4" style={{ color: `${ink}60` }}>
              Al crear tu cuenta aceptas nuestros{" "}
              <Link to="/terminos" className="underline">Términos</Link> y nuestra{" "}
              <Link to="/privacidad" className="underline">Política de privacidad</Link>.
            </p>

            <LegalFooter />
          </>
        )}
      </AuthCard>
    </AuthBackground>
  );
}
