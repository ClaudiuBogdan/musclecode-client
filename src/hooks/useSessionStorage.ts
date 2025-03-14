import { useState, useEffect, useCallback } from "react";

type SetValue<T> = T | ((val: T) => T);

/**
 * Custom hook for storing and retrieving values from session storage
 * @param key The key to store the value under in session storage
 * @param initialValue The initial value to use if no value is found in session storage
 * @returns A tuple containing the current value and a function to update it
 */
function useSessionStorage<T>(
  key: string,
  initialValue: T
): [T, (value: SetValue<T>) => void, () => void] {
  // Get from session storage then parse stored json or return initialValue
  const readValue = useCallback((): T => {
    // Prevent build error on server
    if (typeof window === "undefined") {
      return initialValue;
    }

    try {
      const item = window.sessionStorage.getItem(key);
      return item ? (JSON.parse(item) as T) : initialValue;
    } catch (error) {
      console.warn(`Error reading sessionStorage key "${key}":`, error);
      return initialValue;
    }
  }, [initialValue, key]);

  // State to store our value
  const [storedValue, setStoredValue] = useState<T>(readValue);

  // Return a wrapped version of useState's setter function that persists the new value to sessionStorage
  const setValue = useCallback(
    (value: SetValue<T>) => {
      try {
        // Allow value to be a function so we have the same API as useState
        const valueToStore =
          value instanceof Function ? value(storedValue) : value;

        // Save state
        setStoredValue(valueToStore);

        // Save to session storage
        if (typeof window !== "undefined") {
          window.sessionStorage.setItem(key, JSON.stringify(valueToStore));

          // Dispatch a custom event so other instances can update
          window.dispatchEvent(new Event("session-storage-change"));
        }
      } catch (error) {
        console.warn(`Error setting sessionStorage key "${key}":`, error);
      }
    },
    [key, storedValue]
  );

  // Remove from session storage
  const removeValue = useCallback(() => {
    try {
      if (typeof window !== "undefined") {
        window.sessionStorage.removeItem(key);
        setStoredValue(initialValue);
        window.dispatchEvent(new Event("session-storage-change"));
      }
    } catch (error) {
      console.warn(`Error removing sessionStorage key "${key}":`, error);
    }
  }, [initialValue, key]);

  useEffect(() => {
    setStoredValue(readValue());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Listen for changes to this specific key in other tabs/windows
  useEffect(() => {
    const handleStorageChange = () => {
      setStoredValue(readValue());
    };

    window.addEventListener("session-storage-change", handleStorageChange);

    return () => {
      window.removeEventListener("session-storage-change", handleStorageChange);
    };
  }, [readValue]);

  return [storedValue, setValue, removeValue];
}

export default useSessionStorage;
