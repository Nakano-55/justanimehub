export interface Achievement {
  title: {
    en: string;
    id: string;
  };
  description: {
    en: string;
    id: string;
  };
  icon: string;
  requirement: number;
}

// Achievement types and their configurations
export const ACHIEVEMENTS = {
  FIRST_CONTRIBUTION: {
    title: {
      en: 'First Steps',
      id: 'Langkah Pertama',
    },
    description: {
      en: 'Submit your first content translation',
      id: 'Kirim terjemahan konten pertama Anda',
    },
    icon: 'Star',
    requirement: 1,
  },
  FIRST_REVIEW: {
    title: {
      en: 'Critic in Training',
      id: 'Kritikus Pemula',
    },
    description: {
      en: 'Write your first anime review',
      id: 'Tulis ulasan anime pertama Anda',
    },
    icon: 'PenLine',
    requirement: 1,
  },
  CONTENT_MASTER: {
    title: {
      en: 'Content Master',
      id: 'Master Konten',
    },
    description: {
      en: 'Get 10 content translations approved',
      id: 'Dapatkan 10 terjemahan konten disetujui',
    },
    icon: 'Trophy',
    requirement: 10,
  },
  REVIEW_MASTER: {
    title: {
      en: 'Review Master',
      id: 'Master Ulasan',
    },
    description: {
      en: 'Write 20 quality reviews',
      id: 'Tulis 20 ulasan berkualitas',
    },
    icon: 'Award',
    requirement: 20,
  },
  LANGUAGE_EXPERT: {
    title: {
      en: 'Language Expert',
      id: 'Ahli Bahasa',
    },
    description: {
      en: 'Get 25 content translations approved',
      id: 'Dapatkan 25 terjemahan konten disetujui',
    },
    icon: 'Crown',
    requirement: 25,
  },
} as const;

export const achievementsList = Object.entries(ACHIEVEMENTS).map(([type, config]) => ({
  type,
  ...config
}));