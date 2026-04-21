import React, { useRef, useCallback, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

import ParticleBackground from "./components/ParticleBackground";
import PandaCharacter from "./components/PandaCharacter";
import CameraFeed from "./components/CameraFeed";
import ResultOverlay from "./components/ResultOverlay";
import {
  playCountdownBeep,
  playShoot,
  playWin,
  playLose,
  playDraw,
} from "./components/AudioManager";

/* ──────────────────────────────────────────────────────────
 * CONSTANTS
 * ────────────────────────────────────────────────────────── */
const CHOICES = ["rock", "paper", "scissors"];
const CHOICE_EMOJIS = { rock: "✊", paper: "✋", scissors: "✌️" };

/**
 * Rock-Paper-Scissors winner logic.
 * Returns 'win' | 'lose' | 'draw'
 */
function calcResult(player, panda) {
  if (player === panda) return "draw";
  if (
    (player === "rock" && panda === "scissors") ||
    (player === "paper" && panda === "rock") ||
    (player === "scissors" && panda === "paper")
  )
    return "win";
  return "lose";
}

/* Tailwind-safe panda emotion → aura badge colour mapping */
const resultPandaEmotion = {
  win: "sad",
  lose: "happy",
  draw: "excited",
  no_gesture: "neutral",
};

/* ──────────────────────────────────────────────────────────
 * APP
 * ────────────────────────────────────────────────────────── */
export default function App() {
  /* ── Game state machine ── */
  const [phase, setPhase] = useState("idle");
  //  idle | countdown | capture | result

  const [countdown, setCountdown] = useState(3);
  const [playerGesture, setPlayerGesture] = useState(null);
  const [pandaChoice, setPandaChoice] = useState(null);
  const [result, setResult] = useState(null);
  const [pandaEmotion, setPandaEmotion] = useState("idle");

  /* ── Live gesture from camera feed ── */
  const [liveGesture, setLiveGesture] = useState(null);
  const [liveConfidence, setLiveConf] = useState(0);
  const gestureRef = useRef(null);

  /* ── Scoreboard ── */
  const [wins, setWins] = useState(0);
  const [losses, setLosses] = useState(0);
  const [draws, setDraws] = useState(0);

  /* ── Sound toggle ── */
  const [soundOn, setSoundOn] = useState(true);
  const sfx = useCallback(
    (fn) => {
      if (soundOn) fn();
    },
    [soundOn],
  );

  /* ── Keep gestureRef in sync ── */
  const onGestureDetected = useCallback((g, c) => {
    gestureRef.current = g;
    setLiveGesture(g);
    setLiveConf(c);
  }, []);

  /* ── Start a new round ── */
  const startRound = useCallback(() => {
    setPhase("countdown");
    setCountdown(3);
    setResult(null);
    setPandaChoice(null);
    setPlayerGesture(null);
    setPandaEmotion("thinking");

    let count = 3;
    const tick = setInterval(() => {
      count--;
      setCountdown(count);

      if (count > 0) {
        sfx(() => playCountdownBeep(false));
      } else {
        clearInterval(tick);
        sfx(() => playCountdownBeep(true));
        setPhase("capture");

        // Capture gesture after a brief "SHOOT!" window
        setTimeout(() => {
          const capturedGesture = gestureRef.current;
          const pandaMove = CHOICES[Math.floor(Math.random() * CHOICES.length)];

          sfx(playShoot);
          setPandaChoice(pandaMove);

          if (capturedGesture) {
            const roundResult = calcResult(capturedGesture, pandaMove);
            setPlayerGesture(capturedGesture);
            setResult(roundResult);
            setPandaEmotion(resultPandaEmotion[roundResult]);

            // Update score
            if (roundResult === "win") {
              setWins((w) => w + 1);
              sfx(playWin);
            }
            if (roundResult === "lose") {
              setLosses((l) => l + 1);
              sfx(playLose);
            }
            if (roundResult === "draw") {
              setDraws((d) => d + 1);
              sfx(playDraw);
            }
          } else {
            setResult("no_gesture");
            setPandaEmotion("neutral");
          }
          setPhase("result");
        }, 600);
      }
    }, 1000);
  }, [sfx]);

  /* ── Registration redirect ── */
  const handleRegister = useCallback(() => {
    // ← Replace this URL with your actual registration form
    window.open(
      "https://docs.google.com/forms/d/e/1FAIpQLSeIaDDnXwyk732wz-_NzP_hUEzDLv_jXrCsjE21oepJlD6X4A/viewform?usp=header",
      "_blank",
      "noopener",
    );
  }, []);

  /* ── Auto-redirect 2 s after a win ── */
  const [redirectCountdown, setRedirectCountdown] = useState(null);

  useEffect(() => {
    if (result !== "win") return;
    setRedirectCountdown(2);
    const interval = setInterval(() => {
      setRedirectCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          handleRegister();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [result, handleRegister]);

  /* ─────────────────────────────────────────── RENDER ── */
  return (
    <div
      className="relative min-h-screen overflow-x-hidden font-body text-white"
      style={{ background: "#06060f" }}
    >
      {/* ── Animated background ── */}
      <ParticleBackground />

      {/* ── Top decorative band ── */}
      <div
        className="fixed top-0 left-0 right-0 h-px z-40"
        style={{
          background:
            "linear-gradient(90deg, transparent, #ff1a35 30%, #ff1a35 70%, transparent)",
        }}
      />

      {/* ── Sound toggle ── */}
      <button
        onClick={() => setSoundOn((s) => !s)}
        className="fixed top-4 right-4 z-50 glass-card p-2.5 text-base leading-none
                   hover:scale-110 transition-transform"
        title={soundOn ? "Mute sounds" : "Enable sounds"}
        style={{ border: "1px solid rgba(255,255,255,0.1)" }}
      >
        {soundOn ? "🔊" : "🔇"}
      </button>

      {/* ═══════════════════════════════════════ HEADER ═══ */}
      <header className="relative z-10 text-center pt-10 pb-6 px-4">
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          {/* IEEE pill */}
          <div className="flex items-center justify-center gap-3 mb-3">
            <div
              className="h-px flex-1 max-w-[80px]"
              style={{
                background: "linear-gradient(90deg, transparent, #ff1a35)",
              }}
            />
            <span
              className="font-display text-[10px] text-red-400 uppercase tracking-[0.3em]
                             glass-card px-3 py-1"
              style={{ border: "1px solid rgba(255,26,53,0.3)" }}
            >
              IEEE EPI SB · Event
            </span>
            <div
              className="h-px flex-1 max-w-[80px]"
              style={{
                background: "linear-gradient(270deg, transparent, #ff1a35)",
              }}
            />
          </div>

          {/* Main title */}
          <div className="flex items-baseline justify-center gap-0 flex-wrap">
            <motion.span
              className="font-display font-black uppercase text-5xl md:text-7xl tracking-tighter"
              style={{ color: "#fff" }}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1, duration: 0.7 }}
            >
              Save
            </motion.span>
            <motion.span
              className="font-display font-black uppercase text-5xl md:text-7xl tracking-tighter
                         text-glow-red"
              style={{ color: "#ff1a35" }}
              initial={{ opacity: 0, scale: 1.3 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.6 }}
            >
              Lives
            </motion.span>
            <motion.span
              className="font-display font-black uppercase text-5xl md:text-7xl tracking-tighter ml-3"
              style={{ color: "#fff" }}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, duration: 0.7 }}
            >
              AI
            </motion.span>
          </div>

          <motion.div
            className="font-display text-xl md:text-2xl tracking-[0.25em] mt-1 text-glow-cyan"
            style={{ color: "#00f5ff" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.45, duration: 0.8 }}
          >
            HACKATHON
          </motion.div>

          <motion.p
            className="text-gray-400 mt-2 text-sm md:text-base tracking-[0.2em] uppercase"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            Beat the Panda to Register
          </motion.p>
        </motion.div>
      </header>

      {/* ═════════════════════════════════════ GAME AREA ═══ */}
      <main className="relative z-10 container mx-auto px-4 max-w-5xl pb-16">
        {/* ── Layout: camera | VS | panda ── */}
        <div className="flex flex-col lg:flex-row items-center justify-center gap-6 lg:gap-10">
          {/* Camera feed */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="flex-shrink-0"
          >
            <CameraFeed
              onGestureDetected={onGestureDetected}
              gameState={phase}
            />

            {/* Live confidence pill */}
            <AnimatePresence>
              {liveGesture && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  className="mt-3 glass-card px-5 py-3 flex items-center gap-4"
                  style={{ border: "1px solid rgba(0,245,255,0.2)" }}
                >
                  <span className="text-3xl leading-none">
                    {CHOICE_EMOJIS[liveGesture]}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-display text-xs uppercase tracking-widest text-white capitalize">
                        {liveGesture}
                      </span>
                      <span className="font-display text-xs text-cyan-400">
                        {Math.round(liveConfidence * 100)}%
                      </span>
                    </div>
                    {/* Confidence bar */}
                    <div className="w-full h-1 bg-gray-800 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full rounded-full"
                        style={{
                          background:
                            "linear-gradient(90deg, #00f5ff, #00a0b0)",
                        }}
                        animate={{ width: `${liveConfidence * 100}%` }}
                        transition={{ duration: 0.15 }}
                      />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* VS divider */}
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.55, type: "spring" }}
            className="flex flex-col items-center gap-3 flex-shrink-0"
          >
            <div
              className="hidden lg:block w-px h-24"
              style={{
                background:
                  "linear-gradient(180deg, transparent, rgba(255,26,53,0.5), transparent)",
              }}
            />
            <span
              className="font-display font-black text-3xl tracking-widest text-glow-red"
              style={{ color: "#ff1a35" }}
            >
              VS
            </span>
            <div
              className="hidden lg:block w-px h-24"
              style={{
                background:
                  "linear-gradient(180deg, transparent, rgba(255,26,53,0.5), transparent)",
              }}
            />
          </motion.div>

          {/* Panda + panda choice */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="flex flex-col items-center gap-4 flex-shrink-0"
          >
            <PandaCharacter
              emotion={pandaEmotion}
              pandaChoice={pandaChoice}
              gameState={phase}
            />
          </motion.div>
        </div>

        {/* ═══════════════════════════════════ GAME CONTROLS ═══ */}
        <div className="flex flex-col items-center mt-10 gap-5">
          <AnimatePresence mode="wait">
            {/* ── IDLE: start button ── */}
            {phase === "idle" && (
              <motion.div
                key="idle"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="flex flex-col items-center gap-4"
              >
                <p className="text-gray-500 text-sm tracking-widest uppercase text-center">
                  Show your hand gesture to the camera, then challenge the panda
                </p>
                <button className="btn-neon-red text-lg" onClick={startRound}>
                  🤜&nbsp; Challenge Panda
                </button>
              </motion.div>
            )}

            {/* ── COUNTDOWN ── */}
            {phase === "countdown" && (
              <motion.div
                key="countdown"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center gap-3"
              >
                <p className="font-display text-xs uppercase tracking-[0.3em] text-gray-400">
                  Get your hand ready…
                </p>
                <AnimatePresence mode="wait">
                  <motion.div
                    key={countdown}
                    initial={{ scale: 2.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.4, opacity: 0 }}
                    transition={{ duration: 0.35, ease: "backOut" }}
                    className="font-display font-black text-9xl leading-none"
                    style={{
                      color: "#ff1a35",
                      textShadow: "0 0 40px rgba(255,26,53,0.7)",
                    }}
                  >
                    {countdown}
                  </motion.div>
                </AnimatePresence>
              </motion.div>
            )}

            {/* ── CAPTURE ── */}
            {phase === "capture" && (
              <motion.div
                key="capture"
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 1.5, opacity: 0 }}
                transition={{ duration: 0.3, ease: "backOut" }}
              >
                <motion.div
                  className="font-display font-black text-5xl md:text-6xl text-glow-cyan"
                  style={{ color: "#00f5ff" }}
                  animate={{ scale: [1, 1.04, 1] }}
                  transition={{ duration: 0.3, repeat: 3 }}
                >
                  ✊ &nbsp;SHOOT!&nbsp; ✌️
                </motion.div>
              </motion.div>
            )}

            {/* ── RESULT ── */}
            {phase === "result" && result && (
              <motion.div
                key="result"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center gap-5 w-full"
              >
                {/* Result card */}
                <ResultOverlay
                  result={result}
                  playerGesture={playerGesture}
                  pandaChoice={pandaChoice}
                />

                {/* Action buttons */}
                <div className="flex flex-wrap gap-3 justify-center">
                  <button className="btn-outline-cyan" onClick={startRound}>
                    ↺&nbsp; Play Again
                  </button>

                  {/* Show auto-redirect notice on win */}
                  <AnimatePresence>
                    {result === "win" && (
                      <motion.div
                        key="redirect"
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{
                          delay: 0.4,
                          type: "spring",
                          stiffness: 200,
                        }}
                        className="flex flex-col items-center gap-2"
                      >
                        <motion.div
                          className="glass-card px-6 py-3 flex items-center gap-3 cursor-pointer"
                          style={{
                            border: "1px solid rgba(57,255,20,0.5)",
                            boxShadow: "0 0 24px rgba(57,255,20,0.3)",
                          }}
                          onClick={handleRegister}
                          whileHover={{ scale: 1.04 }}
                        >
                          <motion.span
                            className="font-display text-3xl font-black"
                            style={{
                              color: "#39ff14",
                              textShadow: "0 0 16px rgba(57,255,20,0.8)",
                            }}
                            key={redirectCountdown}
                            initial={{ scale: 1.6, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ duration: 0.3 }}
                          >
                            {redirectCountdown}
                          </motion.span>
                          <span
                            className="font-display text-sm uppercase tracking-widest"
                            style={{ color: "#39ff14" }}
                          >
                            🎉 Redirecting to registration…
                          </span>
                        </motion.div>
                        <p className="text-gray-600 text-[11px] tracking-widest uppercase">
                          or{" "}
                          <button
                            className="text-cyan-500 underline"
                            onClick={handleRegister}
                          >
                            click here
                          </button>{" "}
                          now
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Scoreboard */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="glass-card px-8 py-4 flex items-center gap-6 md:gap-10"
                  style={{ border: "1px solid rgba(255,255,255,0.07)" }}
                >
                  {[
                    { label: "Wins", value: wins, color: "#39ff14" },
                    { label: "Draws", value: draws, color: "#00f5ff" },
                    { label: "Losses", value: losses, color: "#ff1a35" },
                  ].map(({ label, value, color }, i) => (
                    <React.Fragment key={label}>
                      {i > 0 && <div className="w-px h-8 bg-gray-700" />}
                      <div className="text-center min-w-[48px]">
                        <p className="font-display text-xs uppercase tracking-widest text-gray-500 mb-1">
                          {label}
                        </p>
                        <motion.p
                          className="font-display text-2xl font-black"
                          style={{ color }}
                          key={value}
                          initial={{ scale: 1.5 }}
                          animate={{ scale: 1 }}
                        >
                          {value}
                        </motion.p>
                      </div>
                    </React.Fragment>
                  ))}
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* ═══════════════════════════════════════ FOOTER ═══ */}
      <footer className="relative z-10 text-center pb-8 px-4">
        <p className="text-gray-700 text-xs tracking-widest uppercase font-display">
          IEEE EPI Student Branch &nbsp;·&nbsp; SaveLives AI Hackathon
          &nbsp;·&nbsp;
          <span className="text-red-900">Powered by MediaPipe + React</span>
        </p>
      </footer>

      {/* ── Bottom decorative band ── */}
      <div
        className="fixed bottom-0 left-0 right-0 h-px z-40"
        style={{
          background:
            "linear-gradient(90deg, transparent, rgba(0,245,255,0.4) 40%, rgba(0,245,255,0.4) 60%, transparent)",
        }}
      />
    </div>
  );
}
