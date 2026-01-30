/**
 * Image compression and resizing utilities
 * Runs client-side before upload to reduce storage and bandwidth costs
 */

export interface CompressionOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number; // 0-1
  mimeType?: "image/jpeg" | "image/png" | "image/webp";
}

const DEFAULT_OPTIONS: CompressionOptions = {
  maxWidth: 1200,
  maxHeight: 1200,
  quality: 0.8,
  mimeType: "image/jpeg",
};

/**
 * Check if file is an image that can be compressed
 */
export function isCompressibleImage(file: File): boolean {
  return ["image/jpeg", "image/png", "image/webp"].includes(file.type);
}

/**
 * Load an image file into an HTMLImageElement
 */
function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
}

/**
 * Calculate new dimensions while maintaining aspect ratio
 */
function calculateDimensions(
  originalWidth: number,
  originalHeight: number,
  maxWidth: number,
  maxHeight: number
): { width: number; height: number } {
  let width = originalWidth;
  let height = originalHeight;

  // Only resize if image is larger than max dimensions
  if (width <= maxWidth && height <= maxHeight) {
    return { width, height };
  }

  const aspectRatio = width / height;

  if (width > maxWidth) {
    width = maxWidth;
    height = Math.round(width / aspectRatio);
  }

  if (height > maxHeight) {
    height = maxHeight;
    width = Math.round(height * aspectRatio);
  }

  return { width, height };
}

/**
 * Compress and resize an image file
 * Returns the compressed file or the original if compression fails/not supported
 */
export async function compressImage(
  file: File,
  options: CompressionOptions = {}
): Promise<File> {
  // Skip non-compressible files (videos, HEIC, etc.)
  if (!isCompressibleImage(file)) {
    return file;
  }

  const opts = { ...DEFAULT_OPTIONS, ...options };

  try {
    // Load the image
    const img = await loadImage(file);

    // Calculate new dimensions
    const { width, height } = calculateDimensions(
      img.naturalWidth,
      img.naturalHeight,
      opts.maxWidth!,
      opts.maxHeight!
    );

    // Create canvas and draw resized image
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext("2d");
    if (!ctx) {
      console.warn("Canvas context not available, returning original file");
      return file;
    }

    // Use high-quality image rendering
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";

    // Draw the image
    ctx.drawImage(img, 0, 0, width, height);

    // Clean up object URL
    URL.revokeObjectURL(img.src);

    // Convert canvas to blob
    const blob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob(resolve, opts.mimeType, opts.quality);
    });

    if (!blob) {
      console.warn("Failed to create blob, returning original file");
      return file;
    }

    // Create new file with compressed data
    const compressedFile = new File(
      [blob],
      // Update extension if mime type changed
      file.name.replace(/\.(jpg|jpeg|png|webp)$/i, opts.mimeType === "image/jpeg" ? ".jpg" : ".png"),
      { type: opts.mimeType }
    );

    // Log compression stats
    const savings = ((1 - compressedFile.size / file.size) * 100).toFixed(1);
    console.log(
      `Image compressed: ${file.name}`,
      `${(file.size / 1024).toFixed(1)}KB -> ${(compressedFile.size / 1024).toFixed(1)}KB`,
      `(${savings}% reduction)`,
      `${img.naturalWidth}x${img.naturalHeight} -> ${width}x${height}`
    );

    // Only return compressed file if it's actually smaller
    if (compressedFile.size < file.size) {
      return compressedFile;
    }

    return file;
  } catch (error) {
    console.error("Image compression failed:", error);
    return file;
  }
}

/**
 * Compress multiple images in parallel
 */
export async function compressImages(
  files: File[],
  options: CompressionOptions = {}
): Promise<File[]> {
  return Promise.all(files.map((file) => compressImage(file, options)));
}
