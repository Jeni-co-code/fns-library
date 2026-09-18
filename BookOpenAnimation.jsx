import { useEffect, useState } from "react";

function playChime() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    [523, 659, 784, 988, 1175].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.08);
      gain.gain.setValueAtTime(0, ctx.currentTime + i * 0.08);
      gain.gain.linearRampToValueAtTime(0.12, ctx.currentTime + i * 0.08 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.08 + 0.35);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime + i * 0.08);
      osc.stop(ctx.currentTime + i * 0.08 + 0.4);
    });
  } catch {
    // Web Audio not available — silently skip the sound, animation still plays
  }
}

export default function BookOpenAnimation({ book, color, character, onDone }) {
  const [stage, setStage] = useState("pop");

  useEffect(() => {
    playChime();
    const t1 = setTimeout(() => setStage("flip"), 350);
    const t2 = setTimeout(() => onDone(), 1400);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: "radial-gradient(circle, #FFF3D6, #FFE8F3)" }}>
      <style>{`
        @keyframes bookPop { 0% { transform: scale(1); } 60% { transform: scale(1.3) translateY(-30px) rotate(-4deg); } 100% { transform: scale(1.5) translateY(-45px) rotate(0deg); } }
        @keyframes bookFlip { 0% { transform: perspective(1200px) rotateY(0deg); } 100% { transform: perspective(1200px) rotateY(-150deg); } }
        @keyframes charFly { 0% { transform: translate(0,0) scale(0.4); opacity: 0; } 30% { opacity: 1; } 100% { transform: translate(60px,-160px) scale(1); opacity: 1; } }
        @keyframes sparkle { 0% { opacity: 0; transform: scale(0.3); } 40% { opacity: 1; } 100% { opacity: 0; transform: scale(1.6); } }
      `}</style>

      {stage === "flip" &&
        [0, 1, 2].map((i) => (
          <div
            key={i}
            className="absolute text-2xl"
            style={{ left: `${48 + i * 6}%`, top: `${35 - i * 5}%`, animation: `sparkle 0.8s ease-out ${0.1 + i * 0.15}s forwards` }}
          >
            ✨
          </div>
        ))}

      <div style={{ perspective: 1200 }}>
        <div
          className="w-32 h-48 rounded-2xl origin-left flex items-center justify-center"
          style={{
            background: `linear-gradient(160deg, ${color}dd, ${color})`,
            border: "3px solid white",
            boxShadow: "0 10px 30px rgba(0,0,0,0.25)",
            animation: stage === "pop" ? "bookPop 0.35s ease-out forwards" : "bookFlip 1s ease-in-out forwards",
          }}
        >
          <span
            className="text-center px-2 text-white font-bold text-sm"
            style={{ writingMode: "vertical-rl", transform: "rotate(180deg)", fontFamily: "'Fraunces', serif" }}
          >
            {book.title}
          </span>
        </div>
      </div>

      {stage === "flip" && (
        <div className="absolute text-5xl" style={{ left: "50%", top: "50%", animation: "charFly 0.7s ease-out forwards" }}>
          {typeof character === "string" ? character : <img src={character} alt="" className="w-14 h-14 rounded-full" />}
        </div>
      )}
    </div>
  );
}
