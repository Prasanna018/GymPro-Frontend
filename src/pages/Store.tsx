import { useState, useEffect, useRef } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { SupplementCard } from '@/components/store/SupplementCard';
import { Supplement } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { compressImage } from '@/lib/imageCompress';
import {
  Package,
  Plus,
  Search,
  ShoppingBag,
  RefreshCw,
  CreditCard,
  Clock,
  CheckCircle,
  ImagePlus,
  X,
  Loader2,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { api } from '@/lib/api';
import { cn } from '@/lib/utils';

const MAX_IMAGES = 4;

interface StoreOrder {
  id: string;
  memberId: string;
  items: { supplementId: string; quantity: number; price: number }[];
  total: number;
  date: string;
  status: string;
  paymentStatus: string;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
}

interface Member {
  id: string;
  name: string;
  email: string;
}

const Store = () => {
  const [supplements, setSupplements] = useState<Supplement[]>([]);
  const [orders, setOrders] = useState<StoreOrder[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [supplementMap, setSupplementMap] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isCompressing, setIsCompressing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSupplement, setEditingSupplement] = useState<Supplement | null>(null);
  const { toast } = useToast();

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    stock: '',
    category: '',
  });

  // Image state: existing Cloudinary URLs (for edit) + new local File previews
  const [existingImages, setExistingImages] = useState<string[]>([]); // already-uploaded URLs
  const [newImageFiles, setNewImageFiles] = useState<File[]>([]);     // new files to upload
  const [newImagePreviews, setNewImagePreviews] = useState<string[]>([]);

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    setIsLoading(true);
    try {
      const [supps, ordersData, membersData] = await Promise.all([
        api.get('/supplements'),
        api.get('/orders'),
        api.get('/members'),
      ]);
      setSupplements(supps);
      setOrders(ordersData);
      setMembers(membersData);
      const map: Record<string, string> = {};
      supps.forEach((s: Supplement) => { map[s.id] = s.name; });
      setSupplementMap(map);
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to load store data', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSupplements = async () => {
    const data = await api.get('/supplements');
    setSupplements(data);
  };

  const filteredSupplements = supplements.filter(supplement =>
    supplement.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    supplement.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getMemberName = (memberId: string) => {
    const m = members.find(m => m.id === memberId);
    return m?.name || 'Unknown';
  };

  // ─── Image Handlers ────────────────────────────────────────────────────────
  const totalImageCount = existingImages.length + newImageFiles.length;

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const remaining = MAX_IMAGES - totalImageCount;
    if (files.length > remaining) {
      toast({ title: 'Limit Reached', description: `You can only add ${remaining} more image(s). Max is ${MAX_IMAGES}.`, variant: 'destructive' });
      // Reset input
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }
    const selected = files.slice(0, remaining);
    setIsCompressing(true);
    toast({ title: '🗜️ Compressing images…', description: 'Optimising for upload, please wait.' });
    try {
      // Compress each image before adding to state
      const compressed = await Promise.all(selected.map(f => compressImage(f)));
      const previews = compressed.map(f => URL.createObjectURL(f));
      setNewImageFiles(prev => [...prev, ...compressed]);
      setNewImagePreviews(prev => [...prev, ...previews]);
      toast({ title: '✅ Images ready', description: `${compressed.length} image(s) compressed and ready to upload.` });
    } catch (err) {
      toast({ title: 'Compression error', description: 'Could not process one or more images.', variant: 'destructive' });
    } finally {
      setIsCompressing(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const removeExistingImage = (idx: number) => {
    setExistingImages(prev => prev.filter((_, i) => i !== idx));
  };

  const removeNewImage = (idx: number) => {
    URL.revokeObjectURL(newImagePreviews[idx]);
    setNewImageFiles(prev => prev.filter((_, i) => i !== idx));
    setNewImagePreviews(prev => prev.filter((_, i) => i !== idx));
  };

  // ─── Form Submit ───────────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const fd = new FormData();
      fd.append('name', formData.name);
      fd.append('description', formData.description);
      fd.append('price', formData.price);
      fd.append('stock', formData.stock);
      fd.append('category', formData.category);

      // New image files
      newImageFiles.forEach(file => fd.append('images', file));

      if (editingSupplement) {
        // For editing: also send the list of kept Cloudinary URLs
        fd.append('existing_images', JSON.stringify(existingImages));
        const updated = await api.putForm(`/supplements/${editingSupplement.id}`, fd);
        setSupplements(supplements.map(s => s.id === editingSupplement.id ? updated : s));
        toast({ title: 'Supplement Updated', description: `${formData.name} has been updated.` });
      } else {
        const newSupplement = await api.postForm('/supplements', fd);
        setSupplements([newSupplement, ...supplements]);
        toast({ title: 'Supplement Added', description: `${formData.name} has been added to the store.` });
      }
      resetForm();
      setIsDialogOpen(false);
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to save supplement', variant: 'destructive' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleEdit = (supplement: Supplement) => {
    setEditingSupplement(supplement);
    setFormData({
      name: supplement.name,
      description: supplement.description,
      price: String(supplement.price),
      stock: String(supplement.stock),
      category: supplement.category,
    });
    setExistingImages(supplement.images || []);
    setNewImageFiles([]);
    setNewImagePreviews([]);
    setIsDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({ name: '', description: '', price: '', stock: '', category: '' });
    setEditingSupplement(null);
    newImagePreviews.forEach(url => URL.revokeObjectURL(url));
    setExistingImages([]);
    setNewImageFiles([]);
    setNewImagePreviews([]);
  };

  const lowStockCount = supplements.filter(s => s.stock < 10 && s.stock > 0).length;
  const outOfStockCount = supplements.filter(s => s.stock === 0).length;
  const paidOrders = orders.filter(o => o.paymentStatus === 'paid');
  const pendingOrders = orders.filter(o => o.paymentStatus !== 'paid');

  return (
    <DashboardLayout requiredRole="owner">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl md:text-4xl text-foreground">
              SUPPLEMENT <span className="text-gradient-primary">STORE</span>
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage inventory and view member orders.
            </p>
          </div>

          <div className="flex gap-3">
            <Button variant="outline" size="sm" onClick={fetchAll} className="gap-2">
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
            <Dialog open={isDialogOpen} onOpenChange={(open) => {
              setIsDialogOpen(open);
              if (!open) resetForm();
            }}>
              <DialogTrigger asChild>
                <Button variant="hero" className="gap-2">
                  <Plus className="h-4 w-4" />
                  Add Supplement
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-lg bg-card border-border max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="font-display text-2xl">
                    {editingSupplement ? 'EDIT' : 'ADD'} <span className="text-gradient-primary">SUPPLEMENT</span>
                  </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Product Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Enter product name"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Input
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Enter description"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="price">Price (₹)</Label>
                      <Input
                        id="price"
                        type="number"
                        value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                        placeholder="0"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="stock">Stock</Label>
                      <Input
                        id="stock"
                        type="number"
                        value={formData.stock}
                        onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                        placeholder="0"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Input
                      id="category"
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      placeholder="e.g., Protein, BCAA, Pre-Workout"
                      required
                    />
                  </div>

                  {/* ── Image Upload Section ── */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label>Product Images</Label>
                      <span className="text-xs text-muted-foreground">
                        {totalImageCount}/{MAX_IMAGES} images
                      </span>
                    </div>

                    {/* Preview grid */}
                    {(existingImages.length > 0 || newImagePreviews.length > 0) && (
                      <div className="grid grid-cols-4 gap-2">
                        {existingImages.map((url, idx) => (
                          <div key={`existing-${idx}`} className="relative aspect-square rounded-lg overflow-hidden border border-border/50 group">
                            <img src={url} alt="" className="w-full h-full object-cover" />
                            <button
                              type="button"
                              onClick={() => removeExistingImage(idx)}
                              className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                        ))}
                        {newImagePreviews.map((preview, idx) => (
                          <div key={`new-${idx}`} className="relative aspect-square rounded-lg overflow-hidden border border-primary/30 group">
                            <img src={preview} alt="" className="w-full h-full object-cover" />
                            <div className="absolute top-1 left-1 bg-primary/80 text-white text-xs px-1 rounded">New</div>
                            <button
                              type="button"
                              onClick={() => removeNewImage(idx)}
                              className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Upload button */}
                    {totalImageCount < MAX_IMAGES && (
                      <div>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          multiple
                          className="hidden"
                          onChange={handleImageSelect}
                          id="image-upload"
                        />
                        <label
                          htmlFor="image-upload"
                          className={`flex items-center justify-center gap-2 w-full border-2 border-dashed rounded-lg py-4 cursor-pointer transition-colors ${
                            isCompressing
                              ? 'border-primary/50 text-primary cursor-wait'
                              : 'border-border/50 hover:border-primary/50 text-muted-foreground hover:text-primary'
                          }`}
                        >
                          {isCompressing ? (
                            <>
                              <Loader2 className="h-5 w-5 animate-spin" />
                              <span className="text-sm">Compressing images...</span>
                            </>
                          ) : (
                            <>
                              <ImagePlus className="h-5 w-5" />
                              <span className="text-sm">
                                Click to upload ({MAX_IMAGES - totalImageCount} slot{MAX_IMAGES - totalImageCount !== 1 ? 's' : ''} left)
                              </span>
                            </>
                          )}
                        </label>
                      </div>
                    )}
                    <p className="text-xs text-muted-foreground">
                      Max {MAX_IMAGES} images · Auto-compressed to ≤500 KB · JPG, PNG, WEBP supported
                    </p>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <Button type="button" variant="outline" className="flex-1" onClick={() => setIsDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" variant="hero" className="flex-1 gap-2" disabled={isSaving || isCompressing}>
                      {isSaving && <Loader2 className="h-4 w-4 animate-spin" />}
                      {editingSupplement ? 'Update' : 'Add'} Supplement
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 md:gap-4">
          <div className="stat-card">
            <Package className="h-6 w-6 text-primary mb-2" />
            <h3 className="text-2xl font-bold text-foreground">{supplements.length}</h3>
            <p className="text-sm text-muted-foreground">Products</p>
          </div>
          <div className="stat-card">
            <Package className="h-6 w-6 text-warning mb-2" />
            <h3 className="text-2xl font-bold text-warning">{lowStockCount}</h3>
            <p className="text-sm text-muted-foreground">Low Stock</p>
          </div>
          <div className="stat-card">
            <Package className="h-6 w-6 text-destructive mb-2" />
            <h3 className="text-2xl font-bold text-destructive">{outOfStockCount}</h3>
            <p className="text-sm text-muted-foreground">Out of Stock</p>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="inventory" className="space-y-4">
          <TabsList className="bg-muted/30 p-1 rounded-xl">
            <TabsTrigger value="inventory" className="gap-2 rounded-lg data-[state=active]:bg-card">
              <Package className="h-4 w-4" />
              Inventory
            </TabsTrigger>
            <TabsTrigger value="orders" className="gap-2 rounded-lg data-[state=active]:bg-card">
              <ShoppingBag className="h-4 w-4" />
              Member Orders
              {orders.length > 0 && (
                <Badge className="ml-1 h-5 px-1.5 text-xs bg-primary/20 text-primary border-primary/30">
                  {orders.length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          {/* ── Tab 1: Inventory ── */}
          <TabsContent value="inventory" className="space-y-4">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Search supplements..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {filteredSupplements.map((supplement) => (
                <SupplementCard
                  key={supplement.id}
                  supplement={supplement}
                  isOwner
                  onEdit={handleEdit}
                />
              ))}
            </div>

            {filteredSupplements.length === 0 && (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No supplements found.</p>
              </div>
            )}
          </TabsContent>

          {/* ── Tab 2: Orders ── */}
          <TabsContent value="orders" className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <Card className="bg-gradient-card border-border/50">
                <CardContent className="pt-5 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-accent/20">
                      <CheckCircle className="h-5 w-5 text-accent" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Paid Orders</p>
                      <p className="text-lg font-bold text-foreground">{paidOrders.length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-gradient-card border-border/50">
                <CardContent className="pt-5 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-warning/20">
                      <Clock className="h-5 w-5 text-warning" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Pending</p>
                      <p className="text-lg font-bold text-foreground">{pendingOrders.length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-gradient-card border-border/50">
                <CardContent className="pt-5 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-primary/20">
                      <CreditCard className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Revenue</p>
                      <p className="text-lg font-bold text-foreground">
                        ₹{paidOrders.reduce((s, o) => s + o.total, 0).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-gradient-card border-border/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-foreground flex items-center gap-2 text-lg">
                  <ShoppingBag className="h-5 w-5 text-primary" />
                  All Member Orders
                </CardTitle>
                <CardDescription>Orders placed through the member store</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="text-center py-8">
                    <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                  </div>
                ) : orders.length > 0 ? (
                  <div className="space-y-3">
                    {orders.map((order) => {
                      const isPaid = order.paymentStatus === 'paid';
                      const isOnline = !!order.razorpayPaymentId;
                      return (
                        <div
                          key={order.id}
                          className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl bg-muted/30 border border-border/30 gap-3 hover:bg-muted/50 transition-colors"
                        >
                          <div className="flex items-start gap-3">
                            <div className={cn(
                              "p-2 rounded-lg flex-shrink-0",
                              isPaid ? "bg-accent/20" : "bg-warning/20"
                            )}>
                              {isPaid
                                ? <CheckCircle className="h-5 w-5 text-accent" />
                                : <Clock className="h-5 w-5 text-warning" />
                              }
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <p className="font-semibold text-foreground">
                                  {getMemberName(order.memberId)}
                                </p>
                                {isOnline && (
                                  <Badge className="text-xs bg-primary/20 text-primary border-primary/30">
                                    ⚡ Online
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground">
                                {new Date(order.date).toLocaleDateString('en-IN', {
                                  day: 'numeric', month: 'short', year: 'numeric'
                                })}
                                {' · '}
                                {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                              </p>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {order.items.map((item, idx) => (
                                  <span key={idx} className="text-xs text-muted-foreground/70 bg-muted/40 px-2 py-0.5 rounded-full">
                                    {supplementMap[item.supplementId] || 'Item'} ×{item.quantity}
                                  </span>
                                ))}
                              </div>
                              {order.razorpayPaymentId && (
                                <p className="text-xs text-muted-foreground/60 font-mono mt-0.5 truncate max-w-[280px]">
                                  Txn: {order.razorpayPaymentId}
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-3 sm:flex-shrink-0">
                            <div className="text-right">
                              <p className="font-bold text-foreground text-lg">₹{order.total.toLocaleString()}</p>
                              <Badge className={cn(
                                "text-xs",
                                isPaid
                                  ? "bg-accent/20 text-accent border-accent/30"
                                  : "bg-warning/20 text-warning border-warning/30"
                              )}>
                                {isPaid ? 'PAID' : 'PENDING'}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <ShoppingBag className="h-12 w-12 mx-auto mb-3 opacity-20" />
                    <p>No orders yet. Members can buy supplements from the Member Store.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default Store;
