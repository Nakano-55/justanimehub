/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import { useState, useEffect } from 'react';
import { useLanguage } from '@/components/LanguageProvider';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import {
  Settings,
  Users,
  Shield,
  Mail,
  Loader2,
  AlertCircle,
  Save,
  Plus,
  Trash2
} from 'lucide-react';
import type { Database } from '@/lib/database.types';
import type { Language } from '@/lib/i18n/types';

interface AdminUser {
  id: string;
  email: string | null;
  created_at: string | null;
}

const translations = {
  en: {
    settings: 'Admin Settings',
    adminUsers: 'Admin Users',
    addAdmin: 'Add Admin',
    enterEmail: 'Enter admin email',
    add: 'Add',
    remove: 'Remove',
    loading: 'Loading settings...',
    error: 'Failed to load settings',
    retry: 'Retry',
    addSuccess: 'Admin user added successfully',
    addError: 'Failed to add admin user',
    removeSuccess: 'Admin user removed successfully',
    removeError: 'Failed to remove admin user',
    removeConfirm: 'Are you sure you want to remove this admin?',
    createdAt: 'Added on',
    userNotFound: 'User not found',
    cannotRemoveSelf: 'You cannot remove yourself as admin',
    mustHaveOneAdmin: 'There must be at least one admin user',
    removing: 'Removing...',
    you: 'You',
  },
  id: {
    settings: 'Pengaturan Admin',
    adminUsers: 'Pengguna Admin',
    addAdmin: 'Tambah Admin',
    enterEmail: 'Masukkan email admin',
    add: 'Tambah',
    remove: 'Hapus',
    loading: 'Memuat pengaturan...',
    error: 'Gagal memuat pengaturan',
    retry: 'Coba Lagi',
    addSuccess: 'Pengguna admin berhasil ditambahkan',
    addError: 'Gagal menambahkan pengguna admin',
    removeSuccess: 'Pengguna admin berhasil dihapus',
    removeError: 'Gagal menghapus pengguna admin',
    removeConfirm: 'Apakah Anda yakin ingin menghapus admin ini?',
    createdAt: 'Ditambahkan pada',
    userNotFound: 'Pengguna tidak ditemukan',
    cannotRemoveSelf: 'Anda tidak dapat menghapus diri sendiri sebagai admin',
    mustHaveOneAdmin: 'Harus ada setidaknya satu pengguna admin',
    removing: 'Menghapus...',
    you: 'Anda',
  },
} as const;

