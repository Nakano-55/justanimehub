/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState } from 'react';
import { Card } from './ui/card';
import { Trophy, Star, Award, Crown, PenLine } from 'lucide-react';
import type { Language } from '@/lib/i18n/types';

interface AchievementCardProps {
  title: string;
  description: string;
  icon: string;
  progress: number;
  requirement: number;
  achieved: boolean;
  lang: Language;
}

const iconMap = {
  Trophy,
  Star,
  Award,
  Crown,
  PenLine,
};

export function AchievementCard({
  title,
  description,
  icon,
  progress,
  requirement,
  achieved,
  lang,
}: AchievementCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const Icon = iconMap[icon as keyof typeof iconMap];
  const progressPercentage = Math.min((progress / requirement) * 100, 100);

  return (
    <Card
      className={`relative bg-neutral-900 border-neutral-800 p-4 transition-all duration-300 ${
        achieved ? 'border-violet-500/50' : ''
      } ${isHovered ? 'transform -translate-y-1' : ''}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex items-start gap-4">
        <div
          className={`p-3 rounded-lg ${
            achieved ? 'bg-violet-500/20 text-violet-400' : 'bg-neutral-800 text-neutral-500'
          }`}
        >
          <Icon className="w-6 h-6" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold mb-1">{title}</h3>
          <p className="text-sm text-neutral-400 mb-3">{description}</p>
          <div className="flex items-center justify-between text-sm">
            <div className="flex-1">
              <div className="h-2 bg-neutral-800 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${
                    achieved ? 'bg-violet-500' : 'bg-violet-500/50'
                  }`}
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
            </div>
            <span className="ml-3 text-neutral-400">
              {progress}/{requirement}
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
}