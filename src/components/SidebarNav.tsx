import React from 'react';
import {
  LayoutDashboard,
  GraduationCap,
  FileCheck2,
  Timer,
  BookOpenCheck,
  Home,
  Trophy,
  Lock
} from 'lucide-react';

export type NavTab =
  | 'landing'
  | 'todays_plan'
  | 'tutor'
  | 'assessment'
  | 'rank_graphs'
  | 'productivity'
  | 'sketchbook';

interface SidebarNavProps {
  activeTab: NavTab;
  isAuthenticated: boolean;
  onSelectTab: (tab: NavTab) => void;
  onOpenAuth: () => void;
  uncompletedPlanCount?: number;
}

export const SidebarNav: React.FC<SidebarNavProps> = ({
  activeTab,
  isAuthenticated,
  onSelectTab,
  onOpenAuth,
  uncompletedPlanCount = 0,
}) => {
  const navItems: { id: NavTab; label: string; icon: React.ReactNode; colorClass: string; badge?: string | number }[] = [
    {
      id: 'landing',
      label: 'Landing Home',
      icon: <Home className="w-4 h-4" />,
      colorClass: 'bg-blue-100 text-blue-800',
    },
    {
      id: 'todays_plan',
      label: "Today's Plan",
      icon: <LayoutDashboard className="w-4 h-4" />,
      colorClass: 'bg-amber-100 text-amber-800',
      badge: uncompletedPlanCount > 0 ? `${uncompletedPlanCount} tasks` : undefined,
    },
    {
      id: 'tutor',
      label: 'Step-by-Step AI Tutor',
      icon: <GraduationCap className="w-4 h-4" />,
      colorClass: 'bg-blue-100 text-blue-800',
      badge: 'Interactive',
    },
    {
      id: 'rank_graphs',
      label: 'Leaderboard & Rank',
      icon: <Trophy className="w-4 h-4" />,
      colorClass: 'bg-amber-100 text-amber-800',
      badge: 'Rewards',
    },
    {
      id: 'assessment',
      label: 'Diagnostic Quizzes',
      icon: <FileCheck2 className="w-4 h-4" />,
      colorClass: 'bg-sky-100 text-sky-800',
    },
    {
      id: 'productivity',
      label: 'Timer & Focus Suite',
      icon: <Timer className="w-4 h-4" />,
      colorClass: 'bg-purple-100 text-purple-800',
    },
    {
      id: 'sketchbook',
      label: 'Badges & Portfolio',
      icon: <BookOpenCheck className="w-4 h-4" />,
      colorClass: 'bg-rose-100 text-rose-800',
      badge: 'Badges',
    },
  ];

  const handleTabClick = (tabId: NavTab) => {
    if (!isAuthenticated && tabId !== 'landing') {
      onOpenAuth();
      return;
    }
    onSelectTab(tabId);
  };

  return (
    <aside className="w-full md:w-64 bg-white border-b-2 md:border-b-0 md:border-r-2 border-slate-700 p-3 md:p-4 shrink-0 transition-all text-slate-900">
      <div className="flex md:flex-col gap-1.5 overflow-x-auto md:overflow-x-visible pb-2 md:pb-0 scrollbar-none">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          const isLocked = !isAuthenticated && item.id !== 'landing';

          return (
            <button
              key={item.id}
              onClick={() => handleTabClick(item.id)}
              className={`flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-xl transition-all text-xs font-extrabold shrink-0 md:w-full cursor-pointer border-2 border-slate-700 ${isActive
                  ? 'bg-blue-700 text-white shadow-[3px_3px_0px_0px_#334155]'
                  : 'bg-slate-50 text-slate-800 hover:bg-slate-100 hover:text-slate-900 shadow-[2px_2px_0px_0px_#334155]'
                }`}
            >
              <div className="flex items-center gap-2.5">
                <span
                  className={`p-1.5 rounded-lg transition-colors border border-slate-700 ${isActive ? 'bg-amber-400 text-slate-950 font-black' : item.colorClass
                    }`}
                >
                  {item.icon}
                </span>
                <span className="whitespace-nowrap">{item.label}</span>
              </div>

              {isLocked ? (
                <Lock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              ) : item.badge ? (
                <span
                  className={`hidden sm:inline-block text-[10px] font-black px-2 py-0.5 rounded-md border border-slate-700 transition-colors ${isActive ? 'bg-amber-400 text-slate-950' : 'bg-slate-200 text-slate-900'
                    }`}
                >
                  {item.badge}
                </span>
              ) : null}
            </button>
          );
        })}
      </div>
    </aside>
  );
};