export default function AdminSettingsPage() {
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([]);
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [removingIds, setRemovingIds] = useState<Set<string>>(new Set());
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const supabase = createClientComponentClient<Database>();
  const { lang } = useLanguage();
  const t = translations[lang];

  useEffect(() => {
    const fetchAdminUsers = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Get current user
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          throw new Error('Not authenticated');
        }

        setCurrentUserId(user.id);

        // Check if current user is admin
        const { data: adminCheck } = await supabase
          .from('admin_users')
          .select('id')
          .eq('id', user.id)
          .single();

        if (!adminCheck) {
          throw new Error('Unauthorized');
        }

        // Fetch all admin users
        const { data: admins, error: adminsError } = await supabase
          .from('admin_users')
          .select('*')
          .order('created_at', { ascending: false });

        if (adminsError) {
          console.error('Error fetching admins:', adminsError);
          throw adminsError;
        }

        console.log('Fetched admin users:', admins);
        setAdminUsers(admins || []);

      } catch (err) {
        console.error('Error fetching admin users:', err);
        setError(err instanceof Error ? err.message : t.error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAdminUsers();

    // Subscribe to changes
    const channel = supabase
      .channel('admin-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'admin_users',
        },
        (payload) => {
          console.log('Admin users changed:', payload);
          fetchAdminUsers();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, t.error]);

  const handleAddAdmin = async () => {
    if (!newAdminEmail.trim()) return;

    try {
      setIsAdding(true);

      // First check if the user exists in profiles
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', newAdminEmail.trim())
        .single();

      if (profileError || !profile) {
        throw new Error(t.userNotFound);
      }

      // Check if user is already an admin
      const { data: existingAdmin } = await supabase
        .from('admin_users')
        .select('id')
        .eq('id', profile.id)
        .single();

      if (existingAdmin) {
        throw new Error('User is already an admin');
      }

      // Add user to admin_users table
      const { error: insertError } = await supabase
        .from('admin_users')
        .insert({
          id: profile.id,
          email: newAdminEmail.trim(),
        });

      if (insertError) {
        console.error('Insert error:', insertError);
        throw insertError;
      }

      setNewAdminEmail('');
      toast({
        description: t.addSuccess,
      });
    } catch (error) {
      console.error('Error adding admin:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : t.addError,
        variant: 'destructive',
      });
    } finally {
      setIsAdding(false);
    }
  };

  const handleRemoveAdmin = async (adminId: string) => {
    // Prevent removing self
    if (adminId === currentUserId) {
      toast({
        title: 'Error',
        description: t.cannotRemoveSelf,
        variant: 'destructive',
      });
      return;
    }

    // Prevent removing last admin
    if (adminUsers.length <= 1) {
      toast({
        title: 'Error',
        description: t.mustHaveOneAdmin,
        variant: 'destructive',
      });
      return;
    }

    if (!window.confirm(t.removeConfirm)) return;

    try {
      setRemovingIds(prev => new Set(prev).add(adminId));

      console.log('Attempting to remove admin:', adminId);

      const { error } = await supabase
        .from('admin_users')
        .delete()
        .eq('id', adminId);

      if (error) {
        console.error('Delete error:', error);
        throw error;
      }

      console.log('Admin removed successfully');

      // Update local state immediately
      setAdminUsers(prev => prev.filter(admin => admin.id !== adminId));

      toast({
        description: t.removeSuccess,
      });
    } catch (error) {
      console.error('Error removing admin:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : t.removeError,
        variant: 'destructive',
      });
    } finally {
      setRemovingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(adminId);
        return newSet;
      });
    }
  };

  const formatDate = (date: string | null) => {
    if (!date) return '';
    return new Date(date).toLocaleDateString(lang === 'id' ? 'id-ID' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-neutral-950 text-white pt-20">
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-violet-500" />
            <span className="ml-2">{t.loading}</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-neutral-950 text-white pt-20">
        <div className="container mx-auto px-6">
          <div className="flex flex-col items-center justify-center py-20">
            <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
            <p className="text-xl text-red-500 mb-4">{error}</p>
            <Button
              onClick={() => window.location.reload()}
              className="bg-violet-600 hover:bg-violet-500"
            >
              {t.retry}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-white pt-20">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex items-center gap-3 mb-8">
          <Settings className="w-8 h-8 text-violet-500" />
          <h1 className="text-2xl md:text-3xl font-bold">{t.settings}</h1>
        </div>

        <div className="space-y-8">
          <Card className="bg-neutral-900 border-neutral-800 p-4 md:p-6">
            <div className="flex items-center gap-3 mb-6">
              <Shield className="w-6 h-6 text-violet-500" />
              <h2 className="text-lg md:text-xl font-semibold">{t.adminUsers}</h2>
              <span className="text-xs md:text-sm text-neutral-400">({adminUsers.length} total)</span>
            </div>

            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <Input
                    type="email"
                    placeholder={t.enterEmail}
                    value={newAdminEmail}
                    onChange={(e) => setNewAdminEmail(e.target.value)}
                    className="bg-neutral-800 border-neutral-700"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        handleAddAdmin();
                      }
                    }}
                  />
                </div>
                <Button
                  onClick={handleAddAdmin}
                  disabled={isAdding || !newAdminEmail.trim()}
                  className="bg-violet-600 hover:bg-violet-500 w-full sm:w-auto"
                >
                  {isAdding ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : (
                    <Plus className="w-4 h-4 mr-2" />
                  )}
                  {t.add}
                </Button>
              </div>

              <div className="space-y-4">
                {adminUsers.length === 0 ? (
                  <div className="text-center py-8 text-neutral-400 text-sm md:text-base">
                    No admin users found
                  </div>
                ) : (
                  adminUsers.map((admin) => (
                    <div
                      key={admin.id}
                      className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 bg-neutral-800 rounded-lg gap-3 sm:gap-4"
                    >
                      <div className="flex items-start sm:items-center gap-3 min-w-0 flex-1">
                        <Users className="w-5 h-5 text-violet-500" />
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                            <Mail className="w-4 h-4 text-neutral-500" />
                            <span className="break-all text-sm md:text-base">{admin.email}</span>
                            {admin.id === currentUserId && (
                              <span className="text-xs bg-violet-600 text-white px-2 py-1 rounded self-start">
                                {t.you}
                              </span>
                            )}
                          </div>
                          <p className="text-xs md:text-sm text-neutral-500 mt-1">
                            {t.createdAt}: {formatDate(admin.created_at)}
                          </p>
                        </div>
                      </div>
                      <div className="flex justify-end sm:justify-start">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveAdmin(admin.id)}
                          disabled={
                            removingIds.has(admin.id) || 
                            admin.id === currentUserId || 
                            adminUsers.length <= 1
                          }
                          className="text-red-400 hover:text-red-300 hover:bg-red-950/50 disabled:opacity-50 flex-shrink-0"
                          title={
                            admin.id === currentUserId 
                              ? t.cannotRemoveSelf 
                              : adminUsers.length <= 1 
                              ? t.mustHaveOneAdmin 
                              : t.remove
                          }
                        >
                          {removingIds.has(admin.id) ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}