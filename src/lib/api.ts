export interface Anime {
    mal_id: number;
    title: string;
    title_english: string;
    title_japanese: string;
    images: {
      jpg: {
        image_url: string;
        small_image_url: string;
        large_image_url: string;
      };
      webp: {
        image_url: string;
        small_image_url: string;
        large_image_url: string;
      };
    };
    trailer: {
      youtube_id: string;
      url: string;
      embed_url: string;
    };
    synopsis: string;
    background: string;
    status: string;
    season: string;
    year: number;
    episodes: number;
    duration: string;
    rating: string;
    score: number;
    scored_by: number;
    rank: number;
    popularity: number;
    genres: Array<{
      mal_id: number;
      name: string;
    }>;
    studios: Array<{
      mal_id: number;
      name: string;
    }>;
  }
  
  export interface AnimeResponse {
    pagination: {
      last_visible_page: number;
      has_next_page: boolean;
      current_page: number;
      items: {
        count: number;
        total: number;
        per_page: number;
      };
    };
    data: Anime[];
  }
  
  /**
   * Fetches anime list from Jikan API
   */
  export async function getAnimeList(page = 1, limit = 24): Promise<AnimeResponse> {
    const response = await fetch(
      `https://api.jikan.moe/v4/anime?page=${page}&limit=${limit}&order_by=popularity&sort=asc`
    );
  
    // Jikan API has a rate limit, so we need to handle it
    if (response.status === 429) {
      // Wait for 1 second and try again
      await new Promise((resolve) => setTimeout(resolve, 1000));
      return getAnimeList(page, limit);
    }
  
    if (!response.ok) {
      throw new Error(`Error fetching anime: ${response.statusText}`);
    }
  
    return response.json();
  }
  
  /**
   * Fetches a single anime by ID
   */
  export async function getAnimeById(id: number): Promise<Anime> {
    const response = await fetch(`https://api.jikan.moe/v4/anime/${id}`);
  
    // Jikan API has a rate limit, so we need to handle it
    if (response.status === 429) {
      // Wait for 1 second and try again
      await new Promise((resolve) => setTimeout(resolve, 1000));
      return getAnimeById(id);
    }
  
    if (!response.ok) {
      throw new Error(`Error fetching anime: ${response.statusText}`);
    }
  
    const data = await response.json();
    return data.data;
  }
  
  /**
   * Searches anime by query
   */
  export async function searchAnime(query: string, page = 1, limit = 24): Promise<AnimeResponse> {
    const response = await fetch(
      `https://api.jikan.moe/v4/anime?q=${encodeURIComponent(query)}&page=${page}&limit=${limit}`
    );
  
    // Jikan API has a rate limit, so we need to handle it
    if (response.status === 429) {
      // Wait for 1 second and try again
      await new Promise((resolve) => setTimeout(resolve, 1000));
      return searchAnime(query, page, limit);
    }
  
    if (!response.ok) {
      throw new Error(`Error searching anime: ${response.statusText}`);
    }
  
    return response.json();
  }