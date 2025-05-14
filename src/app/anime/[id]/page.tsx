/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
// /* eslint-disable @typescript-eslint/no-explicit-any */
// 'use client';

// import { useEffect, useState } from 'react';
// import Image from 'next/image';
// import Link from 'next/link';
// import { useParams } from 'next/navigation';

// interface AnimeDetails {
//   mal_id: number;
//   title: string;
//   title_japanese: string;
//   images: { jpg: { image_url: string; large_image_url: string } };
//   score: number;
//   scored_by: number;
//   rank: number;
//   popularity: number;
//   status: string;
//   episodes: number;
//   duration: string;
//   rating: string;
//   synopsis: string;
//   year: number;
//   season: string;
//   studios: Array<{ name: string }>;
//   genres: Array<{ name: string }>;
// }

// async function fetchWithRetry(url: string, retries = 3, delay = 1000): Promise<any> {
//   for (let i = 0; i < retries; i++) {
//     try {
//       const response = await fetch(url);
//       if (!response.ok) {
//         throw new Error(`HTTP error! status: ${response.status}`);
//       }
//       const data = await response.json();
//       return data;
//     } catch (error) {
//       if (i === retries - 1) throw error;
//       await new Promise(resolve => setTimeout(resolve, delay * (i + 1)));
//     }
//   }
// }

// export default function AnimeDetailPage() {
//   const { id } = useParams();
//   const [anime, setAnime] = useState<AnimeDetails | null>(null);
//   const [isLoading, setIsLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);

//   useEffect(() => {
//     async function fetchAnimeDetails() {
//       try {
//         setIsLoading(true);
//         setError(null);
//         const data = await fetchWithRetry(`https://api.jikan.moe/v4/anime/${id}`);
//         setAnime(data.data);
//       } catch (err) {
//         console.error('Error fetching anime details:', err);
//         setError('Failed to load anime details. Please try again later.');
//       } finally {
//         setIsLoading(false);
//       }
//     }

//     if (id) {
//       fetchAnimeDetails();
//     }
//   }, [id]);

//   if (error) {
//     return (
//       <div className="min-h-screen bg-neutral-950 text-white flex items-center justify-center">
//         <div className="text-center p-8">
//           <h2 className="text-2xl font-bold text-red-500 mb-4">Error</h2>
//           <p className="text-lg mb-4">{error}</p>
//           <div className="space-x-4">
//             <button 
//               onClick={() => window.location.reload()} 
//               className="px-4 py-2 bg-violet-600 hover:bg-violet-500 rounded-lg"
//             >
//               Retry
//             </button>
//             <Link 
//               href="/anime" 
//               className="px-4 py-2 bg-neutral-700 hover:bg-neutral-600 rounded-lg inline-block"
//             >
//               Back to List
//             </Link>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   if (isLoading || !anime) {
//     return (
//       <div className="min-h-screen bg-neutral-950 text-white flex items-center justify-center">
//         <div className="text-center p-8">
//           <div className="w-12 h-12 border-4 border-violet-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
//           <p className="text-lg">Loading anime details...</p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="bg-neutral-950 text-white min-h-screen pt-16 px-6">
//       <div className="max-w-6xl mx-auto">
//         {/* Back button */}
//         <Link 
//           href="/anime" 
//           className="inline-flex items-center text-violet-400 hover:text-violet-300 mb-6"
//         >
//           ← Back to List
//         </Link>

//         {/* Main content */}
//         <div className="grid md:grid-cols-[300px_1fr] gap-8">
//           {/* Left column - Image and quick stats */}
//           <div>
//             <Image 
//               src={anime.images.jpg.large_image_url || anime.images.jpg.image_url} 
//               width={300} 
//               height={450} 
//               className="w-full rounded-lg shadow-lg" 
//               alt={anime.title}
//             />
//             <div className="mt-4 bg-neutral-800 p-4 rounded-lg">
//               <div className="flex items-center justify-center text-2xl mb-2">
//                 <span className="text-yellow-400">⭐</span>
//                 <span className="font-bold ml-2">{anime.score || 'N/A'}</span>
//               </div>
//               <p className="text-center text-sm text-neutral-400">
//                 {anime.scored_by?.toLocaleString()} ratings
//               </p>
//               <div className="mt-4 space-y-2 text-sm">
//                 <p>Rank: #{anime.rank || 'N/A'}</p>
//                 <p>Popularity: #{anime.popularity || 'N/A'}</p>
//                 <p>Episodes: {anime.episodes || 'N/A'}</p>
//                 <p>Duration: {anime.duration || 'N/A'}</p>
//                 <p>Status: {anime.status || 'N/A'}</p>
//                 <p>Rating: {anime.rating || 'N/A'}</p>
//               </div>
//             </div>
//           </div>

//           {/* Right column - Details */}
//           <div>
//             <h1 className="text-3xl font-bold mb-2">{anime.title}</h1>
//             <h2 className="text-xl text-neutral-400 mb-6">{anime.title_japanese}</h2>

//             <div className="mb-6">
//               <h3 className="text-lg font-semibold mb-2">Synopsis</h3>
//               <p className="text-neutral-300 leading-relaxed">{anime.synopsis}</p>
//             </div>

