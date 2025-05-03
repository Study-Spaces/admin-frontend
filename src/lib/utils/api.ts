// src/lib/utils/api.ts

const API_BASE =
  import.meta.env.VITE_API_BASE ?? 'https://studyspaces-api.aramirez.dev/api';

async function apiFetch<T>(url: string, opts: RequestInit = {}): Promise<T> {
  const res = await fetch(url, {
    credentials: 'omit',
    ...opts,
    headers: {
      'Content-Type': 'application/json',
      ...(opts.headers || {})
    }
  });

  if (!res.ok) {
    throw new Error(`${res.status} ${res.statusText}`);
  }

  return res.json();
}

export interface Report {
  id: number;
  fullness: number;
  time_stamp: string;
}

export interface Room {
  id: number;
  external_id: number | null;
  library_id: number;
  name: string;
  floor: number;
  is_bookable: boolean | null;
  availability: number | null;
  reports: Report[];
}

export interface Library {
  id: number;
  name: string;
  hours: string;
  location: string;
  general_availability: number | null;
  bookable_rooms: Room[];
  general_rooms: Room[];
  library_reports: Report[];
}

export function getLibraries(): Promise<Library[]> {
  return apiFetch<{ libraries: Library[] }>(`${API_BASE}/libraries/`)
    .then((data) => data.libraries);
}

export function getBookableRooms(): Promise<Room[]> {
  return getLibraries().then((libs) =>
    libs.flatMap((lib) => lib.bookable_rooms)
  );
}

export function getGeneralRooms(): Promise<Room[]> {
  return getLibraries().then((libs) =>
    libs.flatMap((lib) => lib.general_rooms)
  );
}

export function getAllReports(): Promise<
  (Report & { type: 'Library' | 'Room'; location: string })[]
> {
  return getLibraries().then((libs) => {
    const out: (Report & {
      type: 'Library' | 'Room';
      location: string;
    })[] = [];

    libs.forEach((lib) => {
      lib.library_reports.forEach((r) => {
        out.push({ ...r, type: 'Library', location: lib.name });
      });

      [...lib.bookable_rooms, ...lib.general_rooms].forEach((room) => {
        room.reports.forEach((r) => {
          out.push({ ...r, type: 'Room', location: room.name });
        });
      });
    });

    return out.sort(
      (a, b) =>
        new Date(b.time_stamp).getTime() - new Date(a.time_stamp).getTime()
    );
  });
}
