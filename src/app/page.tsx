// /* eslint-disable @typescript-eslint/no-explicit-any */
// /* eslint-disable @typescript-eslint/no-unused-vars */
// 'use client';

// import Image from 'next/image';
// import Link from 'next/link';
// import { useEffect, useState } from 'react';
// import { useRouter } from 'next/navigation';
// import { Search, Star, Calendar } from 'lucide-react';

// interface Anime {
//   mal_id: number;
//   title: string;
//   title_english: string | null;
//   images: { jpg: { image_url: string } };
//   score: number;
// }

// const getCurrentSeason = () => {
//   const month = new Date().getMonth() + 1;
//   const year = new Date().getFullYear();
//   let season = '';

//   if (month >= 1 && month <= 3) season = 'Winter';
//   else if (month >= 4 && month <= 6) season = 'Spring';
//   else if (month >= 7 && month <= 9) season = 'Summer';
//   else season = 'Fall';

//   return { season, year };
// };

// const uniqueAnime = (animeList: Anime[]) => {
//   return animeList
//     .filter(anime => anime.images?.jpg?.image_url && (anime.title_english || anime.title))
//     .filter((anime, index, self) =>
//       index === self.findIndex((a) => a.mal_id === anime.mal_id)
//     )
//     .slice(0, 10);
// };

// const AnimeCard = ({ anime, index }: { anime: Anime; index: number }) => (
//   <div 
//     className="group relative bg-neutral-800/50 backdrop-blur-sm p-4 rounded-xl hover:bg-neutral-700/50 transition-all duration-300 transform hover:-translate-y-1"
//   >
//     <div className="relative overflow-hidden rounded-lg mb-3">
//       <Image 
//         src={anime.images.jpg.image_url} 
//         width={300} 
//         height={400} 
//         className="w-full h-[250px] object-cover transform group-hover:scale-105 transition-transform duration-300" 
//         alt={anime.title_english || anime.title}
//       />
//       <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
//         <Link 
//           href={`/anime/${anime.mal_id}`} 
//           className="w-full py-2 bg-violet-600 hover:bg-violet-500 text-center rounded-lg text-sm font-medium"
//         >
//           View Details
//         </Link>
//       </div>
//     </div>
//     <h3 className="text-lg font-medium line-clamp-2 group-hover:text-violet-400 transition-colors">
//       {anime.title_english || anime.title}
//     </h3>
//     <div className="flex items-center mt-2 text-neutral-400">
//       <Star className="w-4 h-4 text-yellow-500 mr-1" />
//       <span>{anime.score?.toFixed(1) || 'N/A'}</span>
//     </div>
//   </div>
// );

// const AnimeSection = ({ 
//   title, 
//   subtitle,
//   animeList, 
//   icon: Icon, 
//   accentColor
// }: { 
//   title: string; 
//   subtitle?: string;
//   animeList: Anime[]; 
//   icon: any;
//   accentColor: string;
// }) => (
//   <section className="py-12 px-6 animate-fadeIn">
//     <div className="mb-4">
//       <div className="flex items-center gap-3">
//         <Icon className={`w-6 h-6 ${accentColor}`} />
//         <h2 className="text-2xl font-bold">{title}</h2>
//       </div>
//       {subtitle && (
//         <h3 className="text-xl font-semibold text-neutral-300 mt-2">
//           {subtitle}
//         </h3>
//       )}
//     </div>
//     <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
//       {animeList.map((anime, index) => (
//         <AnimeCard key={`${anime.mal_id}-${index}`} anime={anime} index={index} />
//       ))}
//     </div>
//   </section>
// );

// export default function HomePage() {
//   const [seasonalAnime, setSeasonalAnime] = useState<Anime[]>([]);
//   const [topAnime, setTopAnime] = useState<Anime[]>([]);
//   const [isLoading, setIsLoading] = useState(true);
//   const router = useRouter();

//   const { season, year } = getCurrentSeason();

//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         const fetchWithDelay = async (url: string) => {
//           const response = await fetch(url);
//           const data = await response.json();
//           return data.data || [];
//         };

//         // Fetch seasonal anime
//         const seasonalData = await fetchWithDelay(`https://api.jikan.moe/v4/seasons/${year}/${season.toLowerCase()}?limit=15`);
//         setSeasonalAnime(uniqueAnime(seasonalData));

