import { motion, useMotionTemplate, useMotionValue, useReducedMotion, useSpring } from 'framer-motion';
import { useEffect } from 'react';

const spring = { stiffness: 70, damping: 22, mass: 0.7 };

const ReactiveField = () => {
  const reduceMotion = useReducedMotion();
  const pointerX = useMotionValue(-500);
  const pointerY = useMotionValue(-500);
  const smoothX = useSpring(pointerX, spring);
  const smoothY = useSpring(pointerY, spring);
  const glow = useMotionTemplate`radial-gradient(420px circle at ${smoothX}px ${smoothY}px, rgba(230, 59, 98, 0.16), transparent 68%)`;
  const farX = useSpring(useMotionValue(0), spring);
  const farY = useSpring(useMotionValue(0), spring);
  const nearX = useSpring(useMotionValue(0), { ...spring, stiffness: 105 });
  const nearY = useSpring(useMotionValue(0), { ...spring, stiffness: 105 });

  useEffect(() => {
    const handlePointerMove = (event: PointerEvent) => {
      pointerX.set(event.clientX);
      pointerY.set(event.clientY);

      if (reduceMotion) return;
      const dx = event.clientX / window.innerWidth - 0.5;
      const dy = event.clientY / window.innerHeight - 0.5;
      farX.set(dx * 18);
      farY.set(dy * 18);
      nearX.set(dx * -28);
      nearY.set(dy * -28);
    };

    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    return () => window.removeEventListener('pointermove', handlePointerMove);
  }, [farX, farY, nearX, nearY, pointerX, pointerY, reduceMotion]);

  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden="true">
      <motion.div className="absolute inset-0 opacity-90 dark:opacity-60" style={{ background: glow }} />
      <motion.div
        className="absolute left-[5vw] top-[22vh] hidden h-16 w-16 rotate-12 border border-primary-700/20 bg-primary-500/10 lg:block dark:border-secondary-300/20 dark:bg-secondary-300/5"
        style={reduceMotion ? undefined : { x: farX, y: farY }}
      >
        <span className="grid h-full place-items-center font-utility text-[0.58rem] font-bold uppercase tracking-[0.18em] text-primary-700/60 dark:text-secondary-300/60">AAMU</span>
      </motion.div>
      <motion.div
        className="absolute right-[7vw] top-[35vh] hidden h-6 w-6 rotate-45 bg-secondary-300/80 lg:block dark:bg-primary-500/70"
        style={reduceMotion ? undefined : { x: nearX, y: nearY }}
      />
      <motion.div
        className="absolute bottom-[17vh] left-[9vw] hidden h-12 w-12 rounded-full border-[10px] border-primary-700/15 xl:block dark:border-secondary-300/15"
        style={reduceMotion ? undefined : { x: nearX, y: nearY }}
      />
      <motion.span
        className="absolute right-[12vw] top-[72vh] hidden font-display text-5xl italic text-primary-700/20 xl:block dark:text-secondary-300/20"
        style={reduceMotion ? undefined : { x: farX, y: farY }}
      >
        1875
      </motion.span>
    </div>
  );
};

export default ReactiveField;
