import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  User,
  Mail,
  Phone,
  Calendar,
  MapPin,
  Save,
  Camera,
  CreditCard,
  Activity
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { api } from '@/lib/api';
import { Member, MembershipPlan } from '@/lib/types';

const MemberProfile = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [member, setMember] = useState<Member | null>(null);
  const [plan, setPlan] = useState<MembershipPlan | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    emergencyContact: '',
    bloodGroup: '',
    height: '',
    weight: '',
    goal: '',
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setIsLoading(true);
      const [memberData, plansData] = await Promise.all([
        api.get('/members/me'),
        api.get('/plans')
      ]);
      setMember(memberData);
      const myPlan = plansData.find((p: MembershipPlan) => p.id === memberData.planId);
      setPlan(myPlan);

      setFormData({
        name: memberData.name,
        email: memberData.email,
        phone: memberData.phone,
        address: memberData.address,
        emergencyContact: (memberData as any).emergencyContact || '',
        bloodGroup: (memberData as any).bloodGroup || '',
        height: (memberData as any).height?.toString() || '',
        weight: (memberData as any).weight?.toString() || '',
        goal: (memberData as any).goal || '',
      });
    } catch (error) {
      console.error("Error fetching profile:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      await api.put('/members/me', {
        name: formData.name,
        phone: formData.phone,
        address: formData.address,
        emergency_contact: formData.emergencyContact,
        blood_group: formData.bloodGroup,
        height: formData.height ? Number(formData.height) : null,
        weight: formData.weight ? Number(formData.weight) : null,
        goal: formData.goal,
      });
      toast({
        title: 'Profile Updated',
        description: 'Your profile has been updated successfully.',
      });
      fetchProfile();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update profile',
        variant: 'destructive'
      });
    }
  };

  if (isLoading || !member) {
    return (
      <DashboardLayout requiredRole="member">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    );
  }

  const daysRemaining = Math.ceil(
    (new Date(member.expiryDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
  );

  return (
    <DashboardLayout requiredRole="member">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl md:text-4xl text-foreground">
              MY <span className="text-gradient-primary">PROFILE</span>
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage your personal information and preferences.
            </p>
          </div>
          <Button variant="hero" className="gap-2" onClick={handleSave}>
            <Save className="h-4 w-4" />
            Save Changes
          </Button>
        </div>

        {/* Profile Header Card */}
        <Card className="bg-gradient-card border-border/50">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="relative">
                <div className="h-24 w-24 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white text-3xl font-bold uppercase">
                  {member.name.charAt(0)}
                </div>
                <button className="absolute bottom-0 right-0 p-2 rounded-full bg-primary text-primary-foreground">
                  <Camera className="h-4 w-4" />
                </button>
              </div>
              <div className="text-center md:text-left">
                <h2 className="text-2xl font-bold text-foreground">{member.name}</h2>
                <p className="text-muted-foreground">{member.email}</p>
                <div className="flex flex-wrap gap-2 mt-3 justify-center md:justify-start">
                  <Badge className="bg-primary/20 text-primary border-primary/30">
                    {plan?.name || 'Loading Plan...'}
                  </Badge>
                  <Badge
                    className={
                      member.status === 'active'
                        ? 'bg-accent/20 text-accent border-accent/30'
                        : 'bg-warning/20 text-warning border-warning/30'
                    }
                  >
                    {member.status === 'active' ? 'Active' : 'Expired'}
                  </Badge>
                  <Badge className="bg-info/20 text-info border-info/30">
                    {daysRemaining > 0 ? `${daysRemaining} days left` : 'Expired'}
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Personal Information */}
          <Card className="bg-gradient-card border-border/50">
            <CardHeader>
              <CardTitle className="text-foreground flex items-center gap-2">
                <User className="h-5 w-5 text-primary" />
                Personal Information
              </CardTitle>
              <CardDescription>Your basic personal details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="space-y-2 opacity-70">
                <Label htmlFor="email">Email (Cannot be changed)</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    readOnly
                    className="pl-10 bg-muted/20"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="emergency">Emergency Contact</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="emergency"
                    value={formData.emergencyContact}
                    onChange={(e) => setFormData({ ...formData, emergencyContact: e.target.value })}
                    className="pl-10"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Fitness Information */}
          <Card className="bg-gradient-card border-border/50">
            <CardHeader>
              <CardTitle className="text-foreground flex items-center gap-2">
                <Activity className="h-5 w-5 text-accent" />
                Fitness Information
              </CardTitle>
              <CardDescription>Your health and fitness details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="bloodGroup">Blood Group</Label>
                  <Input
                    id="bloodGroup"
                    value={formData.bloodGroup}
                    onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="goal">Fitness Goal</Label>
                  <Input
                    id="goal"
                    value={formData.goal}
                    onChange={(e) => setFormData({ ...formData, goal: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="height">Height (cm)</Label>
                  <Input
                    id="height"
                    type="number"
                    value={formData.height}
                    onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="weight">Weight (kg)</Label>
                  <Input
                    id="weight"
                    type="number"
                    value={formData.weight}
                    onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                  />
                </div>
              </div>
              {Number(formData.weight) > 0 && Number(formData.height) > 0 && (
                <div className="p-4 rounded-lg bg-muted/30 mt-4">
                  <p className="text-sm text-muted-foreground mb-2">Your BMI</p>
                  <p className="text-2xl font-bold text-foreground">
                    {(Number(formData.weight) / Math.pow(Number(formData.height) / 100, 2)).toFixed(1)}
                  </p>
                  <p className="text-sm text-accent">
                    {(() => {
                      const bmi = Number(formData.weight) / Math.pow(Number(formData.height) / 100, 2);
                      if (bmi < 18.5) return 'Underweight';
                      if (bmi < 25) return 'Normal Weight';
                      if (bmi < 30) return 'Overweight';
                      return 'Obese';
                    })()}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Membership Details */}
          <Card className="bg-gradient-card border-border/50 lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-foreground flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-info" />
                Membership Details
              </CardTitle>
              <CardDescription>Your current membership information</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-4 gap-6">
                <div className="p-4 rounded-lg bg-muted/30">
                  <p className="text-sm text-muted-foreground mb-1">Plan</p>
                  <p className="text-lg font-semibold text-foreground">{plan?.name || 'N/A'}</p>
                </div>
                <div className="p-4 rounded-lg bg-muted/30">
                  <p className="text-sm text-muted-foreground mb-1">Price</p>
                  <p className="text-lg font-semibold text-foreground">₹{plan?.price || 0}/month</p>
                </div>
                <div className="p-4 rounded-lg bg-muted/30">
                  <p className="text-sm text-muted-foreground mb-1">Start Date</p>
                  <p className="text-lg font-semibold text-foreground">
                    {new Date(member.joiningDate).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-muted/30">
                  <p className="text-sm text-muted-foreground mb-1">End Date</p>
                  <p className="text-lg font-semibold text-foreground">
                    {new Date(member.expiryDate).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </p>
                </div>
              </div>
              {plan && (
                <div className="mt-6 p-4 rounded-lg bg-primary/10 border border-primary/20">
                  <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div>
                      <h4 className="font-semibold text-foreground">Plan Features</h4>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {plan.features.map((feature, index) => (
                          <Badge key={index} variant="outline" className="border-primary/30 text-primary">
                            {feature}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <Button variant="outline" disabled>Upgrade Plan (Coming Soon)</Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default MemberProfile;
