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
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import Link from 'next/link';
import { useLanguage } from './LanguageProvider';

interface UserMenuProps {
  email: string;
}

const translations = {
  en: {
    profile: 'Profile',
    signOut: 'Sign Out',
    signOutSuccess: 'You have been signed out',
    signOutError: 'Failed to sign out',
  },
  id: {
    profile: 'Profil',
    signOut: 'Keluar',
    signOutSuccess: 'Anda telah keluar',
    signOutError: 'Gagal keluar',
  }
} as const;

export function UserMenu({ email }: UserMenuProps) {
  const { lang } = useLanguage();
  const { toast } = useToast();
  const supabase = createClientComponentClient();
  const t = translations[lang];

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
        <DropdownMenuItem onClick={handleSignOut}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>{t.signOut}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}