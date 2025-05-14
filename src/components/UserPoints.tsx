/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import { useEffect, useState, useCallback } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { AchievementCard } from '@/components/AchievementCard';
import { Trophy, Star, Award, Crown } from 'lucide-react';
import { LEVELS, pointsToNextLevel } from '@/lib/gamification/points';
import { achievementsList } from '@/lib/gamification/achievements';
import type { Database } from '@/lib/database.types';
import type { Language } from '@/lib/i18n/types';

interface UserPointsProps {
  userId: string;
  lang: Language;
}

interface UserPointsData {
  points: number;
  level: number;
}

interface UserAchievement {
  achievement_type: string;
  achieved_at: string;
}

interface AchievementProgress {
  type: string;
  progress: number;
}

const translations = {
  en: {
    level: 'Level',
    points: 'Points',
    nextLevel: 'Next Level',
    achievements: 'Achievements',
    loading: 'Loading points...',
    error: 'Failed to load points',
  },
  id: {
    level: 'Level',
    points: 'Poin',
    nextLevel: 'Level Berikutnya',
    achievements: 'Pencapaian',
    loading: 'Memuat poin...',
    error: 'Gagal memuat poin',
  },
} as const;

export function UserPoints({ userId, lang }: UserPointsProps) {
  const [pointsData, setPointsData] = useState<UserPointsData | null>(null);
  const [achievements, setAchievements] = useState<UserAchievement[]>([]);
  const [achievementProgress, setAchievementProgress] = useState<AchievementProgress[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClientComponentClient<Database>();
  const t = translations[lang];

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Fetch points data - now using order by updated_at to get latest
      const { data: pointsData, error: pointsError } = await supabase
        .from('user_points')
        .select('points, level')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false })
        .single();

      if (pointsError && pointsError.code !== 'PGRST116') {
        throw pointsError;
      }

      // If no points record exists, create one with upsert
      if (!pointsData) {
        const { data: newPointsData, error: createError } = await supabase
          .from('user_points')
          .upsert({
            user_id: userId,
            points: 0,
            level: 1,
            updated_at: new Date().toISOString(),
          }, {
            onConflict: 'user_id'
          })
          .select()
          .single();

        if (createError) throw createError;
        setPointsData(newPointsData);
      } else {
        setPointsData(pointsData);
      }

      // Fetch achievements
      const { data: achievementsData } = await supabase
        .from('user_achievements')
        .select('achievement_type, achieved_at')
        .eq('user_id', userId);

      setAchievements(achievementsData || []);

      // Calculate progress for each achievement
      const [
        { data: translations, count: translationCount },
        { data: reviews, count: reviewCount },
      ] = await Promise.all([
        supabase
          .from('content_versions')
          .select('id', { count: 'exact' })
          .eq('created_by', userId)
          .eq('status', 'approved'),
        supabase
          .from('reviews')
          .select('id', { count: 'exact' })
          .eq('user_id', userId),
      ]);

      setAchievementProgress([
        { type: 'FIRST_CONTRIBUTION', progress: translationCount || 0 },
        { type: 'FIRST_REVIEW', progress: reviewCount || 0 },
        { type: 'CONTENT_MASTER', progress: translationCount || 0 },
        { type: 'REVIEW_MASTER', progress: reviewCount || 0 },
        { type: 'LANGUAGE_EXPERT', progress: translationCount || 0 },
      ]);

    } catch (err) {
      console.error('Error fetching points:', err);
      setError(t.error);
    } finally {
      setIsLoading(false);
    }
  }, [userId, supabase, t.error]);

  useEffect(() => {
    fetchData();

    // Set up subscription for real-time updates
    const channel = supabase
      .channel(`points-${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_points',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          if (payload.new) {
            setPointsData(payload.new as UserPointsData);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, supabase, fetchData]);

  if (isLoading) {
    return (
      <div className="text-center py-4 text-neutral-400">
        {t.loading}
      </div>
    );
  }

  if (error || !pointsData) {
    return (
      <div className="text-center py-4 text-red-400">
        {error}
      </div>
    );
  }

  const nextLevelPoints = pointsToNextLevel(pointsData.points);
  const nextLevel = pointsData.level + 1;
  const currentLevelThreshold = LEVELS[pointsData.level as keyof typeof LEVELS] || 0;
  const nextLevelThreshold = LEVELS[nextLevel as keyof typeof LEVELS];
  const progressPercentage = nextLevelThreshold 
    ? ((pointsData.points - currentLevelThreshold) / (nextLevelThreshold - currentLevelThreshold)) * 100
    : 100;

  return (
    <div className="space-y-8">
      <Card className="bg-neutral-900 border-neutral-800 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold">{t.level} {pointsData.level}</h3>
            <p className="text-sm text-neutral-400">
              {pointsData.points} {t.points}
            </p>
          </div>
          <Trophy className="w-8 h-8 text-yellow-500" />
        </div>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>{pointsData.points - currentLevelThreshold} / {nextLevelThreshold - currentLevelThreshold}</span>
            <span>{t.nextLevel} {nextLevel}</span>
          </div>
          <Progress value={progressPercentage} className="h-2" />
        </div>
      </Card>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">{t.achievements}</h3>
        <div className="grid gap-4 md:grid-cols-2">
          {achievementsList.map((achievement) => {
            const isAchieved = achievements.some(a => a.achievement_type === achievement.type);
            const currentProgress = achievementProgress.find(p => p.type === achievement.type)?.progress || 0;

            return (
              <AchievementCard
                key={achievement.type}
                title={achievement.title[lang]}
                description={achievement.description[lang]}
                icon={achievement.icon}
                progress={currentProgress}
                requirement={achievement.requirement}
                achieved={isAchieved}
                lang={lang}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}