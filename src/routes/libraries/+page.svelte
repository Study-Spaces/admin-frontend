<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import type { Library } from '$lib/utils/api';
  import { getLibraries } from '$lib/utils/api';

  const API_BASE = import.meta.env.VITE_API_BASE ?? 'http://localhost:8000/api';

  let libraries: Library[] = [];
  let loading = true;

  async function loadLibraries() {
    loading = true;
    try {
      libraries = await getLibraries();
    } catch (err) {
      console.error('Error loading libraries:', err);
    } finally {
      loading = false;
    }
  }

  function addLibrary() {
    goto('/libraries/add');
  }

  function viewLibrary(id: number) {
    goto(`/libraries/${id}`);
  }

  function editLibrary(id: number) {
    goto(`/libraries/${id}/edit`);
  }

  async function deleteLibrary(id: number) {
    if (!confirm('Are you sure you want to delete this library? This action cannot be undone.')) {
      return;
    }
    try {
      const res = await fetch(`${API_BASE}/libraries/${id}/`, {
        method: 'DELETE',
        credentials: 'include'
      });
      if (res.ok) {
        libraries = libraries.filter(lib => lib.id !== id);
      } else {
        console.error('Failed to delete library:', res.status, res.statusText);
      }
    } catch (err) {
      console.error('Error deleting library:', err);
    }
  }

  function formatFullness(avail: number | null): string {
    if (avail === null || isNaN(avail)) return 'Unknown';
    const pct = Math.round((avail / 5) * 100);
    return `${pct}%`;
  }

  onMount(loadLibraries);
</script>

{#if loading}
  <p class="px-6 py-8 text-[#2F2F2F]">Loading libraries…</p>
{:else}
  <section class="px-6 py-8">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-xl font-semibold text-[#2F2F2F]">Libraries</h1>
      <button
        on:click={addLibrary}
        class="bg-[#C19C6F] text-white px-4 py-2 rounded text-sm hover:opacity-90"
      >
        Add Library
      </button>
    </div>

    <table class="w-full border border-[#E1E1E1] text-sm text-[#2F2F2F]">
      <thead class="bg-[#F9F6F0] text-left">
        <tr>
          <th class="p-3 font-medium">Name</th>
          <th class="p-3 font-medium">Location</th>
          <th class="p-3 font-medium">Hours</th>
          <th class="p-3 font-medium">Fullness (%)</th>
          <th class="p-3 font-medium">Actions</th>
        </tr>
      </thead>
      <tbody>
        {#each libraries as lib}
          <tr class="border-t border-[#E1E1E1] hover:bg-[#FAFAFC]">
            <td class="p-3">{lib.name}</td>
            <td class="p-3">{lib.location}</td>
            <td class="p-3">{lib.hours}</td>
            <td class="p-3">{formatFullness(lib.general_availability)}</td>
            <td class="p-3 flex gap-2">
              <button
                on:click={() => viewLibrary(lib.id)}
                class="text-[#C19C6F] hover:underline text-sm"
              >
                View
              </button>
              <button
                on:click={() => editLibrary(lib.id)}
                class="text-[#27a844] hover:underline text-sm"
              >
                Edit
              </button>
              <button
                on:click={() => deleteLibrary(lib.id)}
                class="text-[#ff4949] hover:underline text-sm"
              >
                Delete
              </button>
            </td>
          </tr>
        {/each}
      </tbody>
    </table>
  </section>
{/if}
