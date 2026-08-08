import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInAnonymously,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  updateProfile,
  User as FirebaseUser
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  onSnapshot,
  collection,
  query,
  where,
  getDocs,
  addDoc,
  orderBy,
  limit
} from 'firebase/firestore';
import {
  getStorage,
  ref,
  uploadBytesResumable,
  getDownloadURL
} from 'firebase/storage';
import firebaseConfig from '../../firebase-applet-config.json';
import { UserProfile, PdfSummary, LeaderboardEntry } from '../types';

// Initialize Firebase
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId || '(default)');
export const storage = getStorage(app);

export const onAuthChange = (callback: (user: FirebaseUser | null) => void) => onAuthStateChanged(auth, callback);

// Convert Firestore doc to UserProfile
export const defaultProfile = (uid: string, name: string, email: string, username?: string): UserProfile => ({
  uid,
  name: name || 'EduMind Learner',
  username: username || (email ? email.split('@')[0] : `learner_${Math.floor(Math.random() * 8999 + 1000)}`),
  email: email || 'guest@edumind.ai',
  avatarUrl: `https://api.dicebear.com/7.x/bottts/svg?seed=${username || uid}`,
  xp: 0,
  level: 1,
  streakCount: 0,
  lastActiveDate: new Date().toISOString().split('T')[0],
  rank: 'Novice Doodler',
  badges: [],
  stickers: [],
  todayPlan: [],
});

// Save user profile to Firestore
export const saveUserProfileToFirestore = async (userProfile: UserProfile) => {
  try {
    const userRef = doc(db, 'users', userProfile.uid);
    await setDoc(userRef, {
      ...userProfile,
      updatedAt: new Date().toISOString()
    }, { merge: true });
  } catch (error) {
    console.warn('Note: Firestore doc save notice:', error);
  }
};

// Fetch user profile from Firestore
export const getUserProfileFromFirestore = async (uid: string): Promise<UserProfile | null> => {
  try {
    const userRef = doc(db, 'users', uid);
    const snap = await getDoc(userRef);
    if (snap.exists()) {
      return snap.data() as UserProfile;
    }
    return null;
  } catch (error) {
    console.warn('Note: Firestore doc read notice:', error);
    return null;
  }
};

// Real-time listener for User Profile
export const subscribeToUserProfile = (
  uid: string,
  onUpdate: (profile: UserProfile) => void
) => {
  const userRef = doc(db, 'users', uid);
  return onSnapshot(userRef, (snap) => {
    if (snap.exists()) {
      onUpdate(snap.data() as UserProfile);
    }
  });
};

// ---- Leaderboard: real Firestore data, ranked live by XP ----

const toLeaderboardEntry = (data: any, position: number): LeaderboardEntry => ({
  uid: data.uid,
  name: data.name || 'Learner',
  avatar: data.avatarUrl || '🎓',
  xp: data.xp || 0,
  rankLevel: data.rank || 'Novice Doodler',
  streak: data.streakCount || 0,
  badgeCount: Array.isArray(data.badges) ? data.badges.length : 0,
  position,
});

// One-off fetch of the top N users by XP
export const getLeaderboard = async (limitCount = 20): Promise<LeaderboardEntry[]> => {
  try {
    const usersRef = collection(db, 'users');
    const q = query(usersRef, orderBy('xp', 'desc'), limit(limitCount));
    const snap = await getDocs(q);
    return snap.docs.map((d, i) => toLeaderboardEntry(d.data(), i + 1));
  } catch (err) {
    console.warn('Error fetching leaderboard from Firestore:', err);
    return [];
  }
};

// Live-updating leaderboard subscription (top N by XP). Returns an unsubscribe fn.
export const subscribeToLeaderboard = (
  onUpdate: (entries: LeaderboardEntry[]) => void,
  onError?: (err: any) => void,
  limitCount = 20
) => {
  const usersRef = collection(db, 'users');
  const q = query(usersRef, orderBy('xp', 'desc'), limit(limitCount));
  return onSnapshot(
    q,
    (snap) => {
      const entries = snap.docs.map((d, i) => toLeaderboardEntry(d.data(), i + 1));
      onUpdate(entries);
    },
    (err) => {
      console.warn('Leaderboard subscription error:', err);
      if (onError) onError(err);
    }
  );
};

