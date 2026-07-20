import { motion } from 'framer-motion';
import { ArrowRight, BookOpenText, FileCheck2, LockKeyhole, MoveUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import FaqAccordion from '../components/FaqAccordion';
import { useChat } from '../contexts/ChatContext';

const faqItems = [
  {
    question: 'What can I ask the advising desk?',
    answer: 'Ask about undergraduate courses, prerequisites, registration rules, academic policies, or a specific bulletin year. Precise questions return the strongest evidence.'
  },
  {
    question: 'Where does each answer come from?',
    answer: 'Every academic answer is extracted from an indexed AAMU undergraduate bulletin and includes its year, page number, source excerpt, and official document link.'
  },
  {
    question: 'Which academic years are searchable?',
    answer: 'The current local index covers the 2022–2023, 2023–2024, and 2024–2025 undergraduate bulletins. You can name a year or ask to compare years.'
  },
  {
    question: 'Does my question leave this browser?',
    answer: 'No. Bulletin search and optional DegreeWorks parsing happen locally in your browser. Academic questions are not sent to a model or stored by this application.'
  },
];

const reveal = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
};

const Home = () => {
  const { openChat } = useChat();

  return (
    <div className="campus-grid">
      <section className="relative mx-auto max-w-7xl px-5 pb-14 pt-12 sm:px-8 sm:pb-20 sm:pt-16 lg:pb-24 lg:pt-20">
        <div className="grid min-w-0 items-center gap-14 lg:grid-cols-[1.08fr_0.92fr] lg:gap-16">
          <motion.div
            initial="hidden"
            animate="visible"
            transition={{ staggerChildren: 0.12 }}
            className="relative z-10 min-w-0"
          >
            <motion.div variants={reveal} className="mb-7 flex items-center gap-3">
              <span className="h-px w-10 bg-primary-700 dark:bg-secondary-300" />
              <p className="font-utility text-[0.68rem] font-bold uppercase tracking-[0.24em] text-primary-700 dark:text-secondary-300">
                Alabama A&amp;M · Undergraduate advising
              </p>
            </motion.div>

            <motion.h1 variants={reveal} className="max-w-[780px] font-display text-[clamp(3.6rem,8vw,7.4rem)] leading-[0.86] tracking-[-0.055em] text-slate-950 dark:text-[#fffaf2]">
              Make your
              <span className="block pl-[0.34em] italic text-primary-800 dark:text-secondary-300">next move</span>
              on The Hill.
            </motion.h1>

            <motion.p variants={reveal} className="mt-8 max-w-xl text-lg leading-8 text-slate-600 dark:text-slate-300 sm:text-xl">
              Search official AAMU bulletins, see the page behind every answer, and plan registration with evidence in view.
            </motion.p>

            <motion.div variants={reveal} className="mt-9 flex flex-col gap-4 sm:flex-row sm:items-center">
              <button
                onClick={openChat}
                className="group inline-flex min-h-14 items-center justify-between gap-7 rounded-full bg-primary-800 py-3 pl-6 pr-3 text-left text-sm font-bold text-white shadow-[0_18px_45px_-22px_rgba(67,7,25,0.9)] transition hover:-translate-y-1 hover:bg-primary-900 dark:bg-secondary-300 dark:text-[#111827] dark:hover:bg-secondary-200"
              >
                Ask the bulletin
                <span className="grid h-10 w-10 place-items-center rounded-full bg-white text-primary-800 transition-transform group-hover:rotate-[-8deg] dark:bg-[#111827] dark:text-secondary-300">
                  <MoveUpRight size={18} />
                </span>
              </button>
              <Link to="/reliability" className="inline-flex items-center gap-2 px-3 py-3 text-sm font-bold text-slate-700 transition hover:gap-3 hover:text-primary-700 dark:text-slate-200 dark:hover:text-secondary-300">
                See how answers are verified <ArrowRight size={17} />
              </Link>
            </motion.div>

            <motion.div variants={reveal} className="mt-10 flex flex-wrap gap-x-6 gap-y-3 border-t ink-border pt-5 text-xs font-semibold text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-2"><BookOpenText size={15} className="text-primary-700 dark:text-secondary-300" /> 3 official bulletins</span>
              <span className="flex items-center gap-2"><FileCheck2 size={15} className="text-primary-700 dark:text-secondary-300" /> Page-level citations</span>
              <span className="flex items-center gap-2"><LockKeyhole size={15} className="text-primary-700 dark:text-secondary-300" /> Local-only search</span>
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 35, rotate: 1.5 }}
            animate={{ opacity: 1, x: 0, rotate: 0 }}
            transition={{ duration: 0.75, delay: 0.18, ease: [0.22, 1, 0.36, 1] }}
            className="relative mx-auto min-w-0 w-full max-w-xl lg:mx-0"
            aria-label="Example of a cited bulletin answer"
          >
            <div className="absolute -left-5 -top-5 hidden h-28 w-28 rounded-full border border-primary-700/25 sm:block dark:border-secondary-300/25" aria-hidden="true" />
            <div className="paper-shadow relative overflow-hidden rounded-[2rem] border border-black/10 bg-[#fffaf2] dark:border-white/10 dark:bg-[#111b2b]">
              <div className="flex items-center justify-between border-b border-black/10 bg-primary-800 px-5 py-4 text-white dark:border-white/10 dark:bg-[#060b13]">
                <span className="font-utility text-[0.64rem] font-bold uppercase tracking-[0.2em]">Evidence desk · Live preview</span>
                <span className="flex items-center gap-2 text-[0.68rem] font-semibold"><span className="h-2 w-2 animate-pulse rounded-full bg-secondary-300" /> Search ready</span>
              </div>

              <div className="p-5 sm:p-7">
                <p className="font-utility text-[0.62rem] font-bold uppercase tracking-[0.2em] text-slate-400">Student question</p>
                <p className="mt-2 font-display text-2xl leading-tight text-slate-900 dark:text-white sm:text-3xl">“What is the maximum course load in 2024–2025?”</p>

                <div className="my-6 flex items-center gap-3" aria-hidden="true">
                  <span className="h-px flex-1 bg-black/10 dark:bg-white/10" />
                  <span className="grid h-8 w-8 place-items-center rounded-full bg-secondary-300 text-[#111827]"><ArrowRight size={14} /></span>
                  <span className="h-px flex-1 bg-black/10 dark:bg-white/10" />
                </div>

                <div className="rounded-2xl bg-[#f1ebe1] p-5 dark:bg-[#0b1220]">
                  <div className="mb-4 flex items-center justify-between gap-4">
                    <span className="rounded-full bg-[#dceadf] px-3 py-1 text-[0.65rem] font-bold uppercase tracking-[0.12em] text-[#235330] dark:bg-[#163a27] dark:text-[#9ce1af]">Grounded answer</span>
                    <span className="text-[0.68rem] font-semibold text-slate-400">2024–2025</span>
                  </div>
                  <p className="text-base leading-7 text-slate-700 dark:text-slate-200">The answer is returned with supporting language from the bulletin—not a hidden source or an unsupported guess.</p>
                </div>

                <div className="relative mt-5 overflow-hidden rounded-2xl border ink-border bg-white p-4 dark:bg-[#152134]">
                  <span className="absolute left-0 top-0 h-full w-1 bg-primary-700 dark:bg-secondary-300" />
                  <p className="font-utility text-[0.62rem] font-bold uppercase tracking-[0.18em] text-primary-700 dark:text-secondary-300">Source attached</p>
                  <div className="mt-2 flex items-center justify-between gap-3">
                    <p className="text-sm font-semibold text-slate-700 dark:text-slate-200">Undergraduate Bulletin · exact page</p>
                    <MoveUpRight size={16} className="text-slate-400" />
                  </div>
                </div>
              </div>

              <div className="flex overflow-hidden border-t border-black/10 bg-secondary-300 py-2.5 text-[#111827] dark:border-white/10" aria-hidden="true">
                <p className="whitespace-nowrap font-utility text-[0.66rem] font-bold uppercase tracking-[0.18em]">
                  Bulletin 2022–2023 &nbsp; · &nbsp; Bulletin 2023–2024 &nbsp; · &nbsp; Bulletin 2024–2025 &nbsp; · &nbsp; Evidence stays visible
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="border-y border-white/10 bg-[#111b2b] text-[#fffaf2] dark:bg-[#f1e9dc] dark:text-[#111827]">
        <div className="mx-auto grid max-w-7xl gap-8 px-5 py-16 sm:px-8 md:grid-cols-[0.78fr_1.22fr] md:gap-16 md:py-20">
          <div>
            <p className="font-utility text-[0.68rem] font-bold uppercase tracking-[0.22em] text-secondary-300 dark:text-primary-700">A clearer starting point</p>
            <h2 className="mt-5 max-w-md font-display text-4xl leading-[0.98] tracking-[-0.035em] sm:text-5xl">Know what the desk can—and cannot—answer.</h2>
            <p className="mt-6 max-w-sm leading-7 text-slate-300 dark:text-slate-600">The interface keeps scope, privacy, and source coverage visible before you ask.</p>
          </div>
          <FaqAccordion faqs={faqItems} />
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-24">
        <div className="grid gap-8 lg:grid-cols-3">
          {[
            { icon: BookOpenText, label: 'Search', title: 'Ask in your own words', copy: 'Name a course, policy, prerequisite, or academic year. The index narrows the official bulletin text.' },
            { icon: FileCheck2, label: 'Verify', title: 'Read the page behind it', copy: 'Each supported response exposes the source year, page, and relevant excerpt for inspection.' },
            { icon: LockKeyhole, label: 'Plan', title: 'Keep records on your device', copy: 'Questions and optional DegreeWorks processing stay inside the browser—not on a remote model.' },
          ].map((item, index) => (
            <motion.article
              key={item.label}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.35 }}
              transition={{ delay: index * 0.09 }}
              className="group border-t-2 border-primary-800 pt-6 dark:border-secondary-300"
            >
              <div className="flex items-center justify-between">
                <span className="font-utility text-[0.65rem] font-bold uppercase tracking-[0.2em] text-primary-700 dark:text-secondary-300">{item.label}</span>
                <item.icon size={21} className="text-slate-400 transition-transform group-hover:-rotate-6 group-hover:text-primary-700 dark:group-hover:text-secondary-300" />
              </div>
              <h3 className="mt-10 font-display text-3xl leading-tight text-slate-900 dark:text-white">{item.title}</h3>
              <p className="mt-4 max-w-sm leading-7 text-slate-600 dark:text-slate-300">{item.copy}</p>
            </motion.article>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Home;
