import { useEffect, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Activity, AlertTriangle, ArrowDown, ArrowUpRight, BookOpenCheck, CheckCircle2, Database, Gauge, Laptop, ShieldCheck } from 'lucide-react';
import { loadCorpusMetadata } from '../services/bulletinSearch';
import { useChat } from '../contexts/ChatContext';
import type { CorpusMetadata, EvaluationResults } from '../types/knowledge';

const evaluationUrl = `${import.meta.env.BASE_URL}data/evaluation-results.json`;
const percent = (value: number) => `${Math.round(value * 100)}%`;

const Reliability = () => {
  const reduceMotion = useReducedMotion();
  const { sessionMetrics } = useChat();
  const [metadata, setMetadata] = useState<CorpusMetadata | null>(null);
  const [evaluation, setEvaluation] = useState<EvaluationResults | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      loadCorpusMetadata(),
      fetch(evaluationUrl).then(response => {
        if (!response.ok) throw new Error('Evaluation results are unavailable.');
        return response.json() as Promise<EvaluationResults>;
      }),
    ]).then(([corpus, results]) => {
      if (!cancelled) {
        setMetadata(corpus);
        setEvaluation(results);
      }
    }).catch(loadError => {
      if (!cancelled) setError(loadError instanceof Error ? loadError.message : 'Reliability data could not be loaded.');
    });
    return () => { cancelled = true; };
  }, []);

  const averageLatency = sessionMetrics.queryCount ? sessionMetrics.totalLatencyMs / sessionMetrics.queryCount : 0;
  const groundedRate = sessionMetrics.queryCount ? sessionMetrics.groundedAnswerCount / sessionMetrics.queryCount : 0;

  if (error) {
    return (
      <div className="mx-auto my-16 max-w-3xl border border-red-300 bg-red-50 p-8 text-red-800 dark:border-red-800 dark:bg-red-950/30 dark:text-red-300">
        <AlertTriangle className="mb-3" />
        <h1 className="font-display text-3xl">Reliability data unavailable</h1>
        <p className="mt-2">{error}</p>
      </div>
    );
  }

  if (!metadata || !evaluation) {
    return <div className="py-24 text-center font-utility text-xs font-bold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-300">Loading verified system evidence…</div>;
  }

  const evidenceCards = [
    { label: 'Grounded accuracy', value: percent(evaluation.groundedAccuracy), detail: `${evaluation.groundedPassed}/${evaluation.groundedQuestions} questions`, icon: CheckCircle2 },
    { label: 'Abstention accuracy', value: percent(evaluation.abstentionAccuracy), detail: `${evaluation.unsupportedPassed}/${evaluation.unsupportedQuestions} unsupported`, icon: ShieldCheck },
    { label: 'Warm-search P95', value: `${evaluation.p95LatencyMs.toFixed(1)} ms`, detail: `Median ${evaluation.medianLatencyMs.toFixed(1)} ms`, icon: Gauge },
    { label: 'Searchable corpus', value: `${metadata.chunkCount.toLocaleString()} chunks`, detail: `${metadata.searchablePageCount.toLocaleString()} pages`, icon: Database },
  ];
  const sessionCards = [
    { label: 'Queries', value: sessionMetrics.queryCount },
    { label: 'Grounded rate', value: percent(groundedRate) },
    { label: 'Average latency', value: `${averageLatency.toFixed(1)} ms` },
    { label: 'No-answer responses', value: sessionMetrics.noAnswerCount },
  ];

  return (
    <div className="campus-grid">
      <section className="mx-auto max-w-7xl px-5 pb-16 pt-12 sm:px-8 sm:pt-16">
        <motion.header
          initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid gap-8 border-b ink-border pb-10 lg:grid-cols-[1fr_0.7fr] lg:items-end"
        >
          <div>
            <p className="route-kicker"><Activity size={16} /> Engineering evidence</p>
            <h1 className="mt-7 max-w-4xl font-display text-[clamp(3.6rem,7vw,6.8rem)] leading-[0.86] tracking-[-0.05em] text-slate-950 dark:text-white">Reliability &amp; Trust</h1>
          </div>
          <p className="max-w-xl text-lg leading-8 text-slate-600 dark:text-slate-300">Measured behavior for a local-only, source-grounded assistant. Every number on this page maps to a visible test, source, or session count.</p>
        </motion.header>

        <section className="mt-8" aria-labelledby="evaluation-heading">
          <div className="mb-4 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="field-label">Evaluation run</p>
              <h2 id="evaluation-heading" className="mt-2 font-display text-3xl text-slate-900 dark:text-white">Curated evaluation</h2>
            </div>
            <span className={`inline-flex items-center gap-2 border px-3 py-2 font-utility text-[0.62rem] font-bold uppercase tracking-[0.16em] ${evaluation.targetMet ? 'border-emerald-700/25 bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300' : 'border-red-700/25 bg-red-100 text-red-800 dark:bg-red-950/40 dark:text-red-300'}`}>
              <span className={`h-2 w-2 rounded-full ${evaluation.targetMet ? 'bg-emerald-500' : 'bg-red-500'}`} /> {evaluation.targetMet ? 'Targets met' : 'Review required'}
            </span>
          </div>

          <div className="grid gap-px overflow-hidden border border-black/10 bg-black/10 dark:border-white/10 dark:bg-white/10 sm:grid-cols-2 lg:grid-cols-4">
            {evidenceCards.map((card, index) => (
              <motion.article
                key={card.label}
                initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.06 }}
                className="group min-h-56 bg-[#faf8f2] p-5 dark:bg-[#0e1929] sm:p-6"
              >
                <div className="flex items-center justify-between"><card.icon size={20} className="text-primary-700 transition-transform group-hover:-rotate-6 dark:text-secondary-300" /><span className="font-utility text-[0.58rem] font-bold tracking-[0.16em] text-slate-400">0{index + 1}</span></div>
                <p className="mt-10 font-display text-[2.35rem] leading-none tracking-[-0.04em] text-slate-950 dark:text-white">{card.value}</p>
                <p className="mt-4 text-sm font-bold text-slate-700 dark:text-slate-200">{card.label}</p>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{card.detail}</p>
              </motion.article>
            ))}
          </div>
        </section>

        <section className="mt-6 grid gap-6 lg:grid-cols-[1.12fr_0.88fr]">
          <div className="field-panel p-5 sm:p-7">
            <div className="flex items-center justify-between border-b ink-border pb-4">
              <div>
                <p className="field-label">Source coverage</p>
                <h2 className="mt-2 flex items-center gap-2 font-display text-3xl text-slate-900 dark:text-white"><BookOpenCheck size={23} className="text-primary-700 dark:text-secondary-300" /> Indexed sources</h2>
              </div>
              <ArrowUpRight size={18} className="text-slate-400" />
            </div>
            <div className="mt-3 divide-y ink-border">
              {metadata.bulletins.map(bulletin => (
                <a key={bulletin.year} href={bulletin.sourceUrl} target="_blank" rel="noopener noreferrer" className="group flex items-center justify-between gap-4 py-4 transition-colors hover:text-primary-700 dark:hover:text-secondary-300">
                  <span className="font-semibold text-slate-800 group-hover:text-inherit dark:text-slate-200">Undergraduate Bulletin {bulletin.year}</span>
                  <span className="whitespace-nowrap font-utility text-[0.62rem] font-bold uppercase tracking-[0.12em] text-slate-500">{bulletin.searchablePageCount}/{bulletin.pageCount} pages</span>
                </a>
              ))}
            </div>
            <p className="mt-5 font-utility text-[0.58rem] font-bold uppercase tracking-[0.14em] text-slate-400">Index v{metadata.version} · Generated {new Date(metadata.generatedAt).toLocaleString()}</p>
          </div>

          <div className="overflow-hidden border border-black/10 bg-[#111827] text-white dark:border-white/10 dark:bg-[#efe7db] dark:text-[#111827]">
            <div className="border-b border-white/15 p-5 dark:border-black/10 sm:p-7">
              <p className="font-utility text-[0.62rem] font-bold uppercase tracking-[0.2em] text-secondary-300 dark:text-primary-700">Browser session</p>
              <h2 className="mt-2 flex items-center gap-2 font-display text-3xl"><Laptop size={23} /> Current session</h2>
              <p className="mt-3 text-sm leading-6 text-slate-300 dark:text-slate-600">Only aggregate counts stay in memory. Question text is never recorded here.</p>
            </div>
            <dl className="grid grid-cols-2 gap-px bg-white/10 dark:bg-black/10">
              {sessionCards.map(card => (
                <div key={card.label} className="bg-[#111827] p-5 dark:bg-[#efe7db]">
                  <dt className="font-utility text-[0.58rem] font-bold uppercase tracking-[0.14em] text-slate-400 dark:text-slate-500">{card.label}</dt>
                  <dd className="mt-3 font-display text-3xl">{card.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        <section className="mt-6 field-panel p-5 sm:p-7">
          <p className="field-label">Data flow</p>
          <h2 className="mt-2 font-display text-3xl text-slate-900 dark:text-white">Local processing architecture</h2>
          <div className="mt-7 grid gap-2 md:grid-cols-7 md:items-center">
            {['AAMU PDFs', 'Build-time index', 'Local retrieval', 'Cited answer'].map((step, index) => (
              <div key={step} className="contents">
                <div className={`min-h-24 border p-4 ${index === 3 ? 'border-primary-700 bg-primary-800 text-white dark:border-secondary-300 dark:bg-secondary-300 dark:text-[#111827]' : 'ink-border bg-white/65 dark:bg-[#07101d]/65'}`}>
                  <span className="font-utility text-[0.58rem] font-bold tracking-[0.14em] opacity-55">0{index + 1}</span>
                  <p className="mt-5 text-sm font-bold">{step}</p>
                </div>
                {index < 3 && <div className="grid place-items-center py-1 text-primary-700 dark:text-secondary-300"><ArrowDown className="md:hidden" size={18} /><span className="hidden md:block">→</span></div>}
              </div>
            ))}
          </div>
        </section>
      </section>
    </div>
  );
};

export default Reliability;
