
import { Movie } from './types';

export const MOVIES: Movie[] = [
  {
    id: '1',
    title: 'Neon Nights',
    description: 'A futuristic thriller set in a cyberpunk metropolis where fashion is as lethal as the streets.',
    thumbnail: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&q=80&w=800',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    genre: ['Cyberpunk', 'Thriller'],
    year: 2024,
    type: 'movie'
  },
  {
    id: '2',
    title: 'The Silent Peak',
    description: 'An explorer finds more than just snow in the heights of the Himalayas.',
    thumbnail: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=800',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    genre: ['Adventure', 'Drama'],
    year: 2023,
    type: 'movie'
  },
  {
    id: '3',
    title: 'Digital Horizon',
    description: 'A revolutionary TV series exploring the blurred lines between reality and virtual existence.',
    thumbnail: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&q=80&w=800',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    genre: ['Sci-Fi', 'Mystery'],
    year: 2025,
    type: 'tv'
  },
  {
    id: '4',
    title: 'Rustic Echoes',
    description: 'A documentary series following local artisans preserving ancient crafts.',
    thumbnail: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&q=80&w=800',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    genre: ['Indie', 'Documentary'],
    year: 2022,
    type: 'tv'
  },
  {
    id: '5',
    title: 'Cosmic Drift',
    description: 'Intergalactic explorers search for a new home among the stars.',
    thumbnail: 'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&q=80&w=800',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
    genre: ['Sci-Fi', 'Action'],
    year: 2024,
    type: 'movie'
  }
];
