import fnsIcon from "../assets/fns-icon.png";

export const AUTH_COLORS = {
  gold: "#B8860B",
  goldSoft: "#C9971F",
  cream: "#FBF1EA",
  ink: "#3A2E22",
  brown: "#3E2E22",
};

const BOOK_HUES = ["#AE4166", "#4F86C6", "#6F9271", "#C9971F", "#8A6FB0"];

function FlyingBook({ style, hue }) {
  return (
    <svg width="34" height="26" viewBox="0 0 34 26" style={style}>
      <ellipse cx="17" cy="23" rx="12" ry="2" fill="black" opacity="0.12" />
      <path d="M17 4 C12 1.5 5 1 2 2.5 V18 C5 16.5 12 17 17 19.5 Z" fill="#FBF6EC" stroke="#D8CBB8" strokeWidth="0.4" />
      {[4, 6.2, 8.4].map((y, i) => (
        <path key={i} d={`M2 ${y + 0.5} C6 ${y - 0.6} 12 ${y - 0.2} 17 ${y + 2.2}`} fill="none" stroke="#E4D8C6" strokeWidth="0.35" />
      ))}
      <path d="M17 4 C22 1.5 29 1 32 2.5 V18 C29 16.5 22 17 17 19.5 Z" fill="#FBF6EC" stroke="#D8CBB8" strokeWidth="0.4" />
      {[4, 6.2, 8.4].map((y, i) => (
        <path key={i} d={`M32 ${y + 0.5} C28 ${y - 0.6} 22 ${y - 0.2} 17 ${y + 2.2}`} fill="none" stroke="#E4D8C6" strokeWidth="0.35" />
      ))}
      <path d="M17 4 C12 1.5 5 1 2 2.5 V4.4 C5 2.9 12 3.4 17 5.9 Z" fill={hue} opacity="0.85" />
      <path d="M17 4 C22 1.5 29 1 32 2.5 V4.4 C29 2.9 22 3.4 17 5.9 Z" fill={hue} opacity="0.85" />
      <line x1="17" y1="4" x2="17" y2="19.5" stroke={AUTH_COLORS.brown} strokeWidth="0.6" />
      <path d="M17 4 L18.4 4 L18.4 9 L17.7 8 L17 9 Z" fill="#B8494F" opacity="0.9" />
    </svg>
  );
}

function FlyingBooks() {
  const items = Array.from({ length: 11 });
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {items.map((_, i) => {
        const left = (i * 53) % 100;
        const duration = 13 + (i % 5) * 2;
        const delay = (i % 8) * 1.3;
        const drift = i % 2 === 0 ? 34 : -34;
        return (
          <FlyingBook
            key={i}
            hue={BOOK_HUES[i % BOOK_HUES.length]}
            style={{
              position: "absolute",
              left: `${left}%`,
              bottom: "-8%",
              opacity: 0,
              "--drift": `${drift}px`,
              animation: `bookFloat ${duration}s ease-in ${delay}s infinite`,
            }}
          />
        );
      })}
    </div>
  );
}

export function AuthKeyframes() {
  return (
    <style>{`
      @keyframes bookFloat {
        0% { transform: translateY(0) translateX(0) rotate(-8deg); opacity: 0; }
        12% { opacity: 0.85; }
        88% { opacity: 0.5; }
        100% { transform: translateY(-680px) translateX(var(--drift)) rotate(8deg); opacity: 0; }
      }
      @keyframes glowPulse {
        0%, 100% { opacity: 0.5; transform: scale(1); }
        50% { opacity: 0.85; transform: scale(1.08); }
      }
      @keyframes shimmerText {
        0% { background-position: 0% 50%; }
        100% { background-position: 200% 50%; }
      }
      @keyframes riseIn {
        from { opacity: 0; transform: translateY(16px); }
        to { opacity: 1; transform: translateY(0); }
      }
      @keyframes shimmerSweep {
        0% { transform: translateX(-120%) skewX(-15deg); }
        60%, 100% { transform: translateX(220%) skewX(-15deg); }
      }
      @keyframes cardIn {
        from { opacity: 0; transform: translateY(24px); }
        to { opacity: 1; transform: translateY(0); }
      }
    `}</style>
  );
}

export function AuthBackground({ children }) {
  const { cream } = AUTH_COLORS;
  return (
    <div className="min-h-screen w-full relative overflow-hidden flex items-center justify-center px-4 py-12">
      <AuthKeyframes />
      <div className="absolute inset-0" style={{ background: `linear-gradient(160deg, ${cream}, #F7E8DC 45%, #F2E3E8)` }}>
        <div
          className="absolute w-[460px] h-[460px] rounded-full blur-3xl"
          style={{ background: "radial-gradient(circle, #C9971F30, transparent 70%)", top: "-8%", left: "-6%", animation: "glowPulse 9s ease-in-out infinite" }}
        />
        <div
          className="absolute w-[380px] h-[380px] rounded-full blur-3xl"
          style={{ background: "radial-gradient(circle, #E8B0C233, transparent 70%)", bottom: "-6%", right: "-4%", animation: "glowPulse 11s ease-in-out infinite 1s" }}
        />
      </div>
      <FlyingBooks />
      <div className="relative z-10 w-full flex items-center justify-center">{children}</div>
    </div>
  );
}

export function AuthCard({ children, delay = 0 }) {
  return (
    <div
      className="w-full max-w-sm rounded-3xl p-8"
      style={{
        background: "rgba(255,255,255,0.6)",
        backdropFilter: "blur(14px)",
        border: `1px solid ${AUTH_COLORS.goldSoft}35`,
        boxShadow: "0 20px 50px rgba(184,134,11,0.15), 0 4px 12px rgba(0,0,0,0.05)",
        animation: `cardIn 0.6s ease ${delay}s both`,
      }}
    >
      {children}
    </div>
  );
}

export function AuthLogo({ tagline }) {
  const { brown, goldSoft } = AUTH_COLORS;
  return (
    <div className="flex flex-col items-center mb-6" style={{ animation: "riseIn 0.6s ease 0.1s both" }}>
      <img src={fnsIcon} alt="FNS" style={{ height: 60, width: "auto" }} />
      <h1
        className="text-2xl font-semibold mt-1 tracking-wide"
        style={{
          fontFamily: "Fraunces, Georgia, serif",
          background: `linear-gradient(90deg, ${brown}, ${goldSoft}, ${brown})`,
          backgroundSize: "200% auto",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          animation: "shimmerText 4s linear infinite",
        }}
      >
        FNS Library
      </h1>
      {tagline && <p className="text-xs mt-1" style={{ color: `${AUTH_COLORS.ink}80` }}>{tagline}</p>}
    </div>
  );
}
