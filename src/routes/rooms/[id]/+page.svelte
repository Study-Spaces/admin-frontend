<!-- src/routes/rooms/[id]/+page.svelte -->
<script lang="ts">
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';

  const API_BASE = import.meta.env.VITE_API_BASE ?? 'https://studyspaces-api.aramirez.dev/api';

  interface RoomDetail {
    id: number;
    name: string;
    library_id: number;
    floor: number;
    is_bookable: boolean | null;
    availability: number | null;
  }

  let room: RoomDetail | null = null;
  let libraryName = '';
  let loading = true;

  let roomId: string;
  $: roomId = $page.params.id;

  async function loadRoom() {
    loading = true;
    try {
      const res = await fetch(`${API_BASE}/rooms/${roomId}/`);
      if (!res.ok) throw new Error(`Failed to fetch room (${res.status})`);
      room = await res.json();

      const libRes = await fetch(`${API_BASE}/libraries/${room.library_id}/`);
      if (libRes.ok) {
        const lib = await libRes.json();
        libraryName = lib.name;
      }
    } catch (err) {
      console.error('Error loading room:', err);
    } finally {
      loading = false;
    }
  }

  function mapAvailability(level: number): number {
    if (level <= 0) return 0;
    if (level <= 20) return 1;
    if (level <= 40) return 2;
    if (level <= 60) return 3;
    if (level <= 80) return 4;
    return 5;
  }

  function editRoom() {
    if (room) goto(`/rooms/${room.id}/edit`);
  }

  async function deleteRoom() {
    if (!room) return;
    if (!confirm('Are you sure you want to delete this room?')) return;

    try {
      const res = await fetch(`${API_BASE}/rooms/${room.id}/`, {
        method: 'DELETE'
      });
      if (res.ok) {
        alert('Room deleted');
        goto('/rooms');
      } else {
        alert('Failed to delete room');
      }
    } catch (err) {
      console.error('Error deleting room:', err);
      alert('Error deleting room');
    }
  }

  onMount(loadRoom);
</script>

{#if loading}
  <p class="px-6 py-8 text-[#2F2F2F]">Loading room…</p>
{:else if room}
  <section class="px-6 py-8 max-w-2xl mx-auto text-[#2F2F2F]">
    <h1 class="text-2xl font-semibold mb-6">{room.name}</h1>

    <p class="text-sm mb-2">Library: {libraryName}</p>
    <p class="text-sm mb-2">Floor: {room.floor}</p>
    <p class="text-sm mb-4">
      Current Availability:
      {#if room.availability !== null}
        {mapAvailability(room.availability)}
      {:else}
        Unknown
      {/if}
    </p>

    <div class="flex gap-4 mt-6">
      <button
        on:click={editRoom}
        class="bg-[#27a844] text-white px-5 py-2 rounded hover:opacity-90 text-sm"
      >
        Edit Room
      </button>
      <button
        on:click={deleteRoom}
        class="bg-[#ff4949] text-white px-5 py-2 rounded hover:opacity-90 text-sm"
      >
        Delete Room
      </button>
    </div>
  </section>
{:else}
  <p class="px-6 py-8 text-[#2F2F2F]">Room not found.</p>
{/if}