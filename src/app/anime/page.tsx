'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useLanguage } from '@/components/LanguageProvider';
import { AnimeGrid } from '@/components/AnimeGrid';
import type { Genre, FilterState } from '@/types/anime';
import { translations } from '@/types/anime';

const seasons = ['winter', 'spring', 'summer', 'fall'] as const;
const types = ['tv', 'movie', 'ova', 'ona', 'special'] as const;
const statuses = ['airing', 'complete', 'upcoming'] as const;
const sortOptions = [
  { value: 'bypopularity', label: 'Most Popular', endpoint: 'top/anime' },
  { value: 'favorite', label: 'Most Favorite', endpoint: 'top/anime' },
  { value: 'score', label: 'Highest Score', endpoint: 'anime' },
  { value: 'title', label: 'Title A-Z', endpoint: 'anime' }
] as const;

const ascendingSortFields = ['title'];

const currentYear = new Date().getFullYear();
const years = Array.from({ length: currentYear - 1995 + 1 }, (_, i) => (currentYear - i).toString());

const genres: Genre[] = [
  { id: 1, name: 'Action' }, { id: 2, name: 'Adventure' }, { id: 4, name: 'Comedy' },
  { id: 8, name: 'Drama' }, { id: 10, name: 'Fantasy' }, { id: 14, name: 'Horror' },
  { id: 7, name: 'Mystery' }, { id: 22, name: 'Romance' }, { id: 24, name: 'Sci-Fi' },
  { id: 36, name: 'Slice of Life' }, { id: 30, name: 'Sports' }, { id: 37, name: 'Supernatural' },
];

const initialFilterState: FilterState = {
  searchQuery: '',
  selectedGenres: [],
  selectedSeason: 'all',
  selectedYear: 'all',
  selectedStatus: 'all',
  selectedType: 'all',
  selectedSort: 'bypopularity',
};

