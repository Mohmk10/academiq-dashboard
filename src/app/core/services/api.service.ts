import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse, PageResponse } from '../models/api-response.model';

@Injectable({ providedIn: 'root' })
export class ApiService {

  private readonly baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  get<T>(url: string, params?: any): Observable<ApiResponse<T>> {
    return this.http.get<ApiResponse<T>>(`${this.baseUrl}/${url}`, {
      params: this.buildParams(params)
    });
  }

  getPage<T>(url: string, page: number, size: number, sort?: string, direction?: string, params?: any): Observable<ApiResponse<PageResponse<T>>> {
    const httpParams = this.buildParams({
      ...params,
      page,
      size,
      ...(sort ? { sort } : {}),
      ...(direction ? { direction } : {})
    });
    return this.http.get<ApiResponse<PageResponse<T>>>(`${this.baseUrl}/${url}`, { params: httpParams });
  }

  post<T>(url: string, body: any): Observable<ApiResponse<T>> {
    return this.http.post<ApiResponse<T>>(`${this.baseUrl}/${url}`, body);
  }

  put<T>(url: string, body: any): Observable<ApiResponse<T>> {
    return this.http.put<ApiResponse<T>>(`${this.baseUrl}/${url}`, body);
  }

  patch<T>(url: string, body?: any): Observable<ApiResponse<T>> {
    return this.http.patch<ApiResponse<T>>(`${this.baseUrl}/${url}`, body);
  }

  delete<T>(url: string): Observable<ApiResponse<T>> {
    return this.http.delete<ApiResponse<T>>(`${this.baseUrl}/${url}`);
  }

  download(url: string): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/${url}`, { responseType: 'blob' });
  }

  upload<T>(url: string, file: File, fieldName: string = 'fichier'): Observable<ApiResponse<T>> {
    const formData = new FormData();
    formData.append(fieldName, file);
    return this.http.post<ApiResponse<T>>(`${this.baseUrl}/${url}`, formData);
  }

  private buildParams(params?: any): HttpParams {
    let httpParams = new HttpParams();
    if (!params) return httpParams;

    Object.keys(params).forEach(key => {
      const value = params[key];
      if (value !== null && value !== undefined && value !== '') {
        httpParams = httpParams.set(key, value.toString());
      }
    });
    return httpParams;
  }
}
