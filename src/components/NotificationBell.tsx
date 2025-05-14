/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */
'use client';

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Bell } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { useRouter } from 'next/navigation';
import type { Database } from '@/lib/database.types';
import type { Language } from '@/lib/i18n/types';

interface Notification {
  id: string;
  type: string;
  message: string;
  link: string | null;
  read: boolean;
  created_at: string;
  data: any;
}

interface NotificationBellProps {
  lang: Language;
}

const translations = {
  en: {
    noNotifications: 'No notifications',
    markAllRead: 'Mark all as read',
    markAsRead: 'Mark as read',
    loading: 'Loading notifications...',
    error: 'Error loading notifications',
    markReadSuccess: 'Marked as read',
    markReadError: 'Failed to mark as read',
    notifications: 'Notifications',
    notificationMessages: {
      content_approved: 'Your translation has been approved',
      content_rejected: 'Your translation has been rejected',
      content_pending: 'New translation submitted for review',
      reply: 'Someone replied to your thread',
      mention: 'mentioned you in a post',
    },
  },
  id: {
    noNotifications: 'Tidak ada notifikasi',
    markAllRead: 'Tandai semua telah dibaca',
    markAsRead: 'Tandai telah dibaca',
    loading: 'Memuat notifikasi...',
    error: 'Gagal memuat notifikasi',
    markReadSuccess: 'Ditandai telah dibaca',
    markReadError: 'Gagal menandai telah dibaca',
    notifications: 'Notifikasi',
    notificationMessages: {
      content_approved: 'Terjemahan Anda telah disetujui',
      content_rejected: 'Terjemahan Anda telah ditolak',
      content_pending: 'Terjemahan baru menunggu peninjauan',
      reply: 'Seseorang membalas thread Anda',
      mention: 'menyebut Anda dalam postingan',
    },
  }
} as const;

export function NotificationBell({ lang }: NotificationBellProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const { toast } = useToast();
  const supabase = createClientComponentClient<Database>();
  const t = translations[lang];

  const fetchNotifications = async () => {
    try {
      setIsLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;

      setNotifications(data);
      setUnreadCount(data.filter((n: Notification) => !n.read).length);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      toast({
        title: 'Error',
        description: t.error,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();

    const channel = supabase
      .channel('notifications')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notifications',
        },
        () => {
          fetchNotifications();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase]);

  const markAsRead = async (notificationId?: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      let query = supabase
        .from('notifications')
        .update({ read: true });

      if (notificationId) {
        query = query.eq('id', notificationId);
      } else {
        query = query.eq('user_id', user.id);
      }

      const { error } = await query;
      if (error) throw error;

      await fetchNotifications();
      toast({
        description: t.markReadSuccess,
      });
    } catch (error) {
      console.error('Error marking notification as read:', error);
      toast({
        title: 'Error',
        description: t.markReadError,
        variant: 'destructive',
      });
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString(lang === 'id' ? 'id-ID' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getLocalizedMessage = (notification: Notification) => {
    const baseMessage = t.notificationMessages[notification.type as keyof typeof t.notificationMessages] || notification.message;
    
    if (notification.type === 'mention' && notification.data?.mentionedBy) {
      return `@${notification.data.mentionedBy} ${baseMessage}`;
    }
    
    return baseMessage;
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 flex items-center justify-center text-xs text-white">
              {unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 bg-neutral-900 border-neutral-800">
        <div className="flex items-center justify-between p-2">
          <h3 className="font-semibold">{t.notifications}</h3>
          {notifications.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => markAsRead()}
              className="text-xs"
            >
              {t.markAllRead}
            </Button>
          )}
        </div>
        <div className="max-h-96 overflow-y-auto">
          {isLoading ? (
            <div className="p-4 text-center text-neutral-400">
              {t.loading}
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-4 text-center text-neutral-400">
              {t.noNotifications}
            </div>
          ) : (
            notifications.map((notification) => (
              <DropdownMenuItem
                key={notification.id}
                className={`p-4 cursor-pointer ${!notification.read ? 'bg-neutral-800/50' : ''}`}
                onClick={() => {
                  if (!notification.read) {
                    markAsRead(notification.id);
                  }
                  if (notification.link) {
                    router.push(notification.link);
                  }
                }}
              >
                <div className="space-y-1">
                  <p className={`text-sm ${!notification.read ? 'font-medium' : ''}`}>
                    {getLocalizedMessage(notification)}
                  </p>
                  <p className="text-xs text-neutral-400">
                    {formatDate(notification.created_at)}
                  </p>
                </div>
              </DropdownMenuItem>
            ))
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}