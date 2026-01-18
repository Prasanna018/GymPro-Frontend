import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { mockMembers, membershipPlans } from '@/lib/mockData';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Search, 
  Mail, 
  MessageSquare,
  Send,
  AlertCircle,
  Clock,
  Users
} from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';

const Reminders = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const { toast } = useToast();

  // Get members with expiring or expired memberships
  const membersNeedingReminder = mockMembers
    .map(member => {
      const plan = membershipPlans.find(p => p.id === member.planId);
      const endDate = new Date(member.expiryDate);
      const today = new Date();
      const daysUntilExpiry = Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      const paymentStatus = member.dueAmount > 0 ? 'pending' : 'paid';
      return { ...member, plan, daysUntilExpiry, paymentStatus };
    })
    .filter(member => member.daysUntilExpiry <= 7 || member.paymentStatus === 'pending');

  const filteredMembers = membersNeedingReminder.filter(member =>
    member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    member.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleMember = (memberId: string) => {
    setSelectedMembers(prev =>
      prev.includes(memberId)
        ? prev.filter(id => id !== memberId)
        : [...prev, memberId]
    );
  };

  const toggleAll = () => {
    if (selectedMembers.length === filteredMembers.length) {
      setSelectedMembers([]);
    } else {
      setSelectedMembers(filteredMembers.map(m => m.id));
    }
  };

  const sendEmailReminders = () => {
    if (selectedMembers.length === 0) {
      toast({
        title: 'No Members Selected',
        description: 'Please select at least one member to send reminders.',
        variant: 'destructive',
      });
      return;
    }
    toast({
      title: 'Email Reminders Sent',
      description: `Sent reminders to ${selectedMembers.length} member(s).`,
    });
    setSelectedMembers([]);
  };

  const sendWhatsAppReminders = () => {
    if (selectedMembers.length === 0) {
      toast({
        title: 'No Members Selected',
        description: 'Please select at least one member to send reminders.',
        variant: 'destructive',
      });
      return;
    }
    toast({
      title: 'WhatsApp Reminders Sent',
      description: `Sent WhatsApp reminders to ${selectedMembers.length} member(s).`,
    });
    setSelectedMembers([]);
  };

  const getStatusBadge = (daysUntilExpiry: number, paymentStatus: string) => {
    if (paymentStatus === 'pending') {
      return (
        <Badge className="bg-warning/20 text-warning border-warning/30">
          Payment Pending
        </Badge>
      );
    }
    if (daysUntilExpiry < 0) {
      return (
        <Badge className="bg-destructive/20 text-destructive border-destructive/30">
          Expired
        </Badge>
      );
    }
    if (daysUntilExpiry <= 3) {
      return (
        <Badge className="bg-warning/20 text-warning border-warning/30">
          Expiring Soon
        </Badge>
      );
    }
    return (
      <Badge className="bg-info/20 text-info border-info/30">
        {daysUntilExpiry} days left
      </Badge>
    );
  };

  return (
    <DashboardLayout requiredRole="owner">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl md:text-4xl text-foreground">
              SEND <span className="text-gradient-primary">REMINDERS</span>
            </h1>
            <p className="text-muted-foreground mt-1">
              Send email and WhatsApp reminders to members.
            </p>
          </div>
          <div className="flex gap-3">
            <Button 
              variant="outline" 
              className="gap-2"
              onClick={sendEmailReminders}
              disabled={selectedMembers.length === 0}
            >
              <Mail className="h-4 w-4" />
              Send Email ({selectedMembers.length})
            </Button>
            <Button 
              variant="hero" 
              className="gap-2"
              onClick={sendWhatsAppReminders}
              disabled={selectedMembers.length === 0}
            >
              <MessageSquare className="h-4 w-4" />
              Send WhatsApp ({selectedMembers.length})
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-4">
          <div className="stat-card">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-destructive/20">
                <AlertCircle className="h-6 w-6 text-destructive" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Expired Memberships</p>
                <p className="text-2xl font-bold text-foreground">
                  {membersNeedingReminder.filter(m => m.daysUntilExpiry < 0).length}
                </p>
              </div>
            </div>
          </div>
          <div className="stat-card">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-warning/20">
                <Clock className="h-6 w-6 text-warning" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Expiring This Week</p>
                <p className="text-2xl font-bold text-foreground">
                  {membersNeedingReminder.filter(m => m.daysUntilExpiry >= 0 && m.daysUntilExpiry <= 7).length}
                </p>
              </div>
            </div>
          </div>
          <div className="stat-card">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-primary/20">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Payment Pending</p>
                <p className="text-2xl font-bold text-foreground">
                  {membersNeedingReminder.filter(m => m.paymentStatus === 'pending').length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            placeholder="Search members..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Members Table */}
        <div className="rounded-xl border border-border/50 overflow-hidden bg-gradient-card">
          <Table>
            <TableHeader>
              <TableRow className="border-border/50 hover:bg-transparent">
                <TableHead className="w-12">
                  <Checkbox
                    checked={selectedMembers.length === filteredMembers.length && filteredMembers.length > 0}
                    onCheckedChange={toggleAll}
                  />
                </TableHead>
                <TableHead className="text-muted-foreground">Member</TableHead>
                <TableHead className="text-muted-foreground">Contact</TableHead>
                <TableHead className="text-muted-foreground">Plan</TableHead>
                <TableHead className="text-muted-foreground">Status</TableHead>
                <TableHead className="text-muted-foreground text-right">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredMembers.map((member) => (
                <TableRow key={member.id} className="border-border/50">
                  <TableCell>
                    <Checkbox
                      checked={selectedMembers.includes(member.id)}
                      onCheckedChange={() => toggleMember(member.id)}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
                        <span className="text-primary font-medium">
                          {member.name.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{member.name}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <p className="text-sm text-foreground">{member.email}</p>
                      <p className="text-sm text-muted-foreground">{member.phone}</p>
                    </div>
                  </TableCell>
                  <TableCell className="text-foreground">{member.plan?.name}</TableCell>
                  <TableCell>
                    {getStatusBadge(member.daysUntilExpiry, member.paymentStatus)}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => {
                          toast({
                            title: 'Email Sent',
                            description: `Reminder sent to ${member.name}.`,
                          });
                        }}
                      >
                        <Mail className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => {
                          toast({
                            title: 'WhatsApp Message Sent',
                            description: `Reminder sent to ${member.name}.`,
                          });
                        }}
                      >
                        <MessageSquare className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {filteredMembers.length === 0 && (
          <div className="text-center py-12">
            <Send className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No members need reminders at this time.</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Reminders;
