'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { fetchAnime } from '@/lib/api/jikan';
import type { Anime } from '@/types/anime';

interface UseAnimeDataReturn {
  animeList: Anime[];
  isLoading: boolean;
  error: string | null;
  hasNextPage: boolean;
  currentPage: number;
  setPage: (page: number) => void;
  resetPage: () => void;
}

export function useAnimeData(endpoint: string): UseAnimeDataReturn {
  const [animeList, setAnimeList] = useState<Anime[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(true);
  const abortControllerRef = useRef<AbortController | null>(null);
  const lastEndpointRef = useRef<string>(endpoint);

  const fetchData = useCallback(async () => {
    if (!endpoint) {
      setAnimeList([]);
      setError('Invalid endpoint');
      setIsLoading(false);
      return;
    }
    
    // Cancel previous request if it exists
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new abort controller for this request
    abortControllerRef.current = new AbortController();
    
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetchAnime(endpoint, currentPage);
      
      // Filter and validate anime data
      const validAnime = response.data
        .filter((item): item is Anime => {
          if (!item || typeof item !== 'object') return false;
          
          const anime = item as Partial<Anime>;
          return !!(
            anime.mal_id &&
            anime.title &&
            anime.images?.jpg?.image_url &&
            // Filter out adult content
            !anime.rating?.includes('Rx') &&
            !anime.title.toLowerCase().includes('hentai')
          );
        })
        .map(anime => ({
          ...anime,
          score: anime.score || 0,
          title_english: anime.title_english || null,
        }));

      setAnimeList(validAnime);
      setHasNextPage(response.pagination?.has_next_page ?? false);
      setError(null);
    } catch (err) {
      console.error('Error fetching anime:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch anime');
      setAnimeList([]);
      setHasNextPage(false);
    } finally {
      setIsLoading(false);
    }
  }, [endpoint, currentPage]);

  // Reset page when endpoint changes
  useEffect(() => {
    if (lastEndpointRef.current !== endpoint) {
      setCurrentPage(1);
      lastEndpointRef.current = endpoint;
    }
  }, [endpoint]);

  useEffect(() => {
    fetchData();

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [fetchData]);

  const setPage = useCallback((page: number) => {
    setCurrentPage(Math.max(1, page));
  }, []);

  const resetPage = useCallback(() => {
    setCurrentPage(1);
  }, []);

  return {
    animeList,
    isLoading,
    error,
    hasNextPage,
    currentPage,
    setPage,
    resetPage,
  };
}