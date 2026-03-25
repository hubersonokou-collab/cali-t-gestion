'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/navigation';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Card from '@/components/ui/Card';
import { ShieldCheck } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import toast from 'react-hot-toast';

export default function VerifyPage() {
  const t = useTranslations('auth');
  const router = useRouter();
  const [otp, setOtp] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const storedPhone = sessionStorage.getItem('auth_phone');
    if (!storedPhone) {
      router.push('/auth/login');
      return;
    }
    setPhone(storedPhone);
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length !== 6) {
      toast.error(t('invalidOtp'));
      return;
    }

    setLoading(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.verifyOtp({
        phone,
        token: otp,
        type: 'sms',
      });

      if (error) {
        toast.error(error.message);
        return;
      }

      sessionStorage.removeItem('auth_phone');
      router.push('/dashboard');
    } catch {
      toast.error('An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({ phone });
    if (error) {
      toast.error(error.message);
    } else {
      toast.success(t('otpSent'));
    }
  };

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4 py-16">
      <Card className="w-full max-w-md p-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-nature-green/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <ShieldCheck className="w-8 h-8 text-nature-green" />
          </div>
          <h1 className="font-heading text-2xl font-bold text-nature-green-dark">{t('verifyTitle')}</h1>
          <p className="text-sm text-gray-500 mt-2">{phone}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            type="text"
            inputMode="numeric"
            maxLength={6}
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
            placeholder={t('otpPlaceholder')}
            label={t('otpLabel')}
            className="text-center text-2xl tracking-[0.5em] font-mono"
          />

          <Button type="submit" className="w-full" size="lg" disabled={loading}>
            {loading ? '...' : t('verify')}
          </Button>

          <button
            type="button"
            onClick={handleResend}
            className="w-full text-center text-sm text-nature-green hover:underline"
          >
            {t('resendOtp')}
          </button>
        </form>
      </Card>
    </div>
  );
}
