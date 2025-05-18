// hooks/useAnimeFilters.ts
import { useCallback, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import type { FilterState } from '@/types/anime';

export interface PageDefaultFilters extends Partial<FilterState> {
  title?: string;
  description?: string;
  endpoint?: string; // Add this to support custom endpoints
}

export function useAnimeFilters(defaultFilters: PageDefaultFilters) {
  const searchParams = useSearchParams();
  const [filters, setFilters] = useState<FilterState>({
    searchQuery: '',
    selectedGenres: [],
    selectedSeason: 'all',
    selectedYear: 'all',
    selectedStatus: defaultFilters.selectedStatus || 'all',
    selectedType: defaultFilters.selectedType || 'all',
    selectedSort: defaultFilters.selectedSort || 'bypopularity',
  });

  useEffect(() => {
    // Parse URL parameters and merge with defaults
    const urlGenres = searchParams.get('genres')?.split(',').map(Number) || [];
    const urlSeason = searchParams.get('season') || 'all';
    const urlYear = searchParams.get('year') || 'all';
    const urlStatus = searchParams.get('status') || defaultFilters.selectedStatus || 'all';
    const urlType = searchParams.get('type') || defaultFilters.selectedType || 'all';
    const urlSort = searchParams.get('sort') || defaultFilters.selectedSort || 'bypopularity';
    const urlSearch = searchParams.get('q') || '';

    setFilters({
      searchQuery: urlSearch,
      selectedGenres: urlGenres,
      selectedSeason: urlSeason,
      selectedYear: urlYear,
      selectedStatus: urlStatus,
      selectedType: urlType,
      selectedSort: urlSort,
    });
  }, [searchParams, defaultFilters]);

  const buildEndpoint = useCallback((): string => {
    // If a custom endpoint is provided, use it
    if (defaultFilters.endpoint) {
      return defaultFilters.endpoint;
    }

    if (filters.searchQuery.trim()) {
      const params = new URLSearchParams();
      params.append('q', filters.searchQuery.trim());
      
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
      
      return `anime?${params.toString()}`;
    }

    // Handle special endpoints based on sort
    if (filters.selectedSort === 'bypopularity' || filters.selectedSort === 'favorite') {
      return `top/anime?filter=${filters.selectedSort}`;
    }

    // Regular endpoint with filters
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
    if (filters.selectedSort !== 'bypopularity') {
      params.append('order_by', filters.selectedSort);
      params.append('sort', filters.selectedSort === 'title' ? 'asc' : 'desc');
    }

    return `anime?${params.toString()}`;
  }, [filters, defaultFilters.endpoint]);

  return {
    filters,
    setFilters,
    buildEndpoint,
  };
}
