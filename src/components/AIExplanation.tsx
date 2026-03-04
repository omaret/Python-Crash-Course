import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { GoogleGenAI } from "@google/genai";
import ReactMarkdown from 'react-markdown';
import { Sparkles, Loader2 } from 'lucide-react';

interface AIExplanationProps {
  context: string;
  userCode: string;
  lessonTitle: string;
}

export const AIExplanation: React.FC<AIExplanationProps> = ({ context, userCode, lessonTitle }) => {
  const [explanation, setExplanation] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Reset explanation when moving to a new lesson
  useEffect(() => {
    setExplanation(null);
  }, [lessonTitle]);

  const getExplanation = async () => {
    setLoading(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `You are a cool, expert Python mentor at PySprint. 
        The student is working on the lesson: "${lessonTitle}".
        The concept is: "${context}".
        The student's current code is:
        \`\`\`python
        ${userCode}
        \`\`\`
        
        Provide a very brief, encouraging, and high-energy explanation of how this code works or if there's a small mistake. 
        Keep it under 100 words. Use bullet points if helpful. Speak like a modern developer (use terms like "clean", "pythonic", "shredding it").`,
      });
      setExplanation(response.text || "Couldn't get an explanation right now. Keep coding!");
    } catch (error) {
      console.error(error);
      setExplanation("PyBot is taking a nap. Try again in a bit!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-8">
      {!explanation && !loading && (
        <button
          onClick={getExplanation}
          className="group flex items-center gap-3 px-6 py-3 bg-zinc-900/50 hover:bg-indigo-500/10 text-zinc-300 hover:text-indigo-400 font-bold rounded-2xl border border-zinc-800 hover:border-indigo-500/30 transition-all uppercase text-[10px] tracking-widest"
        >
          <Sparkles size={14} className="group-hover:animate-pulse" />
          Ask PyBot for Help
        </button>
      )}

      {loading && (
        <div className="flex items-center gap-3 text-indigo-400 font-bold animate-pulse text-xs uppercase tracking-widest">
          <Loader2 className="animate-spin" size={16} />
          PyBot is analyzing...
        </div>
      )}

      {explanation && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-8 glass rounded-3xl relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500" />
          <button 
            onClick={() => setExplanation(null)}
            className="absolute top-4 right-6 text-[10px] font-bold uppercase text-zinc-600 hover:text-zinc-200 transition-colors"
          >
            Dismiss
          </button>
          <div className="prose prose-invert prose-sm max-w-none prose-p:text-zinc-400 prose-strong:text-indigo-400">
            <ReactMarkdown>{explanation}</ReactMarkdown>
          </div>
        </motion.div>
      )}
    </div>
  );
};
