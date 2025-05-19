'use client';

import { LogOut, User } from 'lucide-react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
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
import { useState } from 'react';

interface UserMenuProps {
  email: string;
}

const translations = {
  en: {
    profile: 'Profile',
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
  const supabase = createClientComponentClient();
  const t = translations[lang];
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      toast({
        description: t.signOutSuccess,
      });
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