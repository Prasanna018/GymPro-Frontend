import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Supplement } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Search,
  ShoppingCart,
  X,
  Minus,
  Plus,
  ShoppingBag,
  CheckCircle,
  IndianRupee,
  Loader2,
  Shield,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { api } from '@/lib/api';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
} from '@/components/ui/sheet';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { openRazorpayCheckout } from '@/lib/razorpay';

interface CartItem {
  supplement: Supplement;
  quantity: number;
}

const MemberStore = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [supplements, setSupplements] = useState<Supplement[]>([]);
  const [gymSettings, setGymSettings] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const initStore = async () => {
      setIsLoading(true);
      await Promise.all([fetchSupplements(), fetchSettings()]);
      setIsLoading(false);
    };
    initStore();
  }, []);

  const fetchSupplements = async () => {
    try {
      const data = await api.get('/supplements');
      setSupplements(data);
    } catch (err) {
      console.error('Error fetching supplements:', err);
    }
  };

  const fetchSettings = async () => {
    try {
      const data = await api.get('/settings');
      setGymSettings(data);
    } catch (err) {
      console.error('Error fetching settings:', err);
    }
  };

  const categories = ['All', ...Array.from(new Set(supplements.map(s => s.category)))];

  const filteredSupplements = supplements.filter(supplement => {
    const matchesSearch = supplement.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      supplement.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || supplement.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const addToCart = (supplement: Supplement) => {
    if (supplement.stock <= 0) {
      toast({ title: 'Out of Stock', description: 'This item is currently unavailable.', variant: 'destructive' });
      return;
    }
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
    if (cart.length === 0 || isCheckingOut) return;
    setIsCheckingOut(true);

    try {
      // Step 1: Create Razorpay order (validates stock server-side)
      const payload = {
        items: cart.map(c => ({
          supplementId: c.supplement.id,
          quantity: c.quantity,
          price: c.supplement.price,
        })),
      };

      const orderData = await api.post('/razorpay/create-store-order', payload);

      // Step 2: Open Razorpay checkout
      await openRazorpayCheckout({
        keyId: orderData.keyId,
        orderId: orderData.razorpayOrderId,
        amount: orderData.amount,
        currency: orderData.currency,
        name: gymSettings?.gymName || 'GymPro Store',
        description: `Supplement Purchase (${cartItemCount} item${cartItemCount !== 1 ? 's' : ''})`,
        prefillName: orderData.memberName,
        prefillEmail: orderData.memberEmail,
        onSuccess: async (response) => {
          try {
            // Step 3: Verify payment and fulfill order
            await api.post('/razorpay/verify-store-payment', {
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
              items: cart.map(c => ({
                supplementId: c.supplement.id,
                quantity: c.quantity,
                price: c.supplement.price,
              })),
              total: cartTotal,
            });

            toast({
              title: '🎉 Order Placed Successfully!',
              description: `Your order of ₹${cartTotal.toLocaleString()} was paid and confirmed.`,
            });

            setCart([]);
            setIsCartOpen(false);
            await fetchSupplements(); // Refresh stock
          } catch (verifyError: any) {
            toast({
              title: 'Order Verification Failed',
              description: verifyError.message || 'Payment received but order confirmation failed. Contact support.',
              variant: 'destructive',
            });
          } finally {
            setIsCheckingOut(false);
          }
        },
        onDismiss: () => {
          setIsCheckingOut(false);
          toast({
            title: 'Payment Cancelled',
            description: 'Your cart is still saved. Complete payment to confirm your order.',
          });
        },
      });
    } catch (error: any) {
      setIsCheckingOut(false);
      toast({
        title: 'Checkout Failed',
        description: error.message || 'Could not initiate checkout. Please try again.',
        variant: 'destructive',
      });
    }
  };

  return (
    <DashboardLayout requiredRole="member">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl md:text-4xl text-foreground uppercase">
              {gymSettings?.gymName || 'GYM'} <span className="text-gradient-primary">STORE</span>
            </h1>
            <p className="text-muted-foreground mt-1">
              Premium vitamins & supplements from your gym's official catalog.
            </p>
          </div>

          <Sheet open={isCartOpen} onOpenChange={setIsCartOpen}>
            <SheetTrigger asChild>
              <Button variant="hero" className="gap-2 relative h-12 px-6">
                <ShoppingCart className="h-5 w-5" />
                Cart
                {cartItemCount > 0 && (
                  <Badge className="absolute -top-2 -right-2 h-6 w-6 p-0 flex items-center justify-center bg-accent text-accent-foreground border-2 border-background shadow-lg">
                    {cartItemCount}
                  </Badge>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent className="bg-gradient-to-b from-card to-background border-l border-border/50 w-full sm:max-w-md flex flex-col p-0">
              <SheetHeader className="p-6 border-b border-border/50 bg-card/50 backdrop-blur-sm">
                <SheetTitle className="font-display text-2xl flex items-center gap-2">
                  <ShoppingCart className="h-6 w-6 text-primary" />
                  YOUR <span className="text-gradient-primary">CART</span>
                </SheetTitle>
                <SheetDescription>Review items and pay securely with Razorpay.</SheetDescription>
              </SheetHeader>

              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {cart.length > 0 ? (
                  cart.map((item) => (
                    <div key={item.supplement.id} className="flex items-center gap-4 p-4 rounded-xl bg-card border border-border/50 shadow-sm hover:shadow-md transition-all group">
                      <div className="h-14 w-14 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                        <ShoppingBag className="h-7 w-7 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-foreground truncate">{item.supplement.name}</h4>
                        <p className="text-primary font-bold">₹{item.supplement.price.toLocaleString()}</p>
                        <div className="flex items-center gap-3 mt-2">
                          <div className="flex items-center border border-border/50 rounded-lg bg-background p-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 rounded-md"
                              onClick={() => updateQuantity(item.supplement.id, -1)}
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span className="w-8 text-center text-sm font-bold">{item.quantity}</span>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 rounded-md"
                              onClick={() => updateQuantity(item.supplement.id, 1)}
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                          <span className="text-sm text-muted-foreground">
                            = ₹{(item.supplement.price * item.quantity).toLocaleString()}
                          </span>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                        onClick={() => removeFromCart(item.supplement.id)}
                      >
                        <X className="h-5 w-5" />
                      </Button>
                    </div>
                  ))
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-muted-foreground space-y-4 opacity-50">
                    <ShoppingCart className="h-16 w-16" />
                    <p className="font-medium">Your cart is empty</p>
                  </div>
                )}
              </div>

              {cart.length > 0 && (
                <SheetFooter className="p-6 border-t border-border/50 bg-card/50 flex-col gap-4 sm:flex-col">
                  <div className="w-full space-y-2">
                    {cart.map(item => (
                      <div key={item.supplement.id} className="flex justify-between text-sm">
                        <span className="text-muted-foreground">{item.supplement.name} × {item.quantity}</span>
                        <span>₹{(item.supplement.price * item.quantity).toLocaleString()}</span>
                      </div>
                    ))}
                    <div className="border-t border-border/30 pt-2 flex justify-between items-center text-xl font-display">
                      <span className="text-foreground">TOTAL</span>
                      <span className="text-gradient-primary font-bold">₹{cartTotal.toLocaleString()}</span>
                    </div>
                  </div>
                  <Button
                    variant="hero"
                    className="w-full h-12 text-lg gap-2"
                    onClick={handleCheckout}
                    disabled={isCheckingOut}
                  >
                    {isCheckingOut ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        Processing Payment...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-5 w-5" />
                        Pay ₹{cartTotal.toLocaleString()}
                      </>
                    )}
                  </Button>
                  <p className="text-xs text-center text-muted-foreground flex items-center justify-center gap-1">
                    <Shield className="h-3 w-3 text-accent" />
                    Secured by Razorpay · UPI, Cards, NetBanking accepted
                  </p>
                </SheetFooter>
              )}
            </SheetContent>
          </Sheet>
        </div>

        {/* Filters & Search */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1 md:max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Search by name or category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 h-12 bg-card border-border/50 rounded-xl"
            />
          </div>
          <div className="flex gap-2 pb-2 overflow-x-auto no-scrollbar">
            {categories.map(cat => (
              <Button
                key={cat}
                variant={selectedCategory === cat ? 'default' : 'outline'}
                className={`rounded-full px-6 transition-all ${selectedCategory === cat ? 'bg-primary shadow-lg shadow-primary/25' : 'hover:border-primary/50'}`}
                onClick={() => setSelectedCategory(cat)}
              >
                {cat}
              </Button>
            ))}
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {isLoading ? (
            Array(8).fill(0).map((_, i) => (
              <Card key={i} className="animate-pulse bg-muted/20 border-border/50 h-[400px] rounded-2xl" />
            ))
          ) : filteredSupplements.length > 0 ? (
            filteredSupplements.map((product) => (
              <Card key={product.id} className="group overflow-hidden bg-gradient-card border-border/50 hover:border-primary/30 transition-all duration-300 rounded-2xl flex flex-col h-full shadow-sm hover:shadow-xl">
                <div className="aspect-[4/3] relative bg-muted/30 flex items-center justify-center overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-t from-card/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity z-10" />
                  <ShoppingBag className="h-24 w-24 text-primary/10 group-hover:text-primary/20 group-hover:scale-110 transition-all duration-500" />
                  <Badge className="absolute top-4 right-4 bg-primary/20 text-primary border-primary/30 backdrop-blur-md z-20">
                    {product.category}
                  </Badge>
                </div>
                <CardHeader className="p-6 pb-2">
                  <div className="flex justify-between items-start gap-2">
                    <CardTitle className="text-xl text-foreground group-hover:text-primary transition-colors line-clamp-1">
                      {product.name}
                    </CardTitle>
                  </div>
                  <CardDescription className="line-clamp-2 h-10 mt-1">
                    {product.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6 pt-0 flex-1">
                  <div className="flex items-center justify-between mt-4">
                    <div className="flex flex-col">
                      <span className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Member Price</span>
                      <span className="text-2xl font-bold text-primary flex items-center">
                        <IndianRupee className="h-5 w-5" />
                        {product.price.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Stock</span>
                      <span className={`text-sm font-medium ${product.stock > 10 ? 'text-accent' : product.stock > 0 ? 'text-warning' : 'text-destructive'}`}>
                        {product.stock > 0 ? `${product.stock} left` : 'Out of stock'}
                      </span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="p-6 pt-0">
                  <Button
                    variant={product.stock > 0 ? "hero" : "secondary"}
                    className="w-full h-12 gap-2 text-base rounded-xl"
                    disabled={product.stock <= 0}
                    onClick={() => addToCart(product)}
                  >
                    {product.stock > 0 ? (
                      <>
                        <Plus className="h-5 w-5" />
                        Add to Cart
                      </>
                    ) : (
                      'Out of Stock'
                    )}
                  </Button>
                </CardFooter>
              </Card>
            ))
          ) : (
            <div className="col-span-full py-20 text-center space-y-4">
              <ShoppingBag className="h-16 w-16 text-muted-foreground/20 mx-auto" />
              <p className="text-muted-foreground text-lg">No supplements found matching your search.</p>
              <Button variant="outline" className="rounded-full px-8" onClick={() => { setSearchQuery(''); setSelectedCategory('All'); }}>
                Clear Filters
              </Button>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default MemberStore;
