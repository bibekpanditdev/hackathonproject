import React from 'react';
import { RoadmapStep } from '../../types';
import { CheckCircle2, Lock, Play, Sparkles } from 'lucide-react';

interface RoadmapSidebarProps {
  topicTitle: string;
  roadmap: RoadmapStep[];
  currentIndex: number;
  onSelectStep: (index: number) => void;
}

export const RoadmapSidebar: React.FC<RoadmapSidebarProps> = ({
  topicTitle,
  roadmap,
  currentIndex,
  onSelectStep,
}) => {
  const completedCount = roadmap.filter((s) => s.status === 'completed').length;
  const progressPercent = Math.round((completedCount / roadmap.length) * 100) || 0;

  return (
    <div className="sketch-card bg-white p-5 w-full lg:w-80 shrink-0 flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="bg-indigo-50 text-indigo-700 text-xs font-bold px-2.5 py-0.5 rounded-full border border-indigo-100 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-indigo-600" /> ROADMAP
          </span>
          <span className="text-xs font-bold text-slate-500">
            {completedCount}/{roadmap.length} Steps
          </span>
        </div>

        <h3 className="font-bold text-lg text-slate-900 mb-3 truncate">{topicTitle}</h3>

        {/* Progress Bar */}
        <div className="w-full bg-slate-100 rounded-full h-2 mb-5 overflow-hidden">
          <div
            className="bg-emerald-500 h-full rounded-full transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Vertical Step Nodes */}
        <div className="space-y-2.5 relative">
          {/* Connector Line */}
          <div className="absolute left-5 top-4 bottom-4 w-0.5 bg-slate-200 z-0" />

          {roadmap.map((step, idx) => {
            const isCurrent = idx === currentIndex;
            const isCompleted = step.status === 'completed';
            const isLocked = step.status === 'locked' && !isCurrent && !isCompleted;

            return (
              <div
                key={step.id || idx}
                onClick={() => {
                  if (!isLocked) onSelectStep(idx);
                }}
                className={`relative z-10 p-3 rounded-xl border transition-all cursor-pointer flex items-start gap-3 ${
                  isCurrent
                    ? 'bg-indigo-50/80 border-indigo-300 shadow-2xs font-semibold'
                    : isCompleted
                    ? 'bg-emerald-50/60 border-emerald-200 hover:bg-emerald-100/50'
                    : 'bg-slate-50/60 border-slate-200 text-slate-400 opacity-80'
                }`}
              >
                {/* Status Node Icon */}
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-xs font-bold shadow-2xs ${
                    isCompleted
                      ? 'bg-emerald-600 text-white'
                      : isCurrent
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-200 text-slate-500'
                  }`}
                >
                  {isCompleted ? (
                    <CheckCircle2 className="w-4 h-4 text-white" />
                  ) : isCurrent ? (
                    <Play className="w-3.5 h-3.5 fill-white" />
                  ) : (
                    <Lock className="w-3.5 h-3.5 text-slate-500" />
                  )}
                </div>

                {/* Step Info */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">
                      Step {step.stepNumber}
                    </span>
                    <span className="text-[10px] font-semibold text-slate-400">~{step.estimatedMinutes}m</span>
                  </div>
                  <h4
                    className={`font-bold text-xs sm:text-sm truncate ${
                      isCurrent ? 'text-indigo-950 font-bold' : 'text-slate-700'
                    }`}
                  >
                    {step.title}
                  </h4>
                  <p className="text-[11px] text-slate-500 line-clamp-1">{step.summary}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-5 pt-4 border-t border-slate-100 text-center">
        <p className="text-xs text-slate-500 font-medium">
          💡 sequential micro-learning accelerates conceptual mastery.
        </p>
      </div>
    </div>
  );
};
