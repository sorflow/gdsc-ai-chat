import { motion, useReducedMotion } from 'framer-motion';
import { ArrowUpRight, Braces, MapPin, Sparkles, Users } from 'lucide-react';

const principles = [
  { icon: Braces, title: 'Build in public', copy: 'Students learn by shipping useful work, reviewing it together, and sharing what changed.' },
  { icon: Users, title: 'Design with campus', copy: 'The best technical solution starts with the people who will depend on it between classes.' },
  { icon: Sparkles, title: 'Leave a trail', copy: 'Sources, decisions, and limitations stay visible so the next builder can keep moving.' },
];

const About = () => {
  const reduceMotion = useReducedMotion();

  return (
    <div className="campus-grid">
      <section className="mx-auto max-w-7xl px-5 pb-14 pt-12 sm:px-8 sm:pb-20 sm:pt-16">
        <motion.div
          initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
          className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-end"
        >
          <div>
            <p className="route-kicker">The people behind the desk</p>
            <h1 className="mt-8 font-display text-[clamp(3.8rem,8vw,7.6rem)] leading-[0.84] tracking-[-0.055em] text-slate-950 dark:text-[#fffaf2]">
              Built on
              <span className="block pl-[0.28em] italic text-primary-800 dark:text-secondary-300">The Hill.</span>
            </h1>
          </div>
          <div className="lg:pb-3">
            <p className="max-w-xl text-xl leading-8 text-slate-600 dark:text-slate-300 sm:text-2xl sm:leading-9">
              We are student builders making university information easier to find, inspect, and use with confidence.
            </p>
            <div className="mt-7 flex items-center gap-2 font-utility text-[0.68rem] font-bold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">
              <MapPin size={15} className="text-primary-700 dark:text-secondary-300" /> Alabama A&amp;M University · Normal, Alabama
            </div>
          </div>
        </motion.div>

        <div className="noise-layer relative mt-14 overflow-hidden border border-black/10 bg-[#111827] text-[#fffaf2] dark:border-white/10 dark:bg-[#f2eadf] dark:text-[#111827] sm:mt-20">
          <div className="grid min-h-[520px] lg:grid-cols-2">
            <motion.div
              initial={reduceMotion ? { opacity: 0 } : { opacity: 0, x: -24 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              className="relative flex flex-col justify-between overflow-hidden bg-primary-600 p-7 sm:p-10"
            >
              <div className="absolute -right-10 top-12 h-40 w-40 rounded-full border-[32px] border-secondary-300/25" aria-hidden="true" />
              <div className="absolute bottom-20 left-[58%] h-8 w-8 rotate-45 bg-[#111827]/65 dark:bg-[#f7f3ea]/60" aria-hidden="true" />
              <p className="relative z-10 font-utility text-[0.65rem] font-bold uppercase tracking-[0.2em] text-white/75">Community signal · Active</p>
              <div className="relative z-10 py-16 sm:py-24">
                <p className="font-display text-5xl italic leading-none sm:text-7xl">Code is the medium.</p>
                <p className="mt-5 max-w-sm text-base leading-7 text-white/85">Clarity is the outcome. Every feature should make the next student decision feel less opaque.</p>
              </div>
              <p className="relative z-10 font-utility text-[0.62rem] font-bold uppercase tracking-[0.18em] text-white/70">GDG on Campus · AAMU</p>
            </motion.div>

            <div className="flex flex-col justify-between p-7 sm:p-10 lg:p-12">
              <div>
                <p className="field-label dark:text-primary-700">Our mission</p>
                <h2 className="mt-6 max-w-lg font-display text-4xl leading-[0.98] tracking-[-0.035em] sm:text-5xl">Turn technical curiosity into work the campus can use.</h2>
                <div className="mt-8 max-w-xl space-y-5 text-base leading-8 text-slate-300 dark:text-slate-600">
                  <p>GDG on Campus brings students from every major into a peer-to-peer learning community around developer technology.</p>
                  <p>The Course Registration Assistant is one expression of that mission: official academic information, made searchable without hiding the evidence behind it.</p>
                </div>
              </div>
              <div className="mt-12 flex items-center justify-between border-t border-white/15 pt-5 dark:border-black/15">
                <span className="font-utility text-[0.62rem] font-bold uppercase tracking-[0.18em] text-slate-400 dark:text-slate-500">Student-built · Community-minded</span>
                <span className="grid h-10 w-10 place-items-center rounded-full border border-white/20 dark:border-black/20"><ArrowUpRight size={17} /></span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-black/10 bg-[#eee8de]/80 dark:border-white/10 dark:bg-[#07101d]/70">
        <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-20">
          <div className="grid gap-8 lg:grid-cols-[0.6fr_1.4fr]">
            <div>
              <p className="route-kicker">How we work</p>
              <h2 className="mt-6 font-display text-4xl leading-none text-slate-950 dark:text-white">Three commitments,<br /><span className="italic text-primary-800 dark:text-secondary-300">one practice.</span></h2>
            </div>
            <div className="grid gap-px overflow-hidden border border-black/10 bg-black/10 dark:border-white/10 dark:bg-white/10 md:grid-cols-3">
              {principles.map((principle, index) => (
                <motion.article
                  key={principle.title}
                  initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 22 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.35 }}
                  transition={{ delay: index * 0.08 }}
                  className="group bg-[#f8f5ee] p-6 dark:bg-[#0d1828]"
                >
                  <div className="flex items-center justify-between">
                    <principle.icon size={21} className="text-primary-700 transition-transform group-hover:-rotate-6 dark:text-secondary-300" />
                    <span className="font-utility text-[0.6rem] font-bold tracking-[0.16em] text-slate-400">0{index + 1}</span>
                  </div>
                  <h3 className="mt-16 font-display text-3xl text-slate-900 dark:text-white">{principle.title}</h3>
                  <p className="mt-4 leading-7 text-slate-600 dark:text-slate-300">{principle.copy}</p>
                </motion.article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-24">
        <div className="grid items-center gap-8 border-t-2 border-primary-800 pt-8 dark:border-secondary-300 md:grid-cols-[1fr_auto]">
          <div>
            <p className="field-label">Build something useful</p>
            <h2 className="mt-4 max-w-3xl font-display text-4xl leading-[0.98] tracking-[-0.03em] text-slate-950 dark:text-white sm:text-6xl">There is room at the table for your point of view.</h2>
          </div>
          <a
            href="https://gdg.community.dev/accounts/social/signup/?next=/gdg-on-campus-alabama-am-university-huntsville-united-states/"
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex min-h-14 items-center justify-between gap-8 bg-primary-800 py-3 pl-6 pr-3 text-sm font-bold text-white transition hover:-translate-y-1 dark:bg-secondary-300 dark:text-[#111827]"
          >
            Join the community
            <span className="grid h-10 w-10 place-items-center bg-white text-primary-800 dark:bg-[#111827] dark:text-secondary-300"><ArrowUpRight size={18} className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" /></span>
          </a>
        </div>
      </section>
    </div>
  );
};

export default About;
