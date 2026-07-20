import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface FaqItem {
  question: string;
  answer: string;
}

interface FaqAccordionProps {
  faqs: FaqItem[];
}

const FaqAccordion: React.FC<FaqAccordionProps> = ({ faqs }) => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="w-full border-t ink-border">
      {faqs.map((faq, index) => (
        <motion.div
          key={faq.question}
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: index * 0.07 }}
          className="group border-b ink-border"
        >
          <button
            className="flex w-full items-center gap-4 py-6 text-left sm:gap-7 sm:py-8"
            onClick={() => setOpenIndex(openIndex === index ? null : index)}
            aria-expanded={openIndex === index}
            aria-controls={`faq-panel-${index}`}
          >
            <span className="font-utility text-xs font-bold tabular-nums tracking-[0.16em] text-secondary-300 dark:text-primary-700">0{index + 1}</span>
            <span className="flex-1 text-lg font-semibold transition-colors group-hover:text-secondary-300 dark:group-hover:text-primary-700 sm:text-xl">
              {faq.question}
            </span>
            <motion.span
              animate={{ rotate: openIndex === index ? 180 : 0 }}
              transition={{ duration: 0.2 }}
              className="grid h-9 w-9 place-items-center rounded-full border ink-border text-slate-400 transition group-hover:border-secondary-300 group-hover:text-secondary-300 dark:group-hover:border-primary-700 dark:group-hover:text-primary-700"
            >
              <ChevronDown size={18} />
            </motion.span>
          </button>

          <AnimatePresence>
            {openIndex === index && (
              <motion.div
                id={`faq-panel-${index}`}
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.25 }}
              >
                <div className="pb-7 pl-11 pr-12 sm:pb-8 sm:pl-[4.25rem] sm:pr-20">
                  <p className="max-w-3xl leading-7 text-slate-300 dark:text-slate-600">{faq.answer}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      ))}
    </div>
  );
};

export default FaqAccordion;
