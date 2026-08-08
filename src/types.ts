export type MasteryStatus = 'not_started' | 'in_progress' | 'mastered';

export type ErrorType = 'Careless mistake' | 'Misconception' | 'Knowledge gap';

export interface ConceptNode {
  id: string;
  title: string;
  description: string;
  status: MasteryStatus;
  prerequisites: string[]; // array of concept IDs
  estimatedMinutes: number;
  importance: 'high' | 'medium' | 'low'; // for study priority
  subjectId: string;
}

export interface Subject {
  id: string;
  name: string;
  category: string;
  color: string; // e.g. '#4D96FF' for Math, '#6BCB77' for Science, etc.
  iconName: string;
  description: string;
  concepts: ConceptNode[];
}

export interface RoadmapStep {
  id: string;
  stepNumber: number;
  title: string;
  summary: string;
  estimatedMinutes: number;
  status: 'locked' | 'current' | 'completed';
}

export interface CheckQuestion {
  id: string;
  question: string;
  options?: string[]; // for MCQ if applicable
  correctAnswer: string;
  explanation: string;
  hint?: string;
}

export interface RepairLesson {
  errorType: ErrorType;
  diagnosticExplanation: string; // e.g., "This was a careless mistake in subnet calculation, not a concept flaw!"
  microRepairContent: string; // 3-minute targeted repair lesson
  recallChallenge: CheckQuestion; // 1 mini challenge question to verify repair
  activeRecallTips: string[]; // Active recall formulas & techniques
  improvementFormula: string; // Step-by-step formula to master the concept
}

export interface MicroLesson {
  stepId: string;
  stepNumber: number;
  title: string;
  content: string; // ~150-250 words
  keyTakeaways: string[];
  analogy: string; // real world analogy
  checkQuestions: CheckQuestion[];
}

export interface StudyPrioritySummary {
  highYieldTopics: { title: string; reason: string }[];
  mediumYieldTopics: { title: string; reason: string }[];
  lowYieldTopics: { title: string; reason: string }[];
  nightBeforeChecklist: string[];
}

export interface TutorSession {
  id: string;
  subjectId: string;
  subjectName: string;
  topic: string;
  roadmap: RoadmapStep[];
  currentIndex: number;
  completedSteps: string[];
  currentLesson?: MicroLesson;
  activeRepair?: RepairLesson;
  prioritySummary?: StudyPrioritySummary;
  chatHistory: {
    id: string;
    sender: 'tutor' | 'student';
    text: string;
    timestamp: string;
    type?: 'lesson' | 'question' | 'diagnosis' | 'summary' | 'alternate';
  }[];
}

export type QuestionType = 'mcq' | 'short_answer' | 'code_numeric';

export interface AssessmentQuestion {
  id: string;
  type: QuestionType;
  question: string;
  options?: string[];
  correctAnswer: string;
  explanation: string;
  topic: string;
  points: number;
}

export interface AssessmentResult {
  questionId: string;
  studentAnswer: string;
  isCorrect: boolean;
  errorType?: ErrorType;
  repairLesson?: RepairLesson;
  scoreGained: number;
}

export interface PerformanceReport {
  id: string;
  topic: string;
  totalQuestions: number;
  correctAnswers: number;
  scorePercentage: number;
  strengths: string[];
  weakConcepts: { concept: string; errorType: ErrorType; repairAdvice: string }[];
  nextStudySteps: string[];
  completedAt: string;
}

export interface PdfSummary {
  id: string;
  fileName: string;
  fileSize: string;
  extractedTextPreview: string;
  keyPoints: string[];
  flashcards: { front: string; back: string }[];
  suggestedRoadmap: RoadmapStep[];
  uploadedAt: string;
}

export interface CareerRole {
  id: string;
  title: string;
  category: string;
  description: string;
  requiredSkills: { name: string; conceptId?: string; importance: 'critical' | 'important' | 'nice_to_have' }[];
  averageSalary: string;
  growthRate: string;
  recommendedProjects: string[];
}

export interface SkillGapAnalysis {
  roleId: string;
  roleTitle: string;
  matchPercentage: number;
  masteredSkills: string[];
  missingSkills: { name: string; conceptId?: string; topicToLearn: string }[];
  learningRoadmap: string[];
}

export interface MockInterviewQA {
  id: string;
  question: string;
  context: string;
  studentAnswer?: string;
  aiFeedback?: {
    score: number; // 0 - 100
    strengths: string[];
    improvements: string[];
    idealAnswerSample: string;
  };
}

export interface Flashcard {
  id: string;
  front: string;
  back: string;
  subjectId: string;
  lastReviewed?: string;
  easeFactor?: number;
  intervalDays?: number;
  status: 'new' | 'learning' | 'mastered';
}

export interface TaskItem {
  id: string;
  title: string;
  subjectId?: string;
  dueDate: string;
  completed: boolean;
  estimatedMinutes: number;
  xpReward: number;
  priority: 'high' | 'medium' | 'low';
  subtasks?: { id: string; title: string; completed: boolean }[];
}

export interface Badge {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt?: string;
  category: 'streak' | 'mastery' | 'summarizer' | 'pomodoro' | 'assessment';
}

export interface StickerStamp {
  id: string;
  title: string;
  subjectName: string;
  topicTitle: string;
  unlockedDate: string;
  stickerStyle: 'star' | 'crown' | 'rocket' | 'bulb' | 'fire' | 'brain';
  color: string;
}

export type RankLevel = 'Novice Doodler' | 'Scholar' | 'Concept Explorer' | 'Knowledge Architect' | 'Mastermind' | 'Sage' | 'EduMind Master';

export interface UserProfile {
  uid: string;
  name: string;
  username: string;
  email: string;
  level: number;
  avatarUrl?: string;
  xp: number;
  streakCount: number;
  lastActiveDate: string;
  rank: RankLevel;
  badges: Badge[];
  stickers: StickerStamp[];
  todayPlan: {
    id: string;
    title: string;
    estimatedMinutes: number;
    completed: boolean;
    xpReward: number;
    type: 'tutor' | 'quiz' | 'flashcard' | 'pomodoro';
  }[];
  coins?: number;
  claimedChests?: Record<string, boolean>;
}

export interface LeaderboardEntry {
  uid: string;
  name: string;
  avatar: string;
  xp: number;
  rankLevel: RankLevel;
  streak: number;
  badgeCount: number;
  position: number;
}