//             {anime.studios && anime.studios.length > 0 && (
//               <div className="mb-4">
//                 <h3 className="text-lg font-semibold mb-2">Studios</h3>
//                 <div className="flex flex-wrap gap-2">
//                   {anime.studios.map(studio => (
//                     <span 
//                       key={studio.name}
//                       className="px-3 py-1 bg-neutral-800 rounded-full text-sm"
//                     >
//                       {studio.name}
//                     </span>
//                   ))}
//                 </div>
//               </div>
//             )}

//             {anime.genres && anime.genres.length > 0 && (
//               <div className="mb-4">
//                 <h3 className="text-lg font-semibold mb-2">Genres</h3>
//                 <div className="flex flex-wrap gap-2">
//                   {anime.genres.map(genre => (
//                     <span 
//                       key={genre.name}
//                       className="px-3 py-1 bg-violet-900 rounded-full text-sm"
//                     >
//                       {genre.name}
//                     </span>
//                   ))}
//                 </div>
//               </div>
//             )}

//             <div className="mt-6 grid grid-cols-2 gap-4">
//               {anime.year && (
//                 <div className="bg-neutral-800 p-4 rounded-lg">
//                   <h3 className="font-semibold mb-1">Year</h3>
//                   <p>{anime.year}</p>
//                 </div>
//               )}
//               {anime.season && (
//                 <div className="bg-neutral-800 p-4 rounded-lg">
//                   <h3 className="font-semibold mb-1">Season</h3>
//                   <p className="capitalize">{anime.season}</p>
//                 </div>
//               )}
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// ====================================================

// 'use client';

// import { useEffect, useState } from 'react';
// import Image from 'next/image';
// import Link from 'next/link';
// import { useParams } from 'next/navigation';
// import { Badge } from '@/components/ui/badge';
// import { Card, CardContent } from '@/components/ui/card';
// import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
// import {
//   Star,
//   Clock,
//   Calendar,
//   Play,
//   Users,
//   Trophy,
//   Heart,
//   Info,
//   Globe,
//   Video,
//   Tv,
//   CalendarDays,
//   CircleUserRound,
//   Building2,
//   ChevronLeft,
//   ChevronRight,
//   ArrowLeft
// } from 'lucide-react';

// interface AnimeDetails {
//   mal_id: number;
//   title: string;
//   title_japanese: string;
//   title_english?: string;
//   images: { jpg: { image_url: string; large_image_url: string } };
//   score: number;
//   scored_by: number;
//   rank: number;
//   popularity: number;
//   members: number;
//   favorites: number;
//   status: string;
//   episodes: number;
//   duration: string;
//   rating: string;
//   synopsis: string;
//   background?: string;
//   year: number;
//   season: string;
//   broadcast?: { string: string };
//   studios: Array<{ name: string }>;
//   genres: Array<{ name: string }>;
//   themes: Array<{ name: string }>;
//   demographics: Array<{ name: string }>;
//   trailer?: { youtube_id: string };
//   type: string;
// }

// interface Character {
//   character: {
//     mal_id: number;
//     name: string;
//     images: { jpg: { image_url: string } };
//   };
//   role: string;
//   voice_actors: Array<{
//     person: { name: string };
//     language: string;
//   }>;
// }

// interface Picture {
//   jpg: {
//     large_image_url: string;
//   };
// }

// async function fetchWithRetry(url: string, retries = 3, delay = 1000): Promise<any> {
//   for (let i = 0; i < retries; i++) {
//     try {
//       const response = await fetch(url);
//       if (!response.ok) {
//         throw new Error(`HTTP error! status: ${response.status}`);
//       }
//       const data = await response.json();
//       return data;
//     } catch (error) {
//       if (i === retries - 1) throw error;
//       await new Promise(resolve => setTimeout(resolve, delay * (i + 1)));
//     }
//   }
// }

// export default function AnimeDetailPage() {
//   const { id } = useParams();
//   const [anime, setAnime] = useState<AnimeDetails | null>(null);
//   const [characters, setCharacters] = useState<Character[]>([]);
//   const [pictures, setPictures] = useState<Picture[]>([]);
//   const [currentPage, setCurrentPage] = useState(1);
//   const [isLoading, setIsLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);

//   const charactersPerPage = 25;
//   const totalPages = Math.ceil(characters.length / charactersPerPage);
//   const currentCharacters = characters.slice(
//     (currentPage - 1) * charactersPerPage,
//     currentPage * charactersPerPage
//   );

//   useEffect(() => {
//     async function fetchAnimeDetails() {
//       try {
//         setIsLoading(true);
//         setError(null);
//         const [animeData, charactersData, picturesData] = await Promise.all([
//           fetchWithRetry(`https://api.jikan.moe/v4/anime/${id}/full`),
//           fetchWithRetry(`https://api.jikan.moe/v4/anime/${id}/characters`),
//           fetchWithRetry(`https://api.jikan.moe/v4/anime/${id}/pictures`)
//         ]);
//         setAnime(animeData.data);
//         setCharacters(charactersData.data);
//         setPictures(picturesData.data);
//       } catch (err) {
//         console.error('Error fetching anime details:', err);
//         setError('Failed to load anime details. Please try again later.');
//       } finally {
//         setIsLoading(false);
//       }
//     }

