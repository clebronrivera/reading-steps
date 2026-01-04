import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { PublicLayout } from "@/components/layout/PublicLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, BookOpen, ArrowLeft, Mail } from "lucide-react";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const resetSchema = z.object({
  email: z.string().email("Please enter a valid email"),
});

const newPasswordSchema = z.object({
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string().min(6, "Password must be at least 6 characters"),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type LoginFormData = z.infer<typeof loginSchema>;
type ResetFormData = z.infer<typeof resetSchema>;
type NewPasswordFormData = z.infer<typeof newPasswordSchema>;

type ViewMode = 'login' | 'signup' | 'forgot' | 'reset';

export default function Login() {
  const [isLoading, setIsLoading] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('login');
  const [resetEmailSent, setResetEmailSent] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Check for password reset token in URL
  useEffect(() => {
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    const type = hashParams.get('type');
    if (type === 'recovery') {
      setViewMode('reset');
    }
  }, []);

  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const resetForm = useForm<ResetFormData>({
    resolver: zodResolver(resetSchema),
    defaultValues: { email: "" },
  });

  const newPasswordForm = useForm<NewPasswordFormData>({
    resolver: zodResolver(newPasswordSchema),
    defaultValues: { password: "", confirmPassword: "" },
  });

  const onLoginSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    try {
      if (viewMode === 'signup') {
        const { error } = await supabase.auth.signUp({
          email: data.email,
          password: data.password,
          options: {
            emailRedirectTo: `${window.location.origin}/dashboard`,
          },
        });
        if (error) throw error;
        toast({
          title: "Account created!",
          description: "Please check your email to verify your account.",
        });
      } else {
        const { data: authData, error } = await supabase.auth.signInWithPassword({
          email: data.email,
          password: data.password,
        });
        if (error) throw error;

        // Check if user has assessor or admin role
        const { data: roleData, error: roleError } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", authData.user.id)
          .single();

        if (roleError || !roleData) {
          await supabase.auth.signOut();
          toast({
            title: "Access Denied",
            description: "Your account is not authorized. Please contact an administrator to request access.",
            variant: "destructive",
          });
          return;
        }

        toast({
          title: "Welcome back!",
          description: "You've successfully logged in.",
        });
        navigate("/dashboard");
      }
    } catch (error: any) {
      let message = error.message;
      if (error.message?.includes("User already registered")) {
        message = "An account with this email already exists. Please log in.";
      }
      toast({
        title: viewMode === 'signup' ? "Sign up failed" : "Login failed",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const onResetSubmit = async (data: ResetFormData) => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
        redirectTo: `${window.location.origin}/login`,
      });
      if (error) throw error;
      setResetEmailSent(true);
      toast({
        title: "Reset email sent!",
        description: "Check your email for the password reset link.",
      });
    } catch (error: any) {
      toast({
        title: "Failed to send reset email",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const onNewPasswordSubmit = async (data: NewPasswordFormData) => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: data.password,
      });
      if (error) throw error;
      toast({
        title: "Password updated!",
        description: "You can now log in with your new password.",
      });
      setViewMode('login');
      window.history.replaceState(null, '', window.location.pathname);
    } catch (error: any) {
      toast({
        title: "Failed to update password",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const renderForgotPassword = () => (
    <Card className="card-elevated border-0">
      <CardHeader className="text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl hero-gradient mx-auto mb-4">
          <Mail className="h-6 w-6 text-primary-foreground" />
        </div>
        <CardTitle>Reset Password</CardTitle>
        <CardDescription>
          Enter your email and we'll send you a reset link
        </CardDescription>
      </CardHeader>
      <CardContent>
        {resetEmailSent ? (
          <div className="text-center space-y-4">
            <p className="text-muted-foreground">
              We've sent a password reset link to your email. Please check your inbox and click the link to reset your password.
            </p>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => {
                setViewMode('login');
                setResetEmailSent(false);
              }}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Login
            </Button>
          </div>
        ) : (
          <Form {...resetForm}>
            <form onSubmit={resetForm.handleSubmit(onResetSubmit)} className="space-y-4">
              <FormField
                control={resetForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="your@email.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                type="submit"
                className="w-full hero-gradient border-0 text-primary-foreground"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  "Send Reset Link"
                )}
              </Button>
            </form>
          </Form>
        )}
        {!resetEmailSent && (
          <div className="mt-6 text-center">
            <button
              type="button"
              className="text-primary hover:underline text-sm"
              onClick={() => setViewMode('login')}
            >
              <ArrowLeft className="h-3 w-3 inline mr-1" />
              Back to Login
            </button>
          </div>
        )}
      </CardContent>
    </Card>
  );

  const renderNewPassword = () => (
    <Card className="card-elevated border-0">
      <CardHeader className="text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl hero-gradient mx-auto mb-4">
          <BookOpen className="h-6 w-6 text-primary-foreground" />
        </div>
        <CardTitle>Set New Password</CardTitle>
        <CardDescription>
          Enter your new password below
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...newPasswordForm}>
          <form onSubmit={newPasswordForm.handleSubmit(onNewPasswordSubmit)} className="space-y-4">
            <FormField
              control={newPasswordForm.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>New Password</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="••••••••" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={newPasswordForm.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirm Password</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="••••••••" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              type="submit"
              className="w-full hero-gradient border-0 text-primary-foreground"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                "Update Password"
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );

  const renderLoginSignup = () => (
    <Card className="card-elevated border-0">
      <CardHeader className="text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl hero-gradient mx-auto mb-4">
          <BookOpen className="h-6 w-6 text-primary-foreground" />
        </div>
        <CardTitle>{viewMode === 'signup' ? "Create Account" : "Assessor Login"}</CardTitle>
        <CardDescription>
          {viewMode === 'signup'
            ? "Create an account to access the assessor dashboard"
            : "Sign in to access the assessor dashboard"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...loginForm}>
          <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
            <FormField
              control={loginForm.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="your@email.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={loginForm.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center justify-between">
                    <FormLabel>Password</FormLabel>
                    {viewMode === 'login' && (
                      <button
                        type="button"
                        className="text-xs text-primary hover:underline"
                        onClick={() => setViewMode('forgot')}
                      >
                        Forgot password?
                      </button>
                    )}
                  </div>
                  <FormControl>
                    <Input type="password" placeholder="••••••••" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              type="submit"
              className="w-full hero-gradient border-0 text-primary-foreground"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {viewMode === 'signup' ? "Creating account..." : "Signing in..."}
                </>
              ) : viewMode === 'signup' ? (
                "Create Account"
              ) : (
                "Sign In"
              )}
            </Button>
          </form>
        </Form>
        <div className="mt-6 text-center text-sm">
          <button
            type="button"
            className="text-primary hover:underline"
            onClick={() => setViewMode(viewMode === 'signup' ? 'login' : 'signup')}
          >
            {viewMode === 'signup'
              ? "Already have an account? Sign in"
              : "Need an account? Sign up"}
          </button>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <PublicLayout>
      <section className="py-20">
        <div className="container max-w-md">
          {viewMode === 'forgot' && renderForgotPassword()}
          {viewMode === 'reset' && renderNewPassword()}
          {(viewMode === 'login' || viewMode === 'signup') && renderLoginSignup()}
        </div>
      </section>
    </PublicLayout>
  );
}
