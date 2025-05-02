<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';

  import type { Library, Room } from '../lib/utils/api';
  import {
    getUser,
    getLibraries,
    getBookableRooms,
    getGeneralRooms,
    getAllReports
  } from '../lib/utils/api';

  let user: Record<string, any> | null = null;
  let isAdmin = false;
  let loading = true;

  let libraries: Library[] = [];
  let rooms: Room[] = [];
  let reports: {
    id: number;
    fullness: number;
    time_stamp: string;
    type: 'Library' | 'Room';
    location: string;
  }[] = [];

  let activity: { text: string; time: string }[] = [];

  async function loadData() {
    libraries = await getLibraries();
    rooms = [
      ...await getBookableRooms(),
      ...await getGeneralRooms()
    ];

    reports = await getAllReports();

    loading = false;
  }

  onMount(async () => {
    try {
      const me = await getUser();
      user = me.user;
      isAdmin = me.isAdmin;
    } catch {
      user = null;
    }
    await loadData();
  });

  function viewRoom(id: number) {
    goto(`/rooms/${id}`);
  }

  function editRoom(id: number) {
    goto(`/rooms/${id}/edit`);
  }

  async function deleteRoom(id: number) {
    if (!confirm('Are you sure you want to delete this room?')) return;

    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE}/rooms/${id}/`, {
        method: 'DELETE'
      });
      if (res.ok) {
        rooms = rooms.filter(r => r.id !== id);
      } else {
        alert('Failed to delete room.');
      }
    } catch (err) {
      console.error('Error deleting room:', err);
    }
  }

  function getLibraryName(libraryId: number) {
    return libraries.find(l => l.id === libraryId)?.name ?? 'Unknown';
  }

  function mapAvailability(room: Room): string {
    if (room.is_bookable !== null) {
      return room.is_bookable
        ? 'Occupied'
        : 'Free';
    }
    return room.availability !== null
      ? Math.round(room.availability).toString()
      : 'N/A';
  }
</script>

{#if loading}
  <p class="text-center py-20">Loading dashboard...</p>
{:else}
  <section class="px-6 py-10 max-w-7xl mx-auto text-[#404936]">
    <div class="mb-8 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
      <div>
        <h1 class="text-2xl font-semibold">
          Welcome back, {user?.['urn:oid:2.5.4.3']}!
        </h1>
        <p class="text-sm text-[#666]">Admin Overview</p>
      </div>
      <div class="flex gap-4">
        <div class="bg-white border border-[#E1E1E1] px-4 py-2 rounded shadow-sm text-center">
          <p class="text-xs text-[#777]">Libraries</p>
          <p class="font-semibold">{libraries.length}</p>
        </div>
        <div class="bg-white border border-[#E1E1E1] px-4 py-2 rounded shadow-sm text-center">
          <p class="text-xs text-[#777]">Rooms</p>
          <p class="font-semibold">{rooms.length}</p>
        </div>
        <div class="bg-white border border-[#E1E1E1] px-4 py-2 rounded shadow-sm text-center">
          <p class="text-xs text-[#777]">Reports</p>
          <p class="font-semibold">{reports.length}</p>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
      <!-- Libraries -->
      <div class="border border-[#E1E1E1] rounded-lg bg-white p-5 shadow-sm">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-lg font-semibold">Libraries</h2>
          <a href="/libraries" class="text-sm text-[#C19C6F] hover:underline">View All</a>
        </div>
        <ul class="text-sm space-y-2">
          {#each libraries.slice(0, 3) as lib}
            <li>
              <a href={`/libraries/${lib.id}`} class="text-[#404936] hover:text-[#C19C6F]">
                {lib.name}
              </a>
            </li>
          {/each}
        </ul>
      </div>

      <!-- Rooms -->
      <div class="border border-[#E1E1E1] rounded-lg bg-white p-5 shadow-sm">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-lg font-semibold">Rooms</h2>
          <a href="/rooms" class="text-sm text-[#C19C6F] hover:underline">View All</a>
        </div>
        <table class="w-full text-sm">
          <thead>
            <tr>
              <th class="p-2">Library</th>
              <th class="p-2">Name</th>
              <th class="p-2">Availability</th>
            </tr>
          </thead>
          <tbody>
            {#each rooms.slice(0, 3) as room}
              <tr>
                <td class="p-2">{getLibraryName(room.library_id)}</td>
                <td class="p-2">{room.name}</td>
                <td class="p-2">{mapAvailability(room)}</td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>

      <!-- Recent Reports -->
      <div class="border border-[#E1E1E1] rounded-lg bg-white p-5 shadow-sm md:col-span-2">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-lg font-semibold">Recent Reports</h2>
          <a href="/reports" class="text-sm text-[#C19C6F] hover:underline">Manage Reports</a>
        </div>
        <ul class="text-sm space-y-2">
          {#each reports.slice(0, 5) as r}
            <li class="flex justify-between">
              <span>{r.type}: {r.location} (Fullness {r.fullness})</span>
              <span class="text-xs text-[#888]">
                {new Date(r.time_stamp).toLocaleString()}
              </span>
            </li>
          {/each}
        </ul>
      </div>
    </div>
  </section>
{/if}
