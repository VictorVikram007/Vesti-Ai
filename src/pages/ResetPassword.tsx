import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Link, useNavigate } from "react-router-dom";
import { Loader2, Eye, EyeOff, Check, X } from "lucide-react";
import { supabase } from "@/lib/supabase";

const ResetPassword = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isValidSession, setIsValidSession] = useState(false);

  useEffect(() => {
    // Check if user has a valid session from password reset email
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setIsValidSession(true);
      } else {
        toast({ title: "Invalid reset link", description: "Please request a new password reset." });
        navigate("/forgot-password");
      }
    });
  }, [navigate, toast]);

  const validatePassword = (password: string) => {
    return {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /\d/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const checks = validatePassword(password);
    const isValid = Object.values(checks).every(Boolean);
    
    if (!isValid) {
      toast({ title: "Weak password", description: "Password does not meet requirements." });
      return;
    }
    
    if (password !== confirmPassword) {
      toast({ title: "Passwords don't match", description: "Please make sure both passwords are identical." });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: password
      });

      if (error) {
        toast({ title: "Error", description: error.message });
      } else {
        toast({ title: "Password updated", description: "Your password has been reset successfully." });
        navigate("/login");
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to reset password. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  const passwordChecks = validatePassword(password);

  if (!isValidSession) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Invalid Reset Link</CardTitle>
            <p className="text-muted-foreground">This password reset link is invalid or has expired.</p>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full bg-wardrobe-teal hover:bg-wardrobe-teal/90">
              <Link to="/forgot-password">Request New Reset Link</Link>
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
          <CardTitle className="text-2xl">Set new password</CardTitle>
          <p className="text-muted-foreground">Enter your new password below</p>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label htmlFor="password">New password</Label>
              <div className="relative">
                <Input 
                  id="password" 
                  type={showPassword ? "text" : "password"}
                  placeholder="Create a strong password"
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)}
                  className="focus:border-wardrobe-teal pr-10"
                  required 
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
              {password && (
                <div className="text-xs space-y-1">
                  <div className="flex items-center gap-2">
                    {passwordChecks.length ? <Check className="h-3 w-3 text-green-500" /> : <X className="h-3 w-3 text-red-500" />}
                    <span className={passwordChecks.length ? "text-green-600" : "text-red-600"}>At least 8 characters</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {passwordChecks.uppercase ? <Check className="h-3 w-3 text-green-500" /> : <X className="h-3 w-3 text-red-500" />}
                    <span className={passwordChecks.uppercase ? "text-green-600" : "text-red-600"}>One uppercase letter</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {passwordChecks.number ? <Check className="h-3 w-3 text-green-500" /> : <X className="h-3 w-3 text-red-500" />}
                    <span className={passwordChecks.number ? "text-green-600" : "text-red-600"}>One number</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {passwordChecks.special ? <Check className="h-3 w-3 text-green-500" /> : <X className="h-3 w-3 text-red-500" />}
                    <span className={passwordChecks.special ? "text-green-600" : "text-red-600"}>One special character</span>
                  </div>
                </div>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm new password</Label>
              <div className="relative">
                <Input 
                  id="confirmPassword" 
                  type={showConfirm ? "text" : "password"}
                  placeholder="Confirm your password"
                  value={confirmPassword} 
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="focus:border-wardrobe-teal pr-10"
                  required 
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                  onClick={() => setShowConfirm(!showConfirm)}
                >
                  {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
              {confirmPassword && password !== confirmPassword && (
                <p className="text-sm text-red-500">Passwords do not match</p>
              )}
            </div>
            <Button 
              type="submit" 
              className="w-full bg-wardrobe-teal hover:bg-wardrobe-teal/90" 
              disabled={loading || !Object.values(passwordChecks).every(Boolean) || password !== confirmPassword}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating password...
                </>
              ) : (
                "Update password"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ResetPassword;