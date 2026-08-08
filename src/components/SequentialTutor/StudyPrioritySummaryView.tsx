import React from 'react';
import { StudyPrioritySummary } from '../../types';
import { Award, CheckSquare, Sparkles, CheckCircle2 } from 'lucide-react';

interface StudyPrioritySummaryViewProps {
  topicTitle: string;
  summary: StudyPrioritySummary;
  onFinishTopic: () => void;
}

export const StudyPrioritySummaryView: React.FC<StudyPrioritySummaryViewProps> = ({
  topicTitle,
  summary,
  onFinishTopic,
}) => {
  return (
    <div className="sketch-card bg-white p-6 sm:p-8 space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-indigo-900 to-purple-900 text-white p-6 rounded-2xl shadow-md flex items-center justify-between flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-emerald-500/20 text-emerald-300 text-xs font-bold px-2.5 py-0.5 rounded-full border border-emerald-400/30 flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> ROADMAP COMPLETED
            </span>
            <span className="text-xs font-semibold text-indigo-200">+100 XP Earned</span>
          </div>
          <h2 className="font-bold text-2xl text-white">
            Study Priority Summary: {topicTitle}
          </h2>
          <p className="text-xs text-indigo-100/90 font-medium mt-1">
            Exam-yield breakdown to focus your revision strategy before tests!
          </p>
        </div>

        <button onClick={onFinishTopic} className="bg-amber-400 hover:bg-amber-500 text-slate-900 font-bold px-4 py-2.5 rounded-xl shadow-sm transition-all text-sm flex items-center gap-2 cursor-pointer">
          <Award className="w-4 h-4" />
          Claim Sticker & Finish
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* High-Yield Topics (Study First) */}
        <div className="p-5 bg-emerald-50/60 rounded-2xl border border-emerald-200">
          <div className="flex items-center gap-2 mb-3">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <h3 className="font-bold text-base text-emerald-950">High-Yield (Study First)</h3>
          </div>
          <div className="space-y-2.5">
            {summary.highYieldTopics.map((item, idx) => (
              <div key={idx} className="bg-white p-3.5 rounded-xl border border-emerald-200/80 shadow-2xs">
                <h4 className="font-bold text-sm text-slate-900">{item.title}</h4>
                <p className="text-xs text-emerald-800 font-medium mt-0.5">{item.reason}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Medium Priority */}
        <div className="p-5 bg-amber-50/60 rounded-2xl border border-amber-200">
          <div className="flex items-center gap-2 mb-3">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            <h3 className="font-bold text-base text-amber-950">Medium Priority</h3>
          </div>
          <div className="space-y-2.5">
            {summary.mediumYieldTopics.map((item, idx) => (
              <div key={idx} className="bg-white p-3.5 rounded-xl border border-amber-200/80 shadow-2xs">
                <h4 className="font-bold text-sm text-slate-900">{item.title}</h4>
                <p className="text-xs text-amber-800 font-medium mt-0.5">{item.reason}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Low-Yield / Skippable */}
        <div className="p-5 bg-slate-50/80 rounded-2xl border border-slate-200">
          <div className="flex items-center gap-2 mb-3">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-400" />
            <h3 className="font-bold text-base text-slate-700">Low-Yield (Skippable)</h3>
          </div>
          <div className="space-y-2.5">
            {summary.lowYieldTopics.map((item, idx) => (
              <div key={idx} className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
                <h4 className="font-bold text-sm text-slate-700">{item.title}</h4>
                <p className="text-xs text-slate-500 font-medium mt-0.5">{item.reason}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Night-Before-Exam Checklist */}
      <div className="p-5 bg-sky-50/70 rounded-2xl border border-sky-200/80">
        <div className="flex items-center gap-2 mb-3">
          <CheckSquare className="w-5 h-5 text-sky-600" />
          <h3 className="font-bold text-lg text-slate-900">Night-Before-Exam Checklist</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {summary.nightBeforeChecklist.map((item, idx) => (
            <div key={idx} className="bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-2xs flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span className="text-xs font-semibold text-slate-800">{item}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
