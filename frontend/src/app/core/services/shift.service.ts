import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface ShiftEntry {
  id: string;
  workerName: string;
  date: string;
  shiftType: 'Morning' | 'Afternoon' | 'Night';
  shiftStart: string;
  shiftEnd: string;
  location: string;
  project: string;
  status: 'Scheduled' | 'Completed' | 'Absent' | 'On Leave';
}

@Injectable({
  providedIn: 'root'
})
export class ShiftService {
  private apiUrl = `${environment.apiUrl}/shifts`;

  constructor(private http: HttpClient) {}

  getShifts(): Observable<ShiftEntry[]> {
    return this.http.get<ShiftEntry[]>(this.apiUrl).pipe(
      catchError(() => of([]))
    );
  }

  createShift(shift: Partial<ShiftEntry>): Observable<ShiftEntry> {
    return this.http.post<ShiftEntry>(this.apiUrl, shift);
  }

  updateShift(id: string, updates: Partial<ShiftEntry>): Observable<ShiftEntry> {
    return this.http.put<ShiftEntry>(`${this.apiUrl}/${id}`, updates);
  }

deleteShift(id: string): Observable<boolean> {
    return this.http.delete(`${this.apiUrl}/${id}`, { responseType: 'text' }).pipe(
      map(() => true),
      catchError(() => of(false))
    );
  }
}

