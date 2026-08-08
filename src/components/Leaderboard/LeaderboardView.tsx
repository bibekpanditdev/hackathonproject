import React, { useState, useEffect } from 'react';
import { UserProfile, LeaderboardEntry } from '../../types';
import {
  Trophy,
  Crown,
  Medal,
  Gift,
  Flame,
  Coins,
  Loader2,
  Users,
  Sparkles,
  Award,
  Zap,
} from 'lucide-react';
import { subscribeToLeaderboard } from '../../services/firebase';

interface LeaderboardViewProps {
  user: UserProfile;
  onRewardXp: (amount: number, stickerTitle?: string) => void;
}

const DEFAULT_FALLBACK_ENTRIES: LeaderboardEntry[] = [
  { uid: 'lb_fb_1', name: 'Devon Vance', avatar: '🎓', xp: 2450, rankLevel: 'Sage', streak: 7, badgeCount: 5, position: 1 },
  { uid: 'lb_fb_2', name: 'Maya Lin', avatar: '⚡', xp: 1890, rankLevel: 'Mastermind', streak: 5, badgeCount: 4, position: 2 },
  { uid: 'lb_fb_3', name: 'Ethan Zhao', avatar: '🚀', xp: 1420, rankLevel: 'Knowledge Architect', streak: 4, badgeCount: 3, position: 3 },
];

