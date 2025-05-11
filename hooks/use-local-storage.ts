// hooks/use-local-storage.ts
import { useState, useEffect } from 'react';

export function useLocalStorage<T>(key: string, initialValue: T) {
    // State to store our value
    // Pass initial state function to useState so logic is only executed once
    const [storedValue, setStoredValue] = useState<T>(() => {
        if (typeof window === 'undefined') {
            return initialValue;
        }

        try {
            // Get from local storage by key
            const item = window.localStorage.getItem(key);
            // Parse stored json or if none return initialValue
            return item ? JSON.parse(item) : initialValue;
        } catch (error) {
            // If error also return initialValue
            console.error(error);
            return initialValue;
        }
    });

    // useEffect to update local storage when the state changes
    useEffect(() => {
        if (typeof window === 'undefined') {
            return;
        }

        try {
            // Save state
            window.localStorage.setItem(key, JSON.stringify(storedValue));
        } catch (error) {
            console.error(error);
        }
    }, [key, storedValue]);

    return [storedValue, setStoredValue] as const;
}

// Hook for managing generation history in localStorage
export function useGenerationHistory() {
    const [history, setHistory] = useLocalStorage<Array<{
        id: string;
        type: 'image' | 'video' | 'audio' | 'code' | 'conversation';
        prompt: string;
        result: string;
        model?: string;
        timestamp: number;
    }>>('generation-history', []);

    const addToHistory = (item: {
        type: 'image' | 'video' | 'audio' | 'code' | 'conversation';
        prompt: string;
        result: string;
        model?: string;
    }) => {
        const newItem = {
            id: `history-${Date.now()}`,
            timestamp: Date.now(),
            ...item,
        };

        setHistory(prev => [newItem, ...prev].slice(0, 50)); // Keep last 50 items
    };

    const clearHistory = () => {
        setHistory([]);
    };

    const getHistoryByType = (type: string) => {
        return history.filter(item => item.type === type);
    };

    return {
        history,
        addToHistory,
        clearHistory,
        getHistoryByType,
    };
}

// Hook for managing user preferences
export function useUserPreferences() {
    const [preferences, setPreferences] = useLocalStorage('user-preferences', {
        theme: 'dark',
        defaultModel: 'chatgpt',
        defaultResolution: '1024x1024',
        autoSave: true,
        notifications: true,
    });

    const updatePreference = (key: string, value: any) => {
        setPreferences(prev => ({
            ...prev,
            [key]: value,
        }));
    };

    return {
        preferences,
        updatePreference,
    };
}