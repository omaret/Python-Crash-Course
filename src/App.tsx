import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronRight, ChevronLeft, Trophy, Play, CheckCircle2, Terminal, Zap, Sparkles, AlertTriangle } from 'lucide-react';
import confetti from 'canvas-confetti';
import { CURRICULUM, Lesson } from './data/curriculum';
import { CodeEditor } from './components/CodeEditor';
import { AIExplanation } from './components/AIExplanation';
import { cn } from './lib/utils';

export default function App() {
  const [currentLessonIndex, setCurrentLessonIndex] = useState(0);
  const [code, setCode] = useState(CURRICULUM[0].initialCode);
  const [output, setOutput] = useState<string[]>([]);
  const [isCorrect, setIsCorrect] = useState(false);
  const [completedLessons, setCompletedLessons] = useState<Set<string>>(new Set());
  const [showCelebration, setShowCelebration] = useState(false);

  const currentLesson = CURRICULUM[currentLessonIndex];

  useEffect(() => {
    setCode(currentLesson.initialCode);
    setOutput([]);
    setIsCorrect(false);
  }, [currentLessonIndex]);

  const runCode = () => {
    const newOutput: string[] = [];
    const variables: Record<string, string> = {};
    
    // Split code into lines to process assignments and prints in order
    const lines = code.split('\n');
    let hasSyntaxError = false;
    
    lines.forEach((line, index) => {
      if (hasSyntaxError) return;
      
      const trimmedLine = line.trim();
      if (!trimmedLine || trimmedLine.startsWith('#')) return;

      // Basic Syntax Checks
      // 1. Check for missing colons in control structures
      if ((trimmedLine.startsWith('if ') || trimmedLine.startsWith('elif ') || trimmedLine.startsWith('else') || 
           trimmedLine.startsWith('for ') || trimmedLine.startsWith('def ') || trimmedLine.startsWith('try') || 
           trimmedLine.startsWith('except')) && !trimmedLine.endsWith(':')) {
        newOutput.push(`SyntaxError: invalid syntax (missing colon at end of line ${index + 1})`);
        hasSyntaxError = true;
        return;
      }

      // 2. Simple Indentation Check (very basic)
      const prevLine = lines[index - 1]?.trim();
      if (prevLine && prevLine.endsWith(':')) {
        const currentLineIndentation = line.search(/\S/);
        if (currentLineIndentation === 0) {
          newOutput.push(`IndentationError: expected an indented block after line ${index}`);
          hasSyntaxError = true;
          return;
        }
      }

      // 1. Handle basic variable assignments: var = value
      const assignmentMatch = trimmedLine.match(/^([a-zA-Z_]\w*)\s*=\s*(.*)$/);
      if (assignmentMatch) {
        const varName = assignmentMatch[1];
        const varValue = assignmentMatch[2].trim();
        variables[varName] = varValue;
        return;
      }

      // 2. Handle list appends: list.append(item)
      const appendMatch = trimmedLine.match(/^([a-zA-Z_]\w*)\.append\((.*)\)$/);
      if (appendMatch) {
        const listName = appendMatch[1];
        const item = appendMatch[2].trim().replace(/^["']|["']$/g, '');
        if (variables[listName] && variables[listName].startsWith('[') && variables[listName].endsWith(']')) {
          const currentListStr = variables[listName].slice(1, -1);
          const items = currentListStr ? currentListStr.split(',').map(i => i.trim()) : [];
          items.push(`"${item}"`);
          variables[listName] = `[${items.join(', ')}]`;
        }
        return;
      }

      // 3. Handle simple range loops: for i in range(n):
      const loopMatch = trimmedLine.match(/^for\s+\w+\s+in\s+range\((\d+)\):$/);
      if (loopMatch) {
        const count = parseInt(loopMatch[1]);
        // Find the next line (the body of the loop)
        const nextLine = lines[index + 1];
        if (nextLine && nextLine.includes('print(')) {
          const loopPrintMatch = nextLine.match(/print\((.*)\)/);
          if (loopPrintMatch) {
            const loopExpr = loopPrintMatch[1].trim().replace(/^["']|["']$/g, '');
            for (let i = 0; i < count; i++) {
              newOutput.push(loopExpr);
            }
          }
        }
        return;
      }

      // 4. Handle print statements: print(expression)
      const printMatch = trimmedLine.match(/print\((.*)\)/);
      if (printMatch) {
        const expression = printMatch[1].trim();
        
        // Case A: Quoted string
        if ((expression.startsWith('"') && expression.endsWith('"')) || 
            (expression.startsWith("'") && expression.endsWith("'"))) {
          newOutput.push(expression.slice(1, -1));
        } 
        // Case B: List indexing like fruits[0]
        else if (expression.includes('[') && expression.endsWith(']')) {
          const [varName, indexPart] = expression.split('[');
          const index = parseInt(indexPart.replace(']', ''));
          const listStr = variables[varName];
          if (listStr && listStr.startsWith('[') && listStr.endsWith(']')) {
            const items = listStr.slice(1, -1).split(',').map(i => i.trim().replace(/^["']|["']$/g, ''));
            if (!isNaN(index) && index >= 0 && index < items.length) {
              newOutput.push(items[index]);
            } else {
              newOutput.push(`IndexError: list index out of range`);
            }
          } else {
            newOutput.push(expression);
          }
        }
        // Case C: Known variable
        else if (variables[expression] !== undefined) {
          // If it's a string variable, strip quotes for printing (Python behavior)
          const val = variables[expression];
          if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
            newOutput.push(val.slice(1, -1));
          } else {
            newOutput.push(val);
          }
        }
        // Case D: Fallback/Literal
        else {
          newOutput.push(expression);
        }
      }
    });

    if (!hasSyntaxError && newOutput.length === 0 && lines.some(l => l.trim() && !l.trim().startsWith('#'))) {
      newOutput.push("Code executed successfully (no output).");
    }

    setOutput(newOutput);

    if (hasSyntaxError) {
      setIsCorrect(false);
      return;
    }

    const allKeywordsPresent = currentLesson.solutionKeywords.every(keyword => 
      code.includes(keyword)
    );

    if (allKeywordsPresent) {
      setIsCorrect(true);
      confetti({
        particleCount: 150,
        spread: 100,
        origin: { y: 0.6 },
        colors: ['#6366f1', '#FFFFFF', '#18181b']
      });
      const newCompleted = new Set(completedLessons);
      newCompleted.add(currentLesson.id);
      setCompletedLessons(newCompleted);
    } else {
      setIsCorrect(false);
    }
  };

  const nextLesson = () => {
    if (currentLessonIndex < CURRICULUM.length - 1) {
      setCurrentLessonIndex(prev => prev + 1);
    }
  };

  const prevLesson = () => {
    if (currentLessonIndex > 0) {
      setCurrentLessonIndex(prev => prev - 1);
    }
  };

  const progress = (completedLessons.size / CURRICULUM.length) * 100;

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 font-sans selection:bg-indigo-500/30 selection:text-indigo-200">
      {/* Background Glows */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-500/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-500/5 blur-[120px] rounded-full" />
      </div>

      {/* Navigation */}
      <nav className="glass sticky top-0 z-50 border-b border-zinc-800/50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-500 p-1.5 rounded-lg shadow-[0_0_20px_rgba(99,102,241,0.3)]">
              <Zap className="text-white" size={20} fill="white" />
            </div>
            <span className="font-extrabold text-xl tracking-tight text-white">PySprint</span>
          </div>
          
          <div className="flex items-center gap-8">
            <div className="hidden md:flex items-center gap-4">
              <div className="flex flex-col items-end">
                <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Progress</span>
                <span className="text-xs font-bold">{Math.round(progress)}% Complete</span>
              </div>
              <div className="w-32 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                <motion.div 
                  className="h-full bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]" 
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                />
              </div>
            </div>
            
            <div className="h-10 w-px bg-zinc-800" />
            
            <div className="flex items-center gap-2 bg-zinc-900/50 px-4 py-2 rounded-full border border-zinc-800">
              <Trophy size={16} className={cn(completedLessons.size === CURRICULUM.length ? "text-yellow-400" : "text-zinc-600")} />
              <span className="font-mono font-bold text-sm">{completedLessons.size}/{CURRICULUM.length}</span>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-12 grid grid-cols-1 lg:grid-cols-12 gap-12 relative z-10">
        {/* Left Column: Lesson Content */}
        <div className="lg:col-span-5 space-y-10">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[10px] font-bold uppercase tracking-widest">
              Lesson {currentLessonIndex + 1} of {CURRICULUM.length}
            </div>
            <h1 className="text-5xl font-extrabold tracking-tight leading-none text-white">
              {currentLesson.title}
            </h1>
            <p className="text-xl text-zinc-400 font-medium leading-relaxed">
              {currentLesson.description}
            </p>
          </div>

          <div className="glass p-8 rounded-3xl space-y-6">
            <div className="space-y-2">
              <h3 className="font-bold uppercase tracking-widest text-[10px] text-zinc-500">The Concept</h3>
              <p className="text-lg font-medium text-zinc-200">{currentLesson.concept}</p>
            </div>
            
            {currentLesson.pitfalls && currentLesson.pitfalls.length > 0 && (
              <div className="pt-6 border-t border-zinc-800/50 space-y-3">
                <div className="flex items-center gap-2">
                  <AlertTriangle size={14} className="text-amber-500" />
                  <h3 className="font-bold uppercase tracking-widest text-[10px] text-amber-500">Watch Out!</h3>
                </div>
                <ul className="space-y-2">
                  {currentLesson.pitfalls.map((pitfall, i) => (
                    <li key={i} className="text-sm text-zinc-400 flex gap-2">
                      <span className="text-amber-500/50">•</span>
                      {pitfall}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="pt-6 border-t border-zinc-800/50 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles size={14} className="text-indigo-400" />
                  <h3 className="font-bold uppercase tracking-widest text-[10px] text-indigo-400">The Challenge</h3>
                </div>
              </div>
              <p className="font-bold text-xl text-white">{currentLesson.challenge}</p>
              
              {/* Requirements Checklist */}
              <div className="space-y-2 pt-2">
                {currentLesson.solutionKeywords.map(keyword => {
                  const isMet = code.toLowerCase().includes(keyword.toLowerCase());
                  return (
                    <div key={keyword} className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider">
                      <div className={cn(
                        "w-4 h-4 rounded-full flex items-center justify-center border",
                        isMet ? "bg-indigo-500/20 border-indigo-500 text-indigo-400" : "bg-zinc-800 border-zinc-700 text-zinc-600"
                      )}>
                        {isMet ? <CheckCircle2 size={10} /> : <div className="w-1 h-1 bg-current rounded-full" />}
                      </div>
                      <span className={isMet ? "text-zinc-300" : "text-zinc-600"}>Use "{keyword}"</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <AIExplanation 
            context={currentLesson.concept} 
            userCode={code} 
            lessonTitle={currentLesson.title} 
          />

          <div className="flex items-center gap-4 pt-4">
            <button 
              onClick={prevLesson}
              disabled={currentLessonIndex === 0}
              className="p-5 rounded-2xl glass hover:bg-zinc-800/50 disabled:opacity-20 disabled:cursor-not-allowed transition-all"
            >
              <ChevronLeft size={24} />
            </button>
            {currentLessonIndex === CURRICULUM.length - 1 ? (
              <button 
                onClick={() => isCorrect && setShowCelebration(true)}
                disabled={!isCorrect}
                className="flex-1 p-5 rounded-2xl bg-indigo-500 text-white font-bold uppercase tracking-widest flex items-center justify-center gap-2 hover:shadow-[0_0_30px_rgba(99,102,241,0.3)] disabled:opacity-20 disabled:cursor-not-allowed transition-all"
              >
                Finish Course
                <Trophy size={24} />
              </button>
            ) : (
              <button 
                onClick={nextLesson}
                disabled={!isCorrect}
                className="flex-1 p-5 rounded-2xl bg-white text-black font-bold uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-indigo-500 hover:text-white hover:shadow-[0_0_30px_rgba(99,102,241,0.3)] disabled:opacity-20 disabled:cursor-not-allowed transition-all"
              >
                Next Sprint
                <ChevronRight size={24} />
              </button>
            )}
          </div>
        </div>

        {/* Right Column: Code Editor & Output */}
        <div className="lg:col-span-7 space-y-8">
          <div className="h-[450px] relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500/20 to-transparent rounded-3xl blur opacity-0 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
            <CodeEditor code={code} onChange={setCode} />
            <button 
              onClick={() => setCode(currentLesson.initialCode)}
              className="absolute bottom-6 right-6 text-[10px] font-bold uppercase bg-zinc-900/50 hover:bg-zinc-800 text-zinc-500 hover:text-zinc-200 px-3 py-1.5 rounded-lg border border-zinc-800 transition-all backdrop-blur-md"
            >
              Reset to Start
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Action Button */}
            <button 
              onClick={runCode}
              className="h-full min-h-[120px] bg-indigo-500 rounded-3xl flex flex-col items-center justify-center gap-3 hover:shadow-[0_0_40px_rgba(99,102,241,0.4)] transition-all group relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
              <Play size={32} fill="white" className="relative z-10 group-hover:scale-110 transition-transform text-white" />
              <span className="relative z-10 font-black uppercase tracking-widest text-white text-sm">Run Sprint</span>
            </button>

            {/* Output Console */}
            <div className="glass-dark rounded-3xl p-8 font-mono text-sm min-h-[220px] relative overflow-hidden border border-zinc-800 flex flex-col">
              <div className="flex items-center gap-2 mb-6 text-zinc-600 shrink-0">
                <Terminal size={14} />
                <span className="uppercase text-[10px] tracking-widest font-bold">Terminal</span>
              </div>
              <div className="space-y-2 overflow-y-auto custom-scrollbar flex-1 pr-2 pb-12">
                {output.map((line, i) => (
                  <div key={i} className="flex gap-3">
                    <span className={cn(
                      "font-bold shrink-0",
                      line.includes('SyntaxError') || line.includes('IndentationError') || line.includes('Error') ? "text-red-500" : "text-indigo-500 opacity-50"
                    )}>
                      {line.includes('SyntaxError') || line.includes('IndentationError') || line.includes('Error') ? "!" : "→"}
                    </span>
                    <span className={cn(
                      "text-zinc-200 break-all",
                      line.includes('SyntaxError') || line.includes('IndentationError') || line.includes('Error') ? "text-red-400" : ""
                    )}>{line}</span>
                  </div>
                ))}
                {output.length === 0 && <span className="text-zinc-700 italic">Waiting for execution...</span>}
              </div>

              <AnimatePresence>
                {isCorrect && (
                  <motion.div 
                    initial={{ y: 100 }}
                    animate={{ y: 0 }}
                    exit={{ y: 100 }}
                    className="absolute bottom-0 left-0 right-0 bg-indigo-600 text-white p-4 border-t border-indigo-400/30 flex items-center justify-between z-20 backdrop-blur-md"
                  >
                    <div className="flex items-center gap-3">
                      <div className="bg-white text-indigo-600 p-1 rounded-full">
                        <CheckCircle2 size={16} />
                      </div>
                      <div>
                        <h4 className="font-black uppercase text-[10px] tracking-tight">Sprint Complete!</h4>
                        <p className="text-[9px] font-bold opacity-70">Syntax verified. Ready for the next one?</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => {
                        if (currentLessonIndex === CURRICULUM.length - 1) {
                          setShowCelebration(true);
                        } else {
                          nextLesson();
                        }
                      }}
                      className="bg-white text-indigo-600 px-4 py-1.5 rounded-lg font-bold text-[9px] uppercase tracking-widest hover:bg-zinc-100 transition-colors"
                    >
                      {currentLessonIndex === CURRICULUM.length - 1 ? "Finish Course" : "Next Lesson"}
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </main>

      {/* Celebration Overlay */}
      <AnimatePresence>
        {showCelebration && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-zinc-950 flex items-center justify-center p-6 text-center"
          >
            <div className="max-w-xl space-y-8">
              <motion.div
                initial={{ scale: 0.5, rotate: -20 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", damping: 12 }}
                className="w-32 h-32 bg-indigo-500 rounded-full flex items-center justify-center mx-auto shadow-[0_0_50px_rgba(99,102,241,0.5)]"
              >
                <Trophy size={64} className="text-white" />
              </motion.div>
              
              <div className="space-y-4">
                <h2 className="text-6xl font-black tracking-tighter text-white">COURSE MASTERED</h2>
                <p className="text-xl text-zinc-400 font-medium">You've successfully completed all {CURRICULUM.length} sprints. You're now a Python shredder!</p>
              </div>

              <div className="pt-8">
                <button 
                  onClick={() => {
                    setShowCelebration(false);
                    setCurrentLessonIndex(0);
                    setCompletedLessons(new Set());
                  }}
                  className="px-12 py-5 bg-white text-black font-black uppercase tracking-widest rounded-2xl hover:bg-indigo-500 hover:text-white transition-all shadow-xl"
                >
                  Restart Journey
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer */}
      <footer className="border-t border-zinc-800/50 bg-zinc-950/40 backdrop-blur-md mt-24 py-16">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-12">
          <div className="space-y-4 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-2">
              <Zap className="text-indigo-500" size={20} fill="currentColor" />
              <span className="font-black uppercase tracking-tight text-lg text-white">PySprint</span>
            </div>
            <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-[0.2em]">Master Python. One sprint at a time.</p>
          </div>
          
          <div className="flex gap-10">
            {['Curriculum', 'Community', 'Docs', 'Settings'].map(item => (
              <a key={item} href="#" className="text-xs font-bold uppercase tracking-widest text-zinc-500 hover:text-indigo-400 transition-colors">{item}</a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
