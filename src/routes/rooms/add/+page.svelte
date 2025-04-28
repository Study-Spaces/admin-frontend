<script lang="ts">
    import { onMount } from 'svelte';
    import { goto } from '$app/navigation';
  
    let form = {
      name: '',
      floor: '',
      library_id: ''
    };
  
    let libraries: { id: number; name: string }[] = [];
    let loadingLibraries = true;
  
    async function loadLibraries() {
      try {
        const res = await fetch('http://localhost:8000/api/libraries/');
        if (res.ok) {
          const data = await res.json();
          libraries = data.libraries || [];
        } else {
          console.error('Failed to fetch libraries');
        }
      } catch (err) {
        console.error('Error fetching libraries:', err);
      } finally {
        loadingLibraries = false;
      }
    }
  
    async function submitRoom() {
      if (!form.name || !form.floor || !form.library_id) {
        alert('Please fill all fields');
        return;
      }
  
      try {
        const res = await fetch(`http://localhost:8000/api/libraries/${form.library_id}/rooms/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            name: form.name,
            floor: parseInt(form.floor)
          })
        });
  
        if (res.ok) {
          alert('Room created successfully.');
          goto('/rooms');
        } else {
          alert('Failed to create room.');
        }
      } catch (err) {
        console.error('Error submitting room:', err);
        alert('Error submitting room.');
      }
    }
  
    onMount(() => {
      loadLibraries();
    });
  </script>
  
  <section class="max-w-2xl mx-auto px-6 py-8 text-[#2F2F2F]">
    <h1 class="text-2xl font-semibold mb-6">Add New Room</h1>
  
    {#if loadingLibraries}
      <p>Loading libraries...</p>
    {:else}
      <div class="grid gap-4 mb-6">
        <input
          class="border border-[#E1E1E1] px-4 py-2 rounded"
          placeholder="Room Name"
          bind:value={form.name}
        />
  
        <input
          type="number"
          min="0"
          class="border border-[#E1E1E1] px-4 py-2 rounded"
          placeholder="Floor (number)"
          bind:value={form.floor}
        />
  
        <select
          class="border border-[#E1E1E1] px-4 py-2 rounded"
          bind:value={form.library_id}
        >
          <option value="" disabled selected>Select Library</option>
          {#each libraries as lib}
            <option value={lib.id}>{lib.name}</option>
          {/each}
        </select>
      </div>
  
      <button
        on:click={submitRoom}
        class="bg-[#3396ff] text-white px-6 py-2 rounded hover:opacity-90"
      >
        Submit
      </button>
    {/if}
  </section>
  