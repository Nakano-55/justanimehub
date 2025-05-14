/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';
import { createContext, useContext, useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useToast } from './ui/use-toast';
import { POINTS, calculateLevel } from '@/lib/gamification/points';
import type { Database } from '@/lib/database.types';

interface GamificationContextType {
  addPoints: (amount: number) => Promise<void>;
  checkAchievements: () => Promise<void>;
  points: number;
  level: number;
}

const GamificationContext = createContext<GamificationContextType>({
  addPoints: async () => {},
  checkAchievements: async () => {},
  points: 0,
  level: 1,
});

export function GamificationProvider({ children }: { children: React.ReactNode }) {
  const [points, setPoints] = useState(0);
  const [level, setLevel] = useState(1);
  const { toast } = useToast();
  const supabase = createClientComponentClient<Database>();

  useEffect(() => {
    const fetchUserPoints = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from('user_points')
        .select('points, level')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false })
        .single();

      if (data) {
        setPoints(data.points);
        setLevel(data.level);
      }
    };

    fetchUserPoints();

    const channel = supabase
      .channel('points-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_points',
        },
        (payload: any) => {
          if (payload.new) {
            setPoints(payload.new.points);
            setLevel(payload.new.level);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase]);

  const addPoints = async (amount: number) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get current points first
      const { data: currentData } = await supabase
        .from('user_points')
        .select('points')
        .eq('user_id', user.id)
        .single();

      const newPoints = (currentData?.points || 0) + amount;
      const newLevel = calculateLevel(newPoints);

      // Use upsert to either update existing or create new record
      const { error } = await supabase
        .from('user_points')
        .upsert({
          user_id: user.id,
          points: newPoints,
          level: newLevel,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'user_id'
        });

      if (error) throw error;

      if (newLevel > level) {
        toast({
          title: '🎉 Level Up!',
          description: `You've reached level ${newLevel}!`,
        });
      }

      toast({
        description: `+${amount} points!`,
      });
    } catch (error) {
      console.error('Error adding points:', error);
    }
  };

  const checkAchievements = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch user stats
      const [
        { data: translations },
        { data: reviews },
      ] = await Promise.all([
        supabase
          .from('content_versions')
          .select('id')
          .eq('created_by', user.id)
          .eq('status', 'approved'),
        supabase
          .from('reviews')
          .select('id')
          .eq('user_id', user.id),
      ]);

      const stats = {
        approvedTranslations: translations?.length || 0,
        totalReviews: reviews?.length || 0,
      };

      // Check for achievements
      const { data: existingAchievements } = await supabase
        .from('user_achievements')
        .select('achievement_type')
        .eq('user_id', user.id);

      const achieved = new Set(existingAchievements?.map(a => a.achievement_type));

      // First contribution
      if (stats.approvedTranslations > 0 && !achieved.has('FIRST_CONTRIBUTION')) {
        await supabase
          .from('user_achievements')
          .insert({
            user_id: user.id,
            achievement_type: 'FIRST_CONTRIBUTION',
            achieved_at: new Date().toISOString(),
          });
      }

      // First review
      if (stats.totalReviews > 0 && !achieved.has('FIRST_REVIEW')) {
        await supabase
          .from('user_achievements')
          .insert({
            user_id: user.id,
            achievement_type: 'FIRST_REVIEW',
            achieved_at: new Date().toISOString(),
          });
      }

      // Content master
      if (stats.approvedTranslations >= 10 && !achieved.has('CONTENT_MASTER')) {
        await supabase
          .from('user_achievements')
          .insert({
            user_id: user.id,
            achievement_type: 'CONTENT_MASTER',
            achieved_at: new Date().toISOString(),
          });
      }

      // Review master
      if (stats.totalReviews >= 20 && !achieved.has('REVIEW_MASTER')) {
        await supabase
          .from('user_achievements')
          .insert({
            user_id: user.id,
            achievement_type: 'REVIEW_MASTER',
            achieved_at: new Date().toISOString(),
          });
      }

      // Language expert
      if (stats.approvedTranslations >= 25 && !achieved.has('LANGUAGE_EXPERT')) {
        await supabase
          .from('user_achievements')
          .insert({
            user_id: user.id,
            achievement_type: 'LANGUAGE_EXPERT',
            achieved_at: new Date().toISOString(),
          });
      }
    } catch (error) {
      console.error('Error checking achievements:', error);
    }
  };

  return (
    <GamificationContext.Provider value={{ addPoints, checkAchievements, points, level }}>
      {children}
    </GamificationContext.Provider>
  );
}

export const useGamification = () => useContext(GamificationContext);