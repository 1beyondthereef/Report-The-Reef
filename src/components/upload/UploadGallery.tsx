"use client";

import { useState, useCallback, useRef } from "react";
import { Upload, X, Image as ImageIcon, Film, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ALLOWED_FILE_TYPES, MAX_FILE_SIZE, MAX_FILES_PER_INCIDENT } from "@/lib/constants";

interface UploadedFile {
  id: string;
  file: File;
  preview: string;
  progress: number;
  error?: string;
  uploaded?: boolean;
  url?: string;
}

interface UploadGalleryProps {
  onFilesChange: (files: UploadedFile[]) => void;
  maxFiles?: number;
  className?: string;
}

export function UploadGallery({
  onFilesChange,
  maxFiles = MAX_FILES_PER_INCIDENT,
  className,
}: UploadGalleryProps) {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): string | null => {
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      return "File type not supported. Please upload images or videos.";
    }
    if (file.size > MAX_FILE_SIZE) {
      return `File too large. Maximum size is ${MAX_FILE_SIZE / 1024 / 1024}MB.`;
    }
    return null;
  };

  const createPreview = (file: File): string => {
    return URL.createObjectURL(file);
  };

  const simulateUpload = async (uploadedFile: UploadedFile): Promise<UploadedFile> => {
    // Simulate upload progress
    return new Promise((resolve) => {
      let progress = 0;
      const interval = setInterval(() => {
        progress += 10;
        if (progress >= 100) {
          clearInterval(interval);
          resolve({
            ...uploadedFile,
            progress: 100,
            uploaded: true,
            url: uploadedFile.preview, // In real app, this would be the server URL
          });
        }
        setFiles((prev) =>
          prev.map((f) => (f.id === uploadedFile.id ? { ...f, progress } : f))
        );
      }, 100);
    });
  };

  const addFiles = useCallback(
    async (newFiles: FileList | File[]) => {
      const fileArray = Array.from(newFiles);
      const remainingSlots = maxFiles - files.length;

      if (remainingSlots <= 0) {
        return;
      }

      const filesToAdd = fileArray.slice(0, remainingSlots);
      const newUploadedFiles: UploadedFile[] = [];

      for (const file of filesToAdd) {
        const error = validateFile(file);
        const uploadedFile: UploadedFile = {
          id: Math.random().toString(36).substring(2, 15),
          file,
          preview: createPreview(file),
          progress: error ? 0 : 0,
          error: error || undefined,
        };
        newUploadedFiles.push(uploadedFile);
      }

      const updatedFiles = [...files, ...newUploadedFiles];
      setFiles(updatedFiles);
      onFilesChange(updatedFiles);

      // Upload files without errors
      for (const uploadedFile of newUploadedFiles) {
        if (!uploadedFile.error) {
          const uploaded = await simulateUpload(uploadedFile);
          setFiles((prev) =>
            prev.map((f) => (f.id === uploaded.id ? uploaded : f))
          );
        }
      }
    },
    [files, maxFiles, onFilesChange]
  );

  const removeFile = useCallback(
    (id: string) => {
      const file = files.find((f) => f.id === id);
      if (file) {
        URL.revokeObjectURL(file.preview);
      }
      const updatedFiles = files.filter((f) => f.id !== id);
      setFiles(updatedFiles);
      onFilesChange(updatedFiles);
    },
    [files, onFilesChange]
  );

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files.length > 0) {
      addFiles(e.dataTransfer.files);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      addFiles(e.target.files);
      // Reset input so the same file can be selected again
      e.target.value = "";
    }
  };

  const isVideo = (file: File) => file.type.startsWith("video/");

  return (
    <div className={cn("space-y-4", className)}>
      {/* Drop zone */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={cn(
          "flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-6 transition-colors",
          isDragging
            ? "border-primary bg-primary/5"
            : "border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50",
          files.length >= maxFiles && "pointer-events-none opacity-50"
        )}
      >
        <input
          ref={inputRef}
          type="file"
          accept={ALLOWED_FILE_TYPES.join(",")}
          multiple
          onChange={handleInputChange}
          className="hidden"
          disabled={files.length >= maxFiles}
        />
        <Upload className="mb-2 h-8 w-8 text-muted-foreground" />
        <p className="text-sm font-medium">
          {isDragging ? "Drop files here" : "Drag & drop or click to upload"}
        </p>
        <p className="text-xs text-muted-foreground">
          Images or videos up to {MAX_FILE_SIZE / 1024 / 1024}MB each
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          {files.length} / {maxFiles} files uploaded
        </p>
      </div>

      {/* File previews */}
      {files.length > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {files.map((uploadedFile) => (
            <div
              key={uploadedFile.id}
              className="group relative aspect-square overflow-hidden rounded-lg border bg-muted"
            >
              {/* Preview */}
              {isVideo(uploadedFile.file) ? (
                <div className="flex h-full items-center justify-center">
                  <Film className="h-8 w-8 text-muted-foreground" />
                </div>
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={uploadedFile.preview}
                  alt="Upload preview"
                  className="h-full w-full object-cover"
                />
              )}

              {/* Progress overlay */}
              {!uploadedFile.uploaded && !uploadedFile.error && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                  <div className="text-center text-white">
                    <Loader2 className="mx-auto h-6 w-6 animate-spin" />
                    <p className="mt-1 text-xs">{uploadedFile.progress}%</p>
                  </div>
                </div>
              )}

              {/* Error overlay */}
              {uploadedFile.error && (
                <div className="absolute inset-0 flex items-center justify-center bg-destructive/90 p-2">
                  <div className="text-center text-white">
                    <AlertCircle className="mx-auto h-6 w-6" />
                    <p className="mt-1 text-xs">{uploadedFile.error}</p>
                  </div>
                </div>
              )}

              {/* Remove button */}
              <Button
                type="button"
                variant="destructive"
                size="icon"
                onClick={() => removeFile(uploadedFile.id)}
                className="absolute right-1 top-1 h-6 w-6 opacity-0 transition-opacity group-hover:opacity-100"
                aria-label="Remove file"
              >
                <X className="h-4 w-4" />
              </Button>

              {/* File type indicator */}
              <div className="absolute bottom-1 left-1 rounded bg-black/50 px-1.5 py-0.5 text-xs text-white">
                {isVideo(uploadedFile.file) ? (
                  <Film className="h-3 w-3" />
                ) : (
                  <ImageIcon className="h-3 w-3" />
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
