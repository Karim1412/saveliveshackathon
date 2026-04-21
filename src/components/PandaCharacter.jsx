import { motion, AnimatePresence } from 'framer-motion'
import pandaImg from '../assets/panda.png'

/**
 * Panda mascot component.
 *
 * emotion: 'idle' | 'thinking' | 'happy' | 'sad' | 'excited' | 'neutral'
 * pandaChoice: 'rock' | 'paper' | 'scissors' | null
 * gameState: current game phase
 */

const CHOICE_LABELS = { rock: '✊', paper: '✋', scissors: '✌️' }

/* CSS filter per emotion */
const emotionFilter = {
  idle:     'none',
  thinking: 'brightness(1) saturate(1)',
  happy:    'brightness(1.25) drop-shadow(0 0 18px rgba(255, 26, 53, 0.65))',
  sad:      'brightness(0.65) saturate(0.3) hue-rotate(200deg)',
  excited:  'brightness(1.35) saturate(1.3) drop-shadow(0 0 22px rgba(57,255,20,0.7))',
  neutral:  'brightness(0.95)',
}

/* Framer Motion animation per emotion */
const emotionAnimation = {
  idle: {
    y: [0, -10, 0],
    rotate: [0, 0, 0],
    scale: [1, 1, 1],
    transition: { duration: 3.5, repeat: Infinity, ease: 'easeInOut' },
  },
  thinking: {
    rotate: [-4, 4, -4, 4, -2, 0],
    y: [0, -4, 0],
    transition: { duration: 1.1, repeat: Infinity, ease: 'easeInOut' },
  },
  happy: {
    y: [0, -28, 0, -18, 0, -10, 0],
    rotate: [-6, 6, -4, 4, 0],
    scale: [1, 1.08, 1, 1.04, 1],
    transition: { duration: 0.7, repeat: 3, ease: 'easeOut' },
  },
  sad: {
    y: [0, 6, 4, 6, 0],
    rotate: [-3, 3, -3],
    scale: [1, 0.95, 1],
    transition: { duration: 2.5, repeat: Infinity, ease: 'easeInOut' },
  },
  excited: {
    scale: [1, 1.14, 0.95, 1.1, 1],
    y: [0, -30, 0, -22, 0],
    rotate: [-6, 6, -6, 6, 0],
    transition: { duration: 0.55, repeat: 4, ease: 'easeOut' },
  },
  neutral: {
    scale: [1, 1.02, 1],
    y: 0,
    transition: { duration: 2, repeat: Infinity },
  },
}

/* Aura ring color per emotion */
const auraColor = {
  idle:     'rgba(255,255,255,0.06)',
  thinking: 'rgba(0,245,255,0.15)',
  happy:    'rgba(255,26,53,0.45)',
  sad:      'rgba(0,150,255,0.25)',
  excited:  'rgba(57,255,20,0.4)',
  neutral:  'rgba(255,255,255,0.08)',
}

/* Status text per emotion */
const statusLabel = {
  idle:     { icon: '🐼', text: 'Ready to fight' },
  thinking: { icon: '🤔', text: 'Thinking...' },
  happy:    { icon: '😏', text: 'Panda wins!' },
  sad:      { icon: '😢', text: 'Panda loses...' },
  excited:  { icon: '🎉', text: "It's a draw!" },
  neutral:  { icon: '😐', text: 'Hmm...' },
}

export default function PandaCharacter({ emotion = 'idle', pandaChoice, gameState }) {
  const status = statusLabel[emotion] || statusLabel.idle

  return (
    <div className="flex flex-col items-center gap-3">
      {/* Aura + panda wrapper */}
      <div className="relative flex items-center justify-center">

        {/* Outer pulsing aura ring */}
        <motion.div
          className="absolute rounded-full"
          style={{ width: 310, height: 310 }}
          animate={{
            boxShadow: [
              `0 0 30px ${auraColor[emotion]}`,
              `0 0 60px ${auraColor[emotion]}`,
              `0 0 30px ${auraColor[emotion]}`,
            ],
          }}
          transition={{ duration: 2, repeat: Infinity }}
        />

        {/* Inner glassy ring */}
        <div
          className="absolute rounded-full"
          style={{
            width: 295,
            height: 295,
            border: `1px solid ${auraColor[emotion]}`,
            background: `radial-gradient(circle, ${auraColor[emotion].replace(')', ', 0.05)')} 0%, transparent 70%)`,
          }}
        />

        {/* Panda image with emotion animation */}
        <motion.div
          key={emotion}
          animate={emotionAnimation[emotion] || emotionAnimation.idle}
          style={{ filter: emotionFilter[emotion] || 'none' }}
          className="relative z-10"
        >
          <img
            src={pandaImg}
            alt="IEEE EPI SB Panda mascot"
            className="w-64 h-64 md:w-80 md:h-80 object-contain select-none"
            draggable={false}
          />
        </motion.div>

        {/* Panda choice badge — flies in when result is revealed */}
        <AnimatePresence>
          {pandaChoice && gameState === 'result' && (
            <motion.div
              key="panda-choice"
              initial={{ scale: 0, opacity: 0, y: -10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 18 }}
              className="absolute -top-3 -right-3 z-20 flex flex-col items-center
                         glass-card px-3 py-2 min-w-[68px]"
              style={{ border: '1px solid rgba(255,26,53,0.5)' }}
            >
              <span className="text-2xl leading-none">{CHOICE_LABELS[pandaChoice]}</span>
              <span className="font-display text-[9px] uppercase tracking-widest text-red-400 mt-0.5">
                {pandaChoice}
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Emotion status pill */}
      <motion.div
        layout
        className="glass-card px-4 py-1.5 flex items-center gap-2"
        style={{ border: `1px solid ${auraColor[emotion]}` }}
      >
        <span className="text-base leading-none">{status.icon}</span>
        <span
          className="font-display text-xs uppercase tracking-widest"
          style={{ color: emotion === 'happy' ? '#ff1a35' : emotion === 'sad' ? '#7dd3fc' : emotion === 'excited' ? '#39ff14' : '#9ca3af' }}
        >
          {status.text}
        </span>
      </motion.div>
    </div>
  )
}
