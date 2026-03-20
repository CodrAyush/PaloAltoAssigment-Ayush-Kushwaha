import { createContext, useContext, useReducer, useEffect } from 'react';

const AppContext = createContext(null);

const STORAGE_KEY = 'skillbridge-data';

const initialState = {
  userProfile: {
    skills: [],
    experience: [],
    education: '',
    projects: [],
    targetRole: '',
    resumeText: '',
  },
  gapResults: null,
  roadmap: {
    items: [],
    completedIds: [],
  },
  interviewHistory: [],
  settings: {
    theme: 'dark',
    aiAvailable: true,
  },
  toast: null,
};

function loadState() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      return { ...initialState, ...parsed, toast: null };
    }
  } catch (e) {
    console.warn('Failed to load saved state:', e);
  }
  return initialState;
}

function appReducer(state, action) {
  switch (action.type) {
    case 'SET_PROFILE':
      return { ...state, userProfile: { ...state.userProfile, ...action.payload } };

    case 'SET_SKILLS':
      return { ...state, userProfile: { ...state.userProfile, skills: action.payload } };

    case 'ADD_SKILL':
      if (state.userProfile.skills.includes(action.payload)) return state;
      return { ...state, userProfile: { ...state.userProfile, skills: [...state.userProfile.skills, action.payload] } };

    case 'REMOVE_SKILL':
      return { ...state, userProfile: { ...state.userProfile, skills: state.userProfile.skills.filter(s => s !== action.payload) } };

    case 'SET_TARGET_ROLE':
      return { ...state, userProfile: { ...state.userProfile, targetRole: action.payload } };

    case 'SET_GAP_RESULTS':
      return { ...state, gapResults: action.payload };

    case 'SET_ROADMAP':
      return { ...state, roadmap: { ...state.roadmap, items: action.payload } };

    case 'TOGGLE_ROADMAP_ITEM':
      const completedIds = state.roadmap.completedIds.includes(action.payload)
        ? state.roadmap.completedIds.filter(id => id !== action.payload)
        : [...state.roadmap.completedIds, action.payload];
      return { ...state, roadmap: { ...state.roadmap, completedIds } };

    case 'ADD_INTERVIEW_SESSION':
      return { ...state, interviewHistory: [action.payload, ...state.interviewHistory] };

    case 'SET_AI_AVAILABLE':
      return { ...state, settings: { ...state.settings, aiAvailable: action.payload } };

    case 'SET_THEME':
      return { ...state, settings: { ...state.settings, theme: action.payload } };

    case 'SHOW_TOAST':
      return { ...state, toast: action.payload };

    case 'CLEAR_TOAST':
      return { ...state, toast: null };

    case 'CLEAR_ALL_DATA':
      return { ...initialState };

    case 'IMPORT_DATA':
      return { ...initialState, ...action.payload, toast: null };

    default:
      return state;
  }
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(appReducer, null, loadState);

  // Persist to localStorage on every state change
  useEffect(() => {
    try {
      const { toast, ...persistable } = state;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(persistable));
    } catch (e) {
      console.warn('Failed to save state:', e);
    }
  }, [state]);

  // Auto-clear toast after 4 seconds
  useEffect(() => {
    if (state.toast) {
      const timer = setTimeout(() => dispatch({ type: 'CLEAR_TOAST' }), 4000);
      return () => clearTimeout(timer);
    }
  }, [state.toast]);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
}