//         await new Promise(resolve => setTimeout(resolve, 1000));

//         // Fetch top anime by rating (score)
//         const topData = await fetchWithDelay('https://api.jikan.moe/v4/top/anime?limit=15');
//         setTopAnime(uniqueAnime(topData));

//       } catch (error) {
//         console.error('Error fetching anime data:', error);
//       } finally {
//         setIsLoading(false);
//       }
//     };

//     fetchData();
//   }, [season, year]);

//   if (isLoading) {
//     return (
//       <div className="min-h-screen bg-neutral-950 flex items-center justify-center">
//         <div className="animate-pulse flex flex-col items-center">
//           <div className="w-12 h-12 border-4 border-violet-500 border-t-transparent rounded-full animate-spin"></div>
//           <p className="mt-4 text-violet-500">Loading anime list...</p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="bg-neutral-950 text-white min-h-screen">
//       {/* Hero Section */}
//       <section className="relative w-full h-[500px] flex items-center justify-center">
//         <div className="absolute inset-0">
//           <Image
//             src="https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&q=80"
//             fill
//             className="object-cover"
//             alt="Anime background"
//             priority
//           />
//           <div className="absolute inset-0 bg-gradient-to-b from-neutral-950/70 to-neutral-950"></div>
//         </div>
//         <div className="relative z-10 text-center max-w-4xl mx-auto px-6">
//           <h1 className="text-4xl md:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-violet-500 to-pink-500">
//             Selamat Datang di AnimeDB
//           </h1>
//           <p className="text-xl text-neutral-300 mt-4 mb-8">Temukan anime terbaik setiap musim</p>
//         </div>
//       </section>

//       <div className="container mx-auto px-4">
//         <AnimeSection
//           title="Seasonal Anime"
//           subtitle={`${season} ${year}`}
//           animeList={seasonalAnime}
//           icon={Calendar}
//           accentColor="text-blue-500"
//         />

//         <AnimeSection
//           title="Top Anime"
//           animeList={topAnime}
//           icon={Star}
//           accentColor="text-violet-500"
//         />
//       </div>
//     </div>
//   );
// }


// ==================================

// /* eslint-disable @typescript-eslint/no-explicit-any */
// /* eslint-disable @typescript-eslint/no-unused-vars */
// 'use client';

// import Image from 'next/image';
// import Link from 'next/link';
// import { useEffect, useState } from 'react';
// import { Search, Star, Calendar, X } from 'lucide-react';

// interface Anime {
//   mal_id: number;
//   title: string;
//   title_english: string | null;
//   images: { jpg: { image_url: string } };
//   score: number;
//   genres?: Array<{ mal_id: number; name: string }>;
// }

// const getCurrentSeason = () => {
//   const month = new Date().getMonth() + 1;
//   const year = new Date().getFullYear();
//   let season = '';

//   if (month >= 1 && month <= 3) season = 'Winter';
//   else if (month >= 4 && month <= 6) season = 'Spring';
//   else if (month >= 7 && month <= 9) season = 'Summer';
//   else season = 'Fall';

//   return { season, year };
// };

// const uniqueAnime = (animeList: Anime[]) => {
//   return animeList
//     .filter(anime => anime.images?.jpg?.image_url && (anime.title_english || anime.title))
//     .filter((anime, index, self) =>
//       index === self.findIndex((a) => a.mal_id === anime.mal_id)
//     )
//     .slice(0, 10);
// };

// const AnimeCard = ({ anime, priority = false }: { anime: Anime; priority?: boolean }) => (
//   <div
//     className="group relative bg-neutral-800/50 backdrop-blur-sm rounded-xl hover:bg-neutral-700/50 transition-all duration-300 transform hover:-translate-y-1 flex flex-col h-full"
//   >
//     <div className="relative overflow-hidden rounded-t-xl">
//       <Image
//         src={anime.images.jpg.image_url}
//         width={300}
//         height={400}
//         className="w-full h-[250px] object-cover transform group-hover:scale-105 transition-transform duration-300"
//         alt={anime.title_english || anime.title}
//         priority={priority}
//         loading={priority ? "eager" : "lazy"}
//       />
//       <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
//         <Link
//           href={`/anime/${anime.mal_id}`}
//           className="w-full py-2 bg-violet-600 hover:bg-violet-500 text-center rounded-lg text-sm font-medium"
//         >
//           View Details
//         </Link>
//       </div>
//     </div>

