// components/storage/local-storage-manager.tsx
"use client";

import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { useIndexedDB } from './indexdb-provider';
import axios from 'axios';

interface StorageStats {
  totalSize: number;
  imageCount: number;
  videoCount: number;
  audioCount: number;
  codeCount: number;
  conversationCount: number;
}

interface SyncStatus {
  isSyncing: boolean;
  lastSyncTime: Date | null;
  pendingItems: number;
  error: string | null;
}

export function LocalStorageManager() {
  const { user } = useUser();
  const { 
    isReady, 
    getGenerations, 
    getUnsyncedGenerations, 
    markAsSynced 
  } = useIndexedDB();

  const [storageStats, setStorageStats] = useState<StorageStats>({
    totalSize: 0,
    imageCount: 0,
    videoCount: 0,
    audioCount: 0,
    codeCount: 0,
    conversationCount: 0,
  });

  const [syncStatus, setSyncStatus] = useState<SyncStatus>({
    isSyncing: false,
    lastSyncTime: null,
    pendingItems: 0,
    error: null,
  });

  // Calculate storage statistics
  useEffect(() => {
    const calculateStats = async () => {
      if (!isReady || !user?.id) return;

      try {
        const types = ['image', 'video', 'audio', 'code', 'conversation'] as const;
        let totalSize = 0;
        const counts: Partial<StorageStats> = {};

        for (const type of types) {
          const generations = await getGenerations(type, user.id);
          counts[`${type}Count`] = generations.length;
          
          // Calculate approximate size
          generations.forEach(gen => {
            if (gen.result instanceof Blob) {
              totalSize += gen.result.size;
            } else if (typeof gen.result === 'string') {
              totalSize += new Blob([gen.result]).size;
            }
          });
        }

        setStorageStats({
          totalSize,
          imageCount: counts.imageCount || 0,
          videoCount: counts.videoCount || 0,
          audioCount: counts.audioCount || 0,
          codeCount: counts.codeCount || 0,
          conversationCount: counts.conversationCount || 0,
        });
      } catch (error) {
        console.error('Failed to calculate storage stats:', error);
      }
    };

    calculateStats();
  }, [isReady, user, getGenerations]);

  // Sync data to database
  const syncToDatabase = async () => {
    if (!isReady || syncStatus.isSyncing) return;

    try {
      setSyncStatus(prev => ({ ...prev, isSyncing: true, error: null }));
      
      const unsyncedItems = await getUnsyncedGenerations();
      setSyncStatus(prev => ({ ...prev, pendingItems: unsyncedItems.length }));

      for (const item of unsyncedItems) {
        try {
          // Convert Blob to base64 for API transmission
          let resultData = item.result;
          if (item.result instanceof Blob) {
            resultData = await blobToBase64(item.result);
          }

          // Send to API
          await axios.post('/api/database/sync', {
            ...item,
            result: resultData,
          });

          // Mark as synced
          await markAsSynced(item.id);
        } catch (error) {
          console.error(`Failed to sync item ${item.id}:`, error);
        }
      }

      setSyncStatus(prev => ({
        ...prev,
        isSyncing: false,
        lastSyncTime: new Date(),
        pendingItems: 0,
      }));
    } catch (error) {
      setSyncStatus(prev => ({
        ...prev,
        isSyncing: false,
        error: 'Sync failed. Please try again.',
      }));
      console.error('Sync error:', error);
    }
  };

  // Auto-sync periodically
  useEffect(() => {
    if (!isReady || !user) return;

    // Initial sync
    syncToDatabase();

    // Set up periodic sync (every 5 minutes)
    const interval = setInterval(syncToDatabase, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [isReady, user]);

  // Helper function to convert Blob to base64
  const blobToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  // Format bytes to human readable size
  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return {
    storageStats,
    syncStatus,
    syncToDatabase,
    formatBytes,
  };
}

// Hook to use storage manager
export function useLocalStorage() {
  const manager = LocalStorageManager();
  return manager;
}