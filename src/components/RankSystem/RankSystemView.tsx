import React from 'react';
import { UserProfile, RankLevel } from '../../types';
import { Award, Sparkles, Trophy, Zap, Flame, Crown, Shield, ArrowUpRight, CheckCircle2 } from 'lucide-react';

interface RankSystemViewProps {
  user: UserProfile;
}

export const RankSystemView: React.FC<RankSystemViewProps> = ({ user }) => {
  // Rank levels breakdown definition
  const RANK_TIERS: { title: RankLevel; levelReq: number; xpReq: number; color: string; perk: string; icon: string }[] = [
    {
      title: 'Novice Doodler',
      levelReq: 1,
      xpReq: 0,
      color: 'from-amber-500 to-orange-500',
      perk: 'Access basic sequential AI micro-lessons',
      icon: '🌱',
    },
    {
      title: 'Scholar',
      levelReq: 3,
      xpReq: 1000,
      color: 'from-blue-500 to-indigo-600',
      perk: 'Unlock AI PDF Summarizer & Custom Flashcards',
      icon: '📚',
    },
    {
      title: 'Concept Explorer',
      levelReq: 5,
      xpReq: 1800,
      color: 'from-emerald-500 to-teal-600',
      perk: 'Unlock Step-by-Step AI Reasoning Expander',
      icon: '🔍',
    },
    {
      title: 'Knowledge Architect',
      levelReq: 8,
      xpReq: 2600,
      color: 'from-purple-500 to-indigo-700',
      perk: 'Unlock Career Skill Gap Analysis & Mock Interviews',
      icon: '🏛️',
    },
    {
      title: 'Mastermind',
      levelReq: 12,
      xpReq: 3500,
      color: 'from-pink-500 to-rose-600',
      perk: 'Unlock High-Yield Night-Before Exam Roadmaps',
      icon: '🧠',
    },
    {
      title: 'Sage',
      levelReq: 16,
      xpReq: 5000,
      color: 'from-amber-400 to-yellow-600',
      perk: 'Unlock Custom Micro-Lesson Generator & Custom Prompts',
      icon: '🧙‍♂️',
    },
    {
      title: 'EduMind Master',
      levelReq: 20,
      xpReq: 8000,
      color: 'from-violet-600 to-fuchsia-600',
      perk: 'Global Rank Badge & Unlimited AI Storage',
      icon: '👑',
    },
  ];

  // Calculate current user level and progress
  const currentLevel = Math.max(1, Math.floor(user.xp / 400) + 1);
  const currentLevelXpStart = (currentLevel - 1) * 400;
  const nextLevelXpEnd = currentLevel * 400;
  const currentLevelProgress = Math.min(100, Math.round(((user.xp - currentLevelXpStart) / (nextLevelXpEnd - currentLevelXpStart)) * 100));

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="sketch-card bg-gradient-to-r from-indigo-900 via-purple-900 to-slate-900 text-white p-6 sm:p-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 px-3 py-1 rounded-full text-xs font-bold">
              <Award className="w-4 h-4 text-amber-300" />
              YOUR RANK PROGRESS
            </div>
            <h2 className="font-extrabold text-3xl text-white">Level {currentLevel} • {user.rank}</h2>
            <p className="text-xs text-indigo-200/90 max-w-xl font-medium">
              Track your level progression and climb the rank tier ladder as you earn real XP.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20 w-full md:w-auto min-w-[240px]">
            <div className="flex items-center justify-between text-xs font-bold text-white mb-1.5">
              <span>Level {currentLevel} Progress</span>
              <span className="text-amber-300">{user.xp} / {nextLevelXpEnd} XP</span>
            </div>
            <div className="w-full bg-white/20 h-3 rounded-full overflow-hidden">
              <div
                className="bg-gradient-to-r from-amber-400 to-orange-400 h-full rounded-full transition-all duration-500"
                style={{ width: `${currentLevelProgress}%` }}
              />
            </div>
            <p className="text-[10px] text-indigo-200 text-right mt-1.5">
              {nextLevelXpEnd - user.xp} XP to reach Level {currentLevel + 1}!
            </p>
          </div>
        </div>
      </div>

      {/* Rank Tier System Ladder */}
      <div className="sketch-card bg-white p-6 sm:p-8 space-y-6">
        <div className="flex items-center justify-between border-b border-slate-200 pb-4">
          <div>
            <span className="bg-indigo-50 text-indigo-700 text-xs font-bold px-2.5 py-0.5 rounded-full border border-indigo-100">
              TIER SYSTEM LADDER
            </span>
            <h3 className="font-bold text-2xl text-slate-900 mt-1">Rank Tiers & Level Unlock Perks</h3>
          </div>
          <span className="text-xs font-bold text-slate-400">7 Academic Rank Levels</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {RANK_TIERS.map((tier) => {
            const isUnlocked = user.xp >= tier.xpReq;
            const isCurrentRank = user.rank === tier.title;

            return (
              <div
                key={tier.title}
                className={`p-5 rounded-2xl border transition-all relative overflow-hidden ${
                  isCurrentRank
                    ? 'bg-indigo-50/90 border-indigo-300 ring-2 ring-indigo-500/20 shadow-md'
                    : isUnlocked
                    ? 'bg-white border-slate-200/80 hover:bg-slate-50'
                    : 'bg-slate-50/60 border-slate-200 opacity-60'
                }`}
              >
                {isCurrentRank && (
                  <span className="absolute top-3 right-3 bg-indigo-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                    Current Rank
                  </span>
                )}

                <div className="flex items-center gap-3 mb-3">
                  <div className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${tier.color} text-white flex items-center justify-center text-2xl shadow-sm shrink-0`}>
                    {tier.icon}
                  </div>
                  <div>
                    <h4 className="font-bold text-base text-slate-900">{tier.title}</h4>
                    <span className="text-xs font-semibold text-slate-500">
                      Req: Level {tier.levelReq}+ ({tier.xpReq} XP)
                    </span>
                  </div>
                </div>

                <p className="text-xs text-slate-600 font-medium mb-3 bg-white/60 p-2.5 rounded-xl border border-slate-100">
                  🎁 Perk: {tier.perk}
                </p>

                <div className="flex items-center justify-between text-[11px] font-bold">
                  {isUnlocked ? (
                    <span className="text-emerald-600 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Unlocked
                    </span>
                  ) : (
                    <span className="text-slate-400">
                      🔒 Need {tier.xpReq - user.xp} more XP
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
