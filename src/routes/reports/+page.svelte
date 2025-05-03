<script lang="ts">
  import { onMount } from 'svelte';
  import { getLibraries, getBookableRooms, getGeneralRooms } from '$lib/utils/api';

  const API_BASE = import.meta.env.VITE_API_BASE ?? 'https://studyspaces-api.aramirez.dev/api';

  interface ReportRow {
    id:        number;
    type:      'Library' | 'Room';
    location:  string;
    fullness:  number;
    timestamp: string;
    libraryId?: number;
    roomId?:    number;
  }

  let reports: ReportRow[] = [];
  let loading = true;
  let showCreateModal = false;

  let form = {
    type: 'library' as 'library' | 'room',
    id:   '' as string,
    fullness: '' as string
  };

  let idError = '';
  let fullnessError = '';
  let submitError = '';

  let libraries: { id: number; name: string }[] = [];
  let rooms:     { id: number; name: string; library_id: number }[] = [];

  async function loadData() {
    loading = true;
    reports = [];

    const libs = await getLibraries();
    libraries = libs.map(l => ({ id: l.id, name: l.name }));

    const bookable = await getBookableRooms();
    const general  = await getGeneralRooms();
    rooms = [...bookable, ...general].map(r => ({
      id: r.id, name: r.name, library_id: r.library_id
    }));

    await Promise.all(libs.map(async lib => {
      const res = await fetch(`${API_BASE}/libraries/${lib.id}/reports/`);
      if (!res.ok) return;
      const { reports: reps } = await res.json();
      reps.forEach(r =>
        reports.push({
          id:        r.id,
          type:      'Library',
          location:  lib.name,
          fullness:  r.fullness,
          timestamp: r.time_stamp,
          libraryId: lib.id
        })
      );
    }));

    await Promise.all(rooms.map(async room => {
      const res = await fetch(`${API_BASE}/rooms/${room.id}/reports/`);
      if (!res.ok) return;
      const { reports: reps } = await res.json();
      reps.forEach(r =>
        reports.push({
          id:        r.id,
          type:      'Room',
          location:  room.name,
          fullness:  r.fullness,
          timestamp: r.time_stamp,
          roomId:    room.id
        })
      );
    }));

    reports.sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
    loading = false;
  }

  function validateModal() {
    idError = form.id ? '' : 'Please select a location.';

    const f = parseFloat(form.fullness);

    if (!form.fullness) {
      fullnessError = 'Fullness is required.';
    } else if (isNaN(f) || !Number.isInteger(f) || f < 1 || f > 5) {
      fullnessError = 'Fullness must be an integer from 1 to 5.';
    } else {
      fullnessError = '';
    }

    return !idError && !fullnessError;
  }

  async function submitReport() {
    submitError = '';
    if (!validateModal()) return;

    const endpoint =
      form.type === 'library'
        ? `${API_BASE}/libraries/${form.id}/reports/`
        : `${API_BASE}/rooms/${form.id}/reports/`;

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fullness: parseInt(form.fullness, 10) })
      });

      if (res.ok) {
        showCreateModal = false;
        form.id = '';
        form.fullness = '';
        await loadData();
      } else {
        const err = await res.json().catch(() => ({}));
        submitError = err.detail || 'Failed to create report.';
      }
    } catch (err) {
      console.error(err);
      submitError = 'Error submitting report.';
    }
  }

  async function deleteReport(rep: ReportRow) {
    const endpoint =
      rep.type === 'Library'
        ? `${API_BASE}/libraries/${rep.libraryId}/reports/${rep.id}/`
        : `${API_BASE}/rooms/${rep.roomId}/reports/${rep.id}/`;
    const res = await fetch(endpoint, { method: 'DELETE' });
    if (res.ok) {
      reports = reports.filter(r => r.id !== rep.id);
    } else {
      alert('Failed to delete report');
    }
  }

  onMount(loadData);
</script>

{#if loading}
  <p class="px-6 py-8 text-[#2F2F2F]">Loading reports…</p>
{:else}
  <section class="px-6 py-8">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-xl font-semibold text-[#2F2F2F]">Reports</h1>
      <button
        on:click={() => showCreateModal = true}
        class="bg-[#C19C6F] text-white px-4 py-2 rounded text-sm hover:opacity-90"
      >
        Manually Create Report
      </button>
    </div>

    <table class="w-full border border-[#E1E1E1] text-sm text-[#2F2F2F]">
      <thead class="bg-[#F9F6F0] text-left">
        <tr>
          <th class="p-3 font-medium">Type</th>
          <th class="p-3 font-medium">Location</th>
          <th class="p-3 font-medium">Fullness (1–5)</th>
          <th class="p-3 font-medium">Timestamp</th>
          <th class="p-3 font-medium">Actions</th>
        </tr>
      </thead>
      <tbody>
        {#each reports as report}
          <tr class="border-t border-[#E1E1E1] hover:bg-[#FAFAFC]">
            <td class="p-3">{report.type}</td>
            <td class="p-3">{report.location}</td>
            <td class="p-3">{report.fullness}</td>
            <td class="p-3">
              {new Date(report.timestamp).toLocaleString()}
            </td>
            <td class="p-3">
              <button
                on:click={() => deleteReport(report)}
                class="text-[#ff4949] hover:underline text-xs"
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

{#if showCreateModal}
  <div class="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
    <div class="bg-white p-6 rounded-lg w-96 shadow-lg">
      <h2 class="text-lg font-semibold mb-4">Create New Report</h2>

      {#if submitError}
        <p class="text-red-600 mb-2">{submitError}</p>
      {/if}

      <div class="grid gap-4">
        <div>
          <select
            bind:value={form.type}
            class="border border-[#E1E1E1] px-3 py-2 rounded w-full"
          >
            <option value="library">Library</option>
            <option value="room">Room</option>
          </select>
        </div>

        <div>
          <select
            bind:value={form.id}
            on:change={() => (idError = '')}
            class="border border-[#E1E1E1] px-3 py-2 rounded w-full"
          >
            <option value="" disabled>Select Location</option>
            {#if form.type === 'library'}
              {#each libraries as lib}
                <option value={lib.id}>{lib.name}</option>
              {/each}
            {:else}
              {#each rooms as room}
                <option value={room.id}>{room.name}</option>
              {/each}
            {/if}
          </select>
          {#if idError}
            <p class="text-red-500 text-sm mt-1">{idError}</p>
          {/if}
        </div>

        <div>
          <input
            type="number"
            min="1"
            max="5"
            step="1"
            placeholder="Fullness (1–5)"
            bind:value={form.fullness}
            on:input={() => (fullnessError = '')}
            class="border border-[#E1E1E1] px-3 py-2 rounded w-full"
          />
          {#if fullnessError}
            <p class="text-red-500 text-sm mt-1">{fullnessError}</p>
          {/if}
        </div>
      </div>

      <div class="flex justify-end gap-2 mt-6">
        <button
          on:click={() => showCreateModal = false}
          class="border border-[#E1E1E1] px-4 py-2 rounded text-sm"
        >
          Cancel
        </button>
        <button
          on:click={submitReport}
          class="bg-[#C19C6F] text-white px-4 py-2 rounded text-sm hover:opacity-90"
        >
          Submit
        </button>
      </div>
    </div>
  </div>
{/if}
