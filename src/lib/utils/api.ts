// src/lib/utils/api.ts

const API_BASE  = import.meta.env.VITE_API_BASE  ?? 'http://localhost:8000/api';
const AUTH_BASE = import.meta.env.VITE_AUTH_BASE ?? 'http://localhost:3001';

async function apiFetch<T>(url: string, opts: RequestInit = {}): Promise<T> {
  const res = await fetch(url, {
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    ...opts
  });
  if (!res.ok) {
    throw new Error(`${res.status} ${res.statusText}`);
  }
  return res.json();
}

export interface UserResponse {
  user: any;
  isAdmin: boolean;
}

export function getUser(): Promise<UserResponse> {
  return apiFetch(`${AUTH_BASE}/me`);
}

export interface Report {
  id:         number;
  fullness:   number;
  time_stamp: string;
}

export interface Room {
  id:            number;
  external_id:   number | null;
  library_id:    number;
  name:          string;
  floor:         number;
  is_bookable:   boolean | null;
  availability:  number | null;
  reports:       Report[];
}

export interface Library {
  id:                   number;
  name:                 string;
  hours:                string;
  location:             string;
  general_availability: number | null;
  bookable_rooms:       Room[];
  general_rooms:        Room[];
  library_reports:      Report[];
}

/**
 * Fetch all libraries (with nested rooms & reports)
 */
export function getLibraries(): Promise<Library[]> {
  return apiFetch<{ libraries: Library[] }>(`${API_BASE}/libraries/`)
    .then(data => data.libraries);
}

/**
 * Convenience: all bookable rooms across all libraries
 */
export function getBookableRooms(): Promise<Room[]> {
  return getLibraries().then(libs =>
    libs.flatMap(lib => lib.bookable_rooms)
  );
}

/**
 * Convenience: all general rooms across all libraries
 */
export function getGeneralRooms(): Promise<Room[]> {
  return getLibraries().then(libs =>
    libs.flatMap(lib => lib.general_rooms)
  );
}

/**
 * Convenience: all reports (library + room) flattened out
 */
export function getAllReports(): Promise<(Report & { type: 'Library' | 'Room'; location: string })[]> {
  return getLibraries().then(libs => {
    const out: (Report & { type: 'Library' | 'Room'; location: string })[] = [];

    // library reports
    libs.forEach(lib => {
      lib.library_reports.forEach(r => {
        out.push({ ...r, type: 'Library', location: lib.name });
      });
    });

    // room reports
    libs.forEach(lib => {
      [...lib.bookable_rooms, ...lib.general_rooms].forEach(room => {
        room.reports.forEach(r => {
          out.push({ ...r, type: 'Room', location: room.name });
        });
      });
    });

    return out.sort(
      (a, b) => new Date(b.time_stamp).getTime() - new Date(a.time_stamp).getTime()
    );
  });
}
