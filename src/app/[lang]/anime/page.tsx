'use client';

import { useState, useEffect } from 'react';
import { useDebounce } from 'use-debounce';
import { X, AlertCircle } from 'lucide-react';
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
  { value: 'bypopularity', label: 'Most Popular', endpoint: 'top' },
  { value: 'favorite', label: 'Most Favorite', endpoint: 'top' },
  { value: 'score', label: 'Highest Score', endpoint: 'regular' },
  { value: 'title', label: 'Title A-Z', endpoint: 'regular' }
] as const;

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
  const [debouncedSearchQuery] = useDebounce(filters.searchQuery, 500);
  const [filterWarning, setFilterWarning] = useState<string | null>(null);
  const { lang } = useLanguage();
  const t = translations[lang];

  const selectedSortOption = sortOptions.find(opt => opt.value === filters.selectedSort);
  const isTopEndpoint = selectedSortOption?.endpoint === 'top';
  const isSeasonEndpoint = filters.selectedSeason !== 'all' && filters.selectedYear !== 'all' && !debouncedSearchQuery;

  // Update warning message based on filter combinations
  useEffect(() => {
    if (debouncedSearchQuery) {
      if (isTopEndpoint) {
        setFilterWarning(t.searchSortWarning);
      } else if (isSeasonEndpoint) {
        setFilterWarning(t.searchSeasonWarning);
      } else {
        setFilterWarning(null);
      }
    } else if (isTopEndpoint && (filters.selectedGenres.length > 0 || filters.selectedStatus !== 'all' || filters.selectedType !== 'all')) {
      setFilterWarning(t.topAnimeWarning);
    } else if (isSeasonEndpoint && (filters.selectedGenres.length > 0 || filters.selectedStatus !== 'all' || filters.selectedType !== 'all')) {
      setFilterWarning(t.seasonFilterWarning);
    } else {
      setFilterWarning(null);
    }
  }, [debouncedSearchQuery, filters, isTopEndpoint, isSeasonEndpoint, t]);

  const buildEndpoint = (): string => {
    // Handle search query - takes precedence over other filters
    if (debouncedSearchQuery.trim()) {
      const params = new URLSearchParams();
      params.append('q', debouncedSearchQuery.trim());
      
      // Only apply compatible filters with search
      if (!isTopEndpoint) {
        if (filters.selectedGenres.length > 0) {
          params.append('genres', filters.selectedGenres.join(','));
        }
        if (filters.selectedStatus !== 'all') {
          params.append('status', filters.selectedStatus);
        }
        if (filters.selectedType !== 'all') {
          params.append('type', filters.selectedType.toUpperCase());
        }
        if (filters.selectedSort !== 'bypopularity') {
          params.append('order_by', filters.selectedSort);
          params.append('sort', filters.selectedSort === 'title' ? 'asc' : 'desc');
        }
      }
      
      return `anime?${params.toString()}`;
    }

    // Handle top anime endpoint
    if (isTopEndpoint) {
      return `top/anime?filter=${filters.selectedSort}`;
    }

    // Handle season endpoint
    if (isSeasonEndpoint) {
      return `seasons/${filters.selectedYear}/${filters.selectedSeason}`;
    }

    // Regular anime endpoint with filters
    const params = new URLSearchParams();
    
    if (filters.selectedGenres.length > 0) {
      params.append('genres', filters.selectedGenres.join(','));
    }
    if (filters.selectedStatus !== 'all') {
      params.append('status', filters.selectedStatus);
    }
    if (filters.selectedType !== 'all') {
      params.append('type', filters.selectedType.toUpperCase());
    }
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
    if (filters.selectedSort !== 'bypopularity') {
      params.append('order_by', filters.selectedSort);
      params.append('sort', filters.selectedSort === 'title' ? 'asc' : 'desc');
    }

    return `anime?${params.toString()}`;
  };

  const resetFilters = (): void => {
    setFilters(initialFilterState);
    setFilterWarning(null);
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

        {filterWarning && (
          <div className="flex items-center gap-2 text-sm text-yellow-400 bg-yellow-400/10 p-3 rounded-lg">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <p>{filterWarning}</p>
          </div>
        )}

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
              <SelectValue placeholder={t.selectType} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t.allTypes}</SelectItem>
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
                  {lang === 'id' ? 
                    option.value === 'bypopularity' ? 'Paling Populer' :
                    option.value === 'favorite' ? 'Paling Favorit' :
                    option.value === 'score' ? 'Nilai Tertinggi' :
                    'Judul A-Z'
                    : option.label
                  }
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