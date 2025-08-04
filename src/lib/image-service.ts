interface ImageOptimizationOptions {
  width?: number;
  height?: number;
  quality?: number;
  format?: 'webp' | 'jpeg' | 'png';
}

class ImageService {
  private createObjectURL(blob: Blob): string {
    return URL.createObjectURL(blob);
  }

  private revokeObjectURL(url: string): void {
    URL.revokeObjectURL(url);
  }

  private async loadImage(src: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = src;
    });
  }

  private async optimizeImage(
    file: File,
    options: ImageOptimizationOptions = {}
  ): Promise<Blob> {
    const { width, height, quality = 0.8, format = 'webp' } = options;
    
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Failed to get canvas context');

    const img = await this.loadImage(URL.createObjectURL(file));
    
    let targetWidth = width || img.width;
    let targetHeight = height || img.height;

    // Maintain aspect ratio if only one dimension is specified
    if (width && !height) {
      targetHeight = (width / img.width) * img.height;
    } else if (height && !width) {
      targetWidth = (height / img.height) * img.width;
    }

    canvas.width = targetWidth;
    canvas.height = targetHeight;

    // Draw and optimize
    ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

    return new Promise((resolve, reject) => {
      canvas.toBlob(
        (blob) => {
          if (blob) resolve(blob);
          else reject(new Error('Failed to create blob'));
        },
        `image/${format}`,
        quality
      );
    });
  }

  public async processImage(
    file: File,
    options?: ImageOptimizationOptions
  ): Promise<{ blob: Blob; previewUrl: string }> {
    try {
      const optimizedBlob = await this.optimizeImage(file, options);
      const previewUrl = this.createObjectURL(optimizedBlob);
      return { blob: optimizedBlob, previewUrl };
    } catch (error) {
      throw new Error(`Failed to process image: ${error.message}`);
    }
  }

  public cleanupPreview(previewUrl: string): void {
    this.revokeObjectURL(previewUrl);
  }
}

export const imageService = new ImageService();
