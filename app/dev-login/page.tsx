'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function DevLogin() {
    const router = useRouter();

    useEffect(() => {
        const login = async () => {
            const supabase = createClient();

            const { error } = await supabase.auth.signInWithPassword({
                email: 'suku70655@gmail.com',
                password: 'sakshi@123',
            });

            if (!error) {
                router.push('/dashboard');
            } else {
                console.error(error.message);
            }
        };

        login();
    }, [router]);

    return <div>Signing you in…</div>;
}
