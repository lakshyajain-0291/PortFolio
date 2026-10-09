import type { Transition, Variants } from 'framer-motion';

/**
 * Template 2 motion vocabulary — quiet, typographic, purposeful.
 * Nothing slides across the page: type rises from its own baseline mask,
 * rules are drawn left-to-right like a pen stroke, ink settles into paper.
 * <MotionConfig reducedMotion="user"> at the root strips the transform parts
 * for readers who ask for less motion.
 */

/** Long, soft deceleration — like a page settling. */
export const EASE_PAPER = [0.16, 1, 0.3, 1] as const;
/** Slightly quicker, used for interactive feedback. */
export const EASE_INK = [0.2, 0.7, 0.1, 1] as const;

const settle: Transition = { duration: 0.9, ease: EASE_PAPER };

/** Line of type revealed upward through a clip mask anchored to its baseline. */
export const typeset: Variants = {
  hidden: { clipPath: 'inset(0 0 100% 0)', y: '0.3em' },
  show: { clipPath: 'inset(0 0 0% 0)', y: '0em', transition: settle },
};

/** Ink settling into paper: focus pulls in, no travel. */
export const ink: Variants = {
  hidden: { opacity: 0, filter: 'blur(3px)' },
  show: { opacity: 1, filter: 'blur(0px)', transition: { duration: 0.8, ease: EASE_PAPER } },
};

/** Hairline rule drawn from the left. Pair with `origin-left`. */
export const rule: Variants = {
  hidden: { scaleX: 0 },
  show: { scaleX: 1, transition: { duration: 1.1, ease: EASE_PAPER } },
};

/** Parent that sequences its children like lines being set on a page. */
export const leading = (stagger = 0.07, delay = 0): Variants => ({
  hidden: {},
  show: { transition: { staggerChildren: stagger, delayChildren: delay } },
});

/** Spread onto a motion element to play its variants once when it scrolls into view. */
export const onScroll = {
  initial: 'hidden',
  whileInView: 'show',
  viewport: { once: true, margin: '0px 0px -12% 0px' },
} as const;
