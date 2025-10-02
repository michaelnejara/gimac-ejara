import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { catchError, map, tap, shareReplay } from 'rxjs/operators';

/**
 * IP Geolocation response interface
 */
export interface IpGeolocationResponse {
  ip: string;
  continent_code: string;
  continent_name: string;
  country_code2: string;
  country_code3: string;
  country_name: string;
  country_capital: string;
  state_prov: string;
  district: string;
  city: string;
  zipcode: string;
  latitude: string;
  longitude: string;
  is_eu: boolean;
  calling_code: string;
  country_tld: string;
  languages: string;
  country_flag: string;
  geoname_id: string;
  isp: string;
  connection_type: string;
  organization: string;
  currency: {
    code: string;
    name: string;
    symbol: string;
  };
  time_zone: {
    name: string;
    offset: number;
    current_time: string;
    current_time_unix: number;
    is_dst: boolean;
    dst_savings: number;
  };
}

/**
 * Simplified geolocation data for authentication
 */
export interface GeolocationData {
  ipAddress: string;
  latitude: string;
  longitude: string;
  country: string;
  city: string;
  countryCode: string;
}

/**
 * Geolocation Service
 * Fetches IP-based geolocation data for authentication
 */
@Injectable({
  providedIn: 'root'
})
export class GeolocationService {
  private http = inject(HttpClient);
  
  /** API endpoint for IP geolocation */
  private readonly API_URL = 'https://api.ipgeolocation.io/ipgeo';
  
  /** API key for geolocation service */
  private readonly API_KEY = '9f40f3c3987e4976a69b05e6cae839c8';
  
  /** Cached geolocation data */
  private cachedGeolocation$: Observable<GeolocationData> | null = null;

  /**
   * Get current IP geolocation data
   * Results are cached for the session
   * 
   * @returns {Observable<GeolocationData>} Observable of geolocation data
   * 
   * @example
   * this.geolocationService.getGeolocation().subscribe(data => {
   *   console.log('IP:', data.ipAddress);
   *   console.log('Location:', data.city, data.country);
   * });
   */
  getGeolocation(): Observable<GeolocationData> {
    // Return cached data if available
    if (this.cachedGeolocation$) {
      return this.cachedGeolocation$;
    }

    // Fetch and cache geolocation data
    this.cachedGeolocation$ = this.http.get<IpGeolocationResponse>(
      `${this.API_URL}?apiKey=${this.API_KEY}`
    ).pipe(
      map(response => this.mapToGeolocationData(response)),
      tap(data => {
        // Store in session storage as backup
        sessionStorage.setItem('geo_data', JSON.stringify(data));
      }),
      catchError(error => {
        console.error('Failed to fetch geolocation:', error);
        // Try to get from session storage
        const cached = sessionStorage.getItem('geo_data');
        if (cached) {
          return of(JSON.parse(cached));
        }
        // Return default values
        return of(this.getDefaultGeolocationData());
      }),
      shareReplay(1) // Share and replay for multiple subscribers
    );

    return this.cachedGeolocation$;
  }

  /**
   * Clear cached geolocation data
   * Use this when you need to refresh location data
   */
  clearCache(): void {
    this.cachedGeolocation$ = null;
    sessionStorage.removeItem('geo_data');
  }

  /**
   * Map API response to simplified geolocation data
   * @private
   */
  private mapToGeolocationData(response: IpGeolocationResponse): GeolocationData {
    return {
      ipAddress: response.ip,
      latitude: response.latitude,
      longitude: response.longitude,
      country: response.country_name,
      city: response.city,
      countryCode: response.country_code2,
    };
  }

  /**
   * Get default geolocation data when API fails
   * @private
   */
  private getDefaultGeolocationData(): GeolocationData {
    return {
      ipAddress: '0.0.0.0',
      latitude: '0.0',
      longitude: '0.0',
      country: 'Unknown',
      city: 'Unknown',
      countryCode: 'XX',
    };
  }
}