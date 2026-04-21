import { motion } from 'framer-motion'

/**
 * Animated result card shown after each round.
 * result: 'win' | 'lose' | 'draw' | 'no_gesture'
 */

const CHOICE_EMOJI = { rock: '✊', paper: '✋', scissors: '✌️' }

const RESULT_CONFIG = {
  win: {
    headline: '🎉 YOU WIN!',
    sub: "You outsmarted the panda! Now register and show the world.",
    headlineColor: '#39ff14',
    glowColor: 'rgba(57,255,20,0.5)',
    borderColor: 'rgba(57,255,20,0.35)',
    badge: { bg: 'rgba(57,255,20,0.1)', text: 'victory', color: '#39ff14' },
  },
  lose: {
    headline: '😤 PANDA WINS!',
    sub: "The bamboo-muncher got you. Rematch — prove yourself!",
    headlineColor: '#ff1a35',
    glowColor: 'rgba(255,26,53,0.55)',
    borderColor: 'rgba(255,26,53,0.35)',
    badge: { bg: 'rgba(255,26,53,0.1)', text: 'defeat', color: '#ff1a35' },
  },
  draw: {
    headline: '🤝 DRAW!',
    sub: "The panda matched your move! Impressive minds think alike.",
    headlineColor: '#00f5ff',
    glowColor: 'rgba(0,245,255,0.45)',
    borderColor: 'rgba(0,245,255,0.3)',
    badge: { bg: 'rgba(0,245,255,0.08)', text: 'draw', color: '#00f5ff' },
  },
  no_gesture: {
    headline: '👀 NO GESTURE!',
    sub: "We couldn't read your hand. Hold it steady and try again!",
    headlineColor: '#fbbf24',
    glowColor: 'rgba(251,191,36,0.4)',
    borderColor: 'rgba(251,191,36,0.25)',
    badge: { bg: 'rgba(251,191,36,0.08)', text: 'missed', color: '#fbbf24' },
  },
}

export default function ResultOverlay({ result, playerGesture, pandaChoice }) {
  const cfg = RESULT_CONFIG[result] || RESULT_CONFIG.draw

  return (
    <motion.div
      initial={{ scale: 0.6, opacity: 0, y: 20 }}
      animate={{ scale: 1,   opacity: 1, y: 0  }}
      exit={{ scale: 0.8, opacity: 0 }}
      transition={{ type: 'spring', stiffness: 240, damping: 22 }}
      className="glass-card px-8 py-6 text-center max-w-sm w-full"
      style={{
        border: `1px solid ${cfg.borderColor}`,
        boxShadow: `0 0 40px ${cfg.glowColor}, 0 8px 40px rgba(0,0,0,0.6)`,
      }}
    >
      {/* Badge */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="inline-block px-3 py-0.5 rounded-full font-display text-[10px]
                   uppercase tracking-widest mb-3"
        style={{ background: cfg.badge.bg, color: cfg.badge.color,
                 border: `1px solid ${cfg.borderColor}` }}
      >
        {cfg.badge.text}
      </motion.div>

      {/* Headline */}
      <motion.h2
        className="font-display font-black text-3xl md:text-4xl leading-none"
        style={{ color: cfg.headlineColor, textShadow: `0 0 20px ${cfg.glowColor}` }}
        animate={{ scale: [1, 1.04, 1, 1.03, 1] }}
        transition={{ duration: 0.6, delay: 0.1 }}
      >
        {cfg.headline}
      </motion.h2>

      <p className="text-gray-400 text-sm mt-2 leading-relaxed font-body">{cfg.sub}</p>

      {/* Move comparison */}
      {playerGesture && pandaChoice && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.25, type: 'spring' }}
          className="flex items-center justify-center gap-4 mt-4"
        >
          {/* Player */}
          <div className="flex flex-col items-center gap-1">
            <span className="text-4xl">{CHOICE_EMOJI[playerGesture]}</span>
            <span className="font-display text-[10px] uppercase tracking-widest text-cyan-400">You</span>
            <span className="font-display text-xs text-gray-400 capitalize">{playerGesture}</span>
          </div>

          {/* VS separator */}
          <span className="font-display text-gray-600 text-lg font-bold">VS</span>

          {/* Panda */}
          <div className="flex flex-col items-center gap-1">
            <span className="text-4xl">{CHOICE_EMOJI[pandaChoice]}</span>
            <span className="font-display text-[10px] uppercase tracking-widest text-red-400">Panda</span>
            <span className="font-display text-xs text-gray-400 capitalize">{pandaChoice}</span>
          </div>
        </motion.div>
      )}
    </motion.div>
  )
}
