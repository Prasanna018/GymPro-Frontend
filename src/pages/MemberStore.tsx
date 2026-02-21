import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { SupplementCard } from '@/components/store/SupplementCard';
import { Supplement } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Search, ShoppingCart, X, Minus, Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { api } from '@/lib/api';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';

interface CartItem {
  supplement: Supplement;
  quantity: number;
}

const MemberStore = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [supplements, setSupplements] = useState<Supplement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchSupplements();
  }, []);

  const fetchSupplements = async () => {
    try {
      const data = await api.get('/supplements');
      setSupplements(data);
    } catch (err) {
      console.error('err fetching supplements', err);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredSupplements = supplements.filter(supplement =>
    supplement.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    supplement.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const addToCart = (supplement: Supplement) => {
    setCart(prev => {
      const existing = prev.find(item => item.supplement.id === supplement.id);
      if (existing) {
        return prev.map(item =>
          item.supplement.id === supplement.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { supplement, quantity: 1 }];
    });
    toast({
      title: 'Added to Cart',
      description: `${supplement.name} added to your cart.`,
    });
  };

  const updateQuantity = (supplementId: string, delta: number) => {
    setCart(prev =>
      prev.map(item => {
        if (item.supplement.id === supplementId) {
          const newQty = item.quantity + delta;
          return newQty > 0 ? { ...item, quantity: newQty } : item;
        }
        return item;
      }).filter(item => item.quantity > 0)
    );
  };

  const removeFromCart = (supplementId: string) => {
    setCart(prev => prev.filter(item => item.supplement.id !== supplementId));
  };

  const cartTotal = cart.reduce((total, item) => total + item.supplement.price * item.quantity, 0);
  const cartItemCount = cart.reduce((count, item) => count + item.quantity, 0);

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    try {
      const payload = {
        items: cart.map(c => ({ supplement_id: c.supplement.id, quantity: c.quantity }))
      };
      await api.post('/orders', payload);
      toast({
        title: 'Order Placed!',
        description: 'Please pay at the counter to complete your purchase.',
      });
      setCart([]);
      fetchSupplements(); // Refresh stock
    } catch (error) {
      console.error('Checkout failed:', error);
      toast({ title: 'Error', description: 'Checkout failed', variant: 'destructive' });
    }
  };

  return (
    <DashboardLayout requiredRole="member">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl md:text-4xl text-foreground">
              SUPPLEMENT <span className="text-gradient-primary">STORE</span>
            </h1>
            <p className="text-muted-foreground mt-1">
              Browse and purchase supplements.
            </p>
          </div>

          <Sheet>
            <SheetTrigger asChild>
              <Button variant="hero" className="gap-2 relative">
                <ShoppingCart className="h-4 w-4" />
                Cart
                {cartItemCount > 0 && (
                  <Badge className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center bg-accent text-accent-foreground">
                    {cartItemCount}
                  </Badge>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent className="bg-card border-border w-full sm:max-w-md">
              <SheetHeader>
                <SheetTitle className="font-display text-2xl">
                  YOUR <span className="text-gradient-primary">CART</span>
                </SheetTitle>
              </SheetHeader>

              <div className="mt-6 flex flex-col h-[calc(100vh-200px)]">
                {cart.length > 0 ? (
                  <>
                    <div className="flex-1 space-y-4 overflow-auto">
                      {cart.map((item) => (
                        <div key={item.supplement.id} className="flex items-center gap-4 p-4 rounded-lg bg-muted/30">
                          <div className="flex-1">
                            <h4 className="font-medium text-foreground">{item.supplement.name}</h4>
                            <p className="text-sm text-muted-foreground">₹{item.supplement.price.toLocaleString()} each</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => updateQuantity(item.supplement.id, -1)}
                            >
                              <Minus className="h-4 w-4" />
                            </Button>
                            <span className="w-8 text-center font-medium">{item.quantity}</span>
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => updateQuantity(item.supplement.id, 1)}
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive"
                            onClick={() => removeFromCart(item.supplement.id)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>

                    <div className="border-t border-border/50 pt-4 mt-4 space-y-4">
                      <div className="flex justify-between items-center text-lg">
                        <span className="text-muted-foreground">Total</span>
                        <span className="font-bold text-gradient-primary">₹{cartTotal.toLocaleString()}</span>
                      </div>
                      <Button variant="hero" className="w-full" onClick={handleCheckout}>
                        Place Order
                      </Button>
                      <p className="text-xs text-center text-muted-foreground">
                        Pay at the counter to complete purchase
                      </p>
                    </div>
                  </>
                ) : (
                  <div className="flex-1 flex items-center justify-center">
                    <p className="text-muted-foreground">Your cart is empty</p>
                  </div>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            placeholder="Search supplements..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {filteredSupplements.map((supplement) => (
            <SupplementCard
              key={supplement.id}
              supplement={supplement}
              onAddToCart={addToCart}
            />
          ))}
        </div>

        {filteredSupplements.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No supplements found.</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default MemberStore;
