import React, { useState, useEffect } from 'react';
import { Subject, RoadmapStep, MicroLesson, RepairLesson, StudyPrioritySummary, CheckQuestion } from '../../types';
import { RoadmapSidebar } from './RoadmapSidebar';
import { MicroLessonCard } from './MicroLessonCard';
import { DiagnoseRepairCard } from './DiagnoseRepairCard';
import { StudyPrioritySummaryView } from './StudyPrioritySummaryView';
import { DedicatedChatbot } from './DedicatedChatbot';
import { fetchRoadmap, fetchMicroLesson, fetchAlternateExplanation, fetchDiagnoseRepair, fetchStudyPrioritySummary } from '../../services/api';
import { Sparkles, GraduationCap, Search, Loader2, MessageSquare, ListTree } from 'lucide-react';

interface TutorContainerProps {
  activeSubject: Subject;
  onRewardXp: (amount: number, stickerTitle?: string) => void;
}

export const TutorContainer: React.FC<TutorContainerProps> = ({ activeSubject, onRewardXp }) => {
  const [tutorViewMode, setTutorViewMode] = useState<'chatbot' | 'structured'>('chatbot');
  const [topicInput, setTopicInput] = useState('');
  const [currentTopic, setCurrentTopic] = useState(activeSubject.name);
  const [roadmap, setRoadmap] = useState<RoadmapStep[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const [currentLesson, setCurrentLesson] = useState<MicroLesson | null>(null);
  const [activeRepair, setActiveRepair] = useState<RepairLesson | null>(null);
  const [prioritySummary, setPrioritySummary] = useState<StudyPrioritySummary | null>(null);

  const [isLoadingRoadmap, setIsLoadingRoadmap] = useState(false);
  const [isLoadingLesson, setIsLoadingLesson] = useState(false);
  const [isLoadingAlternate, setIsLoadingAlternate] = useState(false);
  const [alternateContent, setAlternateContent] = useState<string | null>(null);

  const handleLoadTopicRoadmap = async (topicToLoad: string) => {
    setIsLoadingRoadmap(true);
    setCurrentTopic(topicToLoad);
    setPrioritySummary(null);
    setActiveRepair(null);

    const data = await fetchRoadmap(topicToLoad);
    setRoadmap(data.roadmap);
    setCurrentIndex(0);
    setIsLoadingRoadmap(false);

    if (data.roadmap.length > 0) {
      loadLessonStep(topicToLoad, data.roadmap[0], 0, data.roadmap.length);
    }
  };

  const loadLessonStep = async (
    topic: string,
    step: RoadmapStep,
    stepIdx: number,
    totalSteps: number
  ) => {
    setIsLoadingLesson(true);
    setAlternateContent(null);
    setActiveRepair(null);

    const lesson = await fetchMicroLesson(topic, step.title, stepIdx + 1, totalSteps);
    setCurrentLesson(lesson);
    setIsLoadingLesson(false);
  };

  useEffect(() => {
    handleLoadTopicRoadmap(activeSubject.name);
  }, [activeSubject.id]);

  const handleSelectStep = (index: number) => {
    setCurrentIndex(index);
    if (roadmap[index]) {
      loadLessonStep(currentTopic, roadmap[index], index, roadmap.length);
    }
  };

  const handleExplainDifferently = async (style: 'analogy' | 'visual' | 'case_study') => {
    if (!currentLesson) return;
    setIsLoadingAlternate(true);
    const text = await fetchAlternateExplanation(currentLesson.title, style);
    setAlternateContent(text);
    setIsLoadingAlternate(false);
  };

  const handleCheckAnswer = async (question: CheckQuestion, studentAnswer: string) => {
    if (!currentLesson) return;

    const isCorrect = studentAnswer.toLowerCase().includes(question.correctAnswer.toLowerCase()) || studentAnswer.length > 10;

    if (isCorrect) {
      onRewardXp(40);
      advanceRoadmapStep();
    } else {
      setIsLoadingLesson(true);
      const repair = await fetchDiagnoseRepair(
        currentLesson.title,
        question.question,
        studentAnswer,
        question.correctAnswer
      );
      setActiveRepair(repair);
      setIsLoadingLesson(false);
    }
  };

  const advanceRoadmapStep = async () => {
    const updated = [...roadmap];
    updated[currentIndex] = { ...updated[currentIndex], status: 'completed' };

    const nextIndex = currentIndex + 1;
    if (nextIndex < updated.length) {
      updated[nextIndex] = { ...updated[nextIndex], status: 'current' };
      setRoadmap(updated);
      setCurrentIndex(nextIndex);
      loadLessonStep(currentTopic, updated[nextIndex], nextIndex, updated.length);
    } else {
      setRoadmap(updated);
      setIsLoadingLesson(true);
      const summary = await fetchStudyPrioritySummary(currentTopic);
      setPrioritySummary(summary);
      setIsLoadingLesson(false);
    }
  };

  const handleCompleteRepair = (isSuccess: boolean) => {
    if (isSuccess) {
      onRewardXp(30);
      setActiveRepair(null);
      advanceRoadmapStep();
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header Controls */}
      <div className="bg-slate-900 border border-blue-800 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-white shadow-lg">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="p-2.5 bg-blue-700 text-amber-300 rounded-xl shadow-xs border border-amber-400/30">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-extrabold text-lg text-white">Step-by-Step AI Learning Engine</h2>
            <p className="text-xs text-blue-300 font-medium">Bite-sized micro-lessons, diagnosis & recall challenges</p>
          </div>
        </div>

        {/* View Mode Toggle Switch */}
        <div className="flex items-center gap-2 bg-slate-950 p-1 rounded-xl border border-blue-900/80 w-full sm:w-auto justify-center">
          <button
            onClick={() => setTutorViewMode('chatbot')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer ${
              tutorViewMode === 'chatbot'
                ? 'bg-blue-700 text-amber-300 border border-amber-400/40 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5 text-amber-400" />
            <span>Dedicated Chatbot</span>
          </button>

          <button
            onClick={() => setTutorViewMode('structured')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer ${
              tutorViewMode === 'structured'
                ? 'bg-blue-700 text-amber-300 border border-amber-400/40 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <ListTree className="w-3.5 h-3.5 text-blue-300" />
            <span>Structured Tree</span>
          </button>
        </div>
      </div>

      {/* Mode 1: Dedicated Interactive Chatbot */}
      {tutorViewMode === 'chatbot' ? (
        <DedicatedChatbot onRewardXp={onRewardXp} />
      ) : (
        /* Mode 2: Structured Roadmap Workspace */
        <div className="space-y-6">
          <div className="sketch-card bg-white p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (topicInput.trim()) {
                  handleLoadTopicRoadmap(topicInput.trim());
                  setTopicInput('');
                }
              }}
              className="flex items-center gap-2 w-full"
            >
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder='Generate roadmap for any topic e.g. "Computer Networks"'
                  value={topicInput}
                  onChange={(e) => setTopicInput(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:border-blue-600 outline-none transition-all"
                />
              </div>
              <button type="submit" disabled={isLoadingRoadmap} className="btn-sketch-primary text-xs py-2 shrink-0">
                {isLoadingRoadmap ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Generate Roadmap'}
              </button>
            </form>
          </div>

          <div className="flex flex-col lg:flex-row gap-6 items-start">
            <RoadmapSidebar
              topicTitle={currentTopic}
              roadmap={roadmap}
              currentIndex={currentIndex}
              onSelectStep={handleSelectStep}
            />

            <div className="flex-1 w-full min-w-0">
              {isLoadingLesson || isLoadingRoadmap ? (
                <div className="sketch-card bg-white p-12 text-center space-y-4">
                  <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center mx-auto text-blue-700 text-2xl font-bold animate-pulse">
                    🎓
                  </div>
                  <h3 className="font-extrabold text-lg text-slate-900">EduMind AI is crafting your micro-lesson...</h3>
                  <p className="text-xs text-slate-500 max-w-md mx-auto">
                    Structuring bite-sized content with clear takeaways, real-world analogies, and interactive quizzes.
                  </p>
                </div>
              ) : prioritySummary ? (
                <StudyPrioritySummaryView
                  topicTitle={currentTopic}
                  summary={prioritySummary}
                  onFinishTopic={() => {
                    onRewardXp(100, currentTopic);
                    setPrioritySummary(null);
                    setCurrentIndex(0);
                  }}
                />
              ) : activeRepair ? (
                <DiagnoseRepairCard
                  repairLesson={activeRepair}
                  onCompleteRepair={handleCompleteRepair}
                />
              ) : currentLesson ? (
                <MicroLessonCard
                  lesson={currentLesson}
                  onExplainDifferently={handleExplainDifferently}
                  onCheckAnswer={handleCheckAnswer}
                  isLoadingAlternate={isLoadingAlternate}
                  alternateContent={alternateContent}
                />
              ) : null}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
