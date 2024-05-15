import { useCallback, useEffect, useState } from 'react';

import type { Dispatch, SetStateAction } from 'react';
import useEventCallback from './useEventCallback';
import useEventListener from './useEventListener';

declare global {
  // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
  interface WindowEventMap {
    'local-storage': CustomEvent;
  }
}

function useLocalStorage<T>(
  key: string,
  initialValue: T | (() => T)
): [T, Dispatch<SetStateAction<T>>, () => void] {
  const serializer = useCallback<(value: T) => string>(
    (value) => JSON.stringify(value),
    []
  );

  const deserializer = useCallback<(value: string) => T>(
    (value) => {
      let parsed: unknown;
      try {
        parsed = JSON.parse(value);
      } catch (error) {
        console.error('Error parsing JSON:', error);
        const defaultValue =
          initialValue instanceof Function ? initialValue() : initialValue;
        return defaultValue; // Return initialValue if parsing fails
      }

      return parsed as T;
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [initialValue]
  );

  // Get from local storage then
  // parse stored json or return initialValue
  const readValue = useCallback((): T => {
    const initialValueToUse =
      initialValue instanceof Function ? initialValue() : initialValue;

    try {
      const raw = window.localStorage.getItem(key);
      return raw ? deserializer(raw) : initialValueToUse;
    } catch (error) {
      console.warn(`Error reading localStorage key “${key}”:`, error);
      return initialValueToUse;
    }
  }, [initialValue, key, deserializer]);

  const [storedValue, setStoredValue] = useState(() =>
    initialValue instanceof Function ? initialValue() : initialValue
  );

  // Return a wrapped version of useState's setter function that ...
  // ... persists the new value to localStorage.
  const setValue: Dispatch<SetStateAction<T>> = useEventCallback((value) => {
    try {
      // Allow value to be a function so we have the same API as useState
      const newValue = value instanceof Function ? value(readValue()) : value;

      // Save to local storage
      window.localStorage.setItem(key, serializer(newValue));

      // Save state
      setStoredValue(newValue);

      // We dispatch a custom event so every similar useLocalStorage hook is notified
      window.dispatchEvent(new StorageEvent('local-storage', { key }));
    } catch (error) {
      console.warn(`Error setting localStorage key “${key}”:`, error);
    }
  });

  const removeValue = useEventCallback(() => {
    // Prevent build error "window is undefined" but keeps working

    const defaultValue =
      initialValue instanceof Function ? initialValue() : initialValue;

    // Remove the key from local storage
    window.localStorage.removeItem(key);

    // Save state with default value
    setStoredValue(defaultValue);

    // We dispatch a custom event so every similar useLocalStorage hook is notified
    window.dispatchEvent(new StorageEvent('local-storage', { key }));
  });

  useEffect(() => {
    setStoredValue(readValue());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  const handleStorageChange = useCallback(
    (event: StorageEvent | CustomEvent) => {
      if ((event as StorageEvent).key && (event as StorageEvent).key !== key) {
        return;
      }
      setStoredValue(readValue());
    },
    [key, readValue]
  );

  // this only works for other documents, not the current one
  useEventListener('storage', handleStorageChange);

  // this is a custom event, triggered in writeValueToLocalStorage
  // See: useLocalStorage()
  useEventListener('local-storage', handleStorageChange);

  return [storedValue, setValue, removeValue];
}

export default useLocalStorage;
