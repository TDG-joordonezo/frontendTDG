import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AppService {
  constructor(private http: HttpClient) {}

  predict(img: any) {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
    });

    const body = JSON.stringify({ image: img });
    return this.http.post(`${environment.apiUrl}/predict`, body, {
      headers: headers,
    });
  }
}
