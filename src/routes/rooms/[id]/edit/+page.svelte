<script lang="ts">
    import { onMount } from 'svelte';
    import { page } from '$app/stores';
    import { goto } from '$app/navigation';
  
    let room: any = null;
    let loading = true;
    let libraryName = '';
  
    let form = {
      name: '',
      floor: ''
    };
  
    $: roomId = $page.params.id;
  
    async function loadRoom() {
      try {
        const res = await fetch(`http://localhost:8000/api/rooms/${roomId}/`);
        if (res.ok) {
          const data = await res.json();
          room = data;
          form.name = room.name;
          form.floor = room.floor.toString();
  
          // Get library name
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
  
    async function submitEdit() {
      if (!form.name || !form.floor) {
        alert('Please fill all fields');
        return;
      }
  
      try {
        const res = await fetch(`http://localhost:8000/api/rooms/${roomId}/`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: form.name,
            floor: parseInt(form.floor)
          })
        });
  
        if (res.ok) {
          alert('Room updated');
          goto(`/rooms/${roomId}`);
        } else {
          alert('Failed to update room');
        }
      } catch (err) {
        console.error('Error updating room:', err);
      }
    }
  
    onMount(() => {
      loadRoom();
    });
  </script>
  
  {#if loading}
    <p class="px-6 py-8">Loading room...</p>
  {:else if room}
    <section class="px-6 py-8 max-w-2xl mx-auto text-[#2F2F2F]">
      <h1 class="text-2xl font-semibold mb-6">Edit Room: {room.name}</h1>
  
      <p class="text-sm mb-4">Library: {libraryName}</p>
  
      <div class="grid gap-4 mb-6">
        <input
          class="border border-[#E1E1E1] px-4 py-2 rounded"
          bind:value={form.name}
          placeholder="Room Name"
        />
  
        <input
          class="border border-[#E1E1E1] px-4 py-2 rounded"
          bind:value={form.floor}
          type="number"
          min="0"
          placeholder="Floor"
        />
      </div>
  
      <div class="flex gap-4">
        <button
          on:click={submitEdit}
          class="bg-[#3396ff] text-white px-6 py-2 rounded hover:opacity-90 text-sm"
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
    <p class="px-6 py-8">Room not found.</p>
  {/if}
  