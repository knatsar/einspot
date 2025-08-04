import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { toast } from '@/hooks/use-toast';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { Icons } from '@/components/ui/icons';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useRouter } from 'next/navigation';
import {
  signInWithEmail,
  signInWithProvider,
  signUp,
  resetPassword,
  type AuthProvider,
} from '@/lib/auth';

const authSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

const resetSchema = z.object({
  email: z.string().email('Invalid email address'),
});

export function AuthForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [showResetDialog, setShowResetDialog] = useState(false);
  const router = useRouter();

  const form = useForm({
    resolver: zodResolver(authSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const resetForm = useForm({
    resolver: zodResolver(resetSchema),
    defaultValues: {
      email: '',
    },
  });

  const onSubmitSignIn = async (data: z.infer<typeof authSchema>) => {
    try {
      setIsLoading(true);
      const result = await signInWithEmail(data.email, data.password);
      
      if (result.error) {
        throw result.error;
      }

      toast({
        title: 'Success',
        description: 'Signed in successfully',
      });

      router.push('/dashboard');
    } catch (error) {
      toast({
        title: 'Error',
        description: (error as Error).message || 'Failed to sign in',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmitSignUp = async (data: z.infer<typeof authSchema>) => {
    try {
      setIsLoading(true);
      const result = await signUp(data.email, data.password);
      
      if (result.error) {
        throw result.error;
      }

      toast({
        title: 'Success',
        description: 'Please check your email to verify your account',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: (error as Error).message || 'Failed to sign up',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmitReset = async (data: z.infer<typeof resetSchema>) => {
    try {
      setIsLoading(true);
      const result = await resetPassword(data.email);
      
      if (result.error) {
        throw result.error;
      }

      toast({
        title: 'Success',
        description: 'Password reset link sent to your email',
      });
      setShowResetDialog(false);
    } catch (error) {
      toast({
        title: 'Error',
        description: (error as Error).message || 'Failed to send reset email',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleProviderSignIn = async (provider: AuthProvider) => {
    try {
      setIsLoading(true);
      const result = await signInWithProvider(provider);
      
      if (result.error) {
        throw result.error;
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: (error as Error).message || 'Failed to sign in',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-[400px]">
      <Tabs defaultValue="signin" className="w-full">
        <CardHeader>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="signin">Sign In</TabsTrigger>
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
          </TabsList>
        </CardHeader>
        <CardContent>
          <TabsContent value="signin">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmitSignIn)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input {...field} type="email" placeholder="you@example.com" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input {...field} type="password" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button
                  type="submit"
                  className="w-full"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    'Sign In'
                  )}
                </Button>
              </form>
            </Form>
            <div className="mt-4 text-center">
              <Button
                variant="link"
                className="px-0 text-sm text-muted-foreground"
                onClick={() => setShowResetDialog(true)}
              >
                Forgot password?
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="signup">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmitSignUp)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input {...field} type="email" placeholder="you@example.com" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input {...field} type="password" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button
                  type="submit"
                  className="w-full"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    'Sign Up'
                  )}
                </Button>
              </form>
            </Form>
          </TabsContent>

          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <Separator />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Or continue with
              </span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <Button
              variant="outline"
              disabled={isLoading}
              onClick={() => handleProviderSignIn('google')}
            >
              <Icons.google className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              disabled={isLoading}
              onClick={() => handleProviderSignIn('github')}
            >
              <Icons.gitHub className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              disabled={isLoading}
              onClick={() => handleProviderSignIn('twitter')}
            >
              <Icons.twitter className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Tabs>

      <Dialog open={showResetDialog} onOpenChange={setShowResetDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reset Password</DialogTitle>
            <DialogDescription>
              Enter your email address and we'll send you a link to reset your password.
            </DialogDescription>
          </DialogHeader>
          <Form {...resetForm}>
            <form onSubmit={resetForm.handleSubmit(onSubmitReset)} className="space-y-4">
              <FormField
                control={resetForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input {...field} type="email" placeholder="you@example.com" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                type="submit"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? (
                  <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  'Send Reset Link'
                )}
              </Button>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </Card>
  );
}