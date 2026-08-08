import React, { useState, useEffect } from 'react';
import { Flashcard, TaskItem } from '../../types';
import { INITIAL_TASKS } from '../../data/mockData';
import { fetchFlashcards, breakDownAssignment } from '../../services/api';
import { Timer, Layers, CheckSquare, Play, Pause, RotateCcw, Check, Plus, Loader2, Sparkles, Trash2, Calendar, AlertCircle, Filter, Target, Zap, ChevronDown, ChevronUp } from 'lucide-react';

interface ProductivitySuiteProps {
  onRewardXp: (amount: number) => void;
}

export const ProductivitySuite: React.FC<ProductivitySuiteProps> = ({ onRewardXp }) => {
  const [activeSubTab, setActiveSubTab] = useState<'pomodoro' | 'flashcards' | 'tasks'>('pomodoro');

  // Pomodoro state
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);

  // Flashcards state
  const [flashcardTopic, setFlashcardTopic] = useState('Computer Networks');
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [currentFcIndex, setCurrentFcIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isLoadingFlashcards, setIsLoadingFlashcards] = useState(false);

  const handleGenerateFlashcards = async (topicToLoad: string) => {
    setIsLoadingFlashcards(true);
    setCurrentFcIndex(0);
    setIsFlipped(false);
    const generated = await fetchFlashcards(topicToLoad, 6);
    setFlashcards(generated);
    setIsLoadingFlashcards(false);
  };

  useEffect(() => {
    if (activeSubTab === 'flashcards' && flashcards.length === 0) {
      handleGenerateFlashcards(flashcardTopic);
    }
  }, [activeSubTab]);

  // Tasks state
  const [tasks, setTasks] = useState<TaskItem[]>(INITIAL_TASKS);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [taskPriority, setTaskPriority] = useState<'high' | 'medium' | 'low'>('medium');
  const [taskDueDate, setTaskDueDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [taskFilter, setTaskFilter] = useState<'all' | 'pending' | 'completed' | 'high'>('all');
  const [loadingBreakdownId, setLoadingBreakdownId] = useState<string | null>(null);

  // Pomodoro Timer effect
  useEffect(() => {
    let timer: any;
    if (isRunning && timeLeft > 0) {
      timer = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    } else if (timeLeft === 0 && isRunning) {
      setIsRunning(false);
      onRewardXp(100);
      alert('🎉 Great work! 25-minute Pomodoro focus session completed! +100 XP awarded!');
    }
    return () => clearInterval(timer);
  }, [isRunning, timeLeft]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleRateFlashcard = (rating: 'easy' | 'good' | 'hard') => {
    setIsFlipped(false);
    onRewardXp(rating === 'easy' ? 20 : 10);
    if (currentFcIndex + 1 < flashcards.length) {
      setCurrentFcIndex(currentFcIndex + 1);
    } else {
      setCurrentFcIndex(0);
    }
  };

  const handleAddTask = () => {
    if (newTaskTitle.trim()) {
      const task: TaskItem = {
        id: `tk_${Date.now()}`,
        title: newTaskTitle.trim(),
        dueDate: taskDueDate || new Date().toISOString().split('T')[0],
        completed: false,
        estimatedMinutes: taskPriority === 'high' ? 30 : 15,
        xpReward: taskPriority === 'high' ? 60 : 40,
        priority: taskPriority,
      };
      setTasks([task, ...tasks]);
      setNewTaskTitle('');
    }
  };

  const handleToggleTask = (id: string) => {
    setTasks(
      tasks.map((t) => {
        if (t.id === id) {
          if (!t.completed) onRewardXp(t.xpReward);
          return { ...t, completed: !t.completed };
        }
        return t;
      })
    );
  };

  const handleDeleteTask = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setTasks(tasks.filter((t) => t.id !== id));
  };

  const handleAiBreakdown = async (taskId: string, title: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setLoadingBreakdownId(taskId);
    const subtaskTitles = await breakDownAssignment(title);

    setTasks(
      tasks.map((t) => {
        if (t.id === taskId) {
          return {
            ...t,
            subtasks: subtaskTitles.map((st, idx) => ({
              id: `st_${taskId}_${idx}`,
              title: st,
              completed: false,
            })),
          };
        }
        return t;
      })
    );
    setLoadingBreakdownId(null);
  };

  const handleToggleSubtask = (taskId: string, subtaskId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setTasks(
      tasks.map((t) => {
        if (t.id === taskId && t.subtasks) {
          const updatedSub = t.subtasks.map((st) => {
            if (st.id === subtaskId) {
              if (!st.completed) onRewardXp(15);
              return { ...st, completed: !st.completed };
            }
            return st;
          });
          const allDone = updatedSub.every((st) => st.completed);
          return { ...t, subtasks: updatedSub, completed: allDone ? true : t.completed };
        }
        return t;
      })
    );
  };

  return (
    <div className="space-y-6">
      {/* Top Selector Subtabs */}
      <div className="sketch-card bg-white p-2.5 flex gap-2 overflow-x-auto">
        <button
          onClick={() => setActiveSubTab('pomodoro')}
          className={`flex-1 min-w-[120px] py-2.5 px-4 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer ${
            activeSubTab === 'pomodoro'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'bg-transparent text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Timer className="w-4 h-4" /> Pomodoro Timer
        </button>
        <button
          onClick={() => setActiveSubTab('flashcards')}
          className={`flex-1 min-w-[120px] py-2.5 px-4 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer ${
            activeSubTab === 'flashcards'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'bg-transparent text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Layers className="w-4 h-4" /> Flashcard Deck
        </button>
        <button
          onClick={() => setActiveSubTab('tasks')}
          className={`flex-1 min-w-[120px] py-2.5 px-4 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer ${
            activeSubTab === 'tasks'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'bg-transparent text-slate-600 hover:bg-slate-100'
          }`}
        >
          <CheckSquare className="w-4 h-4" /> Assignment Tracker
        </button>
      </div>

      {/* Pomodoro Timer View */}
      {activeSubTab === 'pomodoro' && (
        <div className="sketch-card bg-white p-8 text-center space-y-6 max-w-xl mx-auto">
          <span className="bg-indigo-50 text-indigo-700 text-xs font-bold px-3 py-1 rounded-full border border-indigo-100">
            DEEP FOCUS SESSION
          </span>

          <div className="w-48 h-48 rounded-full bg-slate-50 border border-slate-200 shadow-inner flex flex-col items-center justify-center mx-auto">
            <span className="font-bold text-4xl text-slate-900 font-mono tracking-tight">{formatTime(timeLeft)}</span>
            <span className="text-xs font-semibold text-slate-400 mt-1">25 Min Focus</span>
          </div>

          <div className="flex justify-center gap-3">
            <button
              onClick={() => setIsRunning(!isRunning)}
              className="btn-sketch-primary flex items-center gap-2 px-6 py-3 text-base"
            >
              {isRunning ? <Pause className="w-5 h-5 fill-white" /> : <Play className="w-5 h-5 fill-white" />}
              {isRunning ? 'Pause Timer' : 'Start Focus'}
            </button>
            <button
              onClick={() => {
                setIsRunning(false);
                setTimeLeft(25 * 60);
              }}
              className="btn-sketch-secondary p-3"
            >
              <RotateCcw className="w-5 h-5 text-slate-600" />
            </button>
          </div>

          <p className="text-xs text-slate-500 font-medium">
            💡 Complete a 25-minute study block to claim +100 XP and boost your streak!
          </p>
        </div>
      )}

      {/* Flashcard Deck View */}
      {activeSubTab === 'flashcards' && (
        <div className="sketch-card bg-white p-6 sm:p-8 space-y-6 max-w-xl mx-auto text-center">
          {/* AI Flashcards Topic Generator Bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (flashcardTopic.trim()) {
                handleGenerateFlashcards(flashcardTopic.trim());
              }
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              placeholder='Topic e.g. "Computer Networks"'
              value={flashcardTopic}
              onChange={(e) => setFlashcardTopic(e.target.value)}
              className="flex-1 px-3.5 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:border-indigo-600 outline-none"
            />
            <button
              type="submit"
              disabled={isLoadingFlashcards || !flashcardTopic.trim()}
              className="btn-sketch-primary text-xs py-2 px-4 flex items-center gap-1.5 shrink-0"
            >
              {isLoadingFlashcards ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              )}
              <span>Generate AI Deck</span>
            </button>
          </form>

          {isLoadingFlashcards ? (
            <div className="py-12 flex flex-col items-center justify-center space-y-2 text-indigo-600 animate-pulse">
              <Loader2 className="w-8 h-8 animate-spin" />
              <span className="text-xs font-bold text-slate-600">EduMind AI is generating flashcards for "{flashcardTopic}"...</span>
            </div>
          ) : flashcards.length > 0 ? (
            <>
              <div className="flex items-center justify-between text-xs font-bold text-slate-400">
                <span>Card {currentFcIndex + 1} of {flashcards.length}</span>
                <span className="text-indigo-600 font-extrabold uppercase">AI Deck • {flashcardTopic}</span>
              </div>

              {/* Flashcard Flip Container */}
              <div
                onClick={() => setIsFlipped(!isFlipped)}
                className="w-full min-h-[220px] bg-slate-50 rounded-2xl border border-slate-200/80 p-6 flex flex-col items-center justify-center cursor-pointer transition-all hover:bg-slate-100/60"
              >
                <span className="text-[10px] font-bold uppercase text-indigo-600 mb-2">
                  {isFlipped ? '💡 ANSWER' : '❓ QUESTION (Click to Flip)'}
                </span>
                <p className="font-bold text-base sm:text-lg text-slate-900">
                  {isFlipped ? flashcards[currentFcIndex]?.back : flashcards[currentFcIndex]?.front}
                </p>
              </div>

              {/* Self Assessment Rating Buttons */}
              <div className="flex justify-center gap-3 pt-2">
                <button onClick={() => handleRateFlashcard('hard')} className="btn-sketch-primary text-xs py-2 px-4">
                  Hard (Retry Soon)
                </button>
                <button onClick={() => handleRateFlashcard('good')} className="btn-sketch-secondary text-xs py-2 px-4">
                  Good (+10 XP)
                </button>
                <button onClick={() => handleRateFlashcard('easy')} className="btn-sketch-mint text-xs py-2 px-4">
                  Easy (+20 XP)
                </button>
              </div>
            </>
          ) : (
            <div className="py-8 text-center text-xs text-slate-500 font-medium">
              No flashcards available. Click "Generate AI Deck" to create a fresh flashcard set!
            </div>
          )}
        </div>
      )}

      {/* Assignment & Task Tracker View */}
      {activeSubTab === 'tasks' && (() => {
        const completedCount = tasks.filter((t) => t.completed).length;
        const totalCount = tasks.length;
        const completionPct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
        const totalXpEarned = tasks.filter((t) => t.completed).reduce((acc, t) => acc + t.xpReward, 0);

        const filteredTasks = tasks.filter((t) => {
          if (taskFilter === 'pending') return !t.completed;
          if (taskFilter === 'completed') return t.completed;
          if (taskFilter === 'high') return t.priority === 'high';
          return true;
        });

        return (
          <div className="sketch-card bg-white p-6 sm:p-8 space-y-6">
            {/* Header & Overview Stats */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="bg-indigo-50 text-indigo-700 text-xs font-bold px-2.5 py-0.5 rounded-full border border-indigo-100 flex items-center gap-1">
                    <Target className="w-3.5 h-3.5" /> AI SMART TRACKER
                  </span>
                  <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    +{totalXpEarned} XP Earned
                  </span>
                </div>
                <h3 className="font-bold text-2xl text-slate-900">Task & Assignment Tracker</h3>
              </div>

              {/* Progress Summary Bar */}
              <div className="w-full sm:w-64 bg-slate-50 p-3 rounded-2xl border border-slate-200/80 space-y-1.5 shrink-0">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-slate-600">Progress</span>
                  <span className="text-indigo-600">{completedCount}/{totalCount} Completed ({completionPct}%)</span>
                </div>
                <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-600 transition-all duration-500"
                    style={{ width: `${completionPct}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Form to Add New Assignment */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleAddTask();
              }}
              className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-3"
            >
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Enter assignment or study task (e.g. 'Write 5-page research paper')..."
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 font-medium text-xs sm:text-sm bg-white focus:border-indigo-600 outline-none transition-all shadow-inner"
                />
                <button
                  type="submit"
                  disabled={!newTaskTitle.trim()}
                  className="btn-sketch-primary text-xs py-2.5 px-4 flex items-center gap-1.5 shrink-0 disabled:opacity-50"
                >
                  <Plus className="w-4 h-4" /> Add Goal
                </button>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 text-xs pt-1">
                {/* Priority Selector */}
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-slate-500">Priority:</span>
                  {(['high', 'medium', 'low'] as const).map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setTaskPriority(p)}
                      className={`px-2.5 py-1 rounded-lg font-extrabold capitalize transition-all border ${
                        taskPriority === p
                          ? p === 'high'
                            ? 'bg-rose-500 text-white border-rose-600 shadow-xs'
                            : p === 'medium'
                            ? 'bg-amber-400 text-slate-950 border-amber-500 shadow-xs'
                            : 'bg-emerald-500 text-white border-emerald-600 shadow-xs'
                          : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {p === 'high' ? '🔥 High' : p === 'medium' ? '⚡ Medium' : '🌱 Low'}
                    </button>
                  ))}
                </div>

                {/* Due Date Picker */}
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-500 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" /> Due:
                  </span>
                  <input
                    type="date"
                    value={taskDueDate}
                    onChange={(e) => setTaskDueDate(e.target.value)}
                    className="px-2.5 py-1 rounded-lg border border-slate-200 bg-white font-semibold text-xs text-slate-700 outline-none"
                  />
                </div>
              </div>
            </form>

            {/* Filter Tabs */}
            <div className="flex items-center gap-2 overflow-x-auto pt-1 border-b border-slate-100 pb-2 text-xs font-bold">
              <span className="text-slate-400 flex items-center gap-1 shrink-0">
                <Filter className="w-3.5 h-3.5" /> Filter:
              </span>
              {(['all', 'pending', 'completed', 'high'] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setTaskFilter(f)}
                  className={`px-3 py-1 rounded-xl capitalize transition-all cursor-pointer border ${
                    taskFilter === f
                      ? 'bg-indigo-600 text-white border-indigo-700 shadow-xs'
                      : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
                  }`}
                >
                  {f === 'all'
                    ? `All (${tasks.length})`
                    : f === 'pending'
                    ? `Pending (${tasks.filter((t) => !t.completed).length})`
                    : f === 'completed'
                    ? `Completed (${tasks.filter((t) => t.completed).length})`
                    : `🔥 High Priority (${tasks.filter((t) => t.priority === 'high').length})`}
                </button>
              ))}
            </div>

            {/* Tasks List */}
            {filteredTasks.length > 0 ? (
              <div className="space-y-3">
                {filteredTasks.map((task) => {
                  const isHigh = task.priority === 'high';
                  const isMed = task.priority === 'medium';
                  const isLoadingThis = loadingBreakdownId === task.id;

                  return (
                    <div
                      key={task.id}
                      className={`p-4 rounded-2xl border transition-all space-y-3 ${
                        task.completed
                          ? 'bg-emerald-50/40 border-emerald-200 text-slate-400'
                          : isHigh
                          ? 'bg-gradient-to-r from-rose-50/40 to-white border-rose-200 hover:border-rose-300 shadow-xs'
                          : 'bg-white border-slate-200/90 hover:border-indigo-200 hover:bg-slate-50/60 shadow-2xs'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        {/* Task Checkbox & Title */}
                        <div
                          onClick={() => handleToggleTask(task.id)}
                          className="flex items-start gap-3 flex-1 cursor-pointer"
                        >
                          <div
                            className={`w-6 h-6 rounded-lg border flex items-center justify-center shrink-0 transition-all mt-0.5 ${
                              task.completed
                                ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                                : 'bg-white border-slate-300 hover:border-indigo-500'
                            }`}
                          >
                            {task.completed && <Check className="w-4 h-4" />}
                          </div>

                          <div>
                            <h4
                              className={`font-bold text-sm sm:text-base leading-snug ${
                                task.completed ? 'line-through text-slate-400' : 'text-slate-900'
                              }`}
                            >
                              {task.title}
                            </h4>

                            <div className="flex flex-wrap items-center gap-2 mt-1 text-[11px] font-semibold text-slate-500">
                              <span
                                className={`px-2 py-0.5 rounded-full font-bold border ${
                                  isHigh
                                    ? 'bg-rose-100 text-rose-800 border-rose-200'
                                    : isMed
                                    ? 'bg-amber-100 text-amber-800 border-amber-200'
                                    : 'bg-emerald-100 text-emerald-800 border-emerald-200'
                                }`}
                              >
                                {isHigh ? '🔥 High Priority' : isMed ? '⚡ Medium Priority' : '🌱 Low Priority'}
                              </span>

                              <span className="flex items-center gap-1 text-slate-500">
                                <Calendar className="w-3 h-3 text-slate-400" />
                                {task.dueDate}
                              </span>

                              <span className="bg-amber-100/80 text-amber-900 font-bold px-2 py-0.5 rounded-full border border-amber-200">
                                +{task.xpReward} XP
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Action Buttons: AI Breakdown & Delete */}
                        <div className="flex items-center gap-1.5 shrink-0">
                          {!task.subtasks && (
                            <button
                              onClick={(e) => handleAiBreakdown(task.id, task.title, e)}
                              disabled={isLoadingThis}
                              className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold border border-indigo-200 transition-all cursor-pointer"
                              title="Break down into AI sub-tasks"
                            >
                              {isLoadingThis ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              ) : (
                                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                              )}
                              <span className="hidden sm:inline">AI Breakdown</span>
                            </button>
                          )}

                          <button
                            onClick={(e) => handleDeleteTask(task.id, e)}
                            className="p-1.5 rounded-xl hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                            title="Delete task"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* AI Breakdown Sub-tasks Checklist */}
                      {task.subtasks && task.subtasks.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-slate-200/80 space-y-2 bg-indigo-50/50 p-3.5 rounded-xl border border-indigo-100">
                          <div className="flex items-center justify-between text-xs font-bold text-indigo-900">
                            <span className="flex items-center gap-1">
                              <Zap className="w-3.5 h-3.5 text-indigo-600" />
                              AI Action Plan Sub-tasks ({task.subtasks.filter((s) => s.completed).length}/{task.subtasks.length})
                            </span>
                            <span className="text-[10px] text-indigo-600 font-extrabold">+15 XP per sub-task</span>
                          </div>

                          <div className="space-y-1.5">
                            {task.subtasks.map((st) => (
                              <div
                                key={st.id}
                                onClick={(e) => handleToggleSubtask(task.id, st.id, e)}
                                className={`p-2 rounded-lg border flex items-center gap-2.5 cursor-pointer text-xs font-medium transition-all ${
                                  st.completed
                                    ? 'bg-emerald-100/60 border-emerald-300 text-slate-500 line-through'
                                    : 'bg-white border-slate-200/80 hover:bg-slate-100 text-slate-800'
                                }`}
                              >
                                <div
                                  className={`w-4 h-4 rounded border flex items-center justify-center text-[10px] font-bold shrink-0 ${
                                    st.completed ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white border-slate-300'
                                  }`}
                                >
                                  {st.completed && <Check className="w-3 h-3" />}
                                </div>
                                <span>{st.title}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-12 text-center text-xs text-slate-500 font-medium space-y-2">
                <span className="text-3xl block mb-1">🎯</span>
                <p className="font-bold text-slate-700">No Tasks Matching Filter</p>
                <p>Add a new assignment goal above or clear your active filters!</p>
              </div>
            )}
          </div>
        );
      })()}
    </div>
  );
};
