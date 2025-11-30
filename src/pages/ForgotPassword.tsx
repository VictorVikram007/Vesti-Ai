import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";
import { Loader2, ArrowLeft } from "lucide-react";
import { supabase } from "@/lib/supabase";

const ForgotPassword = () => {
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !validateEmail(email)) {
      toast({ title: "Invalid email", description: "Please enter a valid email address." });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        toast({ title: "Error", description: error.message });
      } else {
        setEmailSent(true);
        toast({ 
          title: "Reset email sent", 
          description: "Check your email for password reset instructions." 
        });
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to send reset email. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  if (emailSent) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <img src="/logo-ui.png" alt="Vesti AI" className="h-20 w-20" onError={(e) => { e.currentTarget.src = '/placeholder.svg'; }} />
            </div>
            <CardTitle className="text-2xl">Check your email</CardTitle>
            <p className="text-muted-foreground">We've sent password reset instructions to {email}</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md text-sm">
              <p>If you don't see the email in your inbox, check your spam folder.</p>
            </div>
            <Button asChild className="w-full bg-wardrobe-teal hover:bg-wardrobe-teal/90">
              <Link to="/login">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to login
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <img src="/logo-ui.png" alt="Vesti AI" className="h-20 w-20" onError={(e) => { e.currentTarget.src = '/placeholder.svg'; }} />
          </div>
          <CardTitle className="text-2xl">Reset your password</CardTitle>
          <p className="text-muted-foreground">Enter your email and we'll send you reset instructions</p>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label htmlFor="email">Email address</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="you@example.com"
                value={email} 
                onChange={(e) => setEmail(e.target.value)}
                className="focus:border-wardrobe-teal"
                required 
              />
            </div>
            <Button 
              type="submit" 
              className="w-full bg-wardrobe-teal hover:bg-wardrobe-teal/90" 
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                "Send reset instructions"
              )}
            </Button>
          </form>
          
          <div className="mt-6 text-center">
            <Link to="/login" className="text-sm text-wardrobe-teal hover:underline font-medium">
              <ArrowLeft className="inline mr-1 h-3 w-3" />
              Back to login
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ForgotPassword;