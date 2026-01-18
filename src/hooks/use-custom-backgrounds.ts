'use client';

import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'custom-background-images';
const MAX_IMAGES = 1;
const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB

export interface CustomImage {
    id: string;
    name: string;
    dataUrl: string;
}

interface UseCustomBackgroundsReturn {
    images: CustomImage[];
    isLoading: boolean;
    addImage: (file: File) => Promise<{ success: boolean; error?: string; image?: CustomImage }>;
    addImageByUrl: (url: string) => Promise<{ success: boolean; error?: string; image?: CustomImage }>;
    removeImage: (id: string) => void;
    canAddMore: boolean;
}

function generateId(): string {
    return `custom-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

function fileToDataUrl(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

function isValidImageUrl(url: string): boolean {
    try {
        const parsed = new URL(url);
        return parsed.protocol === 'http:' || parsed.protocol === 'https:';
    } catch {
        return false;
    }
}

export function useCustomBackgrounds(): UseCustomBackgroundsReturn {
    const [images, setImages] = useState<CustomImage[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Load from localStorage on mount
    useEffect(() => {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved) {
                const parsed = JSON.parse(saved) as CustomImage[];
                setImages(parsed);
            }
        } catch (error) {
            console.error('Failed to load custom backgrounds:', error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Save to localStorage
    const saveToStorage = useCallback((newImages: CustomImage[]) => {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(newImages));
        } catch (error) {
            console.error('Failed to save custom backgrounds:', error);
        }
    }, []);

    // Add image from file
    const addImage = useCallback(
        async (file: File): Promise<{ success: boolean; error?: string; image?: CustomImage }> => {
            // Check limit (Skipped for replacement mode)
            // if (images.length >= MAX_IMAGES) { return { success: false, error: 'limitReached' }; }

            // Validate file type
            if (!file.type.startsWith('image/')) {
                return { success: false, error: 'invalidType' };
            }

            // Validate file size
            if (file.size > MAX_FILE_SIZE) {
                return { success: false, error: 'fileTooLarge' };
            }

            try {
                const dataUrl = await fileToDataUrl(file);
                const newImage: CustomImage = {
                    id: generateId(),
                    name: file.name,
                    dataUrl,
                };

                const newImages = [newImage]; // Replace existing images (Single slot mode)
                setImages(newImages);
                saveToStorage(newImages);

                return { success: true, image: newImage };
            } catch (error) {
                console.error('Failed to process image:', error);
                return { success: false, error: 'processingError' };
            }
        },
        [images, saveToStorage]
    );

    // Add image from URL
    const addImageByUrl = useCallback(
        async (url: string): Promise<{ success: boolean; error?: string }> => {
            // Check limit (Skipped for replacement mode)
            // if (images.length >= MAX_IMAGES) { return { success: false, error: 'limitReached' }; }

            // Validate URL format
            if (!isValidImageUrl(url)) {
                return { success: false, error: 'invalidUrl' };
            }

            try {
                // Extract filename from URL
                const urlObj = new URL(url);
                const pathParts = urlObj.pathname.split('/');
                const name = pathParts[pathParts.length - 1] || 'image';

                const newImage: CustomImage = {
                    id: generateId(),
                    name,
                    dataUrl: url, // Store URL directly instead of base64
                };

                const newImages = [newImage]; // Replace existing images
                setImages(newImages);
                saveToStorage(newImages);

                return { success: true, image: newImage };
            } catch (error) {
                console.error('Failed to add image by URL:', error);
                return { success: false, error: 'processingError' };
            }
        },
        [images, saveToStorage]
    );

    // Remove image
    const removeImage = useCallback(
        (id: string) => {
            const newImages = images.filter((img) => img.id !== id);
            setImages(newImages);
            saveToStorage(newImages);
        },
        [images, saveToStorage]
    );

    return {
        images,
        isLoading,
        addImage,
        addImageByUrl,
        removeImage,
        canAddMore: true, // Always allow adding for replacement mode
    };
}

