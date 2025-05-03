<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
  
	const API_BASE = import.meta.env.VITE_API_BASE ?? 'https://studyspaces-api.aramirez.dev/api';
  
	let library: {
	  id: number;
	  name: string;
	  hours: string;
	  location: string;
	  general_availability: number | null;
	  bookable_rooms: any[];
	  general_rooms: any[];
	} | null = null;
  
	let loading = true;
	let saving = false;
	let editMode = false;
	let error: string | null = null;
  
	$: libraryId = $page.params.id;
  
	async function loadLibrary() {
	  loading = true;
	  error = null;
	  try {
		const res = await fetch(`${API_BASE}/libraries/${libraryId}/`, {
		  credentials: 'include'
		});
		if (!res.ok) throw new Error(`${res.status}`);
		library = await res.json();
	  } catch (e) {
		console.error(e);
		error = 'Failed to load library.';
	  } finally {
		loading = false;
	  }
	}
  
	async function saveLibrary() {
	  if (!library) return;
	  saving = true;
	  error = null;
	  try {
		const res = await fetch(`${API_BASE}/libraries/${libraryId}/`, {
		  method: 'PUT',
		  credentials: 'include',
		  headers: { 'Content-Type': 'application/json' },
		  body: JSON.stringify({
			name: library.name,
			hours: library.hours,
			location: library.location
		  })
		});
		if (!res.ok) throw new Error(`${res.status}`);
		editMode = false;
		await loadLibrary();
		alert('Library updated.');
	  } catch (e) {
		console.error(e);
		error = 'Failed to update library.';
	  } finally {
		saving = false;
	  }
	}
  
	async function deleteLibrary() {
	  if (!confirm('Are you sure? This cannot be undone.')) return;
	  try {
		const res = await fetch(`${API_BASE}/libraries/${libraryId}/`, {
		  method: 'DELETE',
		  credentials: 'include'
		});
		if (!res.ok) throw new Error(`${res.status}`);
		alert('Library deleted.');
		goto('/libraries');
	  } catch (e) {
		console.error(e);
		alert('Failed to delete library.');
	  }
	}
  
	function addRoom() {
	  goto('/rooms/add');
	}
  
	function mapFullnessToRating(fullness: number): number {
	  if (fullness <= 20) return 1;
	  if (fullness <= 40) return 2;
	  if (fullness <= 60) return 3;
	  if (fullness <= 80) return 4;
	  return 5;
	}
  
	function getBookableRoomStatus(room: any): string {
	  if (room.is_bookable === true) return 'Occupied';
	  if (room.is_bookable === false) return 'Free';
	  return 'Closed';
	}
  
	function getGeneralRoomLevel(room: any): string {
	  return typeof room.availability === 'number'
		? Math.round(room.availability).toString()
		: 'Closed';
	}
  
	onMount(loadLibrary);
  </script>
  
  {#if loading}
	<p class="px-6 py-8">Loading library…</p>
  {:else if library}
	<section class="px-6 py-8 max-w-3xl mx-auto text-[#2F2F2F]">
	  {#if error}
		<p class="text-red-500 mb-4">{error}</p>
	  {/if}
  
	  <div class="flex justify-between items-center mb-6">
		<h1 class="text-2xl font-semibold">{library.name}</h1>
		<div class="flex gap-2">
		  {#if !editMode}
			<button
			  on:click={() => (editMode = true)}
			  class="bg-[#C19C6F] text-white px-4 py-2 rounded text-sm hover:opacity-90"
			>
			  Edit
			</button>
		  {/if}
		  <button
			on:click={deleteLibrary}
			class="bg-[#ff4949] text-white px-4 py-2 rounded text-sm hover:opacity-90"
		  >
			Delete
		  </button>
		</div>
	  </div>
  
	  <div class="grid gap-3 mb-8">
		{#if editMode}
		  <input
			class="border border-[#E1E1E1] px-4 py-2 rounded"
			bind:value={library.name}
			placeholder="Library Name"
		  />
		  <input
			class="border border-[#E1E1E1] px-4 py-2 rounded"
			bind:value={library.location}
			placeholder="Location"
		  />
		  <input
			class="border border-[#E1E1E1] px-4 py-2 rounded"
			bind:value={library.hours}
			placeholder="Hours"
		  />
		  <button
			on:click={saveLibrary}
			class="bg-[#27a844] text-white px-4 py-2 rounded text-sm hover:opacity-90 mt-2"
			disabled={saving}
		  >
			{#if saving}Saving…{:else}Save{/if}
		  </button>
		{:else}
		  <p><strong>Location:</strong> {library.location}</p>
		  <p><strong>Hours:</strong> {library.hours}</p>
		  <p>
			<strong>Fullness Rating:</strong>
			{library.general_availability !== null
			  ? mapFullnessToRating(library.general_availability)
			  : 'Unknown'}
		  </p>
		{/if}
	  </div>
  
	  <h2 class="text-xl font-semibold mb-4">Bookable Rooms</h2>
	  <ul class="space-y-2 mb-10">
		{#each library.bookable_rooms as room}
		  <li class="border p-3 rounded flex justify-between items-center">
			<div>
			  <p class="font-semibold">{room.name} (Floor {room.floor})</p>
			  <p class="text-sm text-[#666]">{getBookableRoomStatus(room)}</p>
			</div>
		  </li>
		{/each}
	  </ul>
  
	  <h2 class="text-xl font-semibold mb-4">General Rooms</h2>
	  <ul class="space-y-2">
		{#each library.general_rooms as room}
		  <li class="border p-3 rounded flex justify-between items-center">
			<div>
			  <p class="font-semibold">{room.name} (Floor {room.floor})</p>
			  <p class="text-sm text-[#666]">{getGeneralRoomLevel(room)}</p>
			</div>
		  </li>
		{/each}
	  </ul>
  
	  <div class="flex justify-end mt-8">
		<button
		  on:click={addRoom}
		  class="bg-[#C19C6F] text-white px-4 py-2 rounded text-sm hover:opacity-90"
		>
		  Add Room
		</button>
	  </div>
	</section>
  {:else}
	<p class="px-6 py-8">Library not found.</p>
  {/if}
  