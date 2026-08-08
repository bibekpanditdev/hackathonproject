import React, { useState } from 'react';
import { MicroLesson, CheckQuestion } from '../../types';
import { Lightbulb, Sparkles, RefreshCw, CheckCircle2, HelpCircle, ArrowRight } from 'lucide-react';

interface MicroLessonCardProps {
  lesson: MicroLesson;
  onExplainDifferently: (style: 'analogy' | 'visual' | 'case_study') => void;
  onCheckAnswer: (question: CheckQuestion, studentAnswer: string) => void;
  isLoadingAlternate?: boolean;
  alternateContent?: string | null;
}

export const MicroLessonCard: React.FC<MicroLessonCardProps> = ({
  lesson,
  onExplainDifferently,
  onCheckAnswer,
  isLoadingAlternate = false,
  alternateContent = null,
}) => {
  const [userAnswers, setUserAnswers] = useState<{ [qId: string]: string }>({});
  const [selectedStyle, setSelectedStyle] = useState<'analogy' | 'visual' | 'case_study' | null>(null);

  const handleStyleClick = (style: 'analogy' | 'visual' | 'case_study') => {
    setSelectedStyle(style);
    onExplainDifferently(style);
  };

  return (
    <div className="space-y-6">
      {/* Micro-Lesson Header & Content Card */}
      <div className="sketch-card bg-white p-6 sm:p-8">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <span className="bg-indigo-50 text-indigo-700 text-xs font-bold px-2.5 py-1 rounded-full border border-indigo-100">
              STEP {lesson.stepNumber} MICRO-LESSON
            </span>
            <span className="text-xs font-medium text-slate-400">~150-250 words</span>
          </div>

          {/* Explain Differently Button Group */}
          <div className="flex items-center gap-1.5 bg-slate-50 p-1 rounded-xl border border-slate-200">
            <span className="text-[11px] font-bold text-slate-600 px-2 flex items-center gap-1">
              <RefreshCw className="w-3 h-3 text-indigo-600" /> Explain Differently:
            </span>
            <button
              onClick={() => handleStyleClick('analogy')}
              className={`text-xs font-semibold px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                selectedStyle === 'analogy'
                  ? 'bg-indigo-600 text-white shadow-2xs font-bold'
                  : 'bg-white text-slate-700 hover:bg-slate-100'
              }`}
            >
              Analogy
            </button>
            <button
              onClick={() => handleStyleClick('visual')}
              className={`text-xs font-semibold px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                selectedStyle === 'visual'
                  ? 'bg-indigo-600 text-white shadow-2xs font-bold'
                  : 'bg-white text-slate-700 hover:bg-slate-100'
              }`}
            >
              Visual
            </button>
            <button
              onClick={() => handleStyleClick('case_study')}
              className={`text-xs font-semibold px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                selectedStyle === 'case_study'
                  ? 'bg-indigo-600 text-white shadow-2xs font-bold'
                  : 'bg-white text-slate-700 hover:bg-slate-100'
              }`}
            >
              Case Study
            </button>
          </div>
        </div>

        <h2 className="font-bold text-2xl text-slate-900 mb-4">{lesson.title}</h2>

        {/* Main Lesson Body Text */}
        <div className="prose max-w-none text-slate-800 leading-relaxed mb-6 font-normal text-base space-y-3">
          {lesson.content.split('\n').map((paragraph, idx) => (
            <p key={idx}>{paragraph}</p>
          ))}
        </div>

        {/* Alternate Explanation Box */}
        {isLoadingAlternate && (
          <div className="p-4 bg-indigo-50/80 rounded-2xl border border-indigo-200/80 mb-6 flex items-center gap-3 animate-pulse">
            <RefreshCw className="w-5 h-5 text-indigo-600 animate-spin" />
            <span className="text-sm font-semibold text-indigo-900">EduMind is generating a {selectedStyle} explanation...</span>
          </div>
        )}

        {alternateContent && !isLoadingAlternate && (
          <div className="p-5 bg-indigo-50/70 rounded-2xl border border-indigo-200/80 mb-6 relative">
            <div className="flex items-center gap-2 mb-2 text-indigo-950 font-bold text-xs uppercase tracking-wide">
              <Sparkles className="w-4 h-4 text-indigo-600" /> Alternate Explanation ({selectedStyle})
            </div>
            <p className="text-sm text-indigo-950 font-medium leading-relaxed">{alternateContent}</p>
          </div>
        )}

        {/* Real-World Analogy Callout Box */}
        {lesson.analogy && (
          <div className="p-5 bg-amber-50/80 rounded-2xl border border-amber-200/80 mb-6 flex items-start gap-3">
            <div className="p-2 bg-amber-100 rounded-xl shrink-0">
              <Lightbulb className="w-5 h-5 text-amber-700" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-amber-950 mb-1">Real-World Analogy</h4>
              <p className="text-xs sm:text-sm text-amber-900 font-medium leading-relaxed">{lesson.analogy}</p>
            </div>
          </div>
        )}

        {/* Key Takeaways Chips */}
        <div>
          <h4 className="font-bold text-xs text-slate-400 mb-2 uppercase tracking-wider">Key Takeaways</h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {lesson.keyTakeaways.map((takeaway, idx) => (
              <div key={idx} className="p-3 bg-slate-50/80 rounded-xl border border-slate-200/80 flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span className="text-xs font-semibold text-slate-700">{takeaway}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Check Understanding Mini Quiz */}
      <div className="sketch-card bg-slate-50/60 p-6 sm:p-8">
        <div className="flex items-center gap-2 mb-4">
          <HelpCircle className="w-5 h-5 text-indigo-600" />
          <h3 className="font-bold text-xl text-slate-900">Check Your Understanding</h3>
          <span className="text-xs text-slate-500 font-medium ml-auto">Unlock next step</span>
        </div>

        <div className="space-y-6">
          {lesson.checkQuestions.map((q) => {
            const currentAnswer = userAnswers[q.id] || '';

            return (
              <div key={q.id} className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs">
                <h4 className="font-semibold text-base text-slate-900 mb-3">{q.question}</h4>

                {/* Question Input */}
                <div className="space-y-3">
                  {q.options && q.options.length > 0 ? (
                    <div className="space-y-2">
                      {q.options.map((option, optIdx) => (
                        <button
                          key={optIdx}
                          onClick={() => setUserAnswers({ ...userAnswers, [q.id]: option })}
                          className={`w-full text-left p-3 rounded-xl border transition-all font-semibold text-sm cursor-pointer ${
                            currentAnswer === option
                              ? 'bg-indigo-50 border-indigo-300 text-indigo-900 font-bold'
                              : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <input
                      type="text"
                      placeholder="Type your answer here..."
                      value={currentAnswer}
                      onChange={(e) => setUserAnswers({ ...userAnswers, [q.id]: e.target.value })}
                      className="w-full p-3 rounded-xl border border-slate-200 font-medium text-sm focus:bg-slate-50 focus:border-indigo-400 outline-none transition-all"
                    />
                  )}

                  {q.hint && (
                    <p className="text-xs text-amber-800 font-medium italic flex items-center gap-1">
                      💡 Hint: {q.hint}
                    </p>
                  )}

                  <button
                    disabled={!currentAnswer.trim()}
                    onClick={() => onCheckAnswer(q, currentAnswer)}
                    className="btn-sketch-primary text-xs flex items-center gap-2 mt-2 disabled:opacity-50"
                  >
                    Submit Answer & Check
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