//     if (id) {
//       fetchAnimeDetails();
//     }
//   }, [id]);

//   const formatNumber = (num: number): string => {
//     if (num >= 1000000) {
//       return (num / 1000000).toFixed(1) + 'M';
//     }
//     if (num >= 1000) {
//       return (num / 1000).toFixed(1) + 'K';
//     }
//     return num.toString();
//   };

//   const formatRating = (rating: string = 'Unknown'): string => {
//     const ratingMap: { [key: string]: string } = {
//       'G': 'All Ages',
//       'PG': 'Children',
//       'PG-13': 'Teens 13+',
//       'R': 'Violence & Profanity',
//       'R+': 'Mild Nudity',
//       'Rx': 'Hentai',
//     };
//     return ratingMap[rating] || rating;
//   };

//   const getBackgroundImage = (): string => {
//     if (pictures && pictures.length > 0) {
//       const coverUrl = anime?.images.jpg.large_image_url;
//       const differentPicture = pictures.find(pic => pic.jpg.large_image_url !== coverUrl);
//       return differentPicture?.jpg.large_image_url || coverUrl || '';
//     }
//     return anime?.images.jpg.large_image_url || '';
//   };

//   if (error) {
//     return (
//       <div className="min-h-screen bg-neutral-950 text-white pt-16">
//         <div className="text-center p-8">
//           <h2 className="text-2xl font-bold text-red-500 mb-4">Error</h2>
//           <p className="text-lg mb-4">{error}</p>
//           <div className="space-x-4">
//             <button
//               onClick={() => window.location.reload()}
//               className="px-4 py-2 bg-violet-600 hover:bg-violet-500 rounded-lg"
//             >
//               Retry
//             </button>
//             <Link
//               href="/anime"
//               className="px-4 py-2 bg-neutral-700 hover:bg-neutral-600 rounded-lg inline-block"
//             >
//               Back to List
//             </Link>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   if (isLoading || !anime) {
//     return (
//       <div className="min-h-screen bg-neutral-950 text-white pt-16">
//         <div className="text-center p-8">
//           <div className="w-12 h-12 border-4 border-violet-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
//           <p className="text-lg">Loading anime details...</p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-neutral-950 text-white pt-16">
//       <div className="sticky top-20 left-0 w-full z-[100] px-4 md:px-8 mb-4">
//         <Link
//           href="/anime"
//           className="inline-flex items-center gap-2 px-4 py-2 bg-neutral-900/80 backdrop-blur-sm rounded-lg text-white hover:bg-neutral-800/80 transition-colors"
//         >
//           <ArrowLeft className="w-4 h-4" />
//           Back to List
//         </Link>
//       </div>

//       <div className="relative w-full h-[400px] -mt-16">
//         <Image
//           src={getBackgroundImage()}
//           fill
//           className="object-cover blur-sm"
//           alt="background"
//           priority
//         />
//         <div className="absolute inset-0 bg-black/60" />
//       </div>

//       <div className="max-w-7xl mx-auto px-4 py-8 relative">
//         <div className="grid md:grid-cols-[320px_1fr] gap-8">
//           <div className="space-y-6">
//             <div className="relative -mt-32 z-10">
//               <Image
//                 src={anime.images.jpg.large_image_url}
//                 width={320}
//                 height={450}
//                 className="rounded-lg shadow-2xl"
//                 alt={anime.title}
//                 priority
//               />
//             </div>

//             <div className="bg-neutral-900 rounded-lg p-6 space-y-4">
//               <div className="text-center">
//                 <div className="flex items-center justify-center text-3xl font-bold text-yellow-500 mb-1">
//                   <Star className="w-8 h-8 mr-2" />
//                   {anime.score || 'N/A'}
//                 </div>
//                 <p className="text-sm text-neutral-400">
//                   {anime.scored_by ? `${formatNumber(anime.scored_by)} ratings` : 'No ratings yet'}
//                 </p>
//               </div>

//               <div className="grid grid-cols-2 gap-4 text-sm">
//                 <div className="space-y-1">
//                   <p className="text-neutral-400">Rank</p>
//                   <p className="font-semibold flex items-center">
//                     <Trophy className="w-4 h-4 mr-1 text-yellow-500" />
//                     #{anime.rank || 'N/A'}
//                   </p>
//                 </div>
//                 <div className="space-y-1">
//                   <p className="text-neutral-400">Popularity</p>
//                   <p className="font-semibold flex items-center">
//                     <Users className="w-4 h-4 mr-1 text-blue-500" />
//                     #{anime.popularity || 'N/A'}
//                   </p>
//                 </div>
//                 <div className="space-y-1">
//                   <p className="text-neutral-400">Members</p>
//                   <p className="font-semibold flex items-center">
//                     <CircleUserRound className="w-4 h-4 mr-1 text-green-500" />
//                     {anime.members ? formatNumber(anime.members) : 'N/A'}
//                   </p>
//                 </div>
//                 <div className="space-y-1">
//                   <p className="text-neutral-400">Favorites</p>
//                   <p className="font-semibold flex items-center">
//                     <Heart className="w-4 h-4 mr-1 text-red-500" />
//                     {anime.favorites ? formatNumber(anime.favorites) : 'N/A'}
//                   </p>
//                 </div>
//               </div>
//             </div>