//     <div className="p-4 flex flex-col flex-grow">
//       <h3 className="text-lg font-medium line-clamp-2 group-hover:text-violet-400 transition-colors mb-2">
//         {anime.title_english || anime.title}
//       </h3>

//       <div className="space-y-2 mt-auto">
//         <div className="flex items-center text-neutral-400">
//           <Star className="w-4 h-4 text-yellow-500 mr-1" />
//           <span>{anime.score?.toFixed(1) || 'N/A'}</span>
//         </div>

//         {anime.genres && anime.genres.length > 0 && (
//           <div className="flex flex-wrap gap-1">
//             {anime.genres.slice(0, 2).map(genre => (
//               <span
//                 key={genre.mal_id}
//                 className="text-xs px-2 py-1 bg-violet-600/30 rounded-full text-violet-300"
//               >
//                 {genre.name}
//               </span>
//             ))}
//           </div>
//         )}
//       </div>
//     </div>
//   </div>
// );

// const AnimeSection = ({
//   title,
//   subtitle,
//   animeList,
//   isLoading,
//   icon: Icon,
//   accentColor
// }: {
//   title: string;
//   subtitle?: string;
//   animeList: Anime[];
//   isLoading: boolean;
//   icon: any;
//   accentColor: string;
// }) => {
//   if (isLoading) {
//     return (
//       <section className="py-12">
//         <div className="mb-4">
//           <div className="flex items-center gap-3">
//             <div className="w-6 h-6 bg-neutral-700 rounded animate-pulse" />
//             <div className="h-8 w-48 bg-neutral-700 rounded animate-pulse" />
//           </div>
//         </div>
//         <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
//           {[...Array(5)].map((_, i) => (
//             <div key={i} className="bg-neutral-800/50 rounded-xl">
//               <div className="aspect-[3/4] bg-neutral-700 rounded-t-lg animate-pulse" />
//               <div className="p-4">
//                 <div className="h-6 bg-neutral-700 rounded w-3/4 animate-pulse" />
//                 <div className="h-4 bg-neutral-700 rounded w-1/4 mt-2 animate-pulse" />
//               </div>
//             </div>
//           ))}
//         </div>
//       </section>
//     );
//   }

//   return (
//     <section className="py-12">
//       <div className="mb-4">
//         <div className="flex items-center gap-3">
//           <Icon className={`w-6 h-6 ${accentColor}`} />
//           <h2 className="text-2xl font-bold">{title}</h2>
//         </div>
//         {subtitle && (
//           <h3 className="text-xl font-semibold text-neutral-300 mt-2">
//             {subtitle}
//           </h3>
//         )}
//       </div>
//       <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
//         {animeList.map((anime, index) => (
//           <AnimeCard
//             key={`${anime.mal_id}-${index}`}
//             anime={anime}
//             priority={index < 5}
//           />
//         ))}
//       </div>
//     </section>
//   );
// };

// export default function HomePage() {
//   const [seasonalAnime, setSeasonalAnime] = useState<Anime[]>([]);
//   const [topAnime, setTopAnime] = useState<Anime[]>([]);
//   const [searchResults, setSearchResults] = useState<Anime[]>([]);
//   const [searchQuery, setSearchQuery] = useState('');
//   const [isLoading, setIsLoading] = useState(true);
//   const [isSearching, setIsSearching] = useState(false);
//   const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null);

//   const { season, year } = getCurrentSeason();

//   useEffect(() => {
//     setSearchQuery('');
//     setSearchResults([]);
//   }, []);

//   useEffect(() => {
//     let isMounted = true;

//     const fetchData = async () => {
//       try {
//         setIsLoading(true);

//         const seasonalResponse = await fetch(
//           `https://api.jikan.moe/v4/seasons/${year}/${season.toLowerCase()}?limit=15`
//         );
//         if (!seasonalResponse.ok) throw new Error('Failed to fetch seasonal anime');
//         const seasonalData = await seasonalResponse.json();

//         if (!isMounted) return;
//         setSeasonalAnime(uniqueAnime(seasonalData.data || []));

//         await new Promise(resolve => setTimeout(resolve, 1000));

//         const topResponse = await fetch('https://api.jikan.moe/v4/top/anime?limit=15');
//         if (!topResponse.ok) throw new Error('Failed to fetch top anime');
//         const topData = await topResponse.json();

