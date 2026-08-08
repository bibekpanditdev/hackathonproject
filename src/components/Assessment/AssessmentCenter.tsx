import React, { useState } from 'react';
import { Subject, AssessmentQuestion, PerformanceReport, RepairLesson } from '../../types';
import { generateQuiz, fetchDiagnoseRepair } from '../../services/api';
import { DiagnoseRepairCard } from '../SequentialTutor/DiagnoseRepairCard';
import { FileCheck2, Sparkles, CheckCircle2, ArrowRight, Loader2, Award, Target, HelpCircle } from 'lucide-react';

interface AssessmentCenterProps {
  activeSubject: Subject;
  onRewardXp: (amount: number) => void;
}

export const AssessmentCenter: React.FC<AssessmentCenterProps> = ({ activeSubject, onRewardXp }) => {
  const [topic, setTopic] = useState(activeSubject.name);
  const [questionCount, setQuestionCount] = useState(4);
  const [questions, setQuestions] = useState<AssessmentQuestion[]>([]);
  const [currentQIndex, setCurrentQIndex] = useState(0);

  const [studentAnswers, setStudentAnswers] = useState<{ [qId: string]: string }>({});
  const [activeRepair, setActiveRepair] = useState<RepairLesson | null>(null);

  const [isLoadingQuiz, setIsLoadingQuiz] = useState(false);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [performanceReport, setPerformanceReport] = useState<PerformanceReport | null>(null);

  const [correctCount, setCorrectCount] = useState(0);

  const handleStartQuiz = async () => {
    setIsLoadingQuiz(true);
    setPerformanceReport(null);
    setStudentAnswers({});
    setCurrentQIndex(0);
    setCorrectCount(0);
    setActiveRepair(null);

    const generated = await generateQuiz(topic, questionCount);
    setQuestions(generated);
    setIsLoadingQuiz(false);
  };

  const currentQ = questions[currentQIndex];

  const handleAnswerSubmit = async () => {
    if (!currentQ) return;
    const answer = studentAnswers[currentQ.id] || '';

    const normalize = (s: string) => s.toLowerCase().replace(/[^\w\s]/g, '').replace(/\s+/g, ' ').trim();
    const normAnswer = normalize(answer);
    const normCorrect = normalize(currentQ.correctAnswer);

    const isCorrect =
      normAnswer === normCorrect ||
      (normAnswer.length >= 4 && normCorrect.includes(normAnswer)) ||
      (normCorrect.length >= 4 && normAnswer.includes(normCorrect));

    if (isCorrect) {
      const newCorrect = correctCount + 1;
      setCorrectCount(newCorrect);

      if (currentQIndex + 1 < questions.length) {
        setCurrentQIndex(currentQIndex + 1);
      } else {
        finishAssessment(newCorrect);
      }
    } else {
      setIsEvaluating(true);
      const repair = await fetchDiagnoseRepair(
        currentQ.topic,
        currentQ.question,
        answer,
        currentQ.correctAnswer
      );
      setActiveRepair(repair);
      setIsEvaluating(false);
    }
  };

  const handleCompleteRepair = (isSuccess: boolean) => {
    setActiveRepair(null);
    if (currentQIndex + 1 < questions.length) {
      setCurrentQIndex(currentQIndex + 1);
    } else {
      finishAssessment(correctCount);
    }
  };

  const finishAssessment = (finalCorrect: number = correctCount) => {
    const scorePct = Math.round((finalCorrect / (questions.length || 1)) * 100);
    onRewardXp(scorePct >= 70 ? 100 : 50);

    setPerformanceReport({
      id: `report_${Date.now()}`,
      topic,
      totalQuestions: questions.length,
      correctAnswers: finalCorrect,
      scorePercentage: scorePct,
      strengths: [
        `Completed diagnostic evaluation for ${topic}`,
        scorePct >= 70 ? 'High accuracy on core multiple-choice questions' : 'Identified key concept gaps for targeted review',
      ],
      weakConcepts: scorePct < 100 ? [`Review missed concepts in ${topic}`] : [],
      nextStudySteps: [
        'Download the Active Recall Study Guide for any missed questions',
        'Review flashcards in 3 days for spaced repetition',
      ],
      completedAt: new Date().toISOString().split('T')[0],
    });
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="bg-emerald-50 text-emerald-700 text-xs font-bold px-3 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                <FileCheck2 className="w-3.5 h-3.5" /> DIAGNOSTIC ASSESSMENT
              </span>
              <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                +80 XP Reward
              </span>
            </div>
            <h2 className="font-extrabold text-2xl text-slate-900">Automated MCQ Quiz Engine</h2>
            <p className="text-xs text-slate-600 font-medium mt-1">
              Test your knowledge with instant diagnostic error analysis and targeted micro-repairs!
            </p>
          </div>

          {/* Quiz Configuration Controls */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Topic</label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g. Computer Networks"
                className="px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 text-xs font-semibold w-48 outline-none focus:border-blue-600 focus:bg-white transition-all shadow-inner"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Questions</label>
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
                {[4, 6, 8, 10].map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setQuestionCount(n)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      questionCount === n
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                    }`}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-end pt-5">
              <button
                onClick={handleStartQuiz}
                disabled={isLoadingQuiz || !topic.trim()}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-5 py-2.5 rounded-xl text-xs flex items-center gap-2 transition-all cursor-pointer shadow-xs disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoadingQuiz ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                Generate {questionCount}-Question Quiz
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Quiz Area */}
      {performanceReport ? (
        <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <span className="bg-emerald-50 text-emerald-700 text-xs font-bold px-3 py-1 rounded-full border border-emerald-200">
                ASSESSMENT COMPLETED
              </span>
              <h3 className="font-extrabold text-2xl text-slate-900 mt-2">
                Performance Score: {performanceReport.scorePercentage}%
              </h3>
            </div>
            <div className="p-3.5 bg-emerald-600 text-white rounded-2xl shadow-xs">
              <Award className="w-8 h-8" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-5 bg-emerald-50/70 rounded-2xl border border-emerald-200/80 space-y-2">
              <h4 className="font-bold text-base text-emerald-950">Identified Strengths</h4>
              <ul className="space-y-2">
                {performanceReport.strengths.map((str, idx) => (
                  <li key={idx} className="text-xs font-semibold text-emerald-900 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{str}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-5 bg-blue-50/70 rounded-2xl border border-blue-200/80 space-y-2">
              <h4 className="font-bold text-base text-blue-950">Next Study Steps</h4>
              <ul className="space-y-2">
                {performanceReport.nextStudySteps.map((step, idx) => (
                  <li key={idx} className="text-xs font-semibold text-blue-900 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-blue-600 shrink-0" />
                    <span>{step}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <button onClick={handleStartQuiz} className="btn-sketch-primary text-sm font-bold">
            Retake or Generate New Quiz
          </button>
        </div>
      ) : activeRepair ? (
        <DiagnoseRepairCard repairLesson={activeRepair} onCompleteRepair={handleCompleteRepair} />
      ) : questions.length > 0 && currentQ ? (
        <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
          {/* Quiz Header & Progress */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="text-slate-600">
                Question {currentQIndex + 1} of {questions.length}
              </span>
              <span className="bg-blue-50 text-blue-700 px-3 py-0.5 rounded-full border border-blue-200 font-extrabold uppercase">
                {currentQ.topic || 'MCQ QUESTION'}
              </span>
            </div>

            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-600 transition-all duration-300"
                style={{ width: `${((currentQIndex + 1) / questions.length) * 100}%` }}
              />
            </div>
          </div>

          {/* Question Text */}
          <div className="space-y-2">
            <h3 className="font-extrabold text-xl sm:text-2xl text-slate-900 leading-snug">
              {currentQ.question}
            </h3>
          </div>

          {/* MCQ Options List */}
          <div className="space-y-3">
            {currentQ.options && currentQ.options.length > 0 ? (
              <div className="grid grid-cols-1 gap-3">
                {currentQ.options.map((opt, idx) => {
                  const isSelected = studentAnswers[currentQ.id] === opt;
                  const optionLetter = String.fromCharCode(65 + idx); // A, B, C, D

                  return (
                    <button
                      key={idx}
                      onClick={() => setStudentAnswers({ ...studentAnswers, [currentQ.id]: opt })}
                      className={`w-full text-left p-4 rounded-2xl border transition-all cursor-pointer flex items-center gap-3 ${
                        isSelected
                          ? 'bg-blue-600 text-white border-blue-600 shadow-md'
                          : 'bg-white border-slate-200/90 text-slate-800 hover:border-blue-300 hover:bg-slate-50 shadow-2xs'
                      }`}
                    >
                      <span
                        className={`w-8 h-8 rounded-xl font-bold flex items-center justify-center text-xs shrink-0 transition-colors ${
                          isSelected
                            ? 'bg-white text-blue-700'
                            : 'bg-slate-100 text-slate-600 border border-slate-200'
                        }`}
                      >
                        {optionLetter}
                      </span>
                      <span className={`text-sm sm:text-base font-semibold ${isSelected ? 'text-white' : 'text-slate-800'}`}>
                        {opt}
                      </span>
                    </button>
                  );
                })}
              </div>
            ) : (
              <textarea
                rows={3}
                placeholder="Type your answer here..."
                value={studentAnswers[currentQ.id] || ''}
                onChange={(e) => setStudentAnswers({ ...studentAnswers, [currentQ.id]: e.target.value })}
                className="w-full p-4 rounded-2xl border border-slate-200 font-semibold text-sm bg-slate-50 focus:bg-white focus:border-blue-600 outline-none transition-all"
              />
            )}
          </div>

          <button
            disabled={!studentAnswers[currentQ.id] || isEvaluating}
            onClick={handleAnswerSubmit}
            className="btn-sketch-primary text-sm flex items-center gap-2 disabled:opacity-50 font-bold py-3.5"
          >
            {isEvaluating ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Submit Answer & Evaluate'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div className="bg-white border border-slate-200/90 rounded-3xl p-12 text-center space-y-4 shadow-sm">
          <div className="w-14 h-14 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center mx-auto text-blue-600 text-2xl font-bold">
            📝
          </div>
          <h3 className="font-extrabold text-xl text-slate-900">No Assessment Active</h3>
          <p className="text-xs text-slate-600 font-medium max-w-md mx-auto">
            Click "Generate Quiz" above to create an automated MCQ quiz with instant active recall diagnostic analysis!
          </p>
        </div>
      )}
    </div>
  );
};
