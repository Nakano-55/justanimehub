'use client';

import { useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import type { Database } from '@/lib/database.types';

interface ClientLayoutProps {
  children: React.ReactNode;
}

export function ClientLayout({ children }: ClientLayoutProps) {
  const supabase = createClientComponentClient<Database>();

  useEffect(() => {
    const ensureUserExists = async () => {
      try {
        const { data: { user }, error: userError } = await supabase.auth.getUser();

        if (userError) {
          console.error('Error getting user:', userError);
          return;
        }

        if (!user) return;
        if (!user?.id || !user?.email) {
          console.warn('User ID or email is missing');
          return;
        }
        const { data, error } = await supabase
          .from('profiles')
          .upsert({
            id: user.id,
            email: user.email,
          }, {
            onConflict: 'id',
          });

        if (error) {
          console.error('Error upserting profile:', error);
        } else {
          console.log('Profile upsert successful:', data);
        }

        // Check if user is admin
        const { data: adminData } = await supabase
          .from('admin_users')
          .select('id')
          .eq('id', user.id)
          .single();

        if (adminData) {
          // Update profile with admin role
          const { error: roleError } = await supabase
            .from('profiles')
            .update({ role: 'admin' })
            .eq('id', user.id);

          if (roleError) {
            console.error('Error updating admin role:', roleError);
          }
        }

      } catch (error) {
        console.error('Error in ensureUserExists:', error);
      }
    };

    ensureUserExists();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      ensureUserExists();
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase]);

  return <>{children}</>;
}