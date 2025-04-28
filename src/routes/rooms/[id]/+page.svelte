<script lang="ts">
    import { onMount } from 'svelte';
    import { page } from '$app/stores';
    import { goto } from '$app/navigation';
  
    let room: any = null;
    let loading = true;
    let libraryName = '';
  
    $: roomId = $page.params.id;
  
    async function loadRoom() {
      try {
        const res = await fetch(`http://localhost:8000/api/rooms/${roomId}/`);
        if (res.ok) {
          const data = await res.json();
          room = data;
  
          // Fetch the library name
          const libRes = await fetch(`http://localhost:8000/api/libraries/${room.library_id}/`);
          if (libRes.ok) {
            const libData = await libRes.json();
            libraryName = libData.name;
          }
        } else {
          console.error('Failed to fetch room');
        }
      } catch (err) {
        console.error('Error fetching room:', err);
      } finally {
        loading = false;
      }
    }
  
    function mapAvailability(fullness: number): number {
      if (fullness === -1) return 0; // no info
      if (fullness <= 20) return 1;
      if (fullness <= 40) return 2;
      if (fullness <= 60) return 3;
      if (fullness <= 80) return 4;
      return 5;
    }
  
    function editRoom() {
      goto(`/rooms/${room.id}/edit`);
    }
  
    async function deleteRoom() {
      if (!confirm('Are you sure you want to delete this room?')) return;
  
      try {
        const res = await fetch(`http://localhost:8000/api/rooms/${room.id}/`, {
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
      }
    }
  
    onMount(() => {
      loadRoom();
    });
  </script>
  
  {#if loading}
    <p class="px-6 py-8">Loading room...</p>
  {:else if room}
    <section class="px-6 py-8 max-w-2xl mx-auto">
      <h1 class="text-2xl font-semibold mb-6">{room.name}</h1>
  
      <p class="text-sm mb-2">Library: {libraryName}</p>
      <p class="text-sm mb-2">Floor: {room.floor}</p>
      <p class="text-sm mb-4">
        Current Availability: {room.room_availability !== null ? mapAvailability(room.room_availability) : 'Unknown'}
      </p>
  
      <div class="flex gap-4 mt-6">
        <button on:click={editRoom} class="bg-[#27a844] text-white px-5 py-2 rounded hover:opacity-90 text-sm">
          Edit Room
        </button>
        <button on:click={deleteRoom} class="bg-[#ff4949] text-white px-5 py-2 rounded hover:opacity-90 text-sm">
          Delete Room
        </button>
      </div>
    </section>
  {:else}
    <p class="px-6 py-8">Room not found.</p>
  {/if}
  