<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { getLibraries } from '$lib/utils/api';

  const API_BASE = import.meta.env.VITE_API_BASE ?? 'https://studyspaces-api.aramirez.dev/api';

  interface Library {
    id: number;
    name: string;
  }

  let form = {
    name: '',
    floor: '',
    library_id: ''
  };

  let nameError = '';
  let floorError = '';
  let libraryError = '';
  let submitError = '';

  let libraries: Library[] = [];
  let loadingLibraries = true;

  async function loadLibraries() {
    try {
      libraries = await getLibraries();
    } catch (err) {
      console.error('Failed to fetch libraries:', err);
      submitError = 'Could not load library list.';
    } finally {
      loadingLibraries = false;
    }
  }

  function validate() {
    nameError = form.name.trim() ? '' : 'Name is required.';
    const f = parseInt(form.floor, 10);
    floorError = !form.floor
      ? 'Should be greater than 0.'
      : isNaN(f) || f < 1
      ? 'Floor must be an integer > 0.'
      : '';
    libraryError = form.library_id ? '' : 'Library selection is required.';
    return !(nameError || floorError || libraryError);
  }

  async function submitRoom() {
    submitError = '';
    if (!validate()) return;

    const payload = {
      name: form.name.trim(),
      floor: parseInt(form.floor, 10)
    };

    try {
      const res = await fetch(
        `${API_BASE}/libraries/${form.library_id}/rooms/`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        }
      );

      if (res.ok) {
        goto('/rooms');
      } else {
        const err = await res.json().catch(() => ({}));
        console.error('Create failed:', err);
        submitError = err.detail || 'Failed to create room.';
      }
    } catch (err) {
      console.error('Error submitting room:', err);
      submitError = 'Error submitting room.';
    }
  }

  onMount(loadLibraries);
</script>

<section class="max-w-2xl mx-auto px-6 py-8 text-[#2F2F2F]">
  <h1 class="text-2xl font-semibold mb-6">Add New Room</h1>

  {#if loadingLibraries}
    <p>Loading libraries…</p>
  {:else}
    <div class="grid gap-4 mb-4">
      <div>
        <input
          class="border border-[#E1E1E1] px-4 py-2 rounded w-full"
          placeholder="Room Name"
          bind:value={form.name}
          on:input={() => (nameError = '')}
        />
        {#if nameError}
          <p class="text-red-500 text-sm mt-1">{nameError}</p>
        {/if}
      </div>

      <div>
        <input
          type="number"
          min="1"
          step="1"
          inputmode="numeric"
          pattern="\d+"
          class="border border-[#E1E1E1] px-4 py-2 rounded w-full"
          placeholder="Floor (number)"
          bind:value={form.floor}
          on:input={() => (floorError = '')}
        />
        {#if floorError}
          <p class="text-red-500 text-sm mt-1">{floorError}</p>
        {/if}
      </div>

      <div>
        <select
          class="border border-[#E1E1E1] px-4 py-2 rounded w-full"
          bind:value={form.library_id}
          on:change={() => (libraryError = '')}
        >
          <option value="" disabled>Select Library</option>
          {#each libraries as lib}
            <option value={lib.id}>{lib.name}</option>
          {/each}
        </select>
        {#if libraryError}
          <p class="text-red-500 text-sm mt-1">{libraryError}</p>
        {/if}
      </div>
    </div>

    {#if submitError}
      <p class="text-red-600 mb-4">{submitError}</p>
    {/if}

    <button
      on:click={submitRoom}
      class="bg-[#C19C6F] text-white px-6 py-2 rounded hover:opacity-90"
    >
      Submit
    </button>
  {/if}
</section>
