import { ArrowUpRight, MessageSquare } from 'lucide-react';
import { useChat } from '../contexts/ChatContext';
import { motion } from 'framer-motion';

const ChatButton = () => {
  const { toggleChat, isOpen } = useChat();

  return (
    <motion.button
      initial={{ scale: 0.92, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      whileHover={{ y: -3 }}
      whileTap={{ scale: 0.97 }}
      onClick={toggleChat}
      className={`fixed bottom-4 right-4 z-30 grid h-12 w-12 place-items-center rounded-full bg-primary-800 text-white shadow-[0_18px_45px_-18px_rgba(67,7,25,0.75)] transition-all duration-200 hover:bg-primary-900 dark:bg-secondary-300 dark:text-[#111827] dark:hover:bg-secondary-200 sm:bottom-7 sm:right-7 sm:flex sm:h-auto sm:w-auto sm:gap-3 sm:py-2.5 sm:pl-3 sm:pr-4 ${isOpen ? 'pointer-events-none opacity-0' : 'opacity-100'}`}
      aria-label="Open chat assistant"
    >
      <span className="grid h-9 w-9 place-items-center rounded-full bg-white/15 dark:bg-black/10"><MessageSquare size={18} /></span>
      <span className="hidden text-sm font-bold sm:inline">Ask A&amp;M</span>
      <ArrowUpRight size={16} className="hidden sm:block" />
    </motion.button>
  );
};

export default ChatButton;
