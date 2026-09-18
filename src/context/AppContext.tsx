import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User } from 'firebase/auth';
import type { ClassificationResult, ChatMessage, HistoryItem } from '../types';
import {
  isFirebaseConfigured,
  observeAuthState,
  signIn,
  signOut,
  signUp,
} from '../services/firebaseAuth';

interface AppContextType {
  authMode: 'guest' | 'login';
  setAuthMode: (mode: 'guest' | 'login') => void;
  authReady: boolean;
  authConfigured: boolean;
  authenticate: (email: string, password: string, createAccount: boolean) => Promise<void>;
  logout: () => void;
  userEmail: string;
  setUserEmail: (email: string) => void;
  ecoScore: number;
  incrementEcoScore: (points?: number) => void;
  messages: ChatMessage[];
  addMessage: (msg: ChatMessage) => void;
  clearMessages: () => void;
  history: HistoryItem[];
  addToHistory: (result: ClassificationResult) => void;
  clearHistory: () => void;
}

const DEFAULT_SAMPLE_HISTORY: HistoryItem[] = [
  {
    id: 'hist-1',
    itemDescription: 'Marigold flowers (Pooja waste)',
    category: 'Wet',
    timestamp: Date.now() - 3600000 * 2,
    result: {
      itemDescription: 'Marigold flowers (Pooja waste)',
      category: 'Wet',
      explanation: 'Marigold flowers (गेंदा फूल) are 100% biodegradable organic matter categorized as Nirmalya under SWM Rules 2016. Even when dried or wilted, they belong in Wet Waste for composting or temple upcycling.',
      disposalInstructions: [
        'Remove synthetic strings, plastic packaging, and foil ribbons.',
        'Deposit into your Green Bin (गीला कूड़ादान) or community Nirmalya Kalash.',
        'Divert to home composting or sacred flower incense upcycling.',
      ],
      ecoTip: 'Upcycling sacred flowers prevents organic matter from rotting in landfills and stops pesticide runoff into sacred rivers.',
      source: 'gemini',
      modelUsed: 'Gemini 2.5 Flash',
    },
  },
  {
    id: 'hist-2',
    itemDescription: 'Rinsed Amul milk pouch',
    category: 'Dry',
    timestamp: Date.now() - 3600000 * 5,
    result: {
      itemDescription: 'Rinsed Amul milk pouch',
      category: 'Dry',
      explanation: 'Virgin LDPE milk pouches are classified as Dry Waste (सूखा कचरा / Blue Bin). Rinsing and air-drying prevents odor and allows high-grade mechanical recycling.',
      disposalInstructions: [
        'Snip only a partial corner slit to avoid loose microplastic corners.',
        'Rinse the interior lightly with water to remove dairy residues.',
        'Place dry pouch into Blue Bin or hand to local Kabadiwala.',
      ],
      ecoTip: 'Recycled milk pouches are pelletized into durable industrial plastic piping and irrigation sheets.',
      source: 'rule-engine',
      modelUsed: 'Indian SWM 2016 Engine',
    },
  },
];

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [authMode, setAuthMode] = useState<'guest' | 'login'>('guest');
  const [userEmail, setUserEmail] = useState<string>('');
  const [authReady, setAuthReady] = useState(false);
  const [ecoScore, setEcoScore] = useState<number>(85);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [history, setHistory] = useState<HistoryItem[]>(DEFAULT_SAMPLE_HISTORY);

  useEffect(() => {
    const unsubscribe = observeAuthState((user: User | null) => {
      setUserEmail(user?.email ?? '');
      setAuthMode(user ? 'login' : 'guest');
      setAuthReady(true);
    });

    try {
      const savedScore = localStorage.getItem('ecoscan_score');
      if (savedScore) {
        setEcoScore(Number(savedScore));
      }
      const savedHist = localStorage.getItem('ecoscan_history');
      if (savedHist) {
        setHistory(JSON.parse(savedHist));
      }
    } catch {
      // Ignore storage errors in sandboxed iframes
    }
    return unsubscribe;
  }, []);

  const handleSetAuthMode = (mode: 'guest' | 'login') => {
    setAuthMode(mode);
  };

  const authenticate = async (email: string, password: string, createAccount: boolean) => {
    const user = createAccount ? await signUp(email, password) : await signIn(email, password);
    setUserEmail(user.email ?? email);
    setAuthMode('login');
  };

  const logout = () => {
    void signOut();
    setUserEmail('');
    setAuthMode('guest');
  };

  const incrementEcoScore = (points = 3) => {
    setEcoScore((prev) => {
      const next = Math.min(100, prev + points);
      try {
        localStorage.setItem('ecoscan_score', String(next));
      } catch {
        // Ignore
      }
      return next;
    });
  };

  const addMessage = (msg: ChatMessage) => {
    setMessages((prev) => [...prev, msg]);
  };

  const clearMessages = () => {
    setMessages([]);
  };

  const addToHistory = (result: ClassificationResult) => {
    if (authMode !== 'login') return; // Zero storage guarantee for Guest Mode
    const newItem: HistoryItem = {
      id: `hist-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      itemDescription: result.itemDescription,
      category: result.category,
      timestamp: Date.now(),
      result,
    };
    setHistory((prev) => {
      const updated = [newItem, ...prev];
      try {
        localStorage.setItem('ecoscan_history', JSON.stringify(updated.slice(0, 50)));
      } catch {
        // Ignore
      }
      return updated;
    });
  };

  const clearHistory = () => {
    setHistory([]);
    try {
      localStorage.removeItem('ecoscan_history');
    } catch {
      // Ignore
    }
  };

  return (
    <AppContext.Provider value={{
      authMode,
      setAuthMode: handleSetAuthMode,
      authReady,
      authConfigured: isFirebaseConfigured,
      authenticate,
      logout,
      userEmail,
      setUserEmail,
      ecoScore,
      incrementEcoScore,
      messages,
      addMessage,
      clearMessages,
      history,
      addToHistory,
      clearHistory,
    }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = (): AppContextType => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
