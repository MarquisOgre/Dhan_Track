import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Bell, Shield, Palette, HelpCircle, Key } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/hooks/useTheme';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Footer } from '@/components/Footer';
import { ChangePasswordModal } from '@/components/ChangePasswordModal';

const Settings = () => {
  const { user, loading: authLoading, signOut } = useAuth();
  const navigate = useNavigate();
  const { isDark, setIsDark } = useTheme();
  
  const [notifications, setNotifications] = useState(true);
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="space-y-4 w-full max-w-md px-4">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-xl border-b border-border/50">
        <div className="w-full px-6 py-4 flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="font-display font-bold text-xl">Settings</h1>
        </div>
      </header>

      <main className="flex-1 max-w-2xl mx-auto px-4 py-6 space-y-6 w-full">
        {/* Account Section */}
        <Card className="card-elevated">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="w-5 h-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg">Account</CardTitle>
                <CardDescription>Manage your account settings</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Email</p>
                <p className="text-sm text-muted-foreground">{user.email}</p>
              </div>
            </div>
            <Separator />
            <Button 
              variant="destructive" 
              className="w-full"
              onClick={() => signOut()}
            >
              Sign Out
            </Button>
          </CardContent>
        </Card>

        {/* Security Section */}
        <Card className="card-elevated">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Shield className="w-5 h-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg">Security</CardTitle>
                <CardDescription>Protect your account</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Key className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">Password</p>
                  <p className="text-sm text-muted-foreground">Change your account password</p>
                </div>
              </div>
              <Button variant="outline" onClick={() => setPasswordModalOpen(true)}>
                Change
              </Button>
            </div>
            <Separator />
            <p className="text-sm text-muted-foreground">
              Your data is secured with industry-standard encryption and Row Level Security policies.
            </p>
          </CardContent>
        </Card>

        {/* Notifications Section */}
        <Card className="card-elevated">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Bell className="w-5 h-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg">Notifications</CardTitle>
                <CardDescription>Configure notification preferences</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="notifications" className="flex flex-col gap-1">
                <span>Push Notifications</span>
                <span className="text-sm text-muted-foreground font-normal">
                  Receive alerts for recurring expenses
                </span>
              </Label>
              <Switch
                id="notifications"
                checked={notifications}
                onCheckedChange={setNotifications}
              />
            </div>
          </CardContent>
        </Card>

        {/* Appearance Section */}
        <Card className="card-elevated">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Palette className="w-5 h-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg">Appearance</CardTitle>
                <CardDescription>Customize your app experience</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="darkMode" className="flex flex-col gap-1">
                <span>Dark Mode</span>
                <span className="text-sm text-muted-foreground font-normal">
                  Switch to dark theme
                </span>
              </Label>
              <Switch
                id="darkMode"
                checked={isDark}
                onCheckedChange={setIsDark}
              />
            </div>
          </CardContent>
        </Card>

        {/* Help Section */}
        <Card className="card-elevated">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <HelpCircle className="w-5 h-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg">Help & Support</CardTitle>
                <CardDescription>Get assistance when you need it</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              DhanTrack helps you manage your finances with ease. Track your income, expenses, and recurring payments all in one place.
            </p>
            <p className="text-xs text-muted-foreground">
              Version 1.0.0
            </p>
          </CardContent>
        </Card>
      </main>

      <Footer />

      {/* Change Password Modal */}
      <ChangePasswordModal 
        open={passwordModalOpen} 
        onOpenChange={setPasswordModalOpen} 
      />
    </div>
  );
};

export default Settings;
