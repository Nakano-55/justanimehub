'use client';

import { LogOut, User, Shield } from 'lucide-react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import Link from 'next/link';
import { useLanguage } from './LanguageProvider';
import type { Database } from '@/lib/database.types';

interface UserMenuProps {
  email: string;
}

const translations = {
  en: {
    profile: 'Profile',
    adminPanel: 'Admin Panel',
    signOut: 'Sign Out',
    signOutSuccess: 'You have been signed out',
    signOutError: 'Failed to sign out',
    confirmSignOut: 'Are you sure you want to sign out?',
    confirmSignOutDesc: 'You will need to sign in again to access your account.',
    cancel: 'Cancel',
    confirm: 'Yes, sign out',
  },
  id: {
    profile: 'Profil',
    adminPanel: 'Panel Admin',
    signOut: 'Keluar',
    signOutSuccess: 'Anda telah keluar',
    signOutError: 'Gagal keluar',
    confirmSignOut: 'Apakah Anda yakin ingin keluar?',
    confirmSignOutDesc: 'Anda perlu masuk kembali untuk mengakses akun Anda.',
    cancel: 'Batal',
    confirm: 'Ya, keluar',
  }
} as const;

export function UserMenu({ email }: UserMenuProps) {
  const { lang } = useLanguage();
  const { toast } = useToast();
  const router = useRouter();
  const supabase = createClientComponentClient<Database>();
  const t = translations[lang];
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkAdminStatus = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data: adminUser } = await supabase
          .from('admin_users')
          .select('id')
          .eq('id', user.id)
          .single();

        setIsAdmin(!!adminUser);
      } catch (error) {
        console.error('Error checking admin status:', error);
        setIsAdmin(false);
      }
    };

    checkAdminStatus();
  }, [supabase]);

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      toast({
        description: t.signOutSuccess,
      });
      router.push(`/${lang}`);
    } catch (error) {
      console.error('Sign out error:', error);
      toast({
        title: 'Error',
        description: t.signOutError,
        variant: 'destructive',
      });
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="icon">
            <User className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">{email}</p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link href={`/${lang}/profile`}>
              <User className="mr-2 h-4 w-4" />
              <span>{t.profile}</span>
            </Link>
          </DropdownMenuItem>
          {isAdmin && (
            <DropdownMenuItem asChild>
              <Link href={`/${lang}/admin`}>
                <Shield className="mr-2 h-4 w-4" />
                <span>{t.adminPanel}</span>
              </Link>
            </DropdownMenuItem>
          )}
          <DropdownMenuItem onClick={() => setShowConfirmDialog(true)}>
            <LogOut className="mr-2 h-4 w-4" />
            <span>{t.signOut}</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t.confirmSignOut}</AlertDialogTitle>
            <AlertDialogDescription>
              {t.confirmSignOutDesc}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t.cancel}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleSignOut}
              className="bg-red-600 hover:bg-red-500"
            >
              {t.confirm}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}