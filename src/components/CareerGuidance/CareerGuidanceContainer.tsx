import React, { useState } from 'react';
import { Subject, CareerRole } from '../../types';
import { CAREER_ROLES } from '../../data/mockData';
import { analyzeCareerGap } from '../../services/api';
import { Briefcase, Sparkles, CheckCircle2, AlertCircle, Play, MessageSquare, ArrowRight, Loader2 } from 'lucide-react';

interface CareerGuidanceContainerProps {
  activeSubject: Subject;
  onLaunchTopic: (topicName: string) => void;
  onRewardXp: (amount: number) => void;
}

export const CareerGuidanceContainer: React.FC<CareerGuidanceContainerProps> = ({
  activeSubject,
  onLaunchTopic,
  onRewardXp,
}) => {
  const [selectedRole, setSelectedRole] = useState<CareerRole>(CAREER_ROLES[0]);
  const [analysis, setAnalysis] = useState<any | null>(null);
  const [isLoadingAnalysis, setIsLoadingAnalysis] = useState(false);
  const [mockInterviewAnswer, setMockInterviewAnswer] = useState('');
  const [showInterviewFeedback, setShowInterviewFeedback] = useState(false);

  const handleAnalyzeRole = async (role: CareerRole) => {
    setSelectedRole(role);
    setIsLoadingAnalysis(true);
    setShowInterviewFeedback(false);

    const mastered = activeSubject.concepts.filter((c) => c.status === 'mastered').map((c) => c.title);
    const result = await analyzeCareerGap(role.title, mastered);
    setAnalysis(result);
    setIsLoadingAnalysis(false);
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="sketch-card bg-gradient-to-r from-amber-900 via-indigo-900 to-slate-900 text-white p-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-amber-500/20 text-amber-300 rounded-xl border border-amber-400/30">
            <Briefcase className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-bold text-2xl text-white">Career Guidance & Skill-Gap Analyzer</h2>
            <p className="text-xs text-amber-100/90 font-medium mt-0.5">
              Compare your mastered topics against software roles and practice real AI technical interview questions!
            </p>
          </div>
        </div>
      </div>

      {/* Target Roles Selection Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {CAREER_ROLES.map((role) => {
          const isSelected = selectedRole.id === role.id;
          return (
            <div
              key={role.id}
              onClick={() => handleAnalyzeRole(role)}
              className={`sketch-card p-5 bg-white cursor-pointer transition-all ${
                isSelected ? 'bg-indigo-50/80 border-indigo-300 shadow-2xs font-semibold' : 'hover:bg-slate-50/60'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="bg-indigo-50 text-indigo-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-indigo-100">
                  {role.category}
                </span>
                <span className="text-xs font-bold text-slate-500">{role.averageSalary}</span>
              </div>
              <h3 className="font-bold text-lg text-slate-900 mb-1">{role.title}</h3>
              <p className="text-xs text-slate-500 line-clamp-2 mb-3 font-normal">{role.description}</p>
              <span className="text-xs font-semibold text-emerald-600">Growth: {role.growthRate}</span>
            </div>
          );
        })}
      </div>

      {/* Analysis Output & Skill Gap Breakdown */}
      {isLoadingAnalysis ? (
        <div className="sketch-card bg-white p-8 text-center space-y-3">
          <Loader2 className="w-8 h-8 text-indigo-600 animate-spin mx-auto" />
          <h3 className="font-bold text-lg text-slate-900">Analyzing skill gap for {selectedRole.title}...</h3>
        </div>
      ) : analysis ? (
        <div className="sketch-card bg-white p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-200/80 pb-4 flex-wrap gap-4">
            <div>
              <span className="bg-indigo-50 text-indigo-700 text-xs font-bold px-2.5 py-0.5 rounded-full border border-indigo-100">
                SKILL MATCH ANALYSIS
              </span>
              <h3 className="font-bold text-2xl text-slate-900 mt-1">{analysis.roleTitle}</h3>
            </div>

            <div className="text-right">
              <span className="font-bold text-3xl text-indigo-600">{analysis.matchPercentage}%</span>
              <span className="text-xs font-semibold text-slate-400 block">Role Match Rating</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Mastered Skills */}
            <div className="p-5 bg-emerald-50/60 rounded-2xl border border-emerald-200">
              <h4 className="font-bold text-base text-emerald-950 mb-3 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                Mastered Skills ({analysis.masteredSkills.length})
              </h4>
              <div className="space-y-2">
                {analysis.masteredSkills.map((s: string, idx: number) => (
                  <div key={idx} className="p-2.5 bg-white rounded-xl border border-emerald-200 text-xs font-bold text-emerald-900">
                    ✨ {s}
                  </div>
                ))}
              </div>
            </div>

            {/* Missing Skills & 1-Click Study Links */}
            <div className="p-5 bg-amber-50/60 rounded-2xl border border-amber-200">
              <h4 className="font-bold text-base text-amber-950 mb-3 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-amber-600" />
                Missing Skill Gaps to Learn
              </h4>
              <div className="space-y-2">
                {analysis.missingSkills.map((gap: any, idx: number) => (
                  <div key={idx} className="p-3 bg-white rounded-xl border border-amber-200 flex items-center justify-between gap-2 shadow-2xs">
                    <div>
                      <h5 className="font-bold text-xs text-slate-900">{gap.name}</h5>
                      <span className="text-[10px] text-slate-400">Topic: {gap.topicToLearn}</span>
                    </div>
                    <button
                      onClick={() => onLaunchTopic(gap.topicToLearn)}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[10px] py-1 px-2.5 rounded-lg flex items-center gap-1 shrink-0 transition-all cursor-pointer"
                    >
                      <Play className="w-3 h-3 fill-white" /> Learn in Tutor
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* AI Technical Mock Interview Section */}
          {analysis.interviewQuestions && analysis.interviewQuestions.length > 0 && (
            <div className="p-6 bg-sky-50/70 rounded-2xl border border-sky-200/80 space-y-4">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-sky-600" />
                <h4 className="font-bold text-lg text-slate-900">AI Mock Interview Practice Question</h4>
              </div>

              <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs">
                <p className="font-semibold text-sm text-slate-900 mb-1">
                  {analysis.interviewQuestions[0].question}
                </p>
                <span className="text-xs text-slate-400 italic">{analysis.interviewQuestions[0].context}</span>

                <textarea
                  rows={3}
                  placeholder="Type your technical answer here..."
                  value={mockInterviewAnswer}
                  onChange={(e) => setMockInterviewAnswer(e.target.value)}
                  className="w-full mt-3 p-3 rounded-xl border border-slate-200 font-medium text-xs focus:bg-slate-50 focus:border-indigo-400 outline-none transition-all"
                />

                <button
                  onClick={() => {
                    setShowInterviewFeedback(true);
                    onRewardXp(40);
                  }}
                  className="btn-sketch-sky text-xs mt-3 flex items-center gap-2"
                >
                  Submit & Get AI Scoring
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {showInterviewFeedback && (
                <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-300 space-y-2">
                  <h5 className="font-bold text-sm text-emerald-950">AI Feedback Score: 88/100</h5>
                  <p className="text-xs text-emerald-900 font-medium">
                    Strong explanation of protocol flow! To reach top score, mention flow control sliding windows.
                  </p>
                  <p className="text-xs font-semibold text-slate-700 bg-white p-2.5 rounded-lg border border-emerald-200">
                    💡 Sample Ideal Answer: {analysis.interviewQuestions[0].idealAnswerSample}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
};