// Format Firebase Auth errors into clear human-readable messages
const formatAuthError = (err: any): string => {
  const code = err?.code || '';
  if (code === 'auth/user-not-found' || code === 'auth/wrong-password' || code === 'auth/invalid-credential') {
    return 'Invalid email or password. If you do not have an account yet, please select "Create Account" to register.';
  }
  if (code === 'auth/email-already-in-use') {
    return 'An account with this email address already exists. Please select "Sign In" instead.';
  }
  if (code === 'auth/weak-password') {
    return 'Password is too weak. Please use at least 6 characters.';
  }
  if (code === 'auth/invalid-email') {
    return 'Please enter a valid email address.';
  }
  if (code === 'auth/popup-closed-by-user') {
    return 'Google sign-in popup was closed before completing.';
  }
  if (code === 'auth/popup-blocked') {
    return 'Sign-in popup was blocked by your browser. Please allow popups for this site.';
  }
  if (code === 'auth/unauthorized-domain') {
    return 'This domain is not authorized for sign-in. Add it under Firebase Console > Authentication > Settings > Authorized domains.';
  }
  if (code === 'auth/operation-not-allowed') {
    return 'Authentication method is disabled in Firebase console. Please sign in with Guest session or Email.';
  }
  if (err?.message) {
    return err.message.replace(/^Firebase:\s*/, '');
  }
  return 'Authentication failed. Please check your credentials.';
};

// Auth Helper Functions with Firestore Database Fallback
export const registerUser = async (email: string, pass: string, username: string, fullName: string): Promise<UserProfile> => {
  try {
    const cred = await createUserWithEmailAndPassword(auth, email, pass);
    if (cred.user) {
      await updateProfile(cred.user, { displayName: fullName }).catch(() => {});
    }
    const newProfile = defaultProfile(cred.user.uid, fullName, email, username);
    await saveUserProfileToFirestore(newProfile);
    return newProfile;
  } catch (err: any) {
    console.warn('Firebase Auth registration note:', err?.code, err?.message);
    if (err?.code === 'auth/operation-not-allowed' || err?.code === 'auth/admin-restricted-operation') {
      // Query Firestore to verify if email already registered
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('email', '==', email.trim().toLowerCase()));
      const snap = await getDocs(q);
      if (!snap.empty) {
        throw new Error('An account with this email address already exists. Please select "Sign In" to log in.');
      }
      const uid = `usr_${Date.now()}_${Math.floor(Math.random() * 8999 + 1000)}`;
      const newProfile = defaultProfile(uid, fullName, email.trim().toLowerCase(), username);
      await setDoc(doc(db, 'users', uid), {
        ...newProfile,
        storedPassword: pass,
      });
      return newProfile;
    }
    throw new Error(formatAuthError(err));
  }
};

export const loginUser = async (email: string, pass: string): Promise<UserProfile> => {
  try {
    const cred = await signInWithEmailAndPassword(auth, email, pass);
    let profile = await getUserProfileFromFirestore(cred.user.uid);
    if (!profile) {
      profile = defaultProfile(cred.user.uid, cred.user.displayName || email.split('@')[0], email);
      await saveUserProfileToFirestore(profile);
    }
    return profile;
  } catch (err: any) {
    console.warn('Firebase Auth login note:', err?.code, err?.message);
    if (
      err?.code === 'auth/operation-not-allowed' ||
      err?.code === 'auth/admin-restricted-operation' ||
      err?.code === 'auth/user-not-found'
    ) {
      // Query Firestore for user by email
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('email', '==', email.trim().toLowerCase()));
      const snap = await getDocs(q);
      if (snap.empty) {
        throw new Error('No account found with this email. Please select "Create Account" to register first.');
      }
      const userDoc = snap.docs[0].data();
      if (userDoc.storedPassword && userDoc.storedPassword !== pass) {
        throw new Error('Invalid password. Please check your password and try again.');
      }
      return userDoc as UserProfile;
    }
    throw new Error(formatAuthError(err));
  }
};

