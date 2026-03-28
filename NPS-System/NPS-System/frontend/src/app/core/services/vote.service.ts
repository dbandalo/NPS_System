import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Vote, CreateVoteRequest, NpsResult } from '../models/vote.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class VoteService {
  private apiUrl = `${environment.apiUrl}/votes`;

  constructor(private http: HttpClient) {}

  createVote(vote: CreateVoteRequest): Observable<Vote> {
    return this.http.post<Vote>(this.apiUrl, vote);
  }

  getNpsResults(): Observable<NpsResult> {
    return this.http.get<NpsResult>(`${this.apiUrl}/results`);
  }

  hasVoted(): Observable<{ hasVoted: boolean }> {
    return this.http.get<{ hasVoted: boolean }>(`${this.apiUrl}/has-voted`);
  }
}
