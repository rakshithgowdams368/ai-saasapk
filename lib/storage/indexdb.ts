// lib/storage/indexdb.ts
import { openDB, IDBPDatabase } from 'idb';

const DB_NAME = 'nexusai-storage';
const DB_VERSION = 1;
const STORE_NAME = 'generations';

export interface IndexedDBGeneration {
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

export class IndexedDBManager {
  private db: IDBPDatabase | null = null;

  async initialize() {
    if (this.db) return;

    this.db = await openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const store = db.createObjectStore(STORE_NAME, {
            keyPath: 'id',
            autoIncrement: false,
          });
          
          store.createIndex('userId', 'userId');
          store.createIndex('type', 'type');
          store.createIndex('createdAt', 'createdAt');
          store.createIndex('synced', 'synced');
          store.createIndex('userId-type', ['userId', 'type']);
        }
      },
    });
  }

  async saveGeneration(data: Omit<IndexedDBGeneration, 'id' | 'createdAt' | 'synced'>): Promise<string> {
    await this.initialize();
    if (!this.db) throw new Error('Database not initialized');

    const id = `gen_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const generationData: IndexedDBGeneration = {
      ...data,
      id,
      createdAt: new Date(),
      synced: false,
    };

    await this.db.put(STORE_NAME, generationData);
    return id;
  }

  async getGenerations(userId: string, type?: IndexedDBGeneration['type']): Promise<IndexedDBGeneration[]> {
    await this.initialize();
    if (!this.db) throw new Error('Database not initialized');

    if (type) {
      const index = this.db.transaction(STORE_NAME).store.index('userId-type');
      return await index.getAll([userId, type]);
    } else {
      const index = this.db.transaction(STORE_NAME).store.index('userId');
      return await index.getAll(userId);
    }
  }

  async getUnsyncedGenerations(): Promise<IndexedDBGeneration[]> {
    await this.initialize();
    if (!this.db) throw new Error('Database not initialized');

    const index = this.db.transaction(STORE_NAME).store.index('synced');
    return await index.getAll(false);
  }

  async markAsSynced(id: string): Promise<void> {
    await this.initialize();
    if (!this.db) throw new Error('Database not initialized');

    const tx = this.db.transaction(STORE_NAME, 'readwrite');
    const store = tx.store;
    const generation = await store.get(id);

    if (generation) {
      generation.synced = true;
      await store.put(generation);
    }
  }

  async deleteGeneration(id: string): Promise<void> {
    await this.initialize();
    if (!this.db) throw new Error('Database not initialized');

    await this.db.delete(STORE_NAME, id);
  }

  async clearAll(): Promise<void> {
    await this.initialize();
    if (!this.db) throw new Error('Database not initialized');

    await this.db.clear(STORE_NAME);
  }

  async getStorageStats(userId: string) {
    const generations = await this.getGenerations(userId);
    let totalSize = 0;
    const counts = {
      image: 0,
      video: 0,
      audio: 0,
      code: 0,
      conversation: 0,
    };

    generations.forEach(gen => {
      counts[gen.type]++;
      if (gen.result instanceof Blob) {
        totalSize += gen.result.size;
      } else if (typeof gen.result === 'string') {
        totalSize += new Blob([gen.result]).size;
      }
    });

    return { totalSize, counts };
  }
}

export const indexedDBManager = new IndexedDBManager();