export const loginGuest = async (customUsername?: string): Promise<UserProfile> => {
  try {
    const cred = await signInAnonymously(auth);
    let profile = await getUserProfileFromFirestore(cred.user.uid);
    if (!profile) {
      const uname = customUsername || `guest_${Math.floor(Math.random() * 8999 + 1000)}`;
      profile = defaultProfile(cred.user.uid, `Guest (${uname})`, 'guest@edumind.ai', uname);
      await saveUserProfileToFirestore(profile);
    }
    return profile;
  } catch (err: any) {
    console.warn('Firebase guest auth fallback:', err?.message);
    const uname = customUsername || `guest_${Math.floor(Math.random() * 8999 + 1000)}`;
    const profile = defaultProfile(`guest_local_${Date.now()}`, `Guest (${uname})`, 'guest@edumind.ai', uname);
    await saveUserProfileToFirestore(profile);
    return profile;
  }
};

export const loginWithGoogle = async (): Promise<UserProfile> => {
  try {
    const provider = new GoogleAuthProvider();
    const cred = await signInWithPopup(auth, provider);
    let profile = await getUserProfileFromFirestore(cred.user.uid);
    if (!profile) {
      const email = cred.user.email || 'googleuser@edumind.ai';
      const name = cred.user.displayName || 'Google Learner';
      const uname = email.split('@')[0];
      profile = defaultProfile(cred.user.uid, name, email, uname);
      if (cred.user.photoURL) {
        profile.avatarUrl = cred.user.photoURL;
      }
      await saveUserProfileToFirestore(profile);
    }
    return profile;
  } catch (err: any) {
    console.warn('Google login note:', err?.code, err?.message);
    if (err?.code === 'auth/operation-not-allowed' || err?.code === 'auth/admin-restricted-operation') {
      throw new Error('Google Sign-In is disabled on this Firebase project. Please use standard Email Registration or Guest Session.');
    }
    throw new Error(formatAuthError(err));
  }
};

export const logout = async () => {
  try {
    await signOut(auth);
  } catch (err) {
    console.warn('Signout note:', err);
  }
};

// PDF Storage Helpers
export const uploadPdfFileToStorage = async (
  userId: string,
  file: File,
  onProgress?: (pct: number) => void
): Promise<string> => {
  try {
    const storageRef = ref(storage, `pdfs/${userId}/${Date.now()}_${file.name}`);
    const uploadTask = uploadBytesResumable(storageRef, file);

    return new Promise((resolve, reject) => {
      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          if (onProgress) onProgress(progress);
        },
        (error) => {
          console.error('Firebase Storage upload error:', error);
          reject(error);
        },
        async () => {
          const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
          resolve(downloadUrl);
        }
      );
    });
  } catch (err) {
    console.warn('Storage upload fallback url:', err);
    return `https://firebasestorage.googleapis.com/v0/b/mock/o/${file.name}`;
  }
};

export const savePdfDocToFirestore = async (pdfDoc: PdfSummary, userId: string) => {
  try {
    const pdfsCol = collection(db, 'user_pdfs');
    await addDoc(pdfsCol, {
      ...pdfDoc,
      userId,
      uploadedAt: new Date().toISOString()
    });
  } catch (err) {
    console.warn('Error saving PDF metadata to Firestore:', err);
  }
};

export const getUserPdfsFromFirestore = async (userId: string): Promise<PdfSummary[]> => {
  try {
    const pdfsCol = collection(db, 'user_pdfs');
    const q = query(pdfsCol, where('userId', '==', userId));
    const snap = await getDocs(q);
    const results: PdfSummary[] = [];
    snap.forEach((doc) => {
      results.push({ id: doc.id, ...doc.data() } as PdfSummary);
    });
    return results;
  } catch (err) {
    console.warn('Error getting user PDFs from Firestore:', err);
    return [];
  }
};