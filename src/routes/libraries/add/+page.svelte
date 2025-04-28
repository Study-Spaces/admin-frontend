<script lang="ts">
	import { goto } from '$app/navigation';

	let form = {
		name: '',
		hours: '',
		location: ''
	};

	let loading = false;
	let error: string | null = null;

	async function submitLibrary() {
		error = null;

		if (!form.name || !form.hours || !form.location) {
			error = 'All fields are required.';
			return;
		}

		loading = true;
		try {
			const res = await fetch('http://localhost:8000/api/libraries/', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(form)
			});

			if (res.ok) {
				alert('Library created successfully.');
				goto('/libraries');
			} else {
				const data = await res.json();
				error = data.error || 'Failed to create library.';
			}
		} catch (err) {
			console.error('Error submitting library:', err);
			error = 'Server error while creating library.';
		} finally {
			loading = false;
		}
	}
</script>

<section class="max-w-2xl mx-auto px-6 py-8 text-[#2F2F2F]">
	<h1 class="text-2xl font-semibold mb-6">Add New Library</h1>

	{#if error}
		<p class="text-red-500 mb-4">{error}</p>
	{/if}

	<div class="grid gap-4 mb-6">
		<input
			class="border border-[#E1E1E1] px-4 py-2 rounded"
			placeholder="Library Name"
			bind:value={form.name}
		/>
		<input
			class="border border-[#E1E1E1] px-4 py-2 rounded"
			placeholder="Hours (e.g., 8am - 11pm)"
			bind:value={form.hours}
		/>
		<input
			class="border border-[#E1E1E1] px-4 py-2 rounded"
			placeholder="Location"
			bind:value={form.location}
		/>
	</div>

	<button
		on:click={submitLibrary}
		class="bg-[#3396ff] text-white px-6 py-2 rounded hover:opacity-90"
		disabled={loading}
	>
		{#if loading}
			Saving...
		{:else}
			Submit
		{/if}
	</button>
</section>