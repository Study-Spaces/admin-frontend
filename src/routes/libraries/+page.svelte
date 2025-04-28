<script lang="ts">
  import { onMount } from 'svelte';

  let libraries: { id: number; name: string; hours: string; location: string; general_availability: number }[] = [];
  let loading = true;

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
      loading = false;
    }
  }

  function addLibrary() {
    window.location.href = `/libraries/add`;
  }

  function viewLibrary(id: number) {
    window.location.href = `/libraries/${id}`;
  }

  function editLibrary(id: number) {
    window.location.href = `/libraries/${id}?edit=true`;
  }

  async function deleteLibrary(id: number) {
    if (confirm('Are you sure you want to delete this library? This action cannot be undone.')) {
      try {
        const res = await fetch(`http://localhost:8000/api/libraries/${id}/`, {
          method: 'DELETE',
        });
        if (res.ok) {
          libraries = libraries.filter((lib) => lib.id !== id);
        } else {
          console.error('Failed to delete library');
        }
      } catch (err) {
        console.error('Error deleting library:', err);
      }
    }
  }

  function mapFullnessToRating(fullness: number): number {
    if (fullness <= 20) return 1;
    if (fullness <= 40) return 2;
    if (fullness <= 60) return 3;
    if (fullness <= 80) return 4;
    return 5;
  }

  onMount(() => {
    loadLibraries();
  });
</script>

{#if loading}
  <p class="px-6 py-8">Loading libraries...</p>
{:else}
  <section class="px-6 py-8">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-xl font-semibold text-[#2F2F2F]">Libraries</h1>
      <button
        on:click={addLibrary}
        class="bg-[#3396ff] text-white px-4 py-2 rounded text-sm hover:opacity-90"
      >
        Add Library
      </button>
    </div>

    <table class="w-full border border-[#E1E1E1] text-sm text-[#2F2F2F]">
      <thead class="bg-[#F0F4F8] text-left">
        <tr>
          <th class="p-3 font-medium">Name</th>
          <th class="p-3 font-medium">Location</th>
          <th class="p-3 font-medium">Hours</th>
          <th class="p-3 font-medium">Fullness (1–5)</th>
          <th class="p-3 font-medium">Actions</th>
        </tr>
      </thead>
      <tbody>
        {#each libraries as library}
          <tr class="border-t border-[#E1E1E1] hover:bg-[#FAFAFC]">
            <td class="p-3">{library.name}</td>
            <td class="p-3">{library.location}</td>
            <td class="p-3">{library.hours}</td>
            <td class="p-3">
              {library.general_availability !== null
                ? mapFullnessToRating(library.general_availability)
                : 'Unknown'}
            </td>
            <td class="p-3 flex flex-wrap gap-2">
              <button on:click={() => viewLibrary(library.id)} class="text-[#3396ff] hover:underline">
                View
              </button>
              <button on:click={() => editLibrary(library.id)} class="text-[#3396ff] hover:underline">
                Edit
              </button>
              <button on:click={() => deleteLibrary(library.id)} class="text-red-500 hover:underline">
                Delete
              </button>
            </td>
          </tr>
        {/each}
      </tbody>
    </table>
  </section>
{/if}