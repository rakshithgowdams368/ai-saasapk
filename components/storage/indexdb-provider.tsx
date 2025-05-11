// components/storage/indexdb-provider.tsx
"use client";

import { createContext, useContext, useEffect, useState } from 'react';
import { openDB, IDBPDatabase } from 'idb';

interface GenerationData {
  id: string;
  userId: string;
  type: 'image' | 'video' | 'audio' | 'code' | 'conversation';
  prompt: string;
  result: string | Blob;
  model?: string;
  metadata?: Record<string, any>;
  createdAt: Date;
  synced: boolean;
}

interface IndexedDBContextType {
  db: IDBPDatabase | null;
  isReady: boolean;
  saveGeneration: (data: Omit<GenerationData, 'id' | 'createdAt' | 'synced'>) => Promise<string>;
  getGenerations: (type: GenerationData['type'], userId: string) => Promise<GenerationData[]>;
  getUnsyncedGenerations: () => Promise<GenerationData[]>;
  markAsSynced: (id: string) => Promise<void>;
  deleteGeneration: (id: string) => Promise<void>;
  clearAllData: () => Promise<void>;
}

const IndexedDBContext = createContext<IndexedDBContextType | null>(null);

const DB_NAME = 'nexusai-storage';
const DB_VERSION = 1;
const STORE_NAME = 'generations';

export function IndexedDBProvider({ children }: { children: React.ReactNode }) {
  const [db, setDb] = useState<IDBPDatabase | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const initDB = async () => {
      try {
        const database = await openDB(DB_NAME, DB_VERSION, {
          upgrade(db) {
            // Create object store if it doesn't exist
            if (!db.objectStoreNames.contains(STORE_NAME)) {
              const store = db.createObjectStore(STORE_NAME, {
                keyPath: 'id',
                autoIncrement: false,
              });
              
              // Create indexes for efficient querying
              store.createIndex('userId', 'userId');
              store.createIndex('type', 'type');
              store.createIndex('createdAt', 'createdAt');
              store.createIndex('synced', 'synced');
              store.createIndex('userId-type', ['userId', 'type']);
            }
          },
        });

        setDb(database);
        setIsReady(true);
      } catch (error) {
        console.error('Failed to initialize IndexedDB:', error);
      }
    };

    initDB();

    return () => {
      db?.close();
    };
  }, []);

  const saveGeneration = async (
    data: Omit<GenerationData, 'id' | 'createdAt' | 'synced'>
  ): Promise<string> => {
    if (!db) throw new Error('Database not initialized');

    const id = `gen_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const generationData: GenerationData = {
      ...data,
      id,
      createdAt: new Date(),
      synced: false,
    };

    await db.put(STORE_NAME, generationData);
    return id;
  };

  const getGenerations = async (
    type: GenerationData['type'],
    userId: string
  ): Promise<GenerationData[]> => {
    if (!db) throw new Error('Database not initialized');

    const index = db.transaction(STORE_NAME).store.index('userId-type');
    const generations = await index.getAll([userId, type]);
    
    // Sort by creation date (newest first)
    return generations.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  };

  const getUnsyncedGenerations = async (): Promise<GenerationData[]> => {
    if (!db) throw new Error('Database not initialized');

    const index = db.transaction(STORE_NAME).store.index('synced');
    return await index.getAll(false);
  };

  const markAsSynced = async (id: string): Promise<void> => {
    if (!db) throw new Error('Database not initialized');

    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.store;
    const generation = await store.get(id);

    if (generation) {
      generation.synced = true;
      await store.put(generation);
    }
  };

  const deleteGeneration = async (id: string): Promise<void> => {
    if (!db) throw new Error('Database not initialized');
    await db.delete(STORE_NAME, id);
  };

  const clearAllData = async (): Promise<void> => {
    if (!db) throw new Error('Database not initialized');
    await db.clear(STORE_NAME);
  };

  const value: IndexedDBContextType = {
    db,
    isReady,
    saveGeneration,
    getGenerations,
    getUnsyncedGenerations,
    markAsSynced,
    deleteGeneration,
    clearAllData,
  };

  return (
    <IndexedDBContext.Provider value={value}>
      {children}
    </IndexedDBContext.Provider>
  );
}

export function useIndexedDB() {
  const context = useContext(IndexedDBContext);
  if (!context) {
    throw new Error('useIndexedDB must be used within IndexedDBProvider');
  }
  return context;
}