// hooks/use-indexdb.ts
import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { IndexedDBManager, IndexedDBGeneration } from '@/lib/storage/indexdb';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

const dbManager = new IndexedDBManager();

export function useIndexDB() {
    const { user } = useUser();
    const queryClient = useQueryClient();
    const [isReady, setIsReady] = useState(false);

    // Initialize IndexedDB
    useEffect(() => {
        const init = async () => {
            await dbManager.initialize();
            setIsReady(true);
        };
        init();
    }, []);

    // Save generation to IndexedDB
    const saveGeneration = useMutation({
        mutationFn: async (data: Omit<IndexedDBGeneration, 'id' | 'createdAt' | 'synced'>) => {
            if (!user?.id) throw new Error('User not authenticated');
            return await dbManager.saveGeneration({
                ...data,
                userId: user.id,
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['generations'] });
            queryClient.invalidateQueries({ queryKey: ['storage-stats'] });
        },
    });

    // Get generations from IndexedDB
    const { data: generations, isLoading: generationsLoading } = useQuery({
        queryKey: ['generations', user?.id],
        queryFn: async () => {
            if (!user?.id) return [];
            return await dbManager.getGenerations(user.id);
        },
        enabled: isReady && !!user?.id,
    });

    // Get storage statistics
    const { data: storageStats, isLoading: statsLoading } = useQuery({
        queryKey: ['storage-stats', user?.id],
        queryFn: async () => {
            if (!user?.id) return null;
            return await dbManager.getStorageStats(user.id);
        },
        enabled: isReady && !!user?.id,
    });

    // Sync to server
    const syncToServer = useMutation({
        mutationFn: async () => {
            const unsynced = await dbManager.getUnsyncedGenerations();

            for (const item of unsynced) {
                try {
                    // Convert Blob to base64 if necessary
                    let resultData = item.result;
                    if (item.result instanceof Blob) {
                        resultData = await blobToBase64(item.result);
                    }

                    await axios.post('/api/database/sync', {
                        ...item,
                        result: resultData,
                    });

                    await dbManager.markAsSynced(item.id);
                } catch (error) {
                    console.error(`Failed to sync item ${item.id}:`, error);
                    throw error;
                }
            }

            return unsynced.length;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['generations'] });
        },
    });

    // Delete generation
    const deleteGeneration = useMutation({
        mutationFn: async (id: string) => {
            await dbManager.deleteGeneration(id);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['generations'] });
            queryClient.invalidateQueries({ queryKey: ['storage-stats'] });
        },
    });

    // Clear all data
    const clearAll = useMutation({
        mutationFn: async () => {
            await dbManager.clearAll();
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['generations'] });
            queryClient.invalidateQueries({ queryKey: ['storage-stats'] });
        },
    });

    return {
        isReady,
        generations,
        storageStats,
        isLoading: generationsLoading || statsLoading,
        saveGeneration: saveGeneration.mutate,
        syncToServer: syncToServer.mutate,
        deleteGeneration: deleteGeneration.mutate,
        clearAll: clearAll.mutate,
        isSaving: saveGeneration.isPending,
        isSyncing: syncToServer.isPending,
        isDeleting: deleteGeneration.isPending,
        isClearing: clearAll.isPending,
    };
}

// Hook for auto-syncing
export function useAutoSync(interval = 5 * 60 * 1000) { // 5 minutes default
    const { syncToServer, isReady } = useIndexDB();
    const { user } = useUser();

    useEffect(() => {
        if (!isReady || !user) return;

        // Initial sync
        syncToServer();

        // Set up periodic sync
        const intervalId = setInterval(() => {
            syncToServer();
        }, interval);

        return () => clearInterval(intervalId);
    }, [isReady, user, syncToServer, interval]);
}

// Hook for handling file uploads to IndexedDB
export function useFileStorage() {
    const { saveGeneration } = useIndexDB();
    const { user } = useUser();

    const saveFile = async (file: File, type: 'image' | 'video' | 'audio', metadata?: any) => {
        if (!user?.id) throw new Error('User not authenticated');

        return saveGeneration({
            type,
            prompt: metadata?.prompt || file.name,
            result: file,
            metadata: {
                fileName: file.name,
                fileSize: file.size,
                fileType: file.type,
                ...metadata,
            },
        });
    };

    const saveImageGeneration = async (imageUrl: string, prompt: string, model: string, metadata?: any) => {
        if (!user?.id) throw new Error('User not authenticated');

        // Convert image URL to Blob
        const response = await fetch(imageUrl);
        const blob = await response.blob();

        return saveGeneration({
            type: 'image',
            prompt,
            result: blob,
            model,
            metadata,
        });
    };

    const saveVideoGeneration = async (videoUrl: string, prompt: string, metadata?: any) => {
        if (!user?.id) throw new Error('User not authenticated');

        return saveGeneration({
            type: 'video',
            prompt,
            result: videoUrl,
            metadata,
        });
    };

    const saveAudioGeneration = async (audioUrl: string, prompt: string, metadata?: any) => {
        if (!user?.id) throw new Error('User not authenticated');

        return saveGeneration({
            type: 'audio',
            prompt,
            result: audioUrl,
            metadata,
        });
    };

    const saveCodeGeneration = async (code: string, prompt: string, metadata?: any) => {
        if (!user?.id) throw new Error('User not authenticated');

        return saveGeneration({
            type: 'code',
            prompt,
            result: code,
            metadata,
        });
    };

    const saveConversation = async (messages: any[], prompt: string, metadata?: any) => {
        if (!user?.id) throw new Error('User not authenticated');

        return saveGeneration({
            type: 'conversation',
            prompt,
            result: JSON.stringify(messages),
            metadata,
        });
    };

    return {
        saveFile,
        saveImageGeneration,
        saveVideoGeneration,
        saveAudioGeneration,
        saveCodeGeneration,
        saveConversation,
    };
}

// Helper function to convert Blob to base64
async function blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
}