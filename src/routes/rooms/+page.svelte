<script lang="ts">
    import { onMount } from 'svelte';
    import { goto } from '$app/navigation';
  
    let rooms: { id: number; name: string; floor: number; library_id: number; room_availability: number }[] = [];
    let libraries: { id: number; name: string }[] = [];
    let loading = true;
  
    async function loadData() {
      try {
        const libsRes = await fetch('http://localhost:8000/api/libraries/');
        const roomsRes = await fetch('http://localhost:8000/api/rooms/');
  
        if (libsRes.ok && roomsRes.ok) {
          const libsData = await libsRes.json();
          const roomsData = await roomsRes.json();
          libraries = libsData.libraries || [];
          rooms = roomsData.Rooms || [];
        } else {
          console.error('Failed to fetch libraries or rooms');
        }
      } catch (err) {
        console.error('Error fetching data:', err);
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
        const res = await fetch(`http://localhost:8000/api/rooms/${id}/`, {
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
      const lib = libraries.find(l => l.id === libraryId);
      return lib ? lib.name : 'Unknown Library';
    }
  
    function mapAvailability(fullness: number): number {
      if (fullness === -1) return 0; // if no info
      if (fullness <= 20) return 1;
      if (fullness <= 40) return 2;
      if (fullness <= 60) return 3;
      if (fullness <= 80) return 4;
      return 5;
    }
  
    onMount(() => {
      loadData();
    });
  </script>
  
  {#if loading}
    <p class="px-6 py-8">Loading rooms...</p>
  {:else}
    <section class="px-6 py-8">
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-xl font-semibold text-[#2F2F2F]">All Rooms</h1>
        <button
          on:click={() => goto('/rooms/add')}
          class="bg-[#3396ff] text-white px-4 py-2 rounded text-sm hover:opacity-90"
        >
          Add Room
        </button>
      </div>
  
      <table class="w-full border border-[#E1E1E1] text-sm text-[#2F2F2F]">
        <thead class="bg-[#F0F4F8] text-left">
          <tr>
            <th class="p-3 font-medium">Library</th>
            <th class="p-3 font-medium">Room Name</th>
            <th class="p-3 font-medium">Floor</th>
            <th class="p-3 font-medium">Current Availability (1–5)</th>
            <th class="p-3 font-medium">Actions</th>
          </tr>
        </thead>
        <tbody>
          {#each rooms as room}
            <tr class="border-t border-[#E1E1E1] hover:bg-[#FAFAFC]">
              <td class="p-3">{getLibraryName(room.library_id)}</td>
              <td class="p-3">{room.name}</td>
              <td class="p-3">Floor {room.floor}</td>
              <td class="p-3">
                {room.room_availability !== null ? mapAvailability(room.room_availability) : 'Unknown'}
              </td>
              <td class="p-3 flex gap-2">
                <button on:click={() => viewRoom(room.id)} class="text-[#3396ff] hover:underline">
                  View
                </button>
                <button on:click={() => editRoom(room.id)} class="text-[#27a844] hover:underline">
                  Edit
                </button>
                <button on:click={() => deleteRoom(room.id)} class="text-[#ff4949] hover:underline">
                  Delete
                </button>
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    </section>
  {/if}  