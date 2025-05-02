<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import type { Library, Room } from '../../lib/utils/api';
  import { getLibraries } from '../../lib/utils/api';

  type AdminRoom = {
    id: number;
    name: string;
    library_id: number;
    source: 'apiRoom';
  } & Partial<Pick<Room, 'is_bookable' | 'availability'>>;

  let libraries: Library[] = [];
  let rooms: AdminRoom[]  = [];
  let loading = true;

  async function loadData() {
    try {
      libraries = await getLibraries();

      rooms = libraries.flatMap(lib => {
        const bookable = (lib.bookable_rooms || []).map(r => ({
          ...r,
          library_id: lib.id,
          source: 'apiRoom'
        }));
        const general = (lib.general_rooms || []).map(r => ({
          ...r,
          library_id: lib.id,
          source: 'apiRoom'
        }));
        return [...bookable, ...general];
      });
    } catch (err) {
      console.error('Error loading data:', err);
    } finally {
      loading = false;
    }
  }

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
        method: 'DELETE',
        credentials: 'include'
      });
      if (res.ok) {
        rooms = rooms.filter(r => r.id !== id);
      } else {
        alert('Failed to delete room.');
      }
    } catch (err) {
      console.error(err);
    }
  }

  function getLibraryName(libId: number) {
    return libraries.find(l => l.id === libId)?.name ?? 'Unknown';
  }

  function mapAvailability(r: AdminRoom): string {
    if (typeof r.is_bookable === 'boolean') {
      return r.is_bookable ? 'Occupied' : 'Free';
    }

    if (r.availability === null || r.availability === undefined) {
      return 'Closed / No reports';
    }

    if (typeof r.availability === 'number') {
      const pct = Math.round((r.availability / 5) * 100);
      return `${pct}% full`;
    }

    return 'N/A';
  }

  onMount(loadData);
</script>

{#if loading}
  <p class="px-6 py-8 text-center">Loading rooms…</p>
{:else}
  <section class="px-6 py-8">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-xl font-semibold text-[#404936]">All Rooms</h1>
      <button
        on:click={() => goto('/rooms/add')}
        class="bg-[#C19C6F] text-white px-4 py-2 rounded text-sm hover:opacity-90"
      >
        Add Room
      </button>
    </div>

    <table class="w-full border border-[#E1E1E1] text-sm text-[#404936]">
      <thead class="bg-[#F9F6F0] text-left">
        <tr>
          <th class="p-3 font-medium">Library</th>
          <th class="p-3 font-medium">Room Name</th>
          <th class="p-3 font-medium">Current Availability</th>
          <th class="p-3 font-medium">Actions</th>
        </tr>
      </thead>
      <tbody>
        {#each rooms as room}
          <tr class="border-t border-[#E1E1E1] hover:bg-[#FAFAFC]">
            <td class="p-3">{getLibraryName(room.library_id)}</td>
            <td class="p-3">{room.name}</td>
            <td class="p-3">{mapAvailability(room)}</td>
            <td class="p-3 flex gap-2">
              <button on:click={() => viewRoom(room.id)} class="text-[#C19C6F] hover:underline text-sm">
                View
              </button>
              <button on:click={() => editRoom(room.id)} class="text-[#27a844] hover:underline text-sm">
                Edit
              </button>
              <button on:click={() => deleteRoom(room.id)} class="text-[#ff4949] hover:underline text-sm">
                Delete
              </button>
            </td>
          </tr>
        {/each}
      </tbody>
    </table>
  </section>
{/if}
