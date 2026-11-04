export interface User {
  id: string;
  name: string;
  username: string;
  avatar: string;
  bannerUrl: string;
  bio: string;
  favoriteGenre: string;
  badge: string;
  joinedDate: string;
  followersCount: number;
  followingCount: number;
  isGuest?: boolean;
}

export interface Movie {
  id: string;
  userId: string;
  title: string;
  year: number | string;
  director: string;
  genre: string;
  posterUrl: string;
  backdropUrl?: string;
  rating: number; // 1 to 10
  review: string;
  favoriteScene?: string;
  badges?: string[]; // e.g. ['4K UHD', 'IMAX', 'DOLBY ATMOS']
  likesCount: number;
  likedBy: string[]; // user IDs
  createdAt: string;
}

export interface Comment {
  id: string;
  targetUserId: string; // which user's profile wall this belongs to
  movieId?: string;     // optional: if specific to one movie
  movieTitle?: string;
  authorId: string;
  authorName: string;
  authorUsername: string;
  authorAvatar: string;
  content: string;
  createdAt: string;
  likes: number;
  likedBy?: string[];
}

export interface CatalogPresetMovie {
  title: string;
  year: number;
  director: string;
  genre: string;
  posterUrl: string;
  backdropUrl: string;
  defaultReview: string;
  badges: string[];
}
