import React, { useState, useEffect } from 'react';
import { UserProfile, LeaderboardEntry } from '../../types';
import { ALL_BADGES } from '../../data/mockData';
import { subscribeToLeaderboard } from '../../services/firebase';
import { BookOpen, Award, Trophy, Star, Crown, Rocket, Lightbulb, Loader2 } from 'lucide-react';

interface NotebookPortfolioProps {
  user: UserProfile;
}

export const NotebookPortfolio: React.FC<NotebookPortfolioProps> = ({ user }) => {
  const [subTab, setSubTab] = useState<'notebook' | 'badges' | 'leaderboard'>('notebook');
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [isLoadingLb, setIsLoadingLb] = useState(false);

  useEffect(() => {
    if (subTab === 'leaderboard') {
      setIsLoadingLb(true);
      const unsub = subscribeToLeaderboard((entries) => {
        setLeaderboard(entries);
        setIsLoadingLb(false);
      });
      return () => unsub();
    }
  }, [subTab]);

  const getStickerIcon = (style: string) => {
    switch (style) {
      case 'star':
        return <Star className="w-5 h-5 fill-amber-400 text-amber-600" />;
      case 'crown':
        return <Crown className="w-5 h-5 text-amber-600" />;
      case 'rocket':
        return <Rocket className="w-5 h-5 text-indigo-600" />;
      default:
        return <Lightbulb className="w-5 h-5 text-amber-600" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Subtab Selector */}
      <div className="sketch-card bg-white p-2.5 flex gap-2 overflow-x-auto">
        <button
          onClick={() => setSubTab('notebook')}
          className={`flex-1 min-w-[120px] py-2.5 px-4 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer ${
            subTab === 'notebook'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'bg-transparent text-slate-600 hover:bg-slate-100'
          }`}
        >
          <BookOpen className="w-4 h-4" /> Stamp Collection
        </button>
        <button
          onClick={() => setSubTab('badges')}
          className={`flex-1 min-w-[120px] py-2.5 px-4 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer ${
            subTab === 'badges'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'bg-transparent text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Award className="w-4 h-4" /> Badges & Ranks
        </button>
        <button
          onClick={() => setSubTab('leaderboard')}
          className={`flex-1 min-w-[120px] py-2.5 px-4 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer ${
            subTab === 'leaderboard'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'bg-transparent text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Trophy className="w-4 h-4" /> Leaderboard
        </button>
      </div>

      {/* Sketchbook Pages View */}
      {subTab === 'notebook' && (
        <div className="sketch-card bg-white p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-200/80 pb-4">
            <div>
              <span className="bg-indigo-50 text-indigo-700 text-xs font-bold px-2.5 py-0.5 rounded-full border border-indigo-100">
                STAMP COLLECTION
              </span>
              <h2 className="font-bold text-2xl text-slate-900 mt-1">Mastery Badges & Stamps</h2>
            </div>
            <span className="font-bold text-slate-500 text-sm">{user.stickers.length} Stamps Collected</span>
          </div>

          {user.stickers.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {user.stickers.map((st) => (
                <div
                  key={st.id}
                  className="p-5 bg-slate-50/70 rounded-2xl border border-slate-200/80 shadow-2xs relative overflow-hidden flex items-center gap-4 hover:border-indigo-200 transition-all"
                >
                  <div
                    className="w-12 h-12 rounded-2xl border border-slate-200 flex items-center justify-center shrink-0 shadow-2xs bg-white"
                  >
                    {getStickerIcon(st.stickerStyle)}
                  </div>

                  <div>
                    <span className="text-[10px] font-bold uppercase text-slate-400">{st.subjectName}</span>
                    <h4 className="font-bold text-base text-slate-900">{st.title}</h4>
                    <span className="text-[10px] font-medium text-slate-400 block mt-0.5">Unlocked: {st.unlockedDate}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-12 text-center text-xs text-slate-500 font-medium space-y-2">
              <span className="text-3xl block mb-2">⭐</span>
              <p className="font-bold text-slate-700">No Stamps Collected Yet</p>
              <p>Complete AI micro-lessons and diagnostic challenges to earn your mastery stamps!</p>
            </div>
          )}
        </div>
      )}

      {/* Badges Showcase */}
      {subTab === 'badges' && (
        <div className="sketch-card bg-white p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-200/80 pb-4">
            <h2 className="font-bold text-2xl text-slate-900">Achievement Badges</h2>
            <span className="bg-indigo-50 text-indigo-700 text-xs font-bold px-3 py-1 rounded-full border border-indigo-100">
              Current Rank: {user.rank}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {ALL_BADGES.map((b) => {
              const isUnlocked = user.badges.some((ub) => ub.id === b.id);

              return (
                <div
                  key={b.id}
                  className={`p-4 rounded-2xl border flex items-center gap-3 transition-all ${
                    isUnlocked ? 'bg-sky-50/50 border-sky-200 shadow-2xs' : 'bg-slate-50 border-slate-200 opacity-50 grayscale'
                  }`}
                >
                  <div className="text-3xl shrink-0">{b.icon}</div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-900">{b.title}</h4>
                    <p className="text-xs text-slate-500 line-clamp-2">{b.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Leaderboard View */}
      {subTab === 'leaderboard' && (
        <div className="sketch-card bg-white p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-200/80 pb-4">
            <div>
              <span className="bg-amber-50 text-amber-700 text-xs font-bold px-2.5 py-0.5 rounded-full border border-amber-200">
                LIVE FIRESTORE STANDINGS
              </span>
              <h2 className="font-bold text-2xl text-slate-900 mt-1">Global Student Leaderboard</h2>
            </div>
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center font-black">
              <Trophy className="w-6 h-6" />
            </div>
          </div>

          {isLoadingLb ? (
            <div className="py-12 flex flex-col items-center justify-center space-y-2 text-indigo-600">
              <Loader2 className="w-8 h-8 animate-spin" />
              <span className="text-xs font-bold text-slate-500">Loading live leaderboard from Firebase...</span>
            </div>
          ) : leaderboard.length > 0 ? (
            <div className="space-y-3">
              {leaderboard.map((entry) => {
                const isUser = entry.uid === user.uid;
                const isTop3 = entry.position <= 3;

                return (
                  <div
                    key={entry.uid}
                    className={`p-4 rounded-2xl border flex items-center justify-between transition-all ${
                      isUser
                        ? 'bg-indigo-50/90 border-indigo-300 shadow-sm font-bold ring-1 ring-indigo-300'
                        : isTop3
                        ? 'bg-amber-50/40 border-amber-200/80 hover:bg-amber-50/80'
                        : 'bg-white border-slate-200/80 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <span
                        className={`w-7 h-7 rounded-xl flex items-center justify-center font-black text-xs shrink-0 ${
                          entry.position === 1
                            ? 'bg-amber-400 text-slate-950 shadow-xs'
                            : entry.position === 2
                            ? 'bg-slate-300 text-slate-900'
                            : entry.position === 3
                            ? 'bg-amber-700 text-white'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        #{entry.position}
                      </span>

                      <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0 overflow-hidden text-lg">
                        {entry.avatar && (entry.avatar.startsWith('http://') || entry.avatar.startsWith('https://')) ? (
                          <img
                            src={entry.avatar}
                            alt={entry.name}
                            className="w-full h-full object-cover"
                            onError={(e) => { (e.currentTarget as HTMLElement).style.display = 'none'; }}
                          />
                        ) : (
                          entry.avatar || '🎓'
                        )}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="font-extrabold text-sm text-slate-900 truncate">
                            {entry.name}
                          </h4>
                          {isUser && (
                            <span className="bg-indigo-600 text-white text-[9px] font-black px-2 py-0.5 rounded-full uppercase">
                              YOU
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-slate-400 font-semibold block">
                          🔥 {entry.streak}d streak • {entry.rankLevel}
                        </span>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="font-black text-base text-indigo-600 bg-indigo-50 px-3 py-1 rounded-xl border border-indigo-100">
                        {entry.xp} XP
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-12 text-center text-xs text-slate-500 font-medium space-y-1">
              <span className="text-3xl block mb-1">🏆</span>
              <p className="font-bold text-slate-700">No Ranked Students Yet</p>
              <p>Be the first student to complete lessons and claim the top spot!</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