//             <div className="bg-neutral-900 rounded-lg p-6 space-y-4">
//               <h3 className="font-semibold text-lg">Information</h3>

//               <div className="space-y-3 text-sm">
//                 <div className="flex items-start">
//                   <Tv className="w-4 h-4 mr-2 mt-1 text-neutral-400" />
//                   <div>
//                     <p className="text-neutral-400">Type</p>
//                     <p className="font-medium">{anime.type || 'Unknown'}</p>
//                   </div>
//                 </div>

//                 <div className="flex items-start">
//                   <Play className="w-4 h-4 mr-2 mt-1 text-neutral-400" />
//                   <div>
//                     <p className="text-neutral-400">Episodes</p>
//                     <p className="font-medium">{anime.episodes || 'Unknown'}</p>
//                   </div>
//                 </div>

//                 <div className="flex items-start">
//                   <Clock className="w-4 h-4 mr-2 mt-1 text-neutral-400" />
//                   <div>
//                     <p className="text-neutral-400">Duration</p>
//                     <p className="font-medium">{anime.duration || 'Unknown'}</p>
//                   </div>
//                 </div>

//                 <div className="flex items-start">
//                   <Info className="w-4 h-4 mr-2 mt-1 text-neutral-400" />
//                   <div>
//                     <p className="text-neutral-400">Status</p>
//                     <p className="font-medium">{anime.status || 'Unknown'}</p>
//                   </div>
//                 </div>

//                 <div className="flex items-start">
//                   <Calendar className="w-4 h-4 mr-2 mt-1 text-neutral-400" />
//                   <div>
//                     <p className="text-neutral-400">Season</p>
//                     <p className="font-medium">
//                       {anime.season ? `${anime.season.charAt(0).toUpperCase() + anime.season.slice(1)} ${anime.year}` : 'Unknown'}
//                     </p>
//                   </div>
//                 </div>

//                 <div className="flex items-start">
//                   <CalendarDays className="w-4 h-4 mr-2 mt-1 text-neutral-400" />
//                   <div>
//                     <p className="text-neutral-400">Broadcast</p>
//                     <p className="font-medium">{anime.broadcast?.string || 'Unknown'}</p>
//                   </div>
//                 </div>

//                 <div className="flex items-start">
//                   <Building2 className="w-4 h-4 mr-2 mt-1 text-neutral-400" />
//                   <div>
//                     <p className="text-neutral-400">Studios</p>
//                     <div className="font-medium">
//                       {anime.studios.length > 0
//                         ? anime.studios.map(studio => studio.name).join(', ')
//                         : 'Unknown'
//                       }
//                     </div>
//                   </div>
//                 </div>

//                 <div className="flex items-start">
//                   <Globe className="w-4 h-4 mr-2 mt-1 text-neutral-400" />
//                   <div>
//                     <p className="text-neutral-400">Rating</p>
//                     <p className="font-medium">{formatRating(anime.rating)}</p>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>

//           <div className="space-y-8">
//             <div>
//               <h1 className="text-4xl font-bold mb-2">{anime.title}</h1>
//               {anime.title_english && anime.title_english !== anime.title && (
//                 <h2 className="text-2xl text-neutral-400">{anime.title_english}</h2>
//               )}
//               <h3 className="text-xl text-neutral-500 mt-1">{anime.title_japanese}</h3>
//             </div>

//             <div className="space-y-3">
//               {anime.genres.length > 0 && (
//                 <div>
//                   <h4 className="text-sm text-neutral-400 mb-2">Genres</h4>
//                   <div className="flex flex-wrap gap-2">
//                     {anime.genres.map(genre => (
//                       <Badge key={genre.name} variant="secondary" className="bg-violet-600/30 text-violet-300">
//                         {genre.name}
//                       </Badge>
//                     ))}
//                   </div>
//                 </div>
//               )}

//               {anime.themes && anime.themes.length > 0 && (
//                 <div>
//                   <h4 className="text-sm text-neutral-400 mb-2">Themes</h4>
//                   <div className="flex flex-wrap gap-2">
//                     {anime.themes.map(theme => (
//                       <Badge key={theme.name} variant="secondary" className="bg-blue-600/30 text-blue-300">
//                         {theme.name}
//                       </Badge>
//                     ))}
//                   </div>
//                 </div>
//               )}

//               {anime.demographics && anime.demographics.length > 0 && (
//                 <div>
//                   <h4 className="text-sm text-neutral-400 mb-2">Demographics</h4>
//                   <div className="flex flex-wrap gap-2">
//                     {anime.demographics.map(demo => (
//                       <Badge key={demo.name} variant="secondary" className="bg-green-600/30 text-green-300">
//                         {demo.name}
//                       </Badge>
//                     ))}
//                   </div>
//                 </div>
//               )}
//             </div>

//             <Tabs defaultValue="synopsis" className="w-full">
//               <TabsList className="bg-neutral-900">
//                 <TabsTrigger value="synopsis">Synopsis</TabsTrigger>
//                 {anime.background && <TabsTrigger value="background">Background</TabsTrigger>}
//                 {characters.length > 0 && <TabsTrigger value="characters">Characters</TabsTrigger>}
//                 {anime.trailer?.youtube_id && <TabsTrigger value="trailer">Trailer</TabsTrigger>}
//               </TabsList>

