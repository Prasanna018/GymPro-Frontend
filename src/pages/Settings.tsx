import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import {
  Settings as SettingsIcon,
  Building,
  Bell,
  Shield,
  Palette,
  Save,
  Upload,
  Loader2
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

const Settings = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [gymSettings, setGymSettings] = useState({
    gymName: '',
    ownerName: '',
    email: '',
    phone: '',
    address: '',
    openingTime: '06:00',
    closingTime: '22:00',
  });

  const [notifications, setNotifications] = useState({
    emailReminders: true,
    whatsappReminders: true,
    paymentAlerts: true,
    expiryAlerts: true,
    dailyReports: false,
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setIsLoading(true);
      const data = await api.get('/settings');
      if (data) {
        setGymSettings({
          gymName: data.gymName || '',
          ownerName: data.ownerName || '',
          email: data.email || '',
          phone: data.phone || '',
          address: data.address || '',
          openingTime: data.openingTime || '06:00',
          closingTime: data.closingTime || '22:00',
        });
        if (data.notifications) {
          setNotifications({
            emailReminders: data.notifications.emailReminders ?? true,
            whatsappReminders: data.notifications.whatsappReminders ?? true,
            paymentAlerts: data.notifications.paymentAlerts ?? true,
            expiryAlerts: data.notifications.expiryAlerts ?? true,
            dailyReports: data.notifications.dailyReports ?? false,
          });
        }
      }
    } catch (error) {
      console.error('Failed to fetch settings:', error);
      toast({ title: 'Error', description: 'Failed to load settings', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    try {
      setIsSaving(true);
      const payload = {
        ...gymSettings,
        notifications: notifications
      };
      await api.put('/settings', payload);
      toast({
        title: 'Settings Saved',
        description: 'Your settings have been updated successfully.',
      });
    } catch (error: any) {
      console.error('Failed to save settings:', error);
      toast({ title: 'Error', description: error.message || 'Failed to save settings', variant: 'destructive' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdatePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({ title: 'Error', description: 'Passwords do not match', variant: 'destructive' });
      return;
    }
    try {
      await api.put('/auth/change-password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });
      toast({ title: 'Password Updated', description: 'Your password has been changed successfully.' });
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error: any) {
      toast({ title: 'Error', description: error.message || 'Failed to update password', variant: 'destructive' });
    }
  };

  return (
    <DashboardLayout requiredRole="owner">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl md:text-4xl text-foreground">
              <span className="text-gradient-primary">SETTINGS</span>
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage your gym settings and preferences.
            </p>
          </div>
          <Button
            variant="hero"
            className="gap-2 w-full sm:w-auto"
            onClick={handleSaveSettings}
            disabled={isSaving || isLoading}
          >
            {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Save Changes
          </Button>
        </div>

        {isLoading ? (
          <div className="h-[60vh] flex items-center justify-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary opacity-20" />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
            {/* Gym Information */}
            <Card className="bg-gradient-card border-border/50">
              <CardHeader>
                <CardTitle className="text-foreground flex items-center gap-2">
                  <Building className="h-5 w-5 text-primary" />
                  Gym Information
                </CardTitle>
                <CardDescription>Basic details about your gym</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="gymName">Gym Name</Label>
                  <Input
                    id="gymName"
                    value={gymSettings.gymName}
                    onChange={(e) => setGymSettings({ ...gymSettings, gymName: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ownerName">Owner Name</Label>
                  <Input
                    id="ownerName"
                    value={gymSettings.ownerName}
                    onChange={(e) => setGymSettings({ ...gymSettings, ownerName: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={gymSettings.email}
                      onChange={(e) => setGymSettings({ ...gymSettings, email: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      value={gymSettings.phone}
                      onChange={(e) => setGymSettings({ ...gymSettings, phone: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Input
                    id="address"
                    value={gymSettings.address}
                    onChange={(e) => setGymSettings({ ...gymSettings, address: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="openingTime">Opening Time</Label>
                    <Input
                      id="openingTime"
                      type="time"
                      value={gymSettings.openingTime}
                      onChange={(e) => setGymSettings({ ...gymSettings, openingTime: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="closingTime">Closing Time</Label>
                    <Input
                      id="closingTime"
                      type="time"
                      value={gymSettings.closingTime}
                      onChange={(e) => setGymSettings({ ...gymSettings, closingTime: e.target.value })}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Notifications */}
            <Card className="bg-gradient-card border-border/50">
              <CardHeader>
                <CardTitle className="text-foreground flex items-center gap-2">
                  <Bell className="h-5 w-5 text-accent" />
                  Notification Settings
                </CardTitle>
                <CardDescription>Configure how you receive notifications</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-foreground">Email Reminders</p>
                    <p className="text-sm text-muted-foreground">Send reminders via email</p>
                  </div>
                  <Switch
                    checked={notifications.emailReminders}
                    onCheckedChange={(checked) => setNotifications({ ...notifications, emailReminders: checked })}
                  />
                </div>
                <Separator className="bg-border/50" />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-foreground">WhatsApp Reminders</p>
                    <p className="text-sm text-muted-foreground">Send reminders via WhatsApp</p>
                  </div>
                  <Switch
                    checked={notifications.whatsappReminders}
                    onCheckedChange={(checked) => setNotifications({ ...notifications, whatsappReminders: checked })}
                  />
                </div>
                <Separator className="bg-border/50" />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-foreground">Payment Alerts</p>
                    <p className="text-sm text-muted-foreground">Get notified about payments</p>
                  </div>
                  <Switch
                    checked={notifications.paymentAlerts}
                    onCheckedChange={(checked) => setNotifications({ ...notifications, paymentAlerts: checked })}
                  />
                </div>
                <Separator className="bg-border/50" />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-foreground">Expiry Alerts</p>
                    <p className="text-sm text-muted-foreground">Alert when memberships expire</p>
                  </div>
                  <Switch
                    checked={notifications.expiryAlerts}
                    onCheckedChange={(checked) => setNotifications({ ...notifications, expiryAlerts: checked })}
                  />
                </div>
                <Separator className="bg-border/50" />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-foreground">Daily Reports</p>
                    <p className="text-sm text-muted-foreground">Receive daily summary reports</p>
                  </div>
                  <Switch
                    checked={notifications.dailyReports}
                    onCheckedChange={(checked) => setNotifications({ ...notifications, dailyReports: checked })}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Security */}
            <Card className="bg-gradient-card border-border/50">
              <CardHeader>
                <CardTitle className="text-foreground flex items-center gap-2">
                  <Shield className="h-5 w-5 text-info" />
                  Security
                </CardTitle>
                <CardDescription>Manage your account security</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Current Password</Label>
                  <Input
                    id="currentPassword"
                    type="password"
                    placeholder="Enter current password"
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    placeholder="Enter new password"
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="Confirm new password"
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                  />
                </div>
                <Button variant="outline" className="w-full mt-4" onClick={handleUpdatePassword}>
                  Update Password
                </Button>
              </CardContent>
            </Card>

            {/* Appearance */}
            <Card className="bg-gradient-card border-border/50">
              <CardHeader>
                <CardTitle className="text-foreground flex items-center gap-2">
                  <Palette className="h-5 w-5 text-warning" />
                  Appearance
                </CardTitle>
                <CardDescription>Customize the look and feel</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label className="mb-3 block">Gym Logo</Label>
                  <div className="border-2 border-dashed border-border/50 rounded-xl p-8 text-center">
                    <Upload className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                    <p className="text-sm text-muted-foreground mb-2">
                      Drag and drop or click to upload
                    </p>
                    <Button variant="outline" size="sm">
                      Choose File
                    </Button>
                  </div>
                </div>
                <Separator className="bg-border/50" />
                <div>
                  <Label className="mb-3 block">Theme</Label>
                  <div className="grid grid-cols-3 gap-3">
                    <button className="p-4 rounded-xl border-2 border-primary bg-primary/10 text-center">
                      <div className="h-4 w-4 rounded-full bg-primary mx-auto mb-2" />
                      <span className="text-sm text-foreground">Dark</span>
                    </button>
                    <button className="p-4 rounded-xl border border-border/50 text-center opacity-50">
                      <div className="h-4 w-4 rounded-full bg-muted mx-auto mb-2" />
                      <span className="text-sm text-muted-foreground">Light</span>
                    </button>
                    <button className="p-4 rounded-xl border border-border/50 text-center opacity-50">
                      <div className="h-4 w-4 rounded-full bg-gradient-to-r from-primary to-accent mx-auto mb-2" />
                      <span className="text-sm text-muted-foreground">Auto</span>
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Settings;
