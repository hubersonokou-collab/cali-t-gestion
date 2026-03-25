'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/navigation';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Card from '@/components/ui/Card';
import { Phone } from 'lucide-react';
import { PHONE_COUNTRY_CODE } from '@/lib/constants';
import { createClient } from '@/lib/supabase/client';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const t = useTranslations('auth');
  const router = useRouter();
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone.trim()) {
      toast.error(t('invalidPhone'));
      return;
    }

    setLoading(true);
    try {
      const supabase = createClient();
      const fullPhone = `${PHONE_COUNTRY_CODE}${phone.replace(/\s/g, '')}`;

      const { error } = await supabase.auth.signInWithOtp({ phone: fullPhone });

      if (error) {
        toast.error(error.message);
        return;
      }

      toast.success(t('otpSent'));
      // Store phone in sessionStorage for verification page
      sessionStorage.setItem('auth_phone', fullPhone);
      router.push('/auth/verify');
    } catch {
      toast.error('An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4 py-16">
      <Card className="w-full max-w-md p-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-nature-green/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Phone className="w-8 h-8 text-nature-green" />
          </div>
          <h1 className="font-heading text-2xl font-bold text-nature-green-dark">{t('title')}</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('phoneLabel')}
            </label>
            <div className="flex gap-2">
              <div className="flex items-center px-3 bg-gray-100 border border-gray-300 rounded-lg text-sm font-medium text-gray-600">
                {PHONE_COUNTRY_CODE}
              </div>
              <Input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder={t('phonePlaceholder')}
                className="flex-1"
              />
            </div>
          </div>

          <Button type="submit" className="w-full" size="lg" disabled={loading}>
            {loading ? '...' : t('sendOtp')}
          </Button>
        </form>
      </Card>
    </div>
  );
}
