export type Language = 'en' | 'id';

export interface Anime {
  mal_id: number;
  title: string;
  title_english: string | null;
  images: { jpg: { image_url: string } };
  score: number;
  genres?: Array<{ mal_id: number; name: string }>;
  rating?: string;
  year?: number;
  status?: string;
  episodes?: number;
  type?: string;
  season?: string;
}

export interface Genre {
  id: number;
  name: string;
}

export interface FilterState {
  searchQuery: string;
  selectedGenres: number[];
  selectedSeason: string;
  selectedYear: string;
  selectedStatus: string;
  selectedType: string;
  selectedSort: string;
}

export interface Translations {
  animeList: string;
  viewDetails: string;
  rating: string;
  episodes: string;
  status: string;
  year: string;
  prev: string;
  next: string;
  noResults: string;
  error: string;
  retry: string;
  loading: string;
  searching: string;
  showFilters: string;
  hideFilters: string;
  reset: string;
  genres: string;
  sortBy: string;
  selectSeason: string;
  selectYear: string;
  selectStatus: string;
  selectType: string;
  sortPlaceholder: string;
  searchPlaceholder: string;
  allSeasons: string;
  allYears: string;
  allStatus: string;
  allTypes: string;
  loginRequired: string;
  addToFavorites: string;
  removeFromFavorites: string;
  addToWatchPlan: string;
  removeFromWatchPlan: string;
  addedToFavorites: string;
  removedFromFavorites: string;
  addedToWatchPlan: string;
  removedFromWatchPlan: string;
  searchSortWarning: string;
  searchSeasonWarning: string;
  topAnimeWarning: string;
  seasonFilterWarning: string;
}

export const translations: Record<Language, Translations> = {
  en: {
    animeList: 'Anime List',
    viewDetails: 'View Details',
    rating: 'Rating',
    episodes: 'Episodes',
    status: 'Status',
    year: 'Year',
    prev: 'Previous',
    next: 'Next',
    noResults: 'No anime found',
    error: 'An error occurred while fetching data',
    retry: 'Retry',
    loading: 'Loading anime...',
    searching: 'Searching...',
    showFilters: 'Show Filters',
    hideFilters: 'Hide Filters',
    reset: 'Reset Filters',
    genres: 'Genres',
    sortBy: 'Sort By',
    selectSeason: 'Select Season',
    selectYear: 'Select Year',
    selectStatus: 'Select Status',
    selectType: 'Select Type',
    sortPlaceholder: 'Most Popular',
    searchPlaceholder: 'Search anime...',
    allSeasons: 'All Seasons',
    allYears: 'All Years',
    allStatus: 'All Status',
    allTypes: 'All Types',
    loginRequired: 'Please sign in to bookmark anime',
    addToFavorites: 'Add to Favorites',
    removeFromFavorites: 'Remove from Favorites',
    addToWatchPlan: 'Plan to Watch',
    removeFromWatchPlan: 'Remove from Plan',
    addedToFavorites: 'Added to Favorites',
    removedFromFavorites: 'Removed from Favorites',
    addedToWatchPlan: 'Added to Watch Plan',
    removedFromWatchPlan: 'Removed from Watch Plan',
    searchSortWarning: 'Search is not compatible with popularity/favorite sorting. Using regular search instead.',
    searchSeasonWarning: 'Search is not compatible with season filtering. Using regular search instead.',
    topAnimeWarning: 'Some filters are not available when sorting by popularity/favorites.',
    seasonFilterWarning: 'Some filters are not available when viewing seasonal anime.',
  },
  id: {
    animeList: 'Daftar Anime',
    viewDetails: 'Lihat Detail',
    rating: 'Rating',
    episodes: 'Episode',
    status: 'Status',
    year: 'Tahun',
    prev: 'Sebelumnya',
    next: 'Selanjutnya',
    noResults: 'Tidak ada anime yang ditemukan',
    error: 'Terjadi kesalahan saat mengambil data',
    retry: 'Coba Lagi',
    loading: 'Memuat anime...',
    searching: 'Mencari...',
    showFilters: 'Tampilkan Filter',
    hideFilters: 'Sembunyikan Filter',
    reset: 'Reset Filter',
    genres: 'Genre',
    sortBy: 'Urutkan Berdasarkan',
    selectSeason: 'Pilih Musim',
    selectYear: 'Pilih Tahun',
    selectStatus: 'Pilih Status',
    selectType: 'Pilih Tipe',
    sortPlaceholder: 'Paling Populer',
    searchPlaceholder: 'Cari anime...',
    allSeasons: 'Semua Musim',
    allYears: 'Semua Tahun',
    allStatus: 'Semua Status',
    allTypes: 'Semua Tipe',
    loginRequired: 'Silakan masuk untuk menandai anime',
    addToFavorites: 'Tambah ke Favorit',
    removeFromFavorites: 'Hapus dari Favorit',
    addToWatchPlan: 'Rencana Tonton',
    removeFromWatchPlan: 'Hapus dari Rencana',
    addedToFavorites: 'Ditambahkan ke Favorit',
    removedFromFavorites: 'Dihapus dari Favorit',
    addedToWatchPlan: 'Ditambahkan ke Rencana Tonton',
    removedFromWatchPlan: 'Dihapus dari Rencana Tonton',
    searchSortWarning: 'Pencarian tidak kompatibel dengan pengurutan popularitas/favorit. Menggunakan pencarian biasa.',
    searchSeasonWarning: 'Pencarian tidak kompatibel dengan filter musim. Menggunakan pencarian biasa.',
    topAnimeWarning: 'Beberapa filter tidak tersedia saat mengurutkan berdasarkan popularitas/favorit.',
    seasonFilterWarning: 'Beberapa filter tidak tersedia saat melihat anime musiman.',
  }
};