<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';

	let library: any = null;
	let loading = true;

	$: libraryId = $page.params.id;

	let editMode = false;

	async function loadLibrary() {
		try {
			const res = await fetch(`http://localhost:8000/api/libraries/${libraryId}/`);
			if (res.ok) {
				const data = await res.json();
				library = data;
			} else {
				console.error('Failed to fetch library');
			}
		} catch (err) {
			console.error('Error fetching library:', err);
		} finally {
			loading = false;
		}
	}

	async function saveLibrary() {
		try {
			const res = await fetch(`http://localhost:8000/api/libraries/${libraryId}/`, {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					name: library.name,
					hours: library.hours,
					location: library.location
				})
			});
			if (res.ok) {
				alert('Library updated.');
				editMode = false;
				await loadLibrary();
			} else {
				alert('Failed to update library.');
			}
		} catch (err) {
			console.error('Error saving library:', err);
		}
	}

	async function deleteLibrary() {
		if (confirm('Are you sure you want to delete this library? This cannot be undone.')) {
			try {
				const res = await fetch(`http://localhost:8000/api/libraries/${libraryId}/`, {
					method: 'DELETE',
				});
				if (res.ok) {
					alert('Library deleted.');
					goto('/libraries');
				} else {
					alert('Failed to delete library.');
				}
			} catch (err) {
				console.error('Error deleting library:', err);
			}
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

	function mapRoomStatus(fullness: number): string {
		return fullness >= 50 ? "Occupied" : "Available";
	}

	onMount(() => {
		loadLibrary();
	});
</script>

{#if loading}
	<p class="px-6 py-8">Loading library...</p>
{:else if library}
	<section class="px-6 py-8">
		<div class="flex justify-between items-center mb-6">
			<h1 class="text-2xl font-semibold">{library.name}</h1>
			<div class="flex gap-3">
				{#if !editMode}
					<button on:click={() => (editMode = true)} class="bg-[#3396ff] text-white px-4 py-2 rounded text-sm hover:opacity-90">
						Edit Library
					</button>
				{/if}
				<button on:click={deleteLibrary} class="bg-red-500 text-white px-4 py-2 rounded text-sm hover:opacity-90">
					Delete Library
				</button>
			</div>
		</div>

		<div class="grid gap-2 mb-6">
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
				<button on:click={saveLibrary} class="bg-green-500 text-white px-4 py-2 rounded text-sm hover:opacity-90 mt-2">
					Save
				</button>
			{:else}
				<p><strong>Location:</strong> {library.location}</p>
				<p><strong>Hours:</strong> {library.hours}</p>
				<p><strong>Fullness Rating:</strong> {library.general_availability !== null ? mapFullnessToRating(library.general_availability) : "Unknown"}</p>
			{/if}
		</div>

		<h2 class="text-xl font-semibold mb-4 mt-10">Rooms</h2>

		<div class="flex justify-end mb-4">
			<button on:click={addRoom} class="bg-[#3396ff] text-white px-4 py-2 rounded text-sm hover:opacity-90">
				Add Room
			</button>
		</div>

		<ul class="space-y-2">
			{#each library.rooms as room}
				<li class="border p-3 rounded flex justify-between items-center">
					<div>
						<p class="font-semibold">{room.name} (Floor {room.floor})</p>
						<p class="text-sm text-gray-600">{mapRoomStatus(room.room_availability)}</p>
					</div>
				</li>
			{/each}
		</ul>
	</section>
{:else}
	<p class="px-6 py-8">Library not found.</p>
{/if}