import React, { useState } from 'react';
import { Brain, ChevronDown, ChevronUp, CheckCircle2, AlertCircle, Lightbulb, ArrowRight, Shield } from 'lucide-react';

interface QuestionReasoningBoxProps {
  question: string;
  correctAnswer: string;
  studentAnswer?: string;
  explanation: string;
  topic?: string;
  isCorrect?: boolean;
}

export const QuestionReasoningBox: React.FC<QuestionReasoningBoxProps> = ({
  question,
  correctAnswer,
  studentAnswer,
  explanation,
  topic = 'General Concept',
  isCorrect = true,
}) => {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="sketch-card bg-indigo-50/70 border border-indigo-200/90 p-5 rounded-2xl space-y-3 transition-all">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-indigo-600 text-white rounded-xl shadow-xs">
            <Brain className="w-4 h-4" />
          </div>
          <div>
            <h4 className="font-extrabold text-sm text-indigo-950">Step-by-Step AI Question Reasoning</h4>
            <span className="text-[10px] font-bold text-indigo-600 uppercase">Topic: {topic}</span>
          </div>
        </div>

        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-1 text-xs font-bold text-indigo-700 hover:text-indigo-900 bg-white/80 px-2.5 py-1 rounded-lg border border-indigo-200 cursor-pointer"
        >
          {isOpen ? 'Collapse' : 'Expand Reasoning'}
          {isOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      {isOpen && (
        <div className="space-y-3 pt-2 text-xs font-medium text-slate-800 border-t border-indigo-100">
          {/* Step 1 */}
          <div className="p-3 bg-white rounded-xl border border-indigo-100/80 shadow-2xs space-y-1">
            <span className="bg-indigo-100 text-indigo-800 text-[10px] font-bold px-2 py-0.5 rounded-md">
              STEP 1 • Premise & Context
            </span>
            <p className="text-slate-800 font-semibold mt-1">
              {question}
            </p>
          </div>

          {/* Step 2 */}
          <div className="p-3 bg-white rounded-xl border border-indigo-100/80 shadow-2xs space-y-1">
            <span className="bg-purple-100 text-purple-800 text-[10px] font-bold px-2 py-0.5 rounded-md">
              STEP 2 • Applied Rule & Core Concept
            </span>
            <p className="text-slate-700 font-normal leading-relaxed mt-1">
              {explanation || 'Applying foundational protocol rules and logical constraints to systematically solve this question.'}
            </p>
          </div>

          {/* Step 3 */}
          <div className="p-3 bg-white rounded-xl border border-indigo-100/80 shadow-2xs space-y-1">
            <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-md">
              STEP 3 • Elimination & Verification
            </span>
            <div className="mt-1 space-y-1">
              <p className="text-emerald-900 font-bold flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                Correct Solution: {correctAnswer}
              </p>
              {studentAnswer && studentAnswer !== correctAnswer && (
                <p className="text-rose-900 font-bold flex items-center gap-1.5 text-[11px]">
                  <AlertCircle className="w-3.5 h-3.5 text-rose-500" />
                  Your Choice: {studentAnswer} (Mismatch due to misconception/careless check)
                </p>
              )}
            </div>
          </div>

          {/* Step 4 */}
          <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-950 space-y-1">
            <span className="bg-amber-200 text-amber-900 text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1 w-fit">
              <Lightbulb className="w-3 h-3 text-amber-700" /> STEP 4 • Memory Hook / Takeaway
            </span>
            <p className="text-amber-900 font-medium text-[11px] leading-relaxed mt-1">
              💡 Memory Rule: Lock in this concept by linking the underlying protocol definition directly to the correct option during exam reviews.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
