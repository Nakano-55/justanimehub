'use client';

const BASE_URL = 'https://api.jikan.moe/v4';
const RATE_LIMIT_DELAY = 1000; // 1 second between requests
const MAX_RETRIES = 3;
const INITIAL_RETRY_DELAY = 1000;

interface JikanResponse<T> {
  data: T[];
  pagination?: {
    has_next_page: boolean;
    last_visible_page: number;
    current_page: number;
    items: {
      count: number;
      total: number;
      per_page: number;
    };
  };
}

interface JikanError {
  status: number;
  type: string;
  message: string;
  error: string;
}

async function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function fetchWithRetry(url: string, retries = MAX_RETRIES): Promise<Response> {
  let lastError: Error | null = null;
  
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url, {
        headers: {
          'Accept': 'application/json',
        }
      });

      if (response.status === 429) {
        const waitTime = INITIAL_RETRY_DELAY * Math.pow(2, i);
        console.log(`Rate limited, waiting ${waitTime}ms before retry ${i + 1}/${retries}`);
        await delay(waitTime);
        continue;
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return response;
    } catch (error) {
      console.error(`Attempt ${i + 1}/${retries} failed:`, error);
      lastError = error instanceof Error ? error : new Error('Unknown error occurred');
      
      if (i < retries - 1) {
        await delay(INITIAL_RETRY_DELAY * Math.pow(2, i));
      }
    }
  }

  throw lastError || new Error('Failed to fetch after multiple retries');
}

export async function fetchAnime(endpoint: string, page = 1): Promise<JikanResponse<unknown>> {
  try {
    await delay(RATE_LIMIT_DELAY);

    const url = new URL(
      endpoint.startsWith('http') ? endpoint : `${BASE_URL}/${endpoint}`
    );
    
    if (!url.searchParams.has('page')) {
      url.searchParams.set('page', page.toString());
    }

    if (!url.searchParams.has('sfw')) {
      url.searchParams.set('sfw', 'true');
    }

    if (!url.searchParams.has('limit')) {
      url.searchParams.set('limit', '24');
    }

    console.log('Fetching anime from:', url.toString());

    const response = await fetchWithRetry(url.toString());
    const data: JikanResponse<unknown> | JikanError = await response.json();

    // Check if response is an error
    if ('error' in data) {
      throw new Error(data.message || 'API Error');
    }

    // Validate response structure
    if (!data || !('data' in data) || !Array.isArray(data.data)) {
      throw new Error('Invalid response format');
    }

    // Ensure data is always an array
    if (!Array.isArray(data.data)) {
      data.data = [data.data];
    }

    return {
      data: data.data,
      pagination: data.pagination
    };
  } catch (error) {
    console.error('Failed to fetch anime:', error);
    // Return empty result instead of throwing
    return {
      data: [],
      pagination: {
        has_next_page: false,
        last_visible_page: 1,
        current_page: 1,
        items: {
          count: 0,
          total: 0,
          per_page: 24
        }
      }
    };
  }
}