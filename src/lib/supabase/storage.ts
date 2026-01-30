import { createClient } from "./client";
import { compressImage, isCompressibleImage } from "@/lib/image-utils";

// Storage bucket names (must match exactly what's in Supabase - case sensitive)
export const STORAGE_BUCKETS = {
  INCIDENT_REPORTS: "Incident-report-photos",    // Private bucket
  WILDLIFE_SIGHTINGS: "Wildlife-sighting-photos", // Public bucket
} as const;

export type StorageBucket = typeof STORAGE_BUCKETS[keyof typeof STORAGE_BUCKETS];

// Allowed file types and size
export const ALLOWED_UPLOAD_TYPES = [
  "image/jpeg",
  "image/png",
  "image/heic",
  "video/mp4",
  "video/quicktime",
];

export const MAX_UPLOAD_SIZE = 10 * 1024 * 1024; // 10MB

// File type extensions mapping
const MIME_TO_EXT: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/heic": "heic",
  "video/mp4": "mp4",
  "video/quicktime": "mov",
};

/**
 * Generate a unique filename with date prefix and UUID
 */
export function generateStorageFilename(originalName: string, mimeType: string): string {
  const date = new Date();
  const datePrefix = date.toISOString().split("T")[0]; // YYYY-MM-DD
  const uniqueId = crypto.randomUUID().slice(0, 8);
  const ext = MIME_TO_EXT[mimeType] || originalName.split(".").pop() || "bin";
  return `${datePrefix}/${uniqueId}.${ext}`;
}

/**
 * Validate a file before upload
 */
export function validateUploadFile(file: File): { valid: boolean; error?: string } {
  if (!ALLOWED_UPLOAD_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: "File type not supported. Please upload JPG, PNG, HEIC, MP4, or MOV files.",
    };
  }

  if (file.size > MAX_UPLOAD_SIZE) {
    return {
      valid: false,
      error: `File too large. Maximum size is ${MAX_UPLOAD_SIZE / 1024 / 1024}MB.`,
    };
  }

  return { valid: true };
}

/**
 * Upload a file to Supabase Storage with progress tracking
 * Images are automatically compressed before upload (max 1200px, 80% quality)
 */
export async function uploadToStorage(
  file: File,
  bucket: StorageBucket,
  onProgress?: (progress: number) => void
): Promise<{ success: true; path: string; publicUrl?: string } | { success: false; error: string }> {
  // Validate file first
  const validation = validateUploadFile(file);
  if (!validation.valid) {
    return { success: false, error: validation.error! };
  }

  // Compress images before upload (max 1200px width/height, 80% quality)
  let fileToUpload = file;
  if (isCompressibleImage(file)) {
    try {
      fileToUpload = await compressImage(file, {
        maxWidth: 1200,
        maxHeight: 1200,
        quality: 0.8,
      });
    } catch (error) {
      console.warn("Image compression failed, uploading original:", error);
    }
  }

  const supabase = createClient();
  const filename = generateStorageFilename(fileToUpload.name, fileToUpload.type);

  try {
    // Start progress simulation since Supabase JS doesn't support upload progress natively
    let progressInterval: NodeJS.Timeout | null = null;
    let currentProgress = 0;

    if (onProgress) {
      // Simulate progress based on file size
      const estimatedTime = Math.max(1000, Math.min(5000, fileToUpload.size / 10000));
      const stepTime = estimatedTime / 90; // Get to 90% during upload

      progressInterval = setInterval(() => {
        currentProgress = Math.min(currentProgress + 1, 90);
        onProgress(currentProgress);
      }, stepTime);
    }

    // Upload the file (compressed if it was an image)
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(filename, fileToUpload, {
        cacheControl: "3600",
        upsert: false,
      });

    // Clear progress simulation
    if (progressInterval) {
      clearInterval(progressInterval);
    }

    if (error) {
      console.error("Supabase storage upload error:", error);
      return { success: false, error: error.message };
    }

    // Complete progress
    if (onProgress) {
      onProgress(100);
    }

    // For public buckets, get the public URL
    if (bucket === STORAGE_BUCKETS.WILDLIFE_SIGHTINGS) {
      const { data: urlData } = supabase.storage
        .from(bucket)
        .getPublicUrl(data.path);

      return {
        success: true,
        path: data.path,
        publicUrl: urlData.publicUrl,
      };
    }

    // For private buckets, just return the path
    return {
      success: true,
      path: data.path,
    };
  } catch (error) {
    console.error("Upload error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Upload failed",
    };
  }
}

/**
 * Upload multiple files to storage
 */
export async function uploadMultipleToStorage(
  files: File[],
  bucket: StorageBucket,
  onFileProgress?: (fileIndex: number, progress: number) => void
): Promise<Array<{ file: File; result: Awaited<ReturnType<typeof uploadToStorage>> }>> {
  const results: Array<{ file: File; result: Awaited<ReturnType<typeof uploadToStorage>> }> = [];

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const result = await uploadToStorage(file, bucket, (progress) => {
      onFileProgress?.(i, progress);
    });
    results.push({ file, result });
  }

  return results;
}

/**
 * Delete a file from storage
 */
export async function deleteFromStorage(
  path: string,
  bucket: StorageBucket
): Promise<{ success: boolean; error?: string }> {
  const supabase = createClient();

  const { error } = await supabase.storage.from(bucket).remove([path]);

  if (error) {
    console.error("Delete from storage error:", error);
    return { success: false, error: error.message };
  }

  return { success: true };
}
