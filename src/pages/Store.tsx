import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { SupplementCard } from '@/components/store/SupplementCard';

import { Supplement } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Package, Plus, Search } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { api } from '@/lib/api';

const Store = () => {
  const [supplements, setSupplements] = useState<Supplement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSupplement, setEditingSupplement] = useState<Supplement | null>(null);
  const { toast } = useToast();

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    stock: '',
    category: '',
  });

  useEffect(() => {
    fetchSupplements();
  }, []);

  const fetchSupplements = async () => {
    try {
      const data = await api.get('/supplements');
      setSupplements(data);
    } catch (error) {
      console.error('Failed to fetch supplements:', error);
      toast({ title: 'Error', description: 'Failed to load supplements', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const filteredSupplements = supplements.filter(supplement =>
    supplement.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    supplement.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingSupplement) {
        const payload = { ...formData, price: Number(formData.price), stock: Number(formData.stock) };
        const updated = await api.put(`/supplements/${editingSupplement.id}`, payload);
        setSupplements(supplements.map(s =>
          s.id === editingSupplement.id ? updated : s
        ));
        toast({
          title: 'Supplement Updated',
          description: `${formData.name} has been updated.`,
        });
      } else {
        const payload = { ...formData, price: Number(formData.price), stock: Number(formData.stock) };
        const newSupplement = await api.post('/supplements', payload);

        setSupplements([newSupplement, ...supplements]);
        toast({
          title: 'Supplement Added',
          description: `${formData.name} has been added to the store.`,
        });
      }
      resetForm();
      setIsDialogOpen(false);
    } catch (error) {
      console.error('Failed to save supplement:', error);
      toast({ title: 'Error', description: 'Failed to save supplement', variant: 'destructive' });
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
    setIsDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({ name: '', description: '', price: '', stock: '', category: '' });
    setEditingSupplement(null);
  };

  // Count low stock items
  const lowStockCount = supplements.filter(s => s.stock < 10 && s.stock > 0).length;
  const outOfStockCount = supplements.filter(s => s.stock === 0).length;

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
              Manage your supplement inventory and pricing.
            </p>
          </div>

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
            <DialogContent className="sm:max-w-md bg-card border-border">
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

                <div className="flex gap-3 pt-4">
                  <Button type="button" variant="outline" className="flex-1" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" variant="hero" className="flex-1">
                    {editingSupplement ? 'Update' : 'Add'} Supplement
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 md:gap-4">
          <div className="stat-card">
            <Package className="h-6 w-6 text-primary mb-2" />
            <h3 className="text-2xl font-bold text-foreground">{supplements.length}</h3>
            <p className="text-sm text-muted-foreground">Total Products</p>
          </div>
          <div className="stat-card">
            <Package className="h-6 w-6 text-warning mb-2" />
            <h3 className="text-2xl font-bold text-warning">{lowStockCount}</h3>
            <p className="text-sm text-muted-foreground">Low Stock Items</p>
          </div>
          <div className="stat-card">
            <Package className="h-6 w-6 text-destructive mb-2" />
            <h3 className="text-2xl font-bold text-destructive">{outOfStockCount}</h3>
            <p className="text-sm text-muted-foreground">Out of Stock</p>
          </div>
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
      </div>
    </DashboardLayout>
  );
};

export default Store;
