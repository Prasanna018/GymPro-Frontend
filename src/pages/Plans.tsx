import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { MembershipPlan } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dumbbell, Plus, Search, Trash2, Edit2 } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { api } from '@/lib/api';

const Plans = () => {
    const [plans, setPlans] = useState<MembershipPlan[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingPlan, setEditingPlan] = useState<MembershipPlan | null>(null);
    const { toast } = useToast();

    // Form state
    const [formData, setFormData] = useState({
        name: '',
        duration: '',
        price: '',
        features: '',
    });

    const fetchPlans = async () => {
        try {
            const data = await api.get('/plans');
            setPlans(data);
        } catch (error) {
            console.error('Failed to fetch plans:', error);
            toast({ title: 'Error', description: 'Failed to load plans', variant: 'destructive' });
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchPlans();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const payload = {
            name: formData.name,
            duration: Number(formData.duration),
            price: Number(formData.price),
            features: formData.features.split(',').map(f => f.trim()).filter(f => f !== ''),
        };

        try {
            if (editingPlan) {
                const updated = await api.put(`/plans/${editingPlan.id}`, payload);
                setPlans(plans.map(p => p.id === editingPlan.id ? updated : p));
                toast({ title: 'Plan Updated', description: `${formData.name} has been updated.` });
            } else {
                const newPlan = await api.post('/plans', payload);
                setPlans([newPlan, ...plans]);
                toast({ title: 'Plan Added', description: `${formData.name} has been added.` });
            }
            resetForm();
            setIsDialogOpen(false);
        } catch (error) {
            console.error('Failed to save plan:', error);
            toast({ title: 'Error', description: 'Failed to save plan', variant: 'destructive' });
        }
    };

    const handleEdit = (plan: MembershipPlan) => {
        setEditingPlan(plan);
        setFormData({
            name: plan.name,
            duration: String(plan.duration),
            price: String(plan.price),
            features: plan.features.join(', '),
        });
        setIsDialogOpen(true);
    };

    const handleDelete = async (planId: string) => {
        if (confirm('Are you sure you want to delete this plan? Members using this plan will not be affected, but you won\'t be able to assign this plan to new members.')) {
            try {
                await api.delete(`/plans/${planId}`);
                setPlans(plans.filter(p => p.id !== planId));
                toast({ title: 'Plan Deleted', description: 'The membership plan has been removed.' });
            } catch (error) {
                toast({ title: 'Error', description: 'Failed to delete plan', variant: 'destructive' });
            }
        }
    };

    const resetForm = () => {
        setFormData({ name: '', duration: '', price: '', features: '' });
        setEditingPlan(null);
    };

    return (
        <DashboardLayout requiredRole="owner">
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div>
                        <h1 className="font-display text-3xl md:text-4xl text-foreground">
                            MEMBERSHIP <span className="text-gradient-primary">PLANS</span>
                        </h1>
                        <p className="text-muted-foreground mt-1">
                            Create and manage plans for your members.
                        </p>
                    </div>

                    <Dialog open={isDialogOpen} onOpenChange={(open) => {
                        setIsDialogOpen(open);
                        if (!open) resetForm();
                    }}>
                        <DialogTrigger asChild>
                            <Button variant="hero" className="gap-2">
                                <Plus className="h-4 w-4" />
                                Create New Plan
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-md bg-card border-border">
                            <DialogHeader>
                                <DialogTitle className="font-display text-2xl">
                                    {editingPlan ? 'EDIT' : 'CREATE'} <span className="text-gradient-primary">PLAN</span>
                                </DialogTitle>
                            </DialogHeader>

                            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Plan Name</Label>
                                    <Input
                                        id="name"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        placeholder="e.g., Monthly Pro"
                                        required
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="duration">Duration (Months)</Label>
                                        <Input
                                            id="duration"
                                            type="number"
                                            value={formData.duration}
                                            onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                                            placeholder="1"
                                            required
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="price">Price (₹)</Label>
                                        <Input
                                            id="price"
                                            type="number"
                                            value={formData.price}
                                            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                            placeholder="999"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="features">Features (comma separated)</Label>
                                    <Input
                                        id="features"
                                        value={formData.features}
                                        onChange={(e) => setFormData({ ...formData, features: e.target.value })}
                                        placeholder="Locker access, Personal trainer, etc."
                                    />
                                </div>

                                <div className="flex gap-3 pt-4">
                                    <Button type="button" variant="outline" className="flex-1" onClick={() => setIsDialogOpen(false)}>
                                        Cancel
                                    </Button>
                                    <Button type="submit" variant="hero" className="flex-1">
                                        {editingPlan ? 'Update Plan' : 'Create Plan'}
                                    </Button>
                                </div>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>

                {/* Plans Grid */}
                {isLoading ? (
                    <div className="text-center py-12">
                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {plans.map((plan) => (
                            <Card key={plan.id} className="bg-card border-border hover:shadow-glow transition-all duration-300">
                                <CardHeader>
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <CardTitle className="text-xl font-bold">{plan.name}</CardTitle>
                                            <CardDescription>{plan.duration} Month{plan.duration > 1 ? 's' : ''}</CardDescription>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => handleEdit(plan)}>
                                                <Edit2 className="h-4 w-4" />
                                            </Button>
                                            <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => handleDelete(plan.id)}>
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-3xl font-bold text-primary mb-4">
                                        ₹{plan.price.toLocaleString()}
                                    </div>
                                    <ul className="space-y-2">
                                        {plan.features.map((feature, index) => (
                                            <li key={index} className="flex items-center gap-2 text-sm text-muted-foreground">
                                                <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                                                {feature}
                                            </li>
                                        ))}
                                    </ul>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}

                {plans.length === 0 && !isLoading && (
                    <div className="text-center py-12 bg-card rounded-xl border border-dashed border-border">
                        <Dumbbell className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-20" />
                        <h3 className="text-lg font-medium text-foreground">No plans created yet</h3>
                        <p className="text-muted-foreground max-w-sm mx-auto mt-2">
                            Start by creating your first membership plan to begin accepting members.
                        </p>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
};

export default Plans;
