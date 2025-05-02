<!-- src/routes/rooms/[id]/edit/+page.svelte -->
<script lang="ts">
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';

  const API_BASE = import.meta.env.VITE_API_BASE ?? 'http://localhost:8000/api';

  interface RoomDetail {
    id:          number;
    name:        string;
    library_id:  number;
    floor:       number;
    is_bookable: boolean | null;
    availability: number | null;
  }

  let room: RoomDetail | null = null;
  let libraryName = '';
  let loading = true;

  let form = {
    name: '',
    floor: ''
  };

  $: roomId = $page.params.id;

  async function loadRoom() {
    loading = true;
    try {
      const res = await fetch(`${API_BASE}/rooms/${roomId}/`);
      if (!res.ok) throw new Error('Failed to fetch room');
      room = await res.json();

      form.name = room.name;
      form.floor = room.floor.toString();

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

  async function submitEdit() {
    if (!form.name || form.floor === '') {
      alert('Please fill in both name and floor');
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/rooms/${roomId}/`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          floor: parseInt(form.floor, 10)
        })
      });
      if (res.ok) {
        alert('Room updated successfully');
        goto(`/rooms/${roomId}`);
      } else {
        alert('Failed to update room');
      }
    } catch (err) {
      console.error('Error updating room:', err);
      alert('Error updating room');
    }
  }

  onMount(loadRoom);
</script>

{#if loading}
  <p class="px-6 py-8 text-[#2F2F2F]">Loading room…</p>
{:else if room}
  <section class="px-6 py-8 max-w-2xl mx-auto text-[#2F2F2F]">
    <h1 class="text-2xl font-semibold mb-6">Edit Room: {room.name}</h1>
    <p class="text-sm mb-4">Library: {libraryName}</p>

    <div class="grid gap-4 mb-6">
      <input
        type="text"
        class="border border-[#E1E1E1] px-4 py-2 rounded"
        placeholder="Room Name"
        bind:value={form.name}
      />
      <input
        type="number"
        min="0"
        class="border border-[#E1E1E1] px-4 py-2 rounded"
        placeholder="Floor"
        bind:value={form.floor}
      />
    </div>

    <div class="flex gap-4">
      <button
        on:click={submitEdit}
        class="bg-[#C19C6F] text-white px-6 py-2 rounded hover:opacity-90 text-sm"
      >
        Save Changes
      </button>
      <button
        on:click={() => goto(`/rooms/${roomId}`)}
        class="border border-[#E1E1E1] px-6 py-2 rounded text-sm"
      >
        Cancel
      </button>
    </div>
  </section>
{:else}
  <p class="px-6 py-8 text-[#2F2F2F]">Room not found.</p>
{/if}
