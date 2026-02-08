import { useState, useCallback } from "react";

const STORAGE_KEY = "buchclub-username";

export function useUserName() {
  const [userName, setUserNameState] = useState<string | null>(() => {
    return localStorage.getItem(STORAGE_KEY);
  });

  const setUserName = useCallback((name: string) => {
    localStorage.setItem(STORAGE_KEY, name);
    setUserNameState(name);
  }, []);

  const clearUserName = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setUserNameState(null);
  }, []);

  return { userName, setUserName, clearUserName };
}
