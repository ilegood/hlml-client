import { useState, useCallback } from "react";

const STORAGE_KEY = "customReactions";
const DEFAULT_REACTIONS = ["👍", "❤️", "😂"];

const loadReactions = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch { /* empty */ }
  return DEFAULT_REACTIONS;
};

export const useCustomReactions = () => {
  const [reactions, setReactions] = useState(loadReactions);

  const saveReactions = useCallback((newReactions) => {
    setReactions(newReactions);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newReactions));
  }, []);

  const resetReactions = useCallback(() => {
    saveReactions(DEFAULT_REACTIONS);
  }, [saveReactions]);

  return { reactions, saveReactions, resetReactions, DEFAULT_REACTIONS };
};
