import { Supplement } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart, Package } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SupplementCardProps {
  supplement: Supplement;
  onAddToCart?: (supplement: Supplement) => void;
  isOwner?: boolean;
  onEdit?: (supplement: Supplement) => void;
}

export const SupplementCard = ({ supplement, onAddToCart, isOwner, onEdit }: SupplementCardProps) => {
  const isLowStock = supplement.stock < 10;
  const isOutOfStock = supplement.stock === 0;

  return (
    <div className="stat-card group overflow-hidden">
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
