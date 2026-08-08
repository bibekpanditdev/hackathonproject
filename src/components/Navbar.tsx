import React, { useState, useEffect } from 'react';
import { UserProfile, Subject } from '../types';
import { NavTab } from './SidebarNav';
import {
  Sparkles,
  Flame,
  Award,
  BookOpen,
  ChevronDown,
  CheckCircle2,
  GraduationCap,
  AtSign,
  LogIn,
  LogOut,
  Menu,
  X,
  LayoutDashboard,
  FileCheck2,
  Timer,
  BookOpenCheck,
  TrendingUp,
  Home,
  ShieldCheck,
  Trophy,
  UserCheck
} from 'lucide-react';

interface NavbarProps {
  user: UserProfile;
  subjects: Subject[];
  activeSubject: Subject;
  activeTab?: NavTab;
  isAuthenticated: boolean;
  onSelectTab?: (tab: NavTab) => void;
  onSelectSubject: (subject: Subject) => void;
  onOpenNotebook: () => void;
  onOpenAuth: () => void;
  onSignOut?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  subjects,
  activeSubject,
  activeTab = 'landing',
  isAuthenticated,
  onSelectTab,
  onSelectSubject,
  onOpenNotebook,
  onOpenAuth,
  onSignOut,
}) => {
  const [showSubjectMenu, setShowSubjectMenu] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Close modals/dropdowns on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowProfileModal(false);
        setShowSubjectMenu(false);
        setMobileMenuOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // The 4 landing page section links (shown in the middle where the subject selector used to be)
  const landingLinks = [
    { href: '#bento-features', label: 'Features' },
    { href: '#how-it-learns', label: 'How It Works' },
    { href: '#learning-graph', label: 'Learning Graph' },
    { href: '#dashboard-preview', label: 'Dashboard' },
  ];

  const navItems: { id: NavTab; label: string; icon: React.ReactNode; color: string }[] = [
    { id: 'landing', label: 'Landing Home', icon: <Home className="w-4 h-4" />, color: 'text-blue-600' },
    { id: 'todays_plan', label: "Today's Plan", icon: <LayoutDashboard className="w-4 h-4" />, color: 'text-amber-600' },
    { id: 'tutor', label: 'Step-by-Step AI Tutor', icon: <GraduationCap className="w-4 h-4" />, color: 'text-blue-600' },
    { id: 'rank_graphs', label: 'Leaderboard & Rank', icon: <Trophy className="w-4 h-4" />, color: 'text-amber-600' },
    { id: 'assessment', label: 'Diagnostic Quizzes', icon: <FileCheck2 className="w-4 h-4" />, color: 'text-sky-600' },
    { id: 'productivity', label: 'Timer & Focus Suite', icon: <Timer className="w-4 h-4" />, color: 'text-purple-600' },
    { id: 'sketchbook', label: 'Badges & Portfolio', icon: <BookOpenCheck className="w-4 h-4" />, color: 'text-rose-600' },
  ];

  const handleNavClick = (tab: NavTab) => {
    if (!isAuthenticated && tab !== 'landing') {
      onOpenAuth();
      setMobileMenuOpen(false);
      return;
    }
    if (onSelectTab) {
      onSelectTab(tab);
    }
    setMobileMenuOpen(false);
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-xs border-b-2 border-slate-700 text-slate-900 px-4 lg:px-8 py-3 shadow-[0_4px_0px_0px_#334155] transition-all">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">

          {/* Left Section: Mobile Hamburger Button & Brand Logo */}
          <div className="flex items-center gap-3">
            {/* Mobile Hamburger Toggle Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-xl bg-slate-100 border-2 border-slate-900 text-slate-900 hover:bg-slate-200 transition-all cursor-pointer font-bold"
              aria-label="Toggle Mobile Navigation"
            >
              {mobileMenuOpen ? <X className="w-5 h-5 text-rose-600" /> : <Menu className="w-5 h-5 text-blue-700" />}
            </button>

            {/* Royal Brand Logo */}
            <div
              className="flex items-center gap-2.5 cursor-pointer group"
              onClick={() => handleNavClick('landing')}
            >
              <div className="w-10 h-10 rounded-xl bg-blue-700 border-2 border-slate-900 shadow-[2px_2px_0px_0px_#0F172A] flex items-center justify-center text-white font-black text-xl group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform">
                <GraduationCap className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-black text-xl tracking-tight text-slate-900 group-hover:text-blue-700 transition-colors">
                    EduMind
                  </span>
                  <span className="bg-amber-400 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded-md border-2 border-slate-900 shadow-[1px_1px_0px_0px_#0F172A] uppercase tracking-wide">
                    AI
                  </span>
                </div>
                <p className="text-[10px] text-slate-600 font-extrabold hidden sm:block">Interactive Coding & Micro Learning</p>
              </div>
            </div>
          </div>

          {/* Middle Section: Landing Links (on landing) OR Subject & Tab Selector (when logged in) */}
          {activeTab === 'landing' ? (
            <div className="hidden lg:flex items-center gap-5 lg:gap-8 text-xs font-extrabold text-slate-700">
              {landingLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="hover:text-blue-700 transition-colors whitespace-nowrap"
                >
                  {link.label}
                </a>
              ))}
            </div>
          ) : (
            <div className="hidden md:flex items-center gap-1.5 bg-slate-100/80 p-1 rounded-2xl border border-slate-300">
              {[
                { id: 'todays_plan' as NavTab, label: 'Dashboard', icon: <LayoutDashboard className="w-3.5 h-3.5 text-amber-600" /> },
                { id: 'tutor' as NavTab, label: 'AI Tutor', icon: <GraduationCap className="w-3.5 h-3.5 text-blue-600" /> },
                { id: 'assessment' as NavTab, label: 'Quizzes', icon: <FileCheck2 className="w-3.5 h-3.5 text-sky-600" /> },
                { id: 'productivity' as NavTab, label: 'Tasks', icon: <Timer className="w-3.5 h-3.5 text-purple-600" /> },
                { id: 'rank_graphs' as NavTab, label: 'Leaderboard', icon: <Trophy className="w-3.5 h-3.5 text-amber-600" /> },
              ].map((tabItem) => {
                const isActive = activeTab === tabItem.id;
                return (
                  <button
                    key={tabItem.id}
                    onClick={() => handleNavClick(tabItem.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${isActive
                        ? 'bg-white text-blue-700 shadow-xs border border-slate-300'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                      }`}
                  >
                    {tabItem.icon}
                    <span>{tabItem.label}</span>
                  </button>
                );
              })}

              {/* Subject Dropdown for Tutor/Assessment */}
              {['tutor', 'assessment'].includes(activeTab) && (
                <div className="relative border-l border-slate-300 pl-1.5 ml-1">
                  <button
                    onClick={() => setShowSubjectMenu(!showSubjectMenu)}
                    className="flex items-center gap-1.5 bg-white hover:bg-slate-50 px-2.5 py-1 rounded-xl border border-slate-300 font-extrabold text-[11px] text-slate-800 transition-all cursor-pointer shadow-2xs"
                  >
                    <span
                      className="w-2.5 h-2.5 rounded-full border border-slate-400"
                      style={{ backgroundColor: activeSubject.color }}
                    />
                    <span className="max-w-[90px] truncate">{activeSubject.name}</span>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-600" />
                  </button>

                  {showSubjectMenu && (
                    <div className="absolute top-full right-0 mt-2 w-60 bg-white rounded-2xl border-2 border-slate-900 shadow-[4px_4px_0px_0px_#0F172A] p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                      <p className="text-[10px] font-black text-blue-700 uppercase tracking-wider px-3 py-1.5">Active Subject</p>
                      {subjects.map((s) => (
                        <button
                          key={s.id}
                          onClick={() => {
                            onSelectSubject(s);
                            setShowSubjectMenu(false);
                          }}
                          className={`w-full text-left px-3 py-2 rounded-xl flex items-center justify-between font-extrabold text-xs transition-colors cursor-pointer ${s.id === activeSubject.id ? 'bg-blue-100 text-blue-900 border border-blue-300' : 'hover:bg-slate-100 text-slate-800'
                            }`}
                        >
                          <div className="flex items-center gap-2">
                            <span className="w-3 h-3 rounded-full border border-slate-900" style={{ backgroundColor: s.color }} />
                            <span>{s.name}</span>
                          </div>
                          {s.id === activeSubject.id && <CheckCircle2 className="w-4 h-4 text-blue-700" />}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Right Section: Gamification Stats & Conditional Auth/Avatar */}
          <div className="flex items-center gap-2">
            {isAuthenticated ? (
              /* SIGNED IN STATE: Show XP, Streak, and User Avatar Pill */
              <>
                {/* XP Pill */}
                <div className="hidden sm:flex items-center gap-1 bg-amber-100 text-amber-900 border-2 border-slate-900 px-2.5 py-1 rounded-xl font-black text-xs shadow-[2px_2px_0px_0px_#0F172A]">
                  <Sparkles className="w-3.5 h-3.5 text-amber-600 animate-sparkle" />
                  <span>{user.xp} XP</span>
                </div>

                {/* Daily Streak Flame */}
                <div className="hidden sm:flex items-center gap-1 bg-rose-100 text-rose-900 border-2 border-slate-900 px-2.5 py-1 rounded-xl font-black text-xs shadow-[2px_2px_0px_0px_#0F172A]">
                  <Flame className="w-3.5 h-3.5 text-rose-600 fill-rose-600 animate-flame" />
                  <span>{user.streakCount}d</span>
                </div>

                {/* Dashboard Link if on Landing */}
                {activeTab === 'landing' && (
                  <button
                    onClick={() => handleNavClick('todays_plan')}
                    className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-black px-3 py-1.5 rounded-xl border-2 border-slate-900 text-xs shadow-[2px_2px_0px_0px_#0F172A] transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <LayoutDashboard className="w-3.5 h-3.5" />
                    <span>Dashboard</span>
                  </button>
                )}

                {/* USER AVATAR PILL (Only visible when logged in) */}
                <button
                  onClick={() => setShowProfileModal(true)}
                  className="flex items-center gap-1.5 bg-blue-50 hover:bg-blue-100 px-2.5 py-1 rounded-xl border-2 border-slate-900 font-extrabold text-xs text-slate-900 transition-all cursor-pointer shadow-[2px_2px_0px_0px_#0F172A]"
                  title="View Profile & Stats"
                >
                  <AtSign className="w-3.5 h-3.5 text-blue-700" />
                  <span className="hidden md:inline-block font-mono text-[11px]">@{user.username || 'learner'}</span>
                  <div className="w-6 h-6 rounded-md bg-amber-400 border border-slate-900 text-slate-950 font-black flex items-center justify-center text-[11px] shadow-[1px_1px_0px_0px_#0F172A]">
                    {user.name ? user.name.charAt(0) : 'U'}
                  </div>
                </button>
              </>
            ) : (
              /* NOT LOGGED IN STATE: Only show Sign In button */
              <div className="flex items-center gap-2">
                <button
                  onClick={onOpenAuth}
                  className="bg-blue-700 hover:bg-blue-800 text-white font-black px-4 py-1.5 rounded-xl border-2 border-slate-900 text-xs shadow-[3px_3px_0px_0px_#0F172A] hover:shadow-[4px_4px_0px_0px_#0F172A] transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <LogIn className="w-4 h-4 text-amber-300" />
                  <span>Sign In / Register</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* MOBILE HAMBURGER SLIDE-OUT DRAWER MENU */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-3 pt-3 border-t-2 border-slate-900 animate-in slide-in-from-top duration-200 space-y-2 pb-2">
            {/* Landing Section Links (only on landing page) */}
            {activeTab === 'landing' && (
              <div className="grid grid-cols-2 gap-2 pb-2 mb-1 border-b-2 border-dashed border-slate-300">
                {landingLinks.map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-center gap-1.5 p-2.5 rounded-xl border-2 border-slate-900 bg-amber-50 text-slate-900 hover:bg-amber-100 text-xs font-extrabold shadow-[2px_2px_0px_0px_#0F172A] transition-all"
                  >
                    {link.label}
                  </a>
                ))}
              </div>
            )}

            <div className="flex items-center justify-between text-xs font-black text-blue-900 px-1 uppercase tracking-wider">
              <span>⚡ Navigation Routes</span>
              <span className="text-[10px] text-slate-600 font-semibold">
                {isAuthenticated ? 'Logged In' : 'Sign in to access dashboard'}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {navItems.map((item) => {
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item.id)}
                    className={`flex items-center gap-2 p-2.5 rounded-xl border-2 border-slate-900 text-xs font-extrabold transition-all text-left cursor-pointer ${isActive
                        ? 'bg-blue-700 text-white shadow-[2px_2px_0px_0px_#0F172A]'
                        : 'bg-white text-slate-900 hover:bg-slate-100 shadow-[2px_2px_0px_0px_#0F172A]'
                      }`}
                  >
                    <span className={item.color}>{item.icon}</span>
                    <span className="truncate">{item.label}</span>
                  </button>
                );
              })}
            </div>

            <div className="pt-2 flex items-center gap-2">
              {!isAuthenticated ? (
                <button
                  onClick={() => {
                    onOpenAuth();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full btn-sketch-secondary text-xs py-2 flex items-center justify-center gap-1.5"
                >
                  <ShieldCheck className="w-4 h-4" />
                  Sign In to Unlock Workspace
                </button>
              ) : (
                <button
                  onClick={() => {
                    onOpenNotebook();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full btn-sketch-primary text-xs py-2 flex items-center justify-center gap-1.5"
                >
                  <Award className="w-4 h-4 text-amber-300" />
                  My Badges & Portfolio
                </button>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Account / User Profile Modal (Only relevant when logged in) */}
      {showProfileModal && isAuthenticated && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowProfileModal(false);
          }}
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 z-[100] overflow-y-auto animate-in fade-in duration-200"
        >
          <div className="bg-white text-slate-900 rounded-3xl border-2 border-slate-800 shadow-[6px_6px_0px_0px_#1E293B] p-5 sm:p-7 max-w-md w-full my-auto relative animate-in zoom-in-95 duration-200 max-h-[92vh] overflow-y-auto scrollbar-thin">
            <button
              onClick={() => setShowProfileModal(false)}
              type="button"
              aria-label="Close profile modal"
              className="absolute top-4 right-4 w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 border-2 border-slate-800 font-extrabold text-slate-800 flex items-center justify-center transition-all cursor-pointer hover:scale-105 active:scale-95"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-4 mb-5 pt-1">
              <div className="w-16 h-16 rounded-2xl bg-blue-700 border-2 border-slate-800 flex items-center justify-center font-black text-2xl text-white shadow-[3px_3px_0px_0px_#1E293B] shrink-0">
                {user.name.charAt(0)}
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="font-black text-xl text-slate-900 truncate">{user.name}</h3>
                <p className="text-xs text-blue-700 font-mono font-bold truncate">@{user.username || 'learner'}</p>
                <p className="text-xs text-slate-600 font-medium truncate">{user.email}</p>
                <div className="inline-flex items-center gap-1 mt-1.5 bg-amber-100 text-amber-900 px-2.5 py-0.5 rounded-full border-2 border-slate-800 text-xs font-black">
                  Rank: {user.rank}
                </div>
              </div>
            </div>

            <div className="bg-amber-50/50 p-4 rounded-2xl border-2 border-slate-700 space-y-3 mb-5">
              <div className="flex justify-between items-center text-sm font-extrabold">
                <span className="text-slate-600">Total Experience</span>
                <span className="text-amber-700">{user.xp} XP</span>
              </div>
              <div className="flex justify-between items-center text-sm font-extrabold">
                <span className="text-slate-600">Daily Study Streak</span>
                <span className="text-rose-600">🔥 {user.streakCount} Days</span>
              </div>
              <div className="flex justify-between items-center text-sm font-extrabold">
                <span className="text-slate-600">Badges Unlocked</span>
                <span className="text-slate-900">{user.badges.length} Unlocked</span>
              </div>
              <div className="flex justify-between items-center text-sm font-extrabold">
                <span className="text-slate-600">Sticker Stamps</span>
                <span className="text-slate-900">{user.stickers.length} Stamps</span>
              </div>
            </div>

            <div className="flex gap-3">
              {onSignOut && (
                <button
                  onClick={() => {
                    onSignOut();
                    setShowProfileModal(false);
                  }}
                  className="flex-1 btn-sketch-secondary text-xs py-3 flex items-center justify-center gap-2 cursor-pointer min-h-[44px]"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              )}
              <button
                onClick={() => {
                  onOpenNotebook();
                  setShowProfileModal(false);
                }}
                className="flex-1 btn-sketch-primary text-xs py-3 flex items-center justify-center gap-2 cursor-pointer min-h-[44px]"
              >
                <BookOpen className="w-4 h-4" />
                Portfolio
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};