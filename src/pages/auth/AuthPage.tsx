import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Wheat, Shield, Truck, Store } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

const AuthPage = () => {
  const { role } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, loading } = useAuth();
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: ''
  });
  const [authLoading, setAuthLoading] = useState(false);

  // Ensure a profile exists for the authenticated user; creates one if missing
  const ensureProfile = async () => {
    try {
      const { data: userRes } = await supabase.auth.getUser();
      const authedUser = userRes?.user;
      if (!authedUser) return;

      const { data: existing, error: selectError } = await supabase
        .from('profiles')
        .select('user_id')
        .eq('user_id', authedUser.id)
        .maybeSingle();

      if (selectError) {
        // If select fails for reasons other than no rows, surface it
        console.error('Profile select error:', selectError);
      }

      if (!existing) {
        await supabase.from('profiles').insert({
          user_id: authedUser.id,
          email: authedUser.email,
          role: role,
          full_name: formData.fullName || (authedUser.user_metadata as any)?.full_name || null,
        });
      }
    } catch (e) {
      console.error('ensureProfile error:', e);
    }
  };

  const roleConfig = {
    farmer: { title: "Farmer", icon: Wheat, color: "text-primary" },
    inspector: { title: "Inspector", icon: Shield, color: "text-accent" },
    distributor: { title: "Distributor", icon: Truck, color: "text-warning" },
    retailer: { title: "Retailer", icon: Store, color: "text-success" },
  };

  const currentRole = roleConfig[role as keyof typeof roleConfig];

  useEffect(() => {
    if (!currentRole) {
      navigate("/");
    }
    // Redirect if already authenticated
    if (user && !loading) {
      navigate(`/dashboard/${role}`);
    }
  }, [currentRole, navigate, user, loading, role]);

  const handleLogin = async () => {
    if (!formData.email || !formData.password) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    setAuthLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (error) throw error;

      // Make sure profile exists after login
      await ensureProfile();

      toast({
        title: "Login Successful",
        description: `Welcome back to AgriChain!`,
      });

      navigate(`/dashboard/${role}`);
    } catch (error: any) {
      toast({
        title: "Login Failed",
        description: error.message || "An error occurred during login",
        variant: "destructive",
      });
    } finally {
      setAuthLoading(false);
    }
  };

  const handleSignUp = async () => {
    if (!formData.email || !formData.password || !formData.confirmPassword || !formData.fullName) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match",
        variant: "destructive",
      });
      return;
    }

    setAuthLoading(true);
    try {
      const redirectUrl = `${window.location.origin}/dashboard/${role}`;
      
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            full_name: formData.fullName,
            role: role
          }
        }
      });

      if (error) throw error;

      // If email confirmation is disabled, session exists now
      if (data.session) {
        await ensureProfile();
        toast({ title: "Welcome!", description: "Your account is ready." });
        navigate(`/dashboard/${role}`);
        return;
      }

      toast({
        title: "Account Created",
        description: "Please check your email to confirm your account",
      });
    } catch (error: any) {
      toast({
        title: "Sign Up Failed",
        description: error.message || "An error occurred during sign up",
        variant: "destructive",
      });
    } finally {
      setAuthLoading(false);
    }
  };

  if (!currentRole) return null;

  const IconComponent = currentRole.icon;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-secondary flex items-center justify-center">
            <IconComponent className={`w-8 h-8 ${currentRole.color}`} />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">
            {currentRole.title} Portal
          </h1>
          <p className="text-muted-foreground">
            Access your AgriChain dashboard
          </p>
        </div>

        {/* Auth Tabs */}
        <Card>
          <CardHeader>
            <CardTitle>Account Access</CardTitle>
            <CardDescription>
              Sign in to your account or create a new one
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
              </TabsList>
              
              <TabsContent value="login" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login-email">Email</Label>
                  <Input 
                    id="login-email" 
                    type="email" 
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="login-password">Password</Label>
                  <Input 
                    id="login-password" 
                    type="password" 
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  />
                </div>
                <Button 
                  onClick={handleLogin}
                  className="w-full"
                  disabled={authLoading}
                >
                  {authLoading ? "Logging in..." : "Login"}
                </Button>
              </TabsContent>
              
              <TabsContent value="signup" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-name">Full Name</Label>
                  <Input 
                    id="signup-name" 
                    placeholder="Enter your full name"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-email">Email</Label>
                  <Input 
                    id="signup-email" 
                    type="email" 
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password">Password</Label>
                  <Input 
                    id="signup-password" 
                    type="password" 
                    placeholder="Create a password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-confirm">Confirm Password</Label>
                  <Input 
                    id="signup-confirm" 
                    type="password" 
                    placeholder="Confirm your password"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  />
                </div>
                <Button 
                  onClick={handleSignUp}
                  className="w-full"
                  disabled={authLoading}
                >
                  {authLoading ? "Creating Account..." : "Sign Up"}
                </Button>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <div className="text-center mt-6">
          <Button variant="ghost" onClick={() => navigate("/")}>
            ← Back to Role Selection
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;