import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { MemberTable } from '@/components/dashboard/MemberTable';
import { Member, MembershipPlan } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { UserPlus, Search, X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { api } from '@/lib/api';

const Members = () => {
  const [members, setMembers] = useState<Member[]>([]);
  const [plans, setPlans] = useState<MembershipPlan[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    address: '',
    planId: '',
  });

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [membersData, plansData] = await Promise.all([
        api.get('/members'),
        api.get('/plans')
      ]);
      setMembers(membersData);
      setPlans(plansData);
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to load members', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredMembers = members.filter(member =>
    member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    member.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingMember) {
        // Update existing member
        await api.put(`/members/${editingMember.id}`, {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
          plan_id: formData.planId,
          password: formData.password || undefined
        });
        toast({
          title: 'Member Updated',
          description: `${formData.name} has been updated successfully.`,
        });
      } else {
        // Add new member
        await api.post('/members', {
          name: formData.name,
          email: formData.email,
          password: formData.password,
          phone: formData.phone,
          address: formData.address,
          plan_id: formData.planId
        });
        toast({
          title: 'Member Added',
          description: `${formData.name} has been added successfully.`,
        });
      }

      resetForm();
      setIsDialogOpen(false);
      fetchData(); // Refresh list
    } catch (error: any) {
      toast({ title: 'Error', description: error.message || 'Failed to save member', variant: 'destructive' });
    }
  };

  const handleEdit = (member: Member) => {
    setEditingMember(member);
    setFormData({
      name: member.name,
      email: member.email,
      password: '',
      phone: member.phone,
      address: member.address,
      planId: member.planId,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (member: Member) => {
    if (confirm(`Are you sure you want to delete ${member.name}?`)) {
      try {
        await api.delete(`/members/${member.id}`);
        setMembers(members.filter(m => m.id !== member.id));
        toast({
          title: 'Member Deleted',
          description: `${member.name} has been removed.`,
        });
      } catch (error) {
        toast({ title: 'Error', description: 'Failed to delete member', variant: 'destructive' });
      }
    }
  };

  const resetForm = () => {
    setFormData({ name: '', email: '', password: '', phone: '', address: '', planId: '' });
    setEditingMember(null);
  };

  return (
    <DashboardLayout requiredRole="owner">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl md:text-4xl text-foreground">
              MEMBER <span className="text-gradient-primary">MANAGEMENT</span>
            </h1>
            <p className="text-muted-foreground mt-1">
              Add, edit, and manage your gym members.
            </p>
          </div>

          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button variant="hero" className="gap-2">
                <UserPlus className="h-4 w-4" />
                Add Member
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md bg-card border-border">
              <DialogHeader>
                <DialogTitle className="font-display text-2xl">
                  {editingMember ? 'EDIT' : 'ADD'} <span className="text-gradient-primary">MEMBER</span>
                </DialogTitle>
              </DialogHeader>

              <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Enter member name"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="Enter email address"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="Enter phone number"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="Enter address"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">
                    {editingMember ? 'Reset Password (Optional)' : 'Login Password'}
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder={editingMember ? 'Enter new password to reset' : 'Set login password for member'}
                    required={!editingMember}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Membership Plan</Label>
                  <Select
                    value={formData.planId}
                    onValueChange={(value) => setFormData({ ...formData, planId: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a plan" />
                    </SelectTrigger>
                    <SelectContent>
                      {plans.map((plan) => (
                        <SelectItem key={plan.id} value={plan.id}>
                          {plan.name} - ₹{plan.price.toLocaleString()}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button type="button" variant="outline" className="flex-1" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" variant="hero" className="flex-1">
                    {editingMember ? 'Update' : 'Add'} Member
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Search */}
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            placeholder="Search members..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-10"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Members Table */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <MemberTable
            members={filteredMembers}
            plans={plans}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        )}

        {!isLoading && filteredMembers.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No members found.</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Members;
