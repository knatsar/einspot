import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { toast } from '@/hooks/use-toast';
import { Icons } from '@/components/ui/icons';
import QRCode from 'qrcode.react';
import { setupMFA, verifyMFA } from '@/lib/auth';

export function MFASetup() {
  const [isLoading, setIsLoading] = useState(false);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [secret, setSecret] = useState<string | null>(null);
  const [verificationCode, setVerificationCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  const handleSetup = async () => {
    try {
      setIsLoading(true);
      const result = await setupMFA();
      
      if (result.error) {
        throw result.error;
      }

      if (result.data) {
        setQrCode(result.data.qr);
        setSecret(result.data.secret);
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: (error as Error).message || 'Failed to setup MFA',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerify = async () => {
    if (!verificationCode) {
      toast({
        title: 'Error',
        description: 'Please enter the verification code',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsVerifying(true);
      const result = await verifyMFA(verificationCode);
      
      if (result.error) {
        throw result.error;
      }

      toast({
        title: 'Success',
        description: 'MFA setup completed successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: (error as Error).message || 'Failed to verify MFA code',
        variant: 'destructive',
      });
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <Card className="w-[400px]">
      <CardHeader>
        <CardTitle>Two-Factor Authentication</CardTitle>
        <CardDescription>
          Secure your account with two-factor authentication
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!qrCode ? (
          <Button
            onClick={handleSetup}
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? (
              <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <>
                <Icons.lock className="mr-2 h-4 w-4" />
                Setup 2FA
              </>
            )}
          </Button>
        ) : (
          <div className="space-y-6">
            <div className="flex justify-center">
              <div className="bg-white p-4 rounded-lg">
                <QRCode value={qrCode} size={200} />
              </div>
            </div>

            {secret && (
              <div className="space-y-2">
                <p className="text-sm font-medium">Manual Entry Code:</p>
                <code className="bg-muted px-2 py-1 rounded text-sm">
                  {secret}
                </code>
              </div>
            )}

            <div className="space-y-2">
              <p className="text-sm font-medium">Verification Code</p>
              <div className="flex space-x-2">
                <Input
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  placeholder="Enter 6-digit code"
                  maxLength={6}
                />
                <Button
                  onClick={handleVerify}
                  disabled={isVerifying || !verificationCode}
                >
                  {isVerifying ? (
                    <Icons.spinner className="h-4 w-4 animate-spin" />
                  ) : (
                    'Verify'
                  )}
                </Button>
              </div>
            </div>

            <div className="text-sm text-muted-foreground">
              <p>1. Install an authenticator app (like Google Authenticator)</p>
              <p>2. Scan the QR code or enter the code manually</p>
              <p>3. Enter the verification code from your app</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