//               <TabsContent value="synopsis" className="mt-4">
//                 <div className="bg-neutral-900 rounded-lg p-6">
//                   <p className="text-neutral-200 leading-relaxed whitespace-pre-line">
//                     {anime.synopsis}
//                   </p>
//                 </div>
//               </TabsContent>

//               {anime.background && (
//                 <TabsContent value="background" className="mt-4">
//                   <div className="bg-neutral-900 rounded-lg p-6">
//                     <p className="text-neutral-200 leading-relaxed whitespace-pre-line">
//                       {anime.background}
//                     </p>
//                   </div>
//                 </TabsContent>
//               )}

//               {characters.length > 0 && (
//                 <TabsContent value="characters" className="mt-4">
//                   <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
//                     {currentCharacters.map((char) => (
//                       <Card key={char.character.mal_id} className="bg-neutral-900 border-neutral-800">
//                         <CardContent className="p-0">
//                           <div className="relative aspect-[3/4]">
//                             <Image
//                               src={char.character.images.jpg.image_url}
//                               alt={char.character.name}
//                               fill
//                               className="object-cover rounded-t-lg"
//                               sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
//                             />
//                           </div>
//                           <div className="p-4">
//                             <h4 className="font-semibold text-sm mb-1">{char.character.name}</h4>
//                             <p className="text-sm text-neutral-400">{char.role}</p>
//                             {char.voice_actors?.length > 0 && (
//                               <div className="mt-2 pt-2 border-t border-neutral-800">
//                                 <p className="text-xs text-neutral-500 mb-1">Voice Actors</p>
//                                 {char.voice_actors.slice(0, 2).map((va, index) => (
//                                   <div key={index} className="flex items-center text-xs text-neutral-400">
//                                     <span>{va.person.name}</span>
//                                     <span className="mx-1">•</span>
//                                     <span>{va.language}</span>
//                                   </div>
//                                 ))}
//                               </div>
//                             )}
//                           </div>
//                         </CardContent>
//                       </Card>
//                     ))}
//                   </div>

//                   {totalPages > 1 && (
//                     <div className="flex justify-center items-center gap-4 mt-8">
//                       <button
//                         onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
//                         disabled={currentPage === 1}
//                         className="flex items-center gap-1 px-4 py-2 bg-violet-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-violet-500 transition-colors"
//                       >
//                         <ChevronLeft className="w-4 h-4" />
//                         Previous
//                       </button>
//                       <span className="text-sm">
//                         Page {currentPage} of {totalPages}
//                       </span>
//                       <button
//                         onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
//                         disabled={currentPage === totalPages}
//                         className="flex items-center gap-1 px-4 py-2 bg-violet-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-violet-500 transition-colors"
//                       >
//                         Next
//                         <ChevronRight className="w-4 h-4" />
//                       </button>
//                     </div>
//                   )}
//                 </TabsContent>
//               )}

//               {anime.trailer?.youtube_id && (
//                 <TabsContent value="trailer" className="mt-4">
//                   <div className="bg-neutral-900 rounded-lg p-6">
//                     <div className="relative pb-[56.25%]">
//                       <iframe
//                         className="absolute top-0 left-0 w-full h-full rounded-lg"
//                         src={`https://www.youtube.com/embed/${anime.trailer.youtube_id}`}
//                         title="Trailer"
//                         allowFullScreen
//                       />
//                     </div>
//                   </div>
//                 </TabsContent>
//               )}
//             </Tabs>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TranslationContributor } from '@/components/TranslationContributor';
import { useLanguage } from '@/components/LanguageProvider';
import {
  Star,
  Clock,
  Calendar,
  Play,
  Users,
  Trophy,
  Heart,
  Info,
  Globe,
  Video,
  Tv,
  CalendarDays,
  CircleUserRound,
  Building2,
  ChevronLeft,
  ChevronRight,
  ArrowLeft
} from 'lucide-react';

const translations = {
  en: {
    back: 'Back to List',
    loading: 'Loading anime details...',
    error: 'Error',
    retry: 'Retry',
    ratings: 'ratings',
    rank: 'Rank',
    popularity: 'Popularity',
    members: 'Members',
    favorites: 'Favorites',
    information: 'Information',
    type: 'Type',
    episodes: 'Episodes',
    duration: 'Duration',
    status: 'Status',
    season: 'Season',
    broadcast: 'Broadcast',
    studios: 'Studios',
    rating: 'Rating',
    genres: 'Genres',
    themes: 'Themes',
    demographics: 'Demographics',
    synopsis: 'Synopsis',
    background: 'Background',
    characters: 'Characters',
    trailer: 'Trailer',
    voiceActors: 'Voice Actors',
    unknown: 'Unknown',
    previous: 'Previous',
    next: 'Next',
    page: 'Page',
    of: 'of',
  },
  id: {
    back: 'Kembali ke Daftar',
    loading: 'Memuat detail anime...',
    error: 'Error',
    retry: 'Coba Lagi',
    ratings: 'penilaian',
    rank: 'Peringkat',
    popularity: 'Popularitas',
    members: 'Anggota',
    favorites: 'Favorit',
    information: 'Informasi',
    type: 'Tipe',
    episodes: 'Episode',
    duration: 'Durasi',
    status: 'Status',
    season: 'Musim',
    broadcast: 'Siaran',
    studios: 'Studio',
    rating: 'Rating',
    genres: 'Genre',
    themes: 'Tema',
    demographics: 'Demografi',
    synopsis: 'Sinopsis',
    background: 'Latar Belakang',
    characters: 'Karakter',
    trailer: 'Trailer',
    voiceActors: 'Pengisi Suara',
    unknown: 'Tidak diketahui',
    previous: 'Sebelumnya',
    next: 'Selanjutnya',
    page: 'Halaman',
    of: 'dari',
  },
} as const;

