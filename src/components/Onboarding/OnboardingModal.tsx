import React, { useState } from 'react';

interface OnboardingModalProps {
  onCompleteOnboarding: (answers: { goal: string; level: string; primarySubject: string }) => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({ onCompleteOnboarding }) => {
  const [step, setStep] = useState(1);
  const [goal, setGoal] = useState('Upcoming Exam / Final Review');
  const [level, setLevel] = useState('Intermediate');
  const [primarySubject, setPrimarySubject] = useState('Computer Networks');

  const handleFinish = () => {
    onCompleteOnboarding({ goal, level, primarySubject });
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-[100]">
      <div className="bg-white rounded-3xl shadow-2xl p-6 sm:p-8 max-w-lg w-full relative space-y-6 border border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white font-bold text-2xl shadow-sm">
            🧠
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-2xl text-slate-900">EduMind AI</span>
              <span className="bg-indigo-50 text-indigo-700 text-xs font-bold px-2 py-0.5 rounded-full border border-indigo-100">
                Setup
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium">Personalize your micro-learning experience</p>
          </div>
        </div>

        {step === 1 && (
          <div className="space-y-4">
            <h3 className="font-bold text-lg text-slate-900">1. What is your primary study goal?</h3>
            <div className="space-y-2">
              {['Upcoming Exam / Final Review', 'Course Homework & Assignments', 'Career Skill Building & Interviews', 'Curiosity & Deep Concept Mastery'].map((g) => (
                <button
                  key={g}
                  onClick={() => setGoal(g)}
                  className={`w-full text-left p-3.5 rounded-xl border font-bold text-sm transition-all cursor-pointer ${
                    goal === g ? 'bg-indigo-50 border-indigo-300 text-indigo-900' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {g}
                </button>
              ))}
            </div>
            <button onClick={() => setStep(2)} className="w-full btn-sketch-primary text-sm mt-4">
              Next Step →
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <h3 className="font-bold text-lg text-slate-900">2. Which subject would you like to master first?</h3>
            <div className="space-y-2">
              {['Computer Networks', 'Organic Chemistry', 'Data Structures & Algorithms', 'Quantum Physics'].map((s) => (
                <button
                  key={s}
                  onClick={() => setPrimarySubject(s)}
                  className={`w-full text-left p-3.5 rounded-xl border font-bold text-sm transition-all cursor-pointer ${
                    primarySubject === s ? 'bg-indigo-50 border-indigo-300 text-indigo-900' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
            <button onClick={handleFinish} className="w-full btn-sketch-primary text-sm mt-4">
              Finish Diagnostic & Launch EduMind ✨
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
