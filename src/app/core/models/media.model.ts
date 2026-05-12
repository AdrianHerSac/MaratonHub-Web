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
}

export interface Genre {
    id: number;
    name: string;
}

export interface Review {
    id?: string;
    userId: string;
    mediaId: number;
    mediaType: 'Movie' | 'TvShow' | 'Person';
    userName: string;
    rating: number;
    comment: string;
    createdAt: Date;
}

export interface CreateReview {
    mediaId: number;
    mediaType: 'Movie' | 'TvShow' | 'Person';
    rating: number;
    comment: string;
}
