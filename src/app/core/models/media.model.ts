export interface Movie {
    id: number;
    title: string;
    overview: string;
    posterPath?: string;
    backdropPath?: string;
    releaseDate?: Date;
    voteAverage: number;
    voteCount: number;
    originalLanguage?: string;
    genres: Genre[];
    cast: CastMember[];
    director?: string;
    videos: Video[];
}

export interface TvShow {
    id: number;
    name: string;
    overview: string;
    posterPath?: string;
    backdropPath?: string;
    firstAirDate?: Date;
    voteAverage: number;
    voteCount: number;
    originalLanguage?: string;
    genres: Genre[];
    numberOfSeasons?: number;
    numberOfEpisodes?: number;
    status?: string;
    cast: CastMember[];
    director?: string;
    videos: Video[];
    seasons?: Season[];
}

export interface Season {
    id: number;
    seasonNumber: number;
    name: string;
    overview: string;
    posterPath?: string;
    episodeCount: number;
    airDate?: Date;
    episodes?: Episode[];
    appRating?: any; // Contains Average, Percentage, TotalReviews from our app
    showReviewForm?: boolean;
    // UI state
    expanded?: boolean;
    loading?: boolean;
}

export interface Episode {
    id: number;
    episodeNumber: number;
    name: string;
    overview: string;
    stillPath?: string;
    airDate?: Date;
    voteAverage: number;
    appRating?: any; // Contains Average, Percentage, TotalReviews from our app
    showReviewForm?: boolean;
}

export interface CastMember {
    id: number;
    name: string;
    character: string;
    profilePath?: string;
}

export interface Video {
    id: string;
    key: string;
    name: string;
    site: string;
    type: string;
}

export interface Person {
    id: number;
    name: string;
    profilePath?: string;
    popularity: number;
    knownForDepartment?: string;
    biography?: string;
    birthday?: Date;
    placeOfBirth?: string;
    credits?: any[];
}

export interface Genre {
    id: number;
    name: string;
}

export interface Review {
    id?: string;
    userId: string;
    mediaId: number;
    mediaType: 'Movie' | 'TvShow' | 'Person' | 'Season' | 'Episode';
    userName: string;
    rating: number;
    comment: string;
    createdAt: Date;
}

export interface CreateReview {
    mediaId: number;
    mediaType: 'Movie' | 'TvShow' | 'Person' | 'Season' | 'Episode';
    rating: number;
    comment: string;
}
