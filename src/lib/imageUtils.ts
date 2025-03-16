/**
 * Utility functions for image handling
 */

/**
 * Compresses an image file to reduce size before upload
 * @param file The image file to compress
 * @param maxWidth Maximum width of the compressed image
 * @param maxHeight Maximum height of the compressed image
 * @param quality Compression quality (0-1)
 * @returns Promise resolving to a compressed Blob
 */
export const compressImage = async (
  file: File,
  maxWidth = 800,
  maxHeight = 800,
  quality = 0.8,
): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        // Calculate new dimensions while maintaining aspect ratio
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Could not get canvas context"));
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);

        // Convert to blob
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error("Canvas to Blob conversion failed"));
            }
          },
          file.type,
          quality,
        );
      };
      img.onerror = () => {
        reject(new Error("Error loading image"));
      };
    };
    reader.onerror = () => {
      reject(new Error("Error reading file"));
    };
  });
};

/**
 * Validates an image file based on type and size
 * @param file The file to validate
 * @param maxSizeMB Maximum file size in MB
 * @param allowedTypes Array of allowed MIME types
 * @returns Object with validation result and error message if any
 */
export const validateImage = (
  file: File,
  maxSizeMB = 5,
  allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"],
): { valid: boolean; error?: string } => {
  // Check file type
  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: `Invalid file type. Allowed types: ${allowedTypes.join(", ")}`,
    };
  }

  // Check file size
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  if (file.size > maxSizeBytes) {
    return {
      valid: false,
      error: `File size exceeds ${maxSizeMB}MB limit`,
    };
  }

  return { valid: true };
};

/**
 * Creates a thumbnail from an image file
 * @param file The image file
 * @param size Thumbnail size (width and height)
 * @returns Promise resolving to a thumbnail Blob
 */
export const createThumbnail = async (
  file: File,
  size = 150,
): Promise<Blob> => {
  return compressImage(file, size, size, 0.7);
};

/**
 * Converts a Blob to a File object
 * @param blob The Blob to convert
 * @param fileName Desired file name
 * @param type MIME type
 * @returns File object
 */
export const blobToFile = (
  blob: Blob,
  fileName: string,
  type = "image/jpeg",
): File => {
  return new File([blob], fileName, { type });
};