export default function AnimeListPage() {
  const [filters, setFilters] = useState<FilterState>(initialFilterState);
  const { lang } = useLanguage();
  const t = translations[lang];

  const buildEndpoint = (): string => {
    // Special handling for popularity and favorites sorting
    if (filters.selectedSort === 'bypopularity' || filters.selectedSort === 'favorite') {
      const params = new URLSearchParams();
      params.append('filter', filters.selectedSort);
      return `top/anime?${params.toString()}`;
    }

    // Check if only season and year are selected without other filters
    const hasOnlySeasonYear = 
      filters.selectedSeason !== 'all' && 
      filters.selectedYear !== 'all' && 
      !filters.searchQuery.trim() && 
      filters.selectedGenres.length === 0 && 
      filters.selectedStatus === 'all' && 
      filters.selectedType === 'all';

    // Use seasons endpoint for season+year only queries
    if (hasOnlySeasonYear) {
      return `seasons/${filters.selectedYear}/${filters.selectedSeason}`;
    }

    // Build query parameters for the anime endpoint
    const params = new URLSearchParams();

    // Search query
    if (filters.searchQuery.trim()) {
      params.append('q', filters.searchQuery.trim());
    }

    // Genres
    if (filters.selectedGenres.length > 0) {
      const validGenreIds = filters.selectedGenres.filter(id => 
        genres.some(genre => genre.id === id)
      );
      if (validGenreIds.length > 0) {
        params.append('genres', validGenreIds.join(','));
      }
    }

    // Status
    if (filters.selectedStatus !== 'all') {
      params.append('status', filters.selectedStatus);
    }

    // Type
    if (filters.selectedType !== 'all') {
      params.append('type', filters.selectedType.toUpperCase());
    }

    // Year and Season date range
    if (filters.selectedYear !== 'all') {
      const year = parseInt(filters.selectedYear);
      if (!isNaN(year)) {
        if (filters.selectedSeason !== 'all') {
          const seasonRanges = {
            winter: [`${year}-01-01`, `${year}-03-31`],
            spring: [`${year}-04-01`, `${year}-06-30`],
            summer: [`${year}-07-01`, `${year}-09-30`],
            fall: [`${year}-10-01`, `${year}-12-31`],
          };
          const [start, end] = seasonRanges[filters.selectedSeason as keyof typeof seasonRanges];
          params.append('start_date', start);
          params.append('end_date', end);
        } else {
          params.append('start_date', `${year}-01-01`);
          params.append('end_date', `${year}-12-31`);
        }
      }
    }

    // Regular sorting (score and title)
    if (!['bypopularity', 'favorite'].includes(filters.selectedSort)) {
      params.append('order_by', filters.selectedSort);
      params.append('sort', ascendingSortFields.includes(filters.selectedSort) ? 'asc' : 'desc');
    }

    return `anime?${params.toString()}`;
  };

  const resetFilters = (): void => {
    setFilters(initialFilterState);
  };

  const toggleGenre = (genreId: number): void => {
    setFilters(prev => ({
      ...prev,
      selectedGenres: prev.selectedGenres.includes(genreId)
        ? prev.selectedGenres.filter(id => id !== genreId)
        : [...prev.selectedGenres, genreId]
    }));
  };

  const updateFilter = <K extends keyof FilterState>(key: K, value: FilterState[K]): void => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="container mx-auto px-6">
      <div className="flex items-center justify-between mt-6 mb-8">
        <h1 className="text-3xl font-bold border-l-4 border-violet-500 pl-3">{t.animeList}</h1>
      </div>

      <div className="bg-neutral-900 rounded-lg p-6 mb-8 space-y-6">
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <Input
              placeholder={t.searchPlaceholder}
              value={filters.searchQuery}
              onChange={(e) => updateFilter('searchQuery', e.target.value)}
              className="bg-neutral-800 border-neutral-700"
            />
          </div>
          <Button
            variant="ghost"
            onClick={resetFilters}
            className="text-neutral-400 hover:text-white"
          >
            <X className="w-4 h-4 mr-2" />
            {t.reset}
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Select
            value={filters.selectedSeason}
            onValueChange={(value) => updateFilter('selectedSeason', value)}
          >
            <SelectTrigger className="bg-neutral-800 border-neutral-700">
              <SelectValue placeholder={t.selectSeason} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t.allSeasons}</SelectItem>
              {seasons.map(season => (
                <SelectItem key={season} value={season}>
                  {season.charAt(0).toUpperCase() + season.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={filters.selectedYear}
            onValueChange={(value) => updateFilter('selectedYear', value)}
          >
            <SelectTrigger className="bg-neutral-800 border-neutral-700">
              <SelectValue placeholder={t.selectYear} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t.allYears}</SelectItem>
              {years.map(year => (
                <SelectItem key={year} value={year}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={filters.selectedStatus}
            onValueChange={(value) => updateFilter('selectedStatus', value)}
          >
            <SelectTrigger className="bg-neutral-800 border-neutral-700">
              <SelectValue placeholder={t.selectStatus} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t.allStatus}</SelectItem>
              {statuses.map(status => (
                <SelectItem key={status} value={status}>
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={filters.selectedType}
            onValueChange={(value) => updateFilter('selectedType', value)}
          >
            <SelectTrigger className="bg-neutral-800 border-neutral-700">
              <SelectValue placeholder="Select Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              {types.map(type => (
                <SelectItem key={type} value={type}>
                  {type.toUpperCase()}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <h3 className="text-sm font-medium mb-3">{t.genres}</h3>
          <div className="flex flex-wrap gap-2">
            {genres.map(genre => (
              <Button
                key={genre.id}
                variant={filters.selectedGenres.includes(genre.id) ? "secondary" : "outline"}
                size="sm"
                onClick={() => toggleGenre(genre.id)}
                className={filters.selectedGenres.includes(genre.id) ? "bg-violet-600" : ""}
              >
                {genre.name}
              </Button>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-sm font-medium mb-3">{t.sortBy}</h3>
          <Select
            value={filters.selectedSort}
            onValueChange={(value) => updateFilter('selectedSort', value)}
          >
            <SelectTrigger className="w-[200px] bg-neutral-800 border-neutral-700">
              <SelectValue placeholder={t.sortPlaceholder} />
            </SelectTrigger>
            <SelectContent>
              {sortOptions.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <AnimeGrid 
        lang={lang}
        endpoint={buildEndpoint()}
      />
    </div>
  );
}