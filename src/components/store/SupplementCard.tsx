import { Supplement } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart, Package, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';

interface SupplementCardProps {
  supplement: Supplement;
  onAddToCart?: (supplement: Supplement) => void;
  isOwner?: boolean;
  onEdit?: (supplement: Supplement) => void;
}

export const SupplementCard = ({ supplement, onAddToCart, isOwner, onEdit }: SupplementCardProps) => {
  const isLowStock = supplement.stock < 10;
  const isOutOfStock = supplement.stock === 0;
  const images = supplement.images && supplement.images.length > 0 ? supplement.images : null;
  const [currentImg, setCurrentImg] = useState(0);

  const prevImg = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImg(i => (i === 0 ? (images!.length - 1) : i - 1));
  };

  const nextImg = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImg(i => (i === images!.length - 1 ? 0 : i + 1));
  };

  return (
    <div className="stat-card group overflow-hidden">
      {/* Image area */}
      {images ? (
        <div className="relative w-full aspect-video rounded-lg overflow-hidden mb-4 bg-muted/30">
          <img
            src={images[currentImg]}
            alt={supplement.name}
            className="w-full h-full object-cover transition-all duration-500"
          />
          {images.length > 1 && (
            <>
              <button
                onClick={prevImg}
                className="absolute left-1 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white rounded-full p-1 transition-colors z-10"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={nextImg}
                className="absolute right-1 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white rounded-full p-1 transition-colors z-10"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
              {/* Dots */}
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
                {images.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={(e) => { e.stopPropagation(); setCurrentImg(idx); }}
                    className={cn(
                      'w-2 h-2 rounded-full transition-all',
                      idx === currentImg ? 'bg-white scale-110' : 'bg-white/50'
                    )}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      ) : (
        <div className="w-full aspect-video rounded-lg overflow-hidden mb-4 bg-muted/30 flex items-center justify-center">
          <Package className="h-12 w-12 text-primary/20" />
        </div>
      )}

      <div className="flex items-start justify-between mb-4">
        <div className="p-3 rounded-lg bg-primary/20">
          <Package className="h-6 w-6 text-primary" />
        </div>
        <Badge
          variant="outline"
          className={cn(
            'border',
            isOutOfStock ? 'border-destructive/50 text-destructive' :
            isLowStock ? 'border-warning/50 text-warning' :
            'border-accent/50 text-accent'
          )}
        >
          {isOutOfStock ? 'Out of Stock' : `${supplement.stock} in stock`}
        </Badge>
      </div>

      <div className="mb-4">
        <span className="text-xs text-primary uppercase tracking-wider font-medium">
          {supplement.category}
        </span>
        <h3 className="text-lg font-semibold text-foreground mt-1">
          {supplement.name}
        </h3>
        <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
          {supplement.description}
        </p>
      </div>

      <div className="flex items-end justify-between mt-auto pt-4 border-t border-border/30">
        <div>
          <span className="text-2xl font-bold text-gradient-primary">
            ₹{supplement.price.toLocaleString()}
          </span>
        </div>

        {isOwner ? (
          <Button variant="outline" size="sm" onClick={() => onEdit?.(supplement)}>
            Edit
          </Button>
        ) : (
          <Button
            variant="hero"
            size="sm"
            disabled={isOutOfStock}
            onClick={() => onAddToCart?.(supplement)}
            className="gap-2"
          >
            <ShoppingCart className="h-4 w-4" />
            Add
          </Button>
        )}
      </div>
    </div>
  );
};