//         if (!isMounted) return;
//         setTopAnime(uniqueAnime(topData.data || []));
//       } catch (error) {
//         console.error('Error fetching anime data:', error);
//       } finally {
//         if (isMounted) {
//           setIsLoading(false);
//         }
//       }
//     };

//     fetchData();

//     return () => {
//       isMounted = false;
//     };
//   }, [season, year]);

//   const handleSearch = async (query: string) => {
//     if (!query.trim()) {
//       setSearchResults([]);
//       return;
//     }

//     setIsSearching(true);
//     try {
//       const response = await fetch(`https://api.jikan.moe/v4/anime?q=${query}&limit=15`);
//       if (!response.ok) throw new Error('Search failed');
//       const data = await response.json();
//       setSearchResults(data.data || []);
//     } catch (error) {
//       console.error('Error searching anime:', error);
//     } finally {
//       setIsSearching(false);
//     }
//   };

//   const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const query = e.target.value;
//     setSearchQuery(query);

//     if (searchTimeout) {
//       clearTimeout(searchTimeout);
//     }

//     const timeoutId = setTimeout(() => {
//       handleSearch(query);
//     }, 500);

//     setSearchTimeout(timeoutId);
//   };

//   return (
//     <>
//       {/* Hero Section with Search */}
//       <section className="relative w-full h-[500px] flex items-center justify-center">
//         <div className="absolute inset-0">
//           <Image
//             src="https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&q=80"
//             fill
//             className="object-cover"
//             alt="Anime background"
//             priority
//           />
//           <div className="absolute inset-0 bg-gradient-to-b from-neutral-950/70 to-neutral-950"></div>
//         </div>
//         <div className="relative z-10 text-center max-w-4xl mx-auto px-6">
//           <h1 className="text-4xl md:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-violet-500 to-pink-500">
//             Selamat Datang di AnimeDB
//           </h1>
//           <p className="text-xl text-neutral-300 mt-4 mb-8">Temukan anime terbaik setiap musim</p>

//           <div className="max-w-2xl mx-auto">
//             <div className="relative">
//               <input
//                 type="text"
//                 value={searchQuery}
//                 onChange={handleSearchInputChange}
//                 placeholder="Search anime..."
//                 className="w-full px-6 py-3 bg-white/10 backdrop-blur-md rounded-lg text-white placeholder-white/50 border border-white/20 focus:outline-none focus:border-violet-500"
//               />
//               {isSearching && (
//                 <div className="absolute right-2 top-1/2 -translate-y-1/2">
//                   <div className="w-5 h-5 border-2 border-violet-500 border-t-transparent rounded-full animate-spin"></div>
//                 </div>
//               )}
//             </div>
//           </div>
//         </div>
//       </section>

//       <div className="container mx-auto px-6">
//         {/* Search Results */}
//         {searchResults.length > 0 && (
//           <section className="py-12">
//             <div className="flex justify-between items-center mb-6">
//               <h2 className="text-2xl font-bold">Search Results</h2>
//               <button
//                 onClick={() => {
//                   setSearchResults([]);
//                   setSearchQuery('');
//                 }}
//                 className="flex items-center gap-2 text-neutral-400 hover:text-white"
//               >
//                 <X className="w-4 h-4" />
//                 Clear results
//               </button>
//             </div>
//             <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
//               {searchResults.map((anime, index) => (
//                 <AnimeCard
//                   key={`search-${anime.mal_id}-${index}`}
//                   anime={anime}
//                   priority={index < 5}
//                 />
//               ))}
//             </div>
//           </section>
//         )}

//         {/* Regular Sections */}
//         {searchResults.length === 0 && (
//           <>
//             <AnimeSection
//               title="Seasonal Anime"
//               subtitle={`${season} ${year}`}
//               animeList={seasonalAnime}
//               isLoading={isLoading}
//               icon={Calendar}
//               accentColor="text-blue-500"
//             />

//             <AnimeSection
//               title="Top Anime"
//               animeList={topAnime}
//               isLoading={isLoading}
//               icon={Star}
//               accentColor="text-violet-500"
//             />
//           </>
//         )}
//       </div>
//     </>
//   );
// }

import { redirect } from 'next/navigation';

export default function RootPage() {
  redirect('/en');
}