interface AnimeDetails {
  mal_id: number;
  title: string;
  title_japanese: string;
  title_english?: string;
  images: { jpg: { image_url: string; large_image_url: string } };
  score: number;
  scored_by: number;
  rank: number;
  popularity: number;
  members: number;
  favorites: number;
  status: string;
  episodes: number;
  duration: string;
  rating: string;
  synopsis: string;
  background?: string;
  year: number;
  season: string;
  broadcast?: { string: string };
  studios: Array<{ name: string }>;
  genres: Array<{ name: string }>;
  themes: Array<{ name: string }>;
  demographics: Array<{ name: string }>;
  trailer?: { youtube_id: string };
  type: string;
}

interface Character {
  character: {
    mal_id: number;
    name: string;
    images: { jpg: { image_url: string } };
  };
  role: string;
  voice_actors: Array<{
    person: { name: string };
    language: string;
  }>;
}

interface Picture {
  jpg: {
    large_image_url: string;
  };
}

async function fetchWithRetry(url: string, retries = 3, delay = 1000): Promise<any> {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data;
    } catch (error) {
      if (i === retries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, delay * (i + 1)));
    }
  }
}

export default function AnimeDetailPage() {
  const { id } = useParams();
  const { lang } = useLanguage();
  const [anime, setAnime] = useState<AnimeDetails | null>(null);
  const [characters, setCharacters] = useState<Character[]>([]);
  const [pictures, setPictures] = useState<Picture[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const t = translations[lang];
  const charactersPerPage = 25;
  const totalPages = Math.ceil(characters.length / charactersPerPage);
  const currentCharacters = characters.slice(
    (currentPage - 1) * charactersPerPage,
    currentPage * charactersPerPage
  );

  useEffect(() => {
    async function fetchAnimeDetails() {
      try {
        setIsLoading(true);
        setError(null);
        const [animeData, charactersData, picturesData] = await Promise.all([
          fetchWithRetry(`https://api.jikan.moe/v4/anime/${id}/full`),
          fetchWithRetry(`https://api.jikan.moe/v4/anime/${id}/characters`),
          fetchWithRetry(`https://api.jikan.moe/v4/anime/${id}/pictures`)
        ]);
        setAnime(animeData.data);
        setCharacters(charactersData.data);
        setPictures(picturesData.data);
      } catch (err) {
        console.error('Error fetching anime details:', err);
        setError('Failed to load anime details. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    }

    if (id) {
      fetchAnimeDetails();
    }
  }, [id]);

  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  const formatRating = (rating: string = 'Unknown'): string => {
    const ratingMap: { [key: string]: string } = {
      'G': 'All Ages',
      'PG': 'Children',
      'PG-13': 'Teens 13+',
      'R': 'Violence & Profanity',
      'R+': 'Mild Nudity',
      'Rx': 'Hentai',
    };
    return ratingMap[rating] || rating;
  };

  const getBackgroundImage = (): string => {
    if (pictures && pictures.length > 0) {
      const coverUrl = anime?.images.jpg.large_image_url;
      const differentPicture = pictures.find(pic => pic.jpg.large_image_url !== coverUrl);
      return differentPicture?.jpg.large_image_url || coverUrl || '';
    }
    return anime?.images.jpg.large_image_url || '';
  };

  if (error) {
    return (
      <div className="min-h-screen bg-neutral-950 text-white pt-16">
        <div className="text-center p-8">
          <h2 className="text-2xl font-bold text-red-500 mb-4">{t.error}</h2>
          <p className="text-lg mb-4">{error}</p>
          <div className="space-x-4">
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-violet-600 hover:bg-violet-500 rounded-lg"
            >
              {t.retry}
            </button>
            <Link
              href="/anime"
              className="px-4 py-2 bg-neutral-700 hover:bg-neutral-600 rounded-lg inline-block"
            >
              {t.back}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading || !anime) {
    return (
      <div className="min-h-screen bg-neutral-950 text-white pt-16">
        <div className="text-center p-8">
          <div className="w-12 h-12 border-4 border-violet-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg">{t.loading}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-white pt-16">
      <div className="sticky top-20 left-0 w-full z-[100] px-4 md:px-8 mb-4">
        <Link
          href="/anime"
          className="inline-flex items-center gap-2 px-4 py-2 bg-neutral-900/80 backdrop-blur-sm rounded-lg text-white hover:bg-neutral-800/80 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          {t.back}
        </Link>
      </div>

      <div className="relative w-full h-[400px] -mt-16">
        <Image
          src={getBackgroundImage()}
          fill
          className="object-cover blur-sm"
          alt="background"
          priority
        />
        <div className="absolute inset-0 bg-black/60" />
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8 relative">
        <div className="grid md:grid-cols-[320px_1fr] gap-8">
          <div className="space-y-6">
            <div className="relative -mt-32 z-10">
              <Image
                src={anime.images.jpg.large_image_url}
                width={320}
                height={450}
                className="rounded-lg shadow-2xl"
                alt={anime.title}
                priority
              />
            </div>

            <div className="bg-neutral-900 rounded-lg p-6 space-y-4">
              <div className="text-center">
                <div className="flex items-center justify-center text-3xl font-bold text-yellow-500 mb-1">
                  <Star className="w-8 h-8 mr-2" />
                  {anime.score || 'N/A'}
                </div>
                <p className="text-sm text-neutral-400">
                  {anime.scored_by ? `${formatNumber(anime.scored_by)} ${t.ratings}` : 'No ratings yet'}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="space-y-1">
                  <p className="text-neutral-400">{t.rank}</p>
                  <p className="font-semibold flex items-center">
                    <Trophy className="w-4 h-4 mr-1 text-yellow-500" />
                    #{anime.rank || 'N/A'}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-neutral-400">{t.popularity}</p>
                  <p className="font-semibold flex items-center">
                    <Users className="w-4 h-4 mr-1 text-blue-500" />
                    #{anime.popularity || 'N/A'}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-neutral-400">{t.members}</p>
                  <p className="font-semibold flex items-center">
                    <CircleUserRound className="w-4 h-4 mr-1 text-green-500" />
                    {anime.members ? formatNumber(anime.members) : 'N/A'}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-neutral-400">{t.favorites}</p>
                  <p className="font-semibold flex items-center">
                    <Heart className="w-4 h-4 mr-1 text-red-500" />
                    {anime.favorites ? formatNumber(anime.favorites) : 'N/A'}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-neutral-900 rounded-lg p-6 space-y-4">
              <h3 className="font-semibold text-lg">{t.information}</h3>

              <div className="space-y-3 text-sm">
                <div className="flex items-start">
                  <Tv className="w-4 h-4 mr-2 mt-1 text-neutral-400" />
                  <div>
                    <p className="text-neutral-400">{t.type}</p>
                    <p className="font-medium">{anime.type || t.unknown}</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <Play className="w-4 h-4 mr-2 mt-1 text-neutral-400" />
                  <div>
                    <p className="text-neutral-400">{t.episodes}</p>
                    <p className="font-medium">{anime.episodes || t.unknown}</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <Clock className="w-4 h-4 mr-2 mt-1 text-neutral-400" />
                  <div>
                    <p className="text-neutral-400">{t.duration}</p>
                    <p className="font-medium">{anime.duration || t.unknown}</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <Info className="w-4 h-4 mr-2 mt-1 text-neutral-400" />
                  <div>
                    <p className="text-neutral-400">{t.status}</p>
                    <p className="font-medium">{anime.status || t.unknown}</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <Calendar className="w-4 h-4 mr-2 mt-1 text-neutral-400" />
                  <div>
                    <p className="text-neutral-400">{t.season}</p>
                    <p className="font-medium">
                      {anime.season ? `${anime.season.charAt(0).toUpperCase() + anime.season.slice(1)} ${anime.year}` : t.unknown}
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <CalendarDays className="w-4 h-4 mr-2 mt-1 text-neutral-400" />
                  <div>
                    <p className="text-neutral-400">{t.broadcast}</p>
                    <p className="font-medium">{anime.broadcast?.string || t.unknown}</p>
                  </div>
                </div>

                <div className="flex items-start">
                  <Building2 className="w-4 h-4 mr-2 mt-1 text-neutral-400" />
                  <div>
                    <p className="text-neutral-400">{t.studios}</p>
                    <div className="font-medium">
                      {anime.studios.length > 0
                        ? anime.studios.map(studio => studio.name).join(', ')
                        : t.unknown
                      }
                    </div>
                  </div>
                </div>

                <div className="flex items-start">
                  <Globe className="w-4 h-4 mr-2 mt-1 text-neutral-400" />
                  <div>
                    <p className="text-neutral-400">{t.rating}</p>
                    <p className="font-medium">{formatRating(anime.rating)}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-8">
            <div>
              <h1 className="text-4xl font-bold mb-2">
                {anime.title}
                {lang !== 'en' && (
                  <TranslationContributor
                    textKey={`anime.${anime.mal_id}.title`}
                    originalText={anime.title}
                    currentLanguage={lang}
                    animeId={anime.mal_id}
                    field="title"
                  />
                )}
              </h1>
              {anime.title_english && anime.title_english !== anime.title && (
                <h2 className="text-2xl text-neutral-400">{anime.title_english}</h2>
              )}
              <h3 className="text-xl text-neutral-500 mt-1">{anime.title_japanese}</h3>
            </div>

            <div className="space-y-3">
              {anime.genres.length > 0 && (
                <div>
                  <h4 className="text-sm text-neutral-400 mb-2">{t.genres}</h4>
                  <div className="flex flex-wrap gap-2">
                    {anime.genres.map(genre => (
                      <Badge key={genre.name} variant="secondary" className="bg-violet-600/30 text-violet-300">
                        {genre.name}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {anime.themes && anime.themes.length > 0 && (
                <div>
                  <h4 className="text-sm text-neutral-400 mb-2">{t.themes}</h4>
                  <div className="flex flex-wrap gap-2">
                    {anime.themes.map(theme => (
                      <Badge key={theme.name} variant="secondary" className="bg-blue-600/30 text-blue-300">
                        {theme.name}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {anime.demographics && anime.demographics.length > 0 && (
                <div>
                  <h4 className="text-sm text-neutral-400 mb-2">{t.demographics}</h4>
                  <div className="flex flex-wrap gap-2">
                    {anime.demographics.map(demo => (
                      <Badge key={demo.name} variant="secondary" className="bg-green-600/30 text-green-300">
                        {demo.name}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <Tabs defaultValue="synopsis" className="w-full">
              <TabsList className="bg-neutral-900">
                <TabsTrigger value="synopsis">{t.synopsis}</TabsTrigger>
                {anime.background && <TabsTrigger value="background">{t.background}</TabsTrigger>}
                {characters.length > 0 && <TabsTrigger value="characters">{t.characters}</TabsTrigger>}
                {anime.trailer?.youtube_id && <TabsTrigger value="trailer">{t.trailer}</TabsTrigger>}
              </TabsList>

              <TabsContent value="synopsis" className="mt-4">
                <div className="bg-neutral-900 rounded-lg p-6">
                  <p className="text-neutral-200 leading-relaxed whitespace-pre-line">
                    {anime.synopsis}
                    {lang !== 'en' && (
                      <TranslationContributor
                        textKey={`anime.${anime.mal_id}.synopsis`}
                        originalText={anime.synopsis}
                        currentLanguage={lang}
                        animeId={anime.mal_id}
                        field="synopsis"
                      />
                    )}
                  </p>
                </div>
              </TabsContent>

              {anime.background && (
                <TabsContent value="background" className="mt-4">
                  <div className="bg-neutral-900 rounded-lg p-6">
                    <p className="text-neutral-200 leading-relaxed whitespace-pre-line">
                      {anime.background}
                      {lang !== 'en' && (
                        <TranslationContributor
                          textKey={`anime.${anime.mal_id}.background`}
                          originalText={anime.background}
                          currentLanguage={lang}
                          animeId={anime.mal_id}
                          field="background"
                        />
                      )}
                    </p>
                  </div>
                </TabsContent>
              )}

              {characters.length > 0 && (
                <TabsContent value="characters" className="mt-4">
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                    {currentCharacters.map((char) => (
                      <Card key={char.character.mal_id} className="bg-neutral-900 border-neutral-800">
                        <CardContent className="p-0">
                          <div className="relative aspect-[3/4]">
                            <Image
                              src={char.character.images.jpg.image_url}
                              alt={char.character.name}
                              fill
                              className="object-cover rounded-t-lg"
                              sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                            />
                          </div>
                          <div className="p-4">
                            <h4 className="font-semibold text-sm mb-1">
                              {char.character.name}
                              {lang !== 'en' && (
                                <TranslationContributor
                                  textKey={`character.${char.character.mal_id}.name`}
                                  originalText={char.character.name}
                                  currentLanguage={lang}
                                  animeId={anime.mal_id}
                                  field={`character_${char.character.mal_id}`}
                                />
                              )}
                            </h4>
                            <p className="text-sm text-neutral-400">{char.role}</p>
                            {char.voice_actors?.length > 0 && (
                              <div className="mt-2 pt-2 border-t border-neutral-800">
                                <p className="text-xs text-neutral-500 mb-1">{t.voiceActors}</p>
                                {char.voice_actors.slice(0, 2).map((va, index) => (
                                  <div key={index} className="flex items-center text-xs text-neutral-400">
                                    <span>{va.person.name}</span>
                                    <span className="mx-1">•</span>
                                    <span>{va.language}</span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  {totalPages > 1 && (
                    <div className="flex justify-center items-center gap-4 mt-8">
                      <button
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        className="flex items-center gap-1 px-4 py-2 bg-violet-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-violet-500 transition-colors"
                      >
                        <ChevronLeft className="w-4 h-4" />
                        {t.previous}
                      </button>
                      <span className="text-sm">
                        {t.page} {currentPage} {t.of} {totalPages}
                      </span>
                      <button
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                        className="flex items-center gap-1 px-4 py-2 bg-violet-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-violet-500 transition-colors"
                      >
                        {t.next}
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </TabsContent>
              )}

              {anime.trailer?.youtube_id && (
                <TabsContent value="trailer" className="mt-4">
                  <div className="bg-neutral-900 rounded-lg p-6">
                    <div className="relative pb-[56.25%]">
                      <iframe
                        className="absolute top-0 left-0 w-full h-full rounded-lg"
                        src={`https://www.youtube.com/embed/${anime.trailer.youtube_id}`}
                        title="Trailer"
                        allowFullScreen
                      />
                    </div>
                  </div>
                </TabsContent>
              )}
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}