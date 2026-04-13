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
    userName: string;
    rating: number;
    comment: string;
}
