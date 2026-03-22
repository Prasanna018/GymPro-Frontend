/**
 * Compresses an image File using the Canvas API.
 * @param file         Original image file
 * @param maxWidthPx   Max width/height in pixels (default 1200)
 * @param qualityJpeg  JPEG quality 0–1 (default 0.82)
 * @param maxSizeBytes Target max file size in bytes (default 500 KB)
 * @returns A new (smaller) File object
 */
export async function compressImage(
  file: File,
  maxWidthPx = 1200,
  qualityJpeg = 0.82,
  maxSizeBytes = 500 * 1024, // 500 KB
): Promise<File> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);

      // Calculate new dimensions keeping aspect ratio
      let { width, height } = img;
      if (width > maxWidthPx || height > maxWidthPx) {
        if (width > height) {
          height = Math.round((height / width) * maxWidthPx);
          width = maxWidthPx;
        } else {
          width = Math.round((width / height) * maxWidthPx);
          height = maxWidthPx;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) return reject(new Error('Canvas context not available'));
      ctx.drawImage(img, 0, 0, width, height);

      // Try progressively lower quality until under maxSizeBytes
      const tryCompress = (quality: number) => {
        canvas.toBlob(
          (blob) => {
            if (!blob) return reject(new Error('Compression failed'));

            if (blob.size <= maxSizeBytes || quality <= 0.4) {
              // Good enough — wrap in File
              const compressedFile = new File(
                [blob],
                file.name.replace(/\.[^.]+$/, '.jpg'),
                { type: 'image/jpeg', lastModified: Date.now() },
              );
              resolve(compressedFile);
            } else {
              // Retry with lower quality
              tryCompress(Math.max(quality - 0.1, 0.4));
            }
          },
          'image/jpeg',
          quality,
        );
      };

      tryCompress(qualityJpeg);
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('Failed to load image'));
    };

    img.src = objectUrl;
  });
}
