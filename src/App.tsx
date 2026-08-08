import React, { useState, useEffect } from 'react';
import { UserProfile, Subject, StickerStamp } from './types';
import { INITIAL_USER, DEFAULT_SUBJECTS } from './data/mockData';
import { Navbar } from './components/Navbar';
import { SidebarNav, NavTab } from './components/SidebarNav';
import { TodaysPlan } from './components/Dashboard/TodaysPlan';
import { TutorContainer } from './components/SequentialTutor/TutorContainer';
import { AssessmentCenter } from './components/Assessment/AssessmentCenter';
import { ProductivitySuite } from './components/Productivity/ProductivitySuite';
import { NotebookPortfolio } from './components/Sketchbook/NotebookPortfolio';
import { OnboardingModal } from './components/Onboarding/OnboardingModal';
import { AuthModal } from './components/Auth/AuthModal';
import { LandingPage } from './components/LandingPage/LandingPage';
import { RankSystemView } from './components/RankSystem/RankSystemView';
import { LeaderboardView } from './components/Leaderboard/LeaderboardView';
import { onAuthChange, getUserProfileFromFirestore, saveUserProfileToFirestore, subscribeToUserProfile, logout as logoutUser } from './services/firebase';

export default function App() {
  const [user, setUser] = useState<UserProfile>(INITIAL_USER);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [subjects, setSubjects] = useState<Subject[]>(DEFAULT_SUBJECTS);
  const [activeSubject, setActiveSubject] = useState<Subject>(DEFAULT_SUBJECTS[0]);
  const [activeTab, setActiveTab] = useState<NavTab>('landing');
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);

  // Subscribe to Firebase auth state updates & live user profile in Firestore
  useEffect(() => {
    let unsubscribeProfile: (() => void) | null = null;

    const unsubscribeAuth = onAuthChange(async (firebaseUser) => {
      if (unsubscribeProfile) {
        unsubscribeProfile();
        unsubscribeProfile = null;
      }

      if (firebaseUser) {
        setIsAuthenticated(true);
        const storedProfile = await getUserProfileFromFirestore(firebaseUser.uid);
        if (storedProfile) {
          setUser(storedProfile);
        } else {
          setUser((prev) => ({
            ...prev,
            uid: firebaseUser.uid,
            email: firebaseUser.email || prev.email,
            name: firebaseUser.displayName || prev.name,
          }));
        }

        // Subscribe to live profile changes in Firestore
        unsubscribeProfile = subscribeToUserProfile(firebaseUser.uid, (updatedProfile) => {
          setUser(updatedProfile);
        });

        // Switch to student dashboard when signed in
        setActiveTab('todays_plan');
      } else {
        setIsAuthenticated(false);
        setActiveTab('landing');
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribeProfile) unsubscribeProfile();
    };
  }, []);

  const handleSignOut = async () => {
    await logoutUser();
    setIsAuthenticated(false);
    setUser(INITIAL_USER);
    setActiveTab('landing');
  };

  const effectiveIsAuthenticated = isAuthenticated || Boolean(user.uid && user.uid !== 'guest_user' && user.uid !== 'user_123');

  const handleSelectTab = (tab: NavTab) => {
    if (!effectiveIsAuthenticated && tab !== 'landing') {
      setShowAuthModal(true);
      return;
    }
    setActiveTab(tab);
  };

  // Persists a fresh profile snapshot to Firestore in the background (never blocks the UI).
  const persistProfile = (profile: UserProfile) => {
    if (effectiveIsAuthenticated) {
      saveUserProfileToFirestore(profile).catch((err) =>
        console.warn('Failed to persist profile update:', err)
      );
    }
  };

  // Central place for any state update that must also survive a refresh / show up on
  // the real Firebase leaderboard. Every XP/streak/task mutation should route through this.
  const updateUserAndPersist = (updater: (prev: UserProfile) => UserProfile) => {
    setUser((prev) => {
      const next = updater(prev);
      persistProfile(next);
      return next;
    });
  };

  const handleRewardXp = (amount: number, stickerTitle?: string) => {
    updateUserAndPersist((prev) => {
      const newXp = prev.xp + amount;
      const newLevel = Math.max(1, Math.floor(newXp / 400) + 1);
      let newRank = prev.rank;

      if (newXp >= 5000) newRank = 'Sage';
      else if (newXp >= 3500) newRank = 'Mastermind';
      else if (newXp >= 2600) newRank = 'Knowledge Architect';
      else if (newXp >= 1800) newRank = 'Concept Explorer';
      else if (newXp >= 1000) newRank = 'Scholar';
      else newRank = 'Novice Doodler';

      let updatedStickers = prev.stickers;
      if (stickerTitle) {
        const newSticker: StickerStamp = {
          id: `st_${Date.now()}`,
          title: stickerTitle,
          subjectName: activeSubject.name,
          topicTitle: stickerTitle,
          unlockedDate: new Date().toISOString().split('T')[0],
          stickerStyle: 'star',
          color: activeSubject.color,
        };
        updatedStickers = [newSticker, ...prev.stickers];
      }

      return {
        ...prev,
        xp: newXp,
        level: newLevel,
        rank: newRank,
        stickers: updatedStickers,
      };
    });
  };

  const handleCompletePlanTask = (taskId: string, xpReward: number) => {
    updateUserAndPersist((prev) => ({
      ...prev,
      todayPlan: prev.todayPlan.map((t) => (t.id === taskId ? { ...t, completed: true } : t)),
    }));
    handleRewardXp(xpReward);
  };

  // Lets a student add their own custom task to Today's Plan instead of relying on
  // hardcoded/mock goals. Persists immediately to Firestore.
  const handleAddPlanTask = (task: {
    title: string;
    estimatedMinutes: number;
    xpReward: number;
    type: 'tutor' | 'quiz' | 'flashcard' | 'pomodoro';
  }) => {
    updateUserAndPersist((prev) => ({
      ...prev,
      todayPlan: [
        ...prev.todayPlan,
        {
          id: `tp_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
          title: task.title,
          estimatedMinutes: task.estimatedMinutes,
          xpReward: task.xpReward,
          type: task.type,
          completed: false,
        },
      ],
    }));
  };

  const handleDeletePlanTask = (taskId: string) => {
    updateUserAndPersist((prev) => ({
      ...prev,
      todayPlan: prev.todayPlan.filter((t) => t.id !== taskId),
    }));
  };

  const handleLaunchTutor = (subject: Subject) => {
    setActiveSubject(subject);
    handleSelectTab('tutor');
  };

  const uncompletedTaskCount = user.todayPlan.filter((t) => !t.completed).length;

  return (
    <div className="min-h-screen bg-[#FAF6EE] text-slate-900 flex flex-col selection:bg-blue-600 selection:text-white bg-learning-grid">
      {/* Top Navbar */}
      <Navbar
        user={user}
        subjects={subjects}
        activeSubject={activeSubject}
        activeTab={activeTab}
        isAuthenticated={effectiveIsAuthenticated}
        onSelectTab={handleSelectTab}
        onSelectSubject={setActiveSubject}
        onOpenNotebook={() => handleSelectTab('sketchbook')}
        onOpenAuth={() => setShowAuthModal(true)}
        onSignOut={handleSignOut}
      />

      {/* Landing Page layout: Full Width without Sidebar when activeTab === 'landing' */}
      {activeTab === 'landing' ? (
        <main className="flex-1 w-full">
          <LandingPage
            subjects={subjects}
            onEnterApp={() => {
              if (effectiveIsAuthenticated) {
                setActiveTab('todays_plan');
              } else {
                setShowAuthModal(true);
              }
            }}
            onOpenAuth={() => setShowAuthModal(true)}
            onNavigateTab={handleSelectTab}
            user={user}
            isAuthenticated={effectiveIsAuthenticated}
          />
        </main>
      ) : (
        /* Dashboard App layout: Sidebar + Workspace */
        <div className="flex-1 max-w-7xl w-full mx-auto flex flex-col md:flex-row">
          {/* Navigation Sidebar */}
          <SidebarNav
            activeTab={activeTab}
            isAuthenticated={effectiveIsAuthenticated}
            onSelectTab={handleSelectTab}
            onOpenAuth={() => setShowAuthModal(true)}
            uncompletedPlanCount={uncompletedTaskCount}
          />

          {/* Main Tab View Workspace with Protected Route Guard */}
          <main className="flex-1 p-4 lg:p-8 overflow-y-auto">
            {!effectiveIsAuthenticated ? (
              <div className="sketch-card bg-white p-8 sm:p-12 text-center space-y-6 max-w-lg mx-auto my-12 shadow-xl border-2 border-slate-900">
                <div className="w-16 h-16 rounded-3xl bg-blue-50 border border-blue-200 text-blue-600 flex items-center justify-center mx-auto text-2xl shadow-inner font-black">
                  🔒
                </div>
                <div className="space-y-2">
                  <span className="bg-rose-50 text-rose-700 text-[10px] font-black px-3 py-1 rounded-full border border-rose-200 uppercase tracking-wider">
                    PROTECTED STUDENT PORTAL
                  </span>
                  <h3 className="font-extrabold text-2xl text-slate-900">Authentication Required</h3>
                  <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed">
                    Please sign in or create a student account to access your AI micro-lessons, diagnostic assessments, active recall guides, and live leaderboard progress.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
                  <button
                    onClick={() => setShowAuthModal(true)}
                    className="w-full btn-sketch-primary text-xs py-3.5 font-bold shadow-md"
                  >
                    Sign In / Create Account
                  </button>
                  <button
                    onClick={() => setActiveTab('landing')}
                    className="w-full bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs py-3.5 rounded-xl border border-slate-300 transition-all"
                  >
                    Back to Landing Page
                  </button>
                </div>
              </div>
            ) : (
              <>
                {activeTab === 'todays_plan' && (
                  <TodaysPlan
                    user={user}
                    subjects={subjects}
                    onCompleteTask={handleCompletePlanTask}
                    onAddTask={handleAddPlanTask}
                    onDeleteTask={handleDeletePlanTask}
                    onLaunchTutor={handleLaunchTutor}
                    onNavigateTab={handleSelectTab}
                  />
                )}

                {activeTab === 'rank_graphs' && (
                  <div className="space-y-8">
                    <LeaderboardView user={user} onRewardXp={handleRewardXp} />
                    <RankSystemView user={user} />
                  </div>
                )}

                {activeTab === 'tutor' && (
                  <TutorContainer
                    activeSubject={activeSubject}
                    onRewardXp={handleRewardXp}
                  />
                )}

                {activeTab === 'assessment' && (
                  <AssessmentCenter
                    activeSubject={activeSubject}
                    onRewardXp={handleRewardXp}
                  />
                )}

                {activeTab === 'productivity' && (
                  <ProductivitySuite onRewardXp={handleRewardXp} />
                )}

                {activeTab === 'sketchbook' && <NotebookPortfolio user={user} />}
              </>
            )}
          </main>
        </div>
      )}

      {showOnboarding && (
        <OnboardingModal
          onCompleteOnboarding={(answers) => {
            setShowOnboarding(false);
            handleRewardXp(50);
          }}
        />
      )}

      {/* Firebase Authentication Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onAuthenticated={(profile) => {
          setUser(profile);
          setIsAuthenticated(true);
          setShowAuthModal(false);
          setActiveTab('todays_plan'); // Open dashboard after successful sign in
        }}
      />
    </div>
  );
}