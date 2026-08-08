import React, { useState } from 'react';
import {
  Sparkles,
  ArrowRight,
  CheckCircle2,
  FileText,
  Flame,
  Brain,
  Zap,
  ArrowUpRight,
  GitBranch,
  TrendingUp,
  Cpu,
  Activity,
  Sliders,
  Check,
  Target,
  Trophy,
  Download,
  BookOpen,
  Layers,
  ShieldCheck,
  Code2,
  Database,
  Grid,
} from 'lucide-react';
import { Subject, UserProfile } from '../../types';
import { NavTab } from '../SidebarNav';

interface LandingPageProps {
  subjects: Subject[];
  onEnterApp: () => void;
  onOpenAuth: () => void;
  onNavigateTab?: (tab: NavTab) => void;
  user: UserProfile;
  isAuthenticated?: boolean;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  subjects,
  onEnterApp,
  onOpenAuth,
  onNavigateTab,
  user,
  isAuthenticated = false,
}) => {
  const [twinPace, setTwinPace] = useState<'measured' | 'adaptive' | 'rapid'>('adaptive');
  const [selectedFeature, setSelectedFeature] = useState<'tutor' | 'quiz' | 'recall' | 'tasks'>('tutor');

  const handleRouteClick = (tab: NavTab) => {
    if (onNavigateTab) {
      onNavigateTab(tab);
    } else {
      onEnterApp();
    }
  };

  return (
    <div className="space-y-10 sm:space-y-14 animate-in fade-in duration-200 pb-16 max-w-7xl mx-auto px-4">

      {/* Hero Grid Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">

        {/* Main Hero Card (Lg Col 8) */}
        <div className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-3xl p-8 sm:p-12 text-white shadow-xl flex flex-col justify-between">
          <div className="relative z-10 space-y-6">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 bg-blue-500/20 text-blue-300 border border-blue-400/30 px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                <Sparkles className="w-4 h-4 text-amber-400" />
                NEXT-GEN AI ADAPTIVE LEARNING PLATFORM
              </span>
              <span className="inline-flex items-center gap-1 bg-amber-500/20 text-amber-300 border border-amber-400/30 px-3 py-1 rounded-full text-xs font-bold">
                🔥 Groq AI Engine
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.1] text-white">
              EduMind AI: <span className="text-blue-400">Smart Exam & STEM Mastery</span> Engine
            </h1>

            <p className="text-sm sm:text-base text-slate-300 font-medium leading-relaxed max-w-2xl">
              EduMind AI is an advanced agentic learning ecosystem designed to revolutionize study habits. It breaks complex STEM subjects into bite-sized micro-lessons, generates dynamic 4-option MCQ assessments, diagnoses misconceptions with <strong>5-step Improvement Formulas</strong>, and exports print-ready <strong>Active Recall Study Guides</strong>.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                onClick={() => handleRouteClick('todays_plan')}
                className="bg-blue-600 hover:bg-blue-700 text-white text-sm py-4 px-8 rounded-2xl font-bold shadow-md transition-all flex items-center gap-2.5 cursor-pointer border border-blue-500"
              >
                {isAuthenticated ? 'Go to Dashboard' : 'Launch AI Learning App'} <ArrowRight className="w-5 h-5" />
              </button>

              {!isAuthenticated ? (
                <button
                  onClick={onOpenAuth}
                  className="bg-slate-800/90 hover:bg-slate-800 text-slate-200 font-bold text-sm py-4 px-6 rounded-2xl border border-slate-700 transition-all flex items-center gap-2 cursor-pointer"
                >
                  <ShieldCheck className="w-4 h-4 text-emerald-400" /> Sign In / Register
                </button>
              ) : (
                <div className="flex items-center gap-2 bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 px-4 py-3.5 rounded-2xl text-xs font-bold shadow-sm">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                  <span>Welcome back, {user.name || user.username || 'Learner'}! (Signed In)</span>
                </div>
              )}
            </div>
          </div>

          <div className="relative z-10 grid grid-cols-2 sm:grid-cols-4 gap-3 pt-8 mt-8 border-t border-slate-800/80 text-xs font-bold text-slate-300">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Step-by-Step AI Tutor</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>MCQ Quiz Engine</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Active Recall PDFs</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Firebase Realtime DB</span>
            </div>
          </div>
        </div>

        {/* AI Spec Stats Card (Lg Col 4) */}
        <div className="lg:col-span-4 bg-slate-950 border border-slate-800 rounded-3xl p-6 sm:p-8 text-white flex flex-col justify-between space-y-6 shadow-xl relative overflow-hidden">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div className="flex items-center gap-2">
              <Cpu className="w-5 h-5 text-amber-400 animate-pulse" />
              <h3 className="font-extrabold text-base text-white">System Architecture</h3>
            </div>
            <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-mono px-2 py-0.5 rounded-md">
              ONLINE
            </span>
          </div>

          <div className="space-y-3 font-mono text-xs">
            <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1">
              <span className="text-[10px] text-slate-500 font-bold block uppercase">AI Model Provider</span>
              <p className="font-bold text-indigo-300">Groq LLaMA 3.1 8B Instant</p>
              <p className="text-[11px] text-slate-400">Multi-provider fallback (LLaMA 3.3 70B & Mixtral)</p>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1">
              <span className="text-[10px] text-slate-500 font-bold block uppercase">Diagnostic Engine</span>
              <p className="font-bold text-amber-300">5-Step Improvement Formulas</p>
              <p className="text-[11px] text-slate-400">Active Recall Tips & HTML/PDF Exporter</p>
            </div>

            <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1">
              <span className="text-[10px] text-slate-500 font-bold block uppercase">Backend Infrastructure</span>
              <p className="font-bold text-emerald-300">Firebase Firestore & Storage</p>
              <p className="text-[11px] text-slate-400">Live XP Leaderboard & Auth Persistence</p>
            </div>
          </div>

          <button
            onClick={() => handleRouteClick('tutor')}
            className="w-full btn-sketch-secondary text-xs py-3 flex items-center justify-center gap-2"
          >
            Explore AI Chatbot <ArrowUpRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Detailed Project Explanation Section */}
      <section className="bg-white rounded-3xl p-8 sm:p-12 border-2 border-slate-900 shadow-[6px_6px_0px_0px_#0F172A] space-y-6">
        <div className="flex items-center gap-3 border-b border-slate-200/80 pb-4">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl border border-indigo-100">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <span className="bg-indigo-50 text-indigo-700 text-[10px] font-black px-2.5 py-0.5 rounded-full border border-indigo-100 uppercase">
              PROJECT OVERVIEW & PHILOSOPHY
            </span>
            <h2 className="font-black text-2xl sm:text-3xl text-slate-900 tracking-tight mt-1">
              What is EduMind AI & How Does It Work?
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm text-slate-700 leading-relaxed font-medium">
          <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2">
            <h3 className="font-extrabold text-base text-indigo-900 flex items-center gap-2">
              <Brain className="w-5 h-5 text-indigo-600" />
              1. Step-by-Step Micro-Lessons
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Traditional textbooks overwhelm students with dense pages. EduMind AI breaks any complex subject (Computer Networks, Organic Chemistry, Calculus, Data Structures) into bite-sized, sequential micro-lessons. Each part includes exam advice, key takeaways, real-world analogies, and instant mini-challenges.
            </p>
          </div>

          <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2">
            <h3 className="font-extrabold text-base text-rose-900 flex items-center gap-2">
              <Target className="w-5 h-5 text-rose-600" />
              2. Diagnose → Repair → Recall Loop
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              When a student answers a question incorrectly, the AI tutor doesn't just say "wrong". It diagnoses the exact error type (<em>Careless mistake</em>, <em>Misconception</em>, or <em>Knowledge gap</em>), delivers a targeted 3-minute repair lesson, provides a 5-step Improvement Formula with 4 Active Recall strategies, and lets you download a print-ready PDF study guide.
            </p>
          </div>

          <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2">
            <h3 className="font-extrabold text-base text-emerald-900 flex items-center gap-2">
              <Trophy className="w-5 h-5 text-emerald-600" />
              3. Firebase Sync & Gamification
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Student progress (XP, levels, study streaks, unlocked stickers, tasks) is saved in real time to Firebase Firestore. Students climb the Live Global Leaderboard, claim attendance reward chests, unlock achievement badges, and track their study goals in the AI Task Tracker.
            </p>
          </div>
        </div>
      </section>

      {/* Core Systems Bento Grid (Grid-like Design) */}
      <section className="space-y-6">
        <div className="text-center space-y-2 max-w-2xl mx-auto">
          <span className="bg-indigo-50 text-indigo-700 text-xs font-black px-3.5 py-1 rounded-full border border-indigo-100 uppercase">
            FULL FEATURE BENTO GRID
          </span>
          <h2 className="font-black text-3xl sm:text-4xl text-slate-900 tracking-tight">
            Explore Project Core Modules
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            Click any module grid block to test the interactive feature in the app workspace.
          </p>
        </div>

        {/* 6-Block Feature Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

          {/* Card 1: Step-by-Step AI Chatbot Tutor */}
          <div
            onClick={() => handleRouteClick('tutor')}
            className="md:col-span-2 bg-slate-900 rounded-3xl p-6 sm:p-8 text-white space-y-4 border border-slate-800 shadow-md hover:shadow-xl transition-all cursor-pointer group flex flex-col justify-between"
          >
            <div className="flex items-center justify-between">
              <span className="bg-blue-500/20 text-blue-300 border border-blue-400/30 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1.5 uppercase">
                <Brain className="w-4 h-4 text-amber-400" /> AI STEP-BY-STEP TUTOR
              </span>
              <ArrowUpRight className="w-5 h-5 text-blue-300 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
            </div>

            <div className="space-y-2">
              <h3 className="font-black text-2xl text-white">Interactive Micro-Lesson AI Tutor</h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-medium">
                Type any exam or study topic (e.g. <em>"teach me computer networks"</em>). The AI generates a multi-part study roadmap, breaks the topic into digestible micro-lessons, and validates understanding through mini-challenge questions with gold coin & XP rewards.
              </p>
            </div>

            <div className="flex items-center gap-3 pt-2 text-xs font-mono text-blue-300">
              <span className="bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800">Roadmap Generator</span>
              <span className="bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800">Analogy Engine</span>
              <span className="bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800">Exam Priority Summary</span>
            </div>
          </div>

          {/* Card 2: Diagnostic MCQ Quiz Engine */}
          <div
            onClick={() => handleRouteClick('assessment')}
            className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-md hover:shadow-xl transition-all cursor-pointer group flex flex-col justify-between space-y-4"
          >
            <div className="flex items-center justify-between">
              <div className="p-3 bg-emerald-50 text-emerald-700 rounded-2xl border border-emerald-100">
                <FileText className="w-6 h-6" />
              </div>
              <ArrowUpRight className="w-5 h-5 text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-1 transition-all" />
            </div>

            <div className="space-y-2">
              <span className="text-[10px] font-extrabold uppercase text-emerald-600 tracking-wider">DIAGNOSTIC ENGINE</span>
              <h3 className="font-extrabold text-xl text-slate-900">MCQ Diagnostic Quizzes</h3>
              <p className="text-xs text-slate-500 font-medium leading-relaxed">
                Generate exam-style 4-option MCQs for any input topic. Select your desired length (4, 6, 8, or 10 questions) with live score tracking.
              </p>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-slate-700">
              <span>Question Count: 4 - 10</span>
              <span className="text-emerald-600 font-black">+80 XP</span>
            </div>
          </div>

          {/* Card 3: Active Recall & PDF Export */}
          <div
            onClick={() => handleRouteClick('tutor')}
            className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-md hover:shadow-xl transition-all cursor-pointer group space-y-4 flex flex-col justify-between"
          >
            <div className="flex items-center justify-between">
              <div className="p-3 bg-amber-50 text-amber-700 rounded-2xl border border-amber-100">
                <Download className="w-6 h-6" />
              </div>
              <ArrowUpRight className="w-5 h-5 text-slate-400 group-hover:text-amber-600 group-hover:translate-x-1 transition-all" />
            </div>

            <div className="space-y-2">
              <span className="text-[10px] font-extrabold uppercase text-amber-600 tracking-wider">RECALL & EXPORT</span>
              <h3 className="font-extrabold text-xl text-slate-900">Active Recall & PDF Guides</h3>
              <p className="text-xs text-slate-500 font-medium leading-relaxed">
                Automatically builds 5-step Improvement Formulas and 4 Active Recall strategies when an error is diagnosed, with a 1-click <strong>Download PDF Study Guide</strong> feature.
              </p>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-amber-700">
              <span>Printable HTML/PDF</span>
              <span className="font-black">1-Click Export</span>
            </div>
          </div>

          {/* Card 4: AI Flashcard Generator */}
          <div
            onClick={() => handleRouteClick('productivity')}
            className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-md hover:shadow-xl transition-all cursor-pointer group space-y-4 flex flex-col justify-between"
          >
            <div className="flex items-center justify-between">
              <div className="p-3 bg-purple-50 text-purple-700 rounded-2xl border border-purple-100">
                <Layers className="w-6 h-6" />
              </div>
              <ArrowUpRight className="w-5 h-5 text-slate-400 group-hover:text-purple-600 group-hover:translate-x-1 transition-all" />
            </div>

            <div className="space-y-2">
              <span className="text-[10px] font-extrabold uppercase text-purple-600 tracking-wider">SPACED REPETITION</span>
              <h3 className="font-extrabold text-xl text-slate-900">AI Flashcard Deck Engine</h3>
              <p className="text-xs text-slate-500 font-medium leading-relaxed">
                Type any concept in the Flashcards tab to generate high-yield AI flashcard decks with flip cards and self-assessment buttons (Hard, Good, Easy).
              </p>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-purple-700">
              <span>Groq AI Deck Builder</span>
              <span className="font-black">+20 XP / Card</span>
            </div>
          </div>

          {/* Card 5: AI Task & Assignment Manager */}
          <div
            onClick={() => handleRouteClick('productivity')}
            className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-md hover:shadow-xl transition-all cursor-pointer group space-y-4 flex flex-col justify-between"
          >
            <div className="flex items-center justify-between">
              <div className="p-3 bg-indigo-50 text-indigo-700 rounded-2xl border border-indigo-100">
                <Target className="w-6 h-6" />
              </div>
              <ArrowUpRight className="w-5 h-5 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all" />
            </div>

            <div className="space-y-2">
              <span className="text-[10px] font-extrabold uppercase text-indigo-600 tracking-wider">TASK DECOMPOSITION</span>
              <h3 className="font-extrabold text-xl text-slate-900">AI Task & Assignment Tracker</h3>
              <p className="text-xs text-slate-500 font-medium leading-relaxed">
                Add assignments with priority tags (High, Medium, Low) and due dates. Click <strong>⚡ AI Breakdown</strong> to decompose complex tasks into sub-tasks automatically.
              </p>
            </div>

            <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-indigo-700">
              <span>Priority Tags & Filters</span>
              <span className="font-black">Sub-task Progress</span>
            </div>
          </div>

        </div>
      </section>

      {/* Firebase & Gamification Infrastructure Showcase Grid */}
      <section className="bg-slate-900 text-white rounded-3xl p-8 sm:p-12 border border-slate-800 shadow-2xl space-y-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
          <div>
            <span className="bg-emerald-500/20 text-emerald-300 text-xs font-black px-3 py-1 rounded-full border border-emerald-500/30 uppercase">
              REAL-TIME BACKEND & GAMIFICATION
            </span>
            <h2 className="font-black text-2xl sm:text-3xl text-white tracking-tight mt-2">
              Firebase Infrastructure & Live Student Leaderboard
            </h2>
          </div>
          <button
            onClick={() => handleRouteClick('rank_graphs')}
            className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold px-5 py-2.5 rounded-xl text-xs flex items-center gap-2 transition-all cursor-pointer shadow-md shrink-0"
          >
            <Trophy className="w-4 h-4" /> View Live Leaderboard
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-slate-950/80 p-5 rounded-2xl border border-slate-800 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="font-extrabold text-base text-white">Firebase Auth Suite</h3>
            <p className="text-xs text-slate-400 leading-relaxed font-medium">
              Supports Email/Password registration, Google Sign-In popups, and anonymous guest sessions with real-time session restoration.
            </p>
          </div>

          <div className="bg-slate-950/80 p-5 rounded-2xl border border-slate-800 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
              <Database className="w-5 h-5" />
            </div>
            <h3 className="font-extrabold text-base text-white">Firestore Live Snapshot Sync</h3>
            <p className="text-xs text-slate-400 leading-relaxed font-medium">
              Real-time snapshot listeners (<code>subscribeToUserProfile</code> & <code>subscribeToLeaderboard</code>) keep student XP, rank tiers, stickers, and task progress synchronized across devices.
            </p>
          </div>

          <div className="bg-slate-950/80 p-5 rounded-2xl border border-slate-800 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold">
              <Trophy className="w-5 h-5" />
            </div>
            <h3 className="font-extrabold text-base text-white">Podium & Chest Rewards</h3>
            <p className="text-xs text-slate-400 leading-relaxed font-medium">
              Ranks top students on a Gold/Silver/Bronze elevated podium. Students can unlock daily attendance chests and 3-day streak bonuses for free Gold Coins.
            </p>
          </div>
        </div>
      </section>

      {/* Call to Action Footer Grid */}
      <section className="bg-slate-900 text-white rounded-3xl p-8 sm:p-12 text-center space-y-6 border border-slate-800 shadow-xl">
        <div className="max-w-2xl mx-auto space-y-4">
          <span className="bg-white/20 text-white text-xs font-black px-3.5 py-1 rounded-full uppercase tracking-wider">
            READY TO BOOST YOUR GRADES?
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Start Learning with EduMind AI Today
          </h2>
          <p className="text-xs sm:text-sm text-indigo-100 font-medium leading-relaxed">
            Experience the power of Groq-driven AI micro-lessons, diagnostic error repairs, active recall study sheets, and live Firebase progress tracking.
          </p>

          <div className="pt-2 flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={() => handleRouteClick('todays_plan')}
              className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-sm py-4 px-8 rounded-2xl shadow-xl transition-all flex items-center gap-2 cursor-pointer"
            >
              {isAuthenticated ? 'Go to Student Dashboard' : 'Get Started Now'} <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </section>

    </div>
  );
};