import { ImgHTMLAttributes, forwardRef, useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

export interface ImageProps extends ImgHTMLAttributes<HTMLImageElement> {
  aspectRatio?: number;
  objectFit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down';
  fallbackSrc?: string;
}

const Image = forwardRef<HTMLImageElement, ImageProps>(
  ({ 
    className,
    aspectRatio,
    objectFit = 'cover',
    alt = '',
    fallbackSrc,
    onError,
    ...props 
  }, ref) => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [src, setSrc] = useState(props.src);

    useEffect(() => {
      setSrc(props.src);
      setLoading(true);
      setError(false);
    }, [props.src]);

    const handleError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
      setError(true);
      setLoading(false);
      if (fallbackSrc && src !== fallbackSrc) {
        setSrc(fallbackSrc);
      }
      onError?.(e);
    };

    const handleLoad = () => {
      setLoading(false);
    };

    const style = {
      aspectRatio: aspectRatio,
      objectFit: objectFit,
      ...props.style,
    };

    return (
      <div
        className={cn(
          'relative overflow-hidden',
          aspectRatio && 'w-full',
          className
        )}
        style={{ aspectRatio }}
      >
        <img
          ref={ref}
          className={cn(
            'w-full h-full transition-opacity duration-300',
            loading && 'opacity-0',
            error && 'opacity-50'
          )}
          alt={alt}
          style={style}
          src={src}
          onError={handleError}
          onLoad={handleLoad}
          {...props}
        />
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-muted/10">
            <div className="w-6 h-6 border-2 border-primary rounded-full animate-spin border-t-transparent" />
          </div>
        )}
      </div>
    );
  }
);

Image.displayName = 'Image';

export { Image };
