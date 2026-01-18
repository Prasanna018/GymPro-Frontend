import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { MemberTable } from '@/components/dashboard/MemberTable';
import { mockMembers, membershipPlans } from '@/lib/mockData';
import { Member } from '@/lib/types';
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

const Members = () => {
  const [members, setMembers] = useState<Member[]>(mockMembers);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const { toast } = useToast();

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    planId: '',
  });

  const filteredMembers = members.filter(member =>
    member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    member.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingMember) {
      // Update existing member
      setMembers(members.map(m => 
        m.id === editingMember.id 
          ? { ...m, ...formData }
          : m
      ));
      toast({
        title: 'Member Updated',
        description: `${formData.name} has been updated successfully.`,
      });
    } else {
      // Add new member
      const plan = membershipPlans.find(p => p.id === formData.planId);
      const joiningDate = new Date().toISOString().split('T')[0];
      const expiryDate = new Date(
        new Date().setMonth(new Date().getMonth() + (plan?.duration || 1))
      ).toISOString().split('T')[0];

      const newMember: Member = {
        id: String(Date.now()),
        ...formData,
        joiningDate,
        expiryDate,
        status: 'active',
        dueAmount: plan?.price || 0,
        paidAmount: 0,
      };
      
      setMembers([newMember, ...members]);
      toast({
        title: 'Member Added',
        description: `${formData.name} has been added successfully.`,
      });
    }

    resetForm();
    setIsDialogOpen(false);
  };

  const handleEdit = (member: Member) => {
    setEditingMember(member);
    setFormData({
      name: member.name,
      email: member.email,
      phone: member.phone,
      address: member.address,
      planId: member.planId,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (member: Member) => {
    setMembers(members.filter(m => m.id !== member.id));
    toast({
      title: 'Member Deleted',
      description: `${member.name} has been removed.`,
      variant: 'destructive',
    });
  };

  const resetForm = () => {
    setFormData({ name: '', email: '', phone: '', address: '', planId: '' });
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
                  <Label>Membership Plan</Label>
                  <Select
                    value={formData.planId}
                    onValueChange={(value) => setFormData({ ...formData, planId: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a plan" />
                    </SelectTrigger>
                    <SelectContent>
                      {membershipPlans.map((plan) => (
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
        <div className="relative max-w-md">
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
        <MemberTable
          members={filteredMembers}
          plans={membershipPlans}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />

        {filteredMembers.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No members found.</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Members;
