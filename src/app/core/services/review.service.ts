import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Review, CreateReview } from '../models/media.model';

export interface RatingAverage {
    average: number;
    percentage: number;
    totalReviews: number;
}

@Injectable({
    providedIn: 'root'
})
export class ReviewService {
    private apiUrl = 'http://localhost:5000/api/reviews';

    constructor(private http: HttpClient) { }

    getReviewsByMedia(mediaType: string, mediaId: number): Observable<Review[]> {
        return this.http.get<Review[]>(`${this.apiUrl}/${mediaType}/${mediaId}`);
    }

    getReviewsByUser(userName: string): Observable<Review[]> {
        return this.http.get<Review[]>(`${this.apiUrl}/user/${userName}`);
    }

    getAverageRating(mediaType: string, mediaId: number): Observable<RatingAverage> {
        return this.http.get<RatingAverage>(`${this.apiUrl}/average/${mediaType}/${mediaId}`).pipe(
            catchError(() => of({ average: 0, percentage: 0, totalReviews: 0 }))
        );
    }

    createReview(review: CreateReview): Observable<Review> {
        return this.http.post<Review>(this.apiUrl, review);
    }

    updateReview(id: string, review: CreateReview): Observable<void> {
        return this.http.put<void>(`${this.apiUrl}/${id}`, review);
    }

    deleteReview(id: string): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }
}
