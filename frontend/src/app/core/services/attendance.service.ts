import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface AttendanceRecord {
  id: string;
  date: string;
  dayName: string;
  shiftType: string;
  checkIn?: string | null;
  checkOut?: string | null;
  status: 'Present' | 'Absent' | 'Late' | 'Half Day' | 'On Leave';
  hoursWorked: number;
  location?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AttendanceService {
  private apiUrl = `${environment.apiUrl}/attendance`;

  constructor(private http: HttpClient) {}

  getAttendance(): Observable<AttendanceRecord[]> {
    return this.http.get<AttendanceRecord[]>(this.apiUrl).pipe(
      catchError(() => of([]))
    );
  }

  createAttendance(record: Partial<AttendanceRecord>): Observable<AttendanceRecord> {
    return this.http.post<AttendanceRecord>(this.apiUrl, record);
  }
}

