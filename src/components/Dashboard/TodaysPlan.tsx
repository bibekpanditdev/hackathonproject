import React, { useState } from 'react';
import { UserProfile, Subject } from '../../types';
import { Sparkles, Flame, CheckCircle, Circle, Play, ArrowRight, Timer, Target, Plus, X } from 'lucide-react';

interface NewTaskInput {
  title: string;
  estimatedMinutes: number;
  xpReward: number;
  type: 'tutor' | 'quiz' | 'flashcard' | 'pomodoro';
}

interface TodaysPlanProps {
  user: UserProfile;
  subjects: Subject[];
  onCompleteTask: (taskId: string, xpReward: number) => void;
  onAddTask: (task: NewTaskInput) => void;
  onDeleteTask: (taskId: string) => void;
  onLaunchTutor: (subject: Subject) => void;
  onNavigateTab: (tab: any) => void;
}

export const TodaysPlan: React.FC<TodaysPlanProps> = ({
  user,
  subjects,
  onCompleteTask,
  onAddTask,
  onDeleteTask,
  onLaunchTutor,
  onNavigateTab,
}) => {
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskMinutes, setTaskMinutes] = useState(10);
  const [taskXp, setTaskXp] = useState(25);
  const [taskType, setTaskType] = useState<NewTaskInput['type']>('tutor');

  const resetTaskForm = () => {
    setTaskTitle('');
    setTaskMinutes(10);
    setTaskXp(25);
    setTaskType('tutor');
    setIsAddingTask(false);
  };

  const submitNewTask = () => {
    if (!taskTitle.trim()) return;
    onAddTask({
      title: taskTitle.trim(),
      estimatedMinutes: Math.max(1, taskMinutes),
      xpReward: Math.max(1, taskXp),
      type: taskType,
    });
    resetTaskForm();
  };

  const completedCount = user.todayPlan.filter((t) => t.completed).length;
  const totalCount = user.todayPlan.length;
  const progressPercent = Math.round((completedCount / totalCount) * 100) || 0;

  return (
    <div className="space-y-6">
      {/* Hero Welcome Banner */}
      <div className="bg-white text-slate-900 rounded-3xl p-6 sm:p-8 relative overflow-hidden border border-slate-200 shadow-sm">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2.5">
              <span className="bg-amber-200/80 text-amber-900 text-xs font-black px-3 py-1 rounded-full border border-amber-300">
                DAILY LEARNING GOALS
              </span>
              <span className="text-xs font-bold text-slate-700 flex items-center gap-1">
                <Flame className="w-3.5 h-3.5 text-orange-600 fill-orange-500" /> {user.streakCount} Day Streak Active
              </span>
            </div>
            <h1 className="font-black text-2xl sm:text-3xl mb-2 text-slate-900">
              Welcome back, {user.name}! 🚀
            </h1>
            <p className="text-sm text-slate-700 max-w-xl leading-relaxed font-semibold">
              Retention skyrockets when you learn in bite-sized sequential micro-lessons. Complete your goals today to keep your streak alive!
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <button
              onClick={() => onNavigateTab('tutor')}
              className="btn-sketch-primary text-sm py-3 px-5 flex items-center justify-center gap-2 cursor-pointer"
            >
              <Play className="w-4 h-4 fill-white" />
              Start Micro AI Tutor
            </button>
            <button
              onClick={() => onNavigateTab('assessment')}
              className="btn-sketch-white text-sm py-3 px-4 flex items-center justify-center gap-2 cursor-pointer"
            >
              <Target className="w-4 h-4 text-blue-700" />
              Take a Quiz
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Micro-Task Checklist */}
        <div className="lg:col-span-2 sketch-card p-6 bg-white">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-bold text-xl text-slate-900 flex items-center gap-2">
                <Target className="w-5 h-5 text-indigo-600" />
                Today's Micro-Goals
              </h2>
              <p className="text-xs text-slate-500">5-10 minute bite-sized activities</p>
            </div>
            <div className="text-right">
              <span className="font-black text-lg text-slate-900">
                {completedCount}/{totalCount}
              </span>
              <span className="text-xs text-slate-500 block">Completed</span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-slate-100 rounded-full h-2.5 mb-6 overflow-hidden">
            <div
              className="bg-emerald-500 h-full rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          {/* Task Items List */}
          <div className="space-y-3">
            {user.todayPlan.length === 0 && !isAddingTask && (
              <div className="text-center py-8 border border-dashed border-slate-200 rounded-xl">
                <p className="text-sm text-slate-500 font-medium mb-3">No tasks yet for today.</p>
                <button
                  onClick={() => setIsAddingTask(true)}
                  className="btn-sketch-primary text-xs py-2 px-4 inline-flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" /> Add your first task
                </button>
              </div>
            )}

            {user.todayPlan.map((task) => (
              <div
                key={task.id}
                className={`p-4 rounded-xl border transition-all flex items-center justify-between gap-3 ${
                  task.completed
                    ? 'bg-emerald-50/60 border-emerald-200'
                    : 'bg-slate-50/50 hover:bg-slate-100/60 border-slate-200/80 shadow-2xs'
                }`}
              >
                <div
                  className="flex items-center gap-3 flex-1 cursor-pointer min-w-0"
                  onClick={() => {
                    if (!task.completed) {
                      onCompleteTask(task.id, task.xpReward);
                    }
                  }}
                >
                  <button className="text-slate-400 hover:text-emerald-600 transition-colors shrink-0">
                    {task.completed ? (
                      <CheckCircle className="w-5 h-5 text-emerald-600 fill-emerald-100" />
                    ) : (
                      <Circle className="w-5 h-5 text-slate-300" />
                    )}
                  </button>
                  <div className="min-w-0">
                    <h3
                      className={`font-semibold text-sm text-slate-800 truncate ${
                        task.completed ? 'line-through text-slate-400' : ''
                      }`}
                    >
                      {task.title}
                    </h3>
                    <p className="text-xs text-slate-400 font-medium">~{task.estimatedMinutes} min duration</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="bg-amber-50 text-amber-800 text-xs font-bold px-2.5 py-1 rounded-lg border border-amber-200/80 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                    +{task.xpReward} XP
                  </span>
                  <button
                    onClick={() => onDeleteTask(task.id)}
                    className="text-slate-300 hover:text-rose-500 transition-colors p-1"
                    aria-label="Remove task"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}

            {/* Inline "Add Task" form */}
            {isAddingTask ? (
              <div className="p-4 rounded-xl border border-dashed border-indigo-300 bg-indigo-50/40 space-y-3">
                <input
                  autoFocus
                  type="text"
                  placeholder="Task title, e.g. Review Newton's Laws"
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && submitNewTask()}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-400"
                />
                <div className="flex flex-wrap items-center gap-3">
                  <label className="text-xs font-semibold text-slate-600 flex items-center gap-1.5">
                    Minutes
                    <input
                      type="number"
                      min={1}
                      value={taskMinutes}
                      onChange={(e) => setTaskMinutes(Number(e.target.value))}
                      className="w-16 px-2 py-1 rounded-lg border border-slate-300 text-xs font-medium"
                    />
                  </label>
                  <label className="text-xs font-semibold text-slate-600 flex items-center gap-1.5">
                    XP reward
                    <input
                      type="number"
                      min={1}
                      value={taskXp}
                      onChange={(e) => setTaskXp(Number(e.target.value))}
                      className="w-16 px-2 py-1 rounded-lg border border-slate-300 text-xs font-medium"
                    />
                  </label>
                  <label className="text-xs font-semibold text-slate-600 flex items-center gap-1.5">
                    Type
                    <select
                      value={taskType}
                      onChange={(e) => setTaskType(e.target.value as NewTaskInput['type'])}
                      className="px-2 py-1 rounded-lg border border-slate-300 text-xs font-medium"
                    >
                      <option value="tutor">Tutor lesson</option>
                      <option value="quiz">Quiz</option>
                      <option value="flashcard">Flashcard</option>
                      <option value="pomodoro">Focus session</option>
                    </select>
                  </label>
                </div>
                <div className="flex items-center gap-2 pt-1">
                  <button
                    onClick={submitNewTask}
                    disabled={!taskTitle.trim()}
                    className="btn-sketch-primary text-xs py-2 px-4 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Add task
                  </button>
                  <button
                    onClick={resetTaskForm}
                    className="text-xs font-semibold text-slate-500 hover:text-slate-700 px-3 py-2"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              user.todayPlan.length > 0 && (
                <button
                  onClick={() => setIsAddingTask(true)}
                  className="w-full p-3 rounded-xl border border-dashed border-slate-300 text-slate-500 hover:border-indigo-400 hover:text-indigo-600 hover:bg-indigo-50/40 transition-all text-xs font-bold flex items-center justify-center gap-1.5"
                >
                  <Plus className="w-4 h-4" /> Add a task
                </button>
              )
            )}
          </div>
        </div>

        {/* Quick Tools & Focus Session Launcher */}
        <div className="space-y-6">
          {/* Pomodoro Quick Launcher */}
          <div className="sketch-card p-5 bg-gradient-to-br from-sky-50 to-blue-50 border-sky-100">
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2.5 bg-sky-600 text-white rounded-xl shadow-xs">
                <Timer className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base text-slate-900">Focus Timer</h3>
                <p className="text-xs text-slate-500">25 min deep study = +100 XP</p>
              </div>
            </div>
            <p className="text-xs text-slate-600 mb-4 leading-relaxed">
              Maintain deep focus with guided Pomodoro intervals and gentle ambient audio.
            </p>
            <button
              onClick={() => onNavigateTab('productivity')}
              className="w-full btn-sketch-sky text-sm flex items-center justify-center gap-2"
            >
              Start Focus Timer
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Stats Widget */}
          <div className="sketch-card p-5 bg-slate-50 border-slate-200">
            <h3 className="font-bold text-base text-slate-900 mb-3">Your Study Summary</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white p-3.5 rounded-xl border border-slate-200 text-center shadow-2xs">
                <span className="font-black text-2xl text-indigo-600">{user.xp}</span>
                <span className="text-xs font-medium text-slate-500 block mt-0.5">Total XP</span>
              </div>
              <div className="bg-white p-3.5 rounded-xl border border-slate-200 text-center shadow-2xs">
                <span className="font-black text-2xl text-rose-500">🔥 {user.streakCount}</span>
                <span className="text-xs font-medium text-slate-500 block mt-0.5">Day Streak</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Active Subjects Progress Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-xl text-slate-900">Active Courses & Subjects</h2>
          <span className="text-xs text-slate-500 font-semibold">{subjects.length} Enrolled</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {subjects.map((s) => {
            const totalConcepts = s.concepts.length;
            const mastered = s.concepts.filter((c) => c.status === 'mastered').length;
            const percent = Math.round((mastered / totalConcepts) * 100);

            return (
              <div key={s.id} className="sketch-card p-5 bg-white flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span
                      className="w-3.5 h-3.5 rounded-full shadow-xs"
                      style={{ backgroundColor: s.color }}
                    />
                    <span className="bg-slate-100 text-slate-600 text-[11px] font-bold px-2 py-0.5 rounded-md border border-slate-200">
                      {s.category}
                    </span>
                  </div>
                  <h3 className="font-bold text-base text-slate-900 mb-1">{s.name}</h3>
                  <p className="text-xs text-slate-500 line-clamp-2 mb-4 font-normal">{s.description}</p>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-semibold text-slate-600 mb-1.5">
                    <span>Mastery Progress</span>
                    <span>{percent}%</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 mb-4 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-300"
                      style={{ width: `${percent}%`, backgroundColor: s.color }}
                    />
                  </div>

                  <button
                    onClick={() => onLaunchTutor(s)}
                    className="w-full btn-sketch-primary text-xs py-2 flex items-center justify-center gap-1.5"
                  >
                    <Play className="w-3.5 h-3.5 fill-white" />
                    Continue Learning
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
