import React, { useState } from 'react';
import { Subject, ConceptNode } from '../../types';
import { GitBranch, Lock, Play, Sparkles } from 'lucide-react';

interface ConceptNodeGraphProps {
  activeSubject: Subject;
  onLaunchConceptPractice: (concept: ConceptNode) => void;
}

export const ConceptNodeGraph: React.FC<ConceptNodeGraphProps> = ({
  activeSubject,
  onLaunchConceptPractice,
}) => {
  const [selectedConcept, setSelectedConcept] = useState<ConceptNode | null>(activeSubject.concepts[0] || null);

  const masteredCount = activeSubject.concepts.filter((c) => c.status === 'mastered').length;
  const totalCount = activeSubject.concepts.length;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="sketch-card bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 text-white p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="bg-white/10 backdrop-blur-md text-purple-300 text-xs font-bold px-3 py-0.5 rounded-full border border-white/10 flex items-center gap-1">
                <GitBranch className="w-3.5 h-3.5 text-purple-300" /> VISUAL SKILL TREE
              </span>
              <span className="text-xs font-medium text-purple-200">{masteredCount}/{totalCount} Mastered</span>
            </div>
            <h2 className="font-bold text-2xl text-white">
              {activeSubject.name} Concept Map
            </h2>
            <p className="text-xs text-purple-100/90 font-medium mt-1">
              Track your conceptual progression as node connections illuminate!
            </p>
          </div>

          <div className="flex items-center gap-3 bg-white/10 p-2 rounded-xl border border-white/10">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-white">
              <span className="w-3 h-3 rounded-full bg-emerald-400" />
              Mastered
            </div>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-white">
              <span className="w-3 h-3 rounded-full bg-indigo-400" />
              In Progress
            </div>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-white">
              <span className="w-3 h-3 rounded-full bg-slate-500" />
              Locked
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Node Graph Container */}
        <div className="lg:col-span-2 sketch-card bg-white p-6 min-h-[420px] relative flex flex-col justify-between">
          <div className="space-y-5 relative">
            {activeSubject.concepts.map((concept, idx) => {
              const isMastered = concept.status === 'mastered';
              const isInProgress = concept.status === 'in_progress';
              const isSelected = selectedConcept?.id === concept.id;

              return (
                <div key={concept.id} className="relative z-10 flex items-center gap-4">
                  {/* Step Connector Line */}
                  {idx < activeSubject.concepts.length - 1 && (
                    <div className="absolute left-6 top-10 bottom-[-20px] w-0.5 bg-slate-200 z-0" />
                  )}

                  {/* Node Circle */}
                  <div
                    onClick={() => setSelectedConcept(concept)}
                    className={`w-12 h-12 rounded-2xl border shadow-xs flex items-center justify-center font-bold text-slate-800 cursor-pointer transition-all shrink-0 z-10 ${
                      isMastered
                        ? 'bg-emerald-500 border-emerald-600 text-white hover:scale-105'
                        : isInProgress
                        ? 'bg-indigo-600 border-indigo-700 text-white hover:scale-105 shadow-md'
                        : 'bg-slate-100 border-slate-200 text-slate-400 hover:bg-slate-200'
                    } ${isSelected ? 'ring-4 ring-indigo-200 scale-105' : ''}`}
                  >
                    {isMastered ? (
                      <Sparkles className="w-5 h-5 text-white" />
                    ) : isInProgress ? (
                      <Play className="w-4 h-4 fill-white" />
                    ) : (
                      <Lock className="w-4 h-4 text-slate-400" />
                    )}
                  </div>

                  {/* Node Title Card */}
                  <div
                    onClick={() => setSelectedConcept(concept)}
                    className={`flex-1 p-4 rounded-2xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-indigo-50/80 border-indigo-300 shadow-2xs font-semibold'
                        : 'bg-slate-50/60 border-slate-200/80 hover:bg-slate-100/80'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="text-[10px] font-bold uppercase text-slate-400">
                        Concept {idx + 1}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          isMastered
                            ? 'bg-emerald-100 text-emerald-800'
                            : isInProgress
                            ? 'bg-indigo-100 text-indigo-800'
                            : 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        {isMastered ? 'Mastered ✨' : isInProgress ? 'In Progress' : 'Locked'}
                      </span>
                    </div>
                    <h3 className="font-bold text-base text-slate-900">{concept.title}</h3>
                    <p className="text-xs text-slate-500 line-clamp-1">{concept.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Concept Detail Card */}
        {selectedConcept && (
          <div className="sketch-card bg-white p-6 space-y-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="bg-indigo-50 text-indigo-700 text-xs font-bold px-2.5 py-0.5 rounded-full border border-indigo-100">
                  CONCEPT DETAILS
                </span>
                <span className="text-xs font-medium text-slate-400">~{selectedConcept.estimatedMinutes} min</span>
              </div>

              <h3 className="font-bold text-xl text-slate-900 mb-2">{selectedConcept.title}</h3>
              <p className="text-sm text-slate-600 mb-4 leading-relaxed font-normal">{selectedConcept.description}</p>

              <div className="space-y-2 bg-slate-50 p-3.5 rounded-xl border border-slate-200/80 text-xs font-medium text-slate-700 mb-4">
                <div className="flex justify-between">
                  <span>Exam Yield Priority:</span>
                  <span className="font-bold uppercase text-rose-600">{selectedConcept.importance}</span>
                </div>
                <div className="flex justify-between">
                  <span>Prerequisites:</span>
                  <span>None</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => onLaunchConceptPractice(selectedConcept)}
              className="w-full btn-sketch-primary text-sm flex items-center justify-center gap-2"
            >
              <Play className="w-4 h-4 fill-white" />
              Practice Concept in Tutor
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