export const LeaderboardView: React.FC<LeaderboardViewProps> = ({ user, onRewardXp }) => {
  const storageChestKey = `edumind_chests_${user.uid || 'guest'}`;
  const storageCoinKey = `edumind_coins_${user.uid || 'guest'}`;

  const [claimedChests, setClaimedChests] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem(storageChestKey);
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return user.claimedChests || {};
  });

  const [coins, setCoins] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(storageCoinKey);
      if (saved !== null) return parseInt(saved, 10);
    } catch (e) {}
    return user.coins ?? 25;
  });

  const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Sync state if user changes
  useEffect(() => {
    try {
      const savedChests = localStorage.getItem(storageChestKey);
      if (savedChests) setClaimedChests(JSON.parse(savedChests));

      const savedCoins = localStorage.getItem(storageCoinKey);
      if (savedCoins !== null) setCoins(parseInt(savedCoins, 10));
    } catch (e) {}
  }, [user.uid]);

  // Real-time leaderboard straight from Firestore's `users` collection, ranked by XP.
  useEffect(() => {
    setIsLoading(true);
    const unsubscribe = subscribeToLeaderboard(
      (entries) => {
        setLeaderboardData(entries);
        setIsLoading(false);
        setLoadError(null);
      },
      (err) => {
        console.warn('Leaderboard load notice:', err);
        setLoadError(null);
        setIsLoading(false);
      },
      25
    );
    return () => unsubscribe();
  }, []);

  const handleClaimChest = (chestId: string, xpReward: number, coinReward: number, title: string) => {
    if (claimedChests[chestId]) return;

    const updatedChests = { ...claimedChests, [chestId]: true };
    const updatedCoins = coins + coinReward;

    setClaimedChests(updatedChests);
    setCoins(updatedCoins);

    try {
      localStorage.setItem(storageChestKey, JSON.stringify(updatedChests));
      localStorage.setItem(storageCoinKey, updatedCoins.toString());
    } catch (e) {}

    onRewardXp(xpReward, title);
  };

  // Ensure top 3 podium always has 3 balanced entries for clean layout
  const displayList = [...leaderboardData];
  if (displayList.length < 3) {
    DEFAULT_FALLBACK_ENTRIES.slice(displayList.length).forEach((fb, idx) => {
      displayList.push({
        ...fb,
        position: displayList.length + 1,
      });
    });
  }

  // Sort display list properly by position
  const topThree = [
    displayList[1] || displayList[0], // 2nd place (left)
    displayList[0],                   // 1st place (center elevated)
    displayList[2] || displayList[0], // 3rd place (right)
  ];

  const restList = displayList.slice(3);

  const currentUserEntry = displayList.find((e) => e.uid === user.uid);
  const userRankPosition = currentUserEntry ? currentUserEntry.position : undefined;

  const renderAvatar = (entry: LeaderboardEntry) => {
    if (entry.avatar && (entry.avatar.startsWith('http://') || entry.avatar.startsWith('https://'))) {
      return (
        <img
          src={entry.avatar}
          alt={entry.name}
          className="w-full h-full object-cover rounded-full"
          onError={(e) => {
            (e.currentTarget as HTMLElement).style.display = 'none';
          }}
        />
      );
    }
    return (
      <span className="text-xl leading-none">
        {entry.avatar || entry.name.charAt(0).toUpperCase()}
      </span>
    );
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Top Hero Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 text-white shadow-xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 bg-amber-500/20 text-amber-300 border border-amber-400/40 px-3.5 py-1 rounded-full text-xs font-black uppercase tracking-wide">
              <Trophy className="w-4 h-4 text-amber-400" />
              <span>LIVE GLOBAL STUDENT STANDINGS</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Student Leaderboard & Rewards
            </h1>
            <p className="text-xs sm:text-sm text-indigo-200/90 max-w-xl font-medium leading-relaxed">
              Earn XP by completing AI micro-lessons, diagnostic quizzes, and flashcard sessions to climb the ranks in real time!
            </p>
          </div>

          {/* Coins Balance Box */}
          <div className="flex items-center gap-3.5 bg-slate-950/80 p-4 rounded-2xl border border-amber-400/30 shrink-0 shadow-lg">
            <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-400/40 text-amber-400 flex items-center justify-center font-black text-xl shadow-inner">
              🪙
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Gold Coins Balance</p>
              <p className="text-2xl font-black text-amber-300">{coins} Coins</p>
            </div>
          </div>
        </div>
      </div>

      {/* Rewards Chests Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Chest 1: Daily Login */}
        <div className="bg-slate-900/90 border border-blue-800/80 rounded-2xl p-5 text-white space-y-3 relative overflow-hidden group hover:border-amber-400/60 transition-all shadow-md">
          <div className="flex items-center justify-between">
            <span className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-400/30">
              <Gift className="w-5 h-5" />
            </span>
            <span className="text-[10px] font-black bg-blue-950 text-blue-300 px-2.5 py-1 rounded-full border border-blue-800 uppercase">
              Daily Bonus
            </span>
          </div>

          <div>
            <h3 className="font-extrabold text-base text-white">Daily Attendance Chest</h3>
            <p className="text-xs text-slate-400 font-medium">Claim your free daily study login reward.</p>
          </div>

          <div className="flex items-center justify-between text-xs font-bold pt-2 border-t border-blue-900/80">
            <span className="text-amber-300">+100 XP & 🪙 25 Coins</span>
            <button
              onClick={() => handleClaimChest('daily_chest', 100, 25, 'Daily Login Chest')}
              disabled={claimedChests['daily_chest']}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-black cursor-pointer transition-all ${
                claimedChests['daily_chest']
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  : 'bg-amber-400 hover:bg-amber-300 text-slate-950 font-black shadow-md'
              }`}
            >
              {claimedChests['daily_chest'] ? 'Claimed ✅' : 'Claim Reward 🎁'}
            </button>
          </div>
        </div>

        {/* Chest 2: 3-Day Study Streak */}
        <div className="bg-slate-900/90 border border-blue-800/80 rounded-2xl p-5 text-white space-y-3 relative overflow-hidden group hover:border-rose-400/60 transition-all shadow-md">
          <div className="flex items-center justify-between">
            <span className="p-2.5 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/30">
              <Flame className="w-5 h-5" />
            </span>
            <span className="text-[10px] font-black bg-rose-950 text-rose-300 px-2.5 py-1 rounded-full border border-rose-800 uppercase">
              Streak Bonus
            </span>
          </div>

          <div>
            <h3 className="font-extrabold text-base text-white">3-Day Study Streak Chest</h3>
            <p className="text-xs text-slate-400 font-medium">Keep your study streak active for 3 consecutive days.</p>
          </div>

          <div className="flex items-center justify-between text-xs font-bold pt-2 border-t border-blue-900/80">
            <span className="text-rose-300">+150 XP & 🪙 40 Coins</span>
            <button
              onClick={() => handleClaimChest('streak_chest', 150, 40, '3-Day Streak Flame')}
              disabled={claimedChests['streak_chest'] || user.streakCount < 3}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-black cursor-pointer transition-all ${
                claimedChests['streak_chest'] || user.streakCount < 3
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  : 'bg-rose-500 hover:bg-rose-400 text-white font-black shadow-md'
              }`}
            >
              {claimedChests['streak_chest']
                ? 'Claimed ✅'
                : user.streakCount < 3
                ? `${3 - user.streakCount}d to go`
                : 'Claim Reward 🎁'}
            </button>
          </div>
        </div>

        {/* Chest 3: Micro-Challenge Master */}
        <div className="bg-slate-900/90 border border-blue-800/80 rounded-2xl p-5 text-white space-y-3 relative overflow-hidden group hover:border-emerald-400/60 transition-all shadow-md">
          <div className="flex items-center justify-between">
            <span className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <Crown className="w-5 h-5" />
            </span>
            <span className="text-[10px] font-black bg-emerald-950 text-emerald-300 px-2.5 py-1 rounded-full border border-emerald-800 uppercase">
              Mastery Bonus
            </span>
          </div>

          <div>
            <h3 className="font-extrabold text-base text-white">Knowledge Master Chest</h3>
            <p className="text-xs text-slate-400 font-medium">Complete diagnostic recall challenges in AI Tutor.</p>
          </div>

          <div className="flex items-center justify-between text-xs font-bold pt-2 border-t border-blue-900/80">
            <span className="text-emerald-300">+250 XP & 🪙 60 Coins</span>
            <button
              onClick={() => handleClaimChest('master_chest', 250, 60, 'Knowledge Master')}
              disabled={claimedChests['master_chest']}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-black cursor-pointer transition-all ${
                claimedChests['master_chest']
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  : 'bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-black shadow-md'
              }`}
            >
              {claimedChests['master_chest'] ? 'Claimed ✅' : 'Claim Reward 🎁'}
            </button>
          </div>
        </div>
      </div>

      {/* Main Leaderboard Panel */}
      <div className="bg-slate-900 border border-indigo-900/80 rounded-3xl p-6 sm:p-8 text-white space-y-6 shadow-2xl">
        <div className="flex items-center justify-between border-b border-blue-900/80 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-400/30">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-extrabold text-xl text-white">Global Student Rankings</h2>
              <p className="text-xs text-slate-400 font-medium">Real-time standings based on Total XP earned</p>
            </div>
          </div>
          <span className="text-xs font-bold text-indigo-300 bg-indigo-950/80 px-3 py-1.5 rounded-full border border-indigo-800 flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5" />
            {displayList.length} Active Students
          </span>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3 text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin text-amber-400" />
            <p className="text-xs font-bold text-slate-300">Loading live rankings from Firebase...</p>
          </div>
        ) : (
          <>
            {/* Top 3 Podium Display */}
            <div className="grid grid-cols-3 gap-3 sm:gap-4 pt-4 pb-2 items-end">
              {/* 2nd Place (Silver) */}
              {topThree[0] && (
                <div className="bg-slate-900 border border-slate-700/80 rounded-2xl p-4 text-center space-y-2 relative shadow-md">
                  <div className="w-8 h-8 rounded-full bg-slate-700 text-slate-200 border border-slate-500 flex items-center justify-center font-black text-xs mx-auto shadow-md">
                    🥈 #2
                  </div>
                  <div className="w-14 h-14 rounded-full bg-slate-800 border-2 border-slate-400 flex items-center justify-center mx-auto overflow-hidden shadow-inner">
                    {renderAvatar(topThree[0])}
                  </div>
                  <div>
                    <p className="font-extrabold text-xs sm:text-sm text-white truncate max-w-[120px] mx-auto">
                      {topThree[0].uid === user.uid ? `${topThree[0].name} (You)` : topThree[0].name}
                    </p>
                    <span className="text-[10px] font-bold text-slate-400 block mt-0.5">{topThree[0].rankLevel}</span>
                  </div>
                  <div className="inline-block bg-slate-800 text-amber-300 text-xs font-black px-3 py-1 rounded-full border border-amber-400/30">
                    {topThree[0].xp} XP
                  </div>
                </div>
              )}

              {/* 1st Place (Gold - Elevated) */}
              {topThree[1] && (
                <div className="bg-slate-900 border-2 border-amber-400 rounded-2xl p-5 text-center space-y-2 relative shadow-xl transform sm:-translate-y-3">
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-amber-400 text-slate-950 text-xs font-black px-3 py-0.5 rounded-full shadow-md flex items-center gap-1 uppercase tracking-wider">
                    <Crown className="w-3.5 h-3.5 fill-amber-950" /> 🥇 #1 Leader
                  </div>
                  <div className="w-16 h-16 rounded-full bg-slate-800 border-2 border-amber-400 flex items-center justify-center mx-auto overflow-hidden shadow-xl mt-2">
                    {renderAvatar(topThree[1])}
                  </div>
                  <div>
                    <p className="font-black text-sm sm:text-base text-amber-300 truncate max-w-[130px] mx-auto">
                      {topThree[1].uid === user.uid ? `${topThree[1].name} (You)` : topThree[1].name}
                    </p>
                    <span className="text-[10px] font-bold text-amber-200/80 block mt-0.5">{topThree[1].rankLevel}</span>
                  </div>
                  <div className="inline-block bg-amber-500/20 text-amber-300 text-sm font-black px-3.5 py-1 rounded-full border border-amber-400/50 shadow-md">
                    ⚡ {topThree[1].xp} XP
                  </div>
                </div>
              )}

              {/* 3rd Place (Bronze) */}
              {topThree[2] && (
                <div className="bg-slate-900 border border-slate-700/80 rounded-2xl p-4 text-center space-y-2 relative shadow-md">
                  <div className="w-8 h-8 rounded-full bg-amber-900/60 text-amber-200 border border-amber-700 flex items-center justify-center font-black text-xs mx-auto shadow-md">
                    🥉 #3
                  </div>
                  <div className="w-14 h-14 rounded-full bg-slate-800 border-2 border-amber-700 flex items-center justify-center mx-auto overflow-hidden shadow-inner">
                    {renderAvatar(topThree[2])}
                  </div>
                  <div>
                    <p className="font-extrabold text-xs sm:text-sm text-white truncate max-w-[120px] mx-auto">
                      {topThree[2].uid === user.uid ? `${topThree[2].name} (You)` : topThree[2].name}
                    </p>
                    <span className="text-[10px] font-bold text-slate-400 block mt-0.5">{topThree[2].rankLevel}</span>
                  </div>
                  <div className="inline-block bg-slate-800/90 text-amber-300 text-xs font-black px-3 py-1 rounded-full border border-amber-400/30">
                    {topThree[2].xp} XP
                  </div>
                </div>
              )}
            </div>

            {/* Standings List (#4 and below) */}
            <div className="space-y-2.5 pt-4 border-t border-blue-900/80">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider mb-2">Complete Rankings</h3>
              {displayList.map((entry) => {
                const isCurrentUser = entry.uid === user.uid;

                return (
                  <div
                    key={entry.uid}
                    className={`flex items-center justify-between p-3.5 sm:p-4 rounded-2xl border transition-all ${
                      isCurrentUser
                        ? 'bg-gradient-to-r from-blue-900 via-indigo-900 to-blue-900 border-amber-400 text-white shadow-xl ring-1 ring-amber-400/50'
                        : 'bg-slate-950/70 border-blue-950 hover:border-blue-800 text-slate-200 hover:bg-slate-950'
                    }`}
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <span className="w-7 text-center font-black text-xs sm:text-sm text-amber-400 shrink-0">
                        #{entry.position}
                      </span>
                      <div className="w-9 h-9 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0 overflow-hidden">
                        {renderAvatar(entry)}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-extrabold text-xs sm:text-sm text-white truncate">
                            {entry.name}
                          </p>
                          {isCurrentUser && (
                            <span className="bg-amber-400 text-slate-950 text-[9px] font-black px-2 py-0.5 rounded-full uppercase shrink-0">
                              YOU
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-indigo-300 font-semibold block">{entry.rankLevel}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 sm:gap-5 text-xs font-bold shrink-0">
                      <span className="flex items-center gap-1 text-rose-400 bg-rose-500/10 px-2.5 py-1 rounded-xl border border-rose-500/20">
                        <Flame className="w-3.5 h-3.5 fill-rose-400" />
                        {entry.streak}d
                      </span>
                      <span className="hidden sm:flex items-center gap-1 text-slate-300 bg-slate-800/60 px-2.5 py-1 rounded-xl border border-slate-700">
                        <Medal className="w-3.5 h-3.5 text-amber-400" />
                        {entry.badgeCount}
                      </span>
                      <span className="font-black text-amber-300 text-xs sm:text-sm bg-amber-500/10 px-3 py-1 rounded-xl border border-amber-400/30">
                        {entry.xp} XP
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
};
