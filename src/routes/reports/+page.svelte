<script lang="ts">
    import { onMount } from 'svelte';
  
    let reports: {
      id: number;
      type: 'Library' | 'Room';
      location: string;
      fullness: number;
      timestamp: string;
      libraryId?: number;
      roomId?: number;
    }[] = [];
  
    let loading = true;
    let showCreateModal = false;
    let form = {
      type: 'library',
      id: '',
      fullness: ''
    };
  
    let libraries: { id: number; name: string }[] = [];
    let rooms: { id: number; name: string; library_id: number }[] = [];
  
    async function loadData() {
      try {
        const libsRes = await fetch('http://localhost:8000/api/libraries/');
        const roomsRes = await fetch('http://localhost:8000/api/rooms/');
        if (libsRes.ok && roomsRes.ok) {
          const libsData = await libsRes.json();
          const roomsData = await roomsRes.json();
          libraries = libsData.libraries || [];
          rooms = roomsData.Rooms || [];
  
          // Fetch reports
          for (const lib of libraries) {
            const libReportsRes = await fetch(`http://localhost:8000/api/libraries/${lib.id}/reports/`);
            if (libReportsRes.ok) {
              const libReports = await libReportsRes.json();
              for (const report of libReports.reports) {
                reports.push({
                  id: report.id,
                  type: 'Library',
                  location: lib.name,
                  fullness: report.fullness,
                  timestamp: report.time_stamp,
                  libraryId: lib.id
                });
              }
            }
            for (const room of lib.rooms) {
              const roomReportsRes = await fetch(`http://localhost:8000/api/rooms/${room.id}/reports/`);
              if (roomReportsRes.ok) {
                const roomReports = await roomReportsRes.json();
                for (const report of roomReports.reports) {
                  reports.push({
                    id: report.id,
                    type: 'Room',
                    location: room.name,
                    fullness: report.fullness,
                    timestamp: report.time_stamp,
                    roomId: room.id
                  });
                }
              }
            }
          }
        }
      } catch (err) {
        console.error('Error loading data:', err);
      } finally {
        loading = false;
      }
    }
  
    async function deleteReport(report) {
      const endpoint =
        report.type === 'Library'
          ? `http://localhost:8000/api/libraries/${report.libraryId}/reports/${report.id}/`
          : `http://localhost:8000/api/rooms/${report.roomId}/reports/${report.id}/`;
  
      const res = await fetch(endpoint, {
        method: 'DELETE'
      });
  
      if (res.ok) {
        reports = reports.filter(r => r.id !== report.id);
      } else {
        alert('Failed to delete report');
      }
    }
  
    async function submitReport() {
      if (!form.id || !form.fullness) {
        alert('Please fill all fields');
        return;
      }
  
      const endpoint =
        form.type === 'library'
          ? `http://localhost:8000/api/libraries/${form.id}/reports/`
          : `http://localhost:8000/api/rooms/${form.id}/reports/`;
  
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fullness: parseInt(form.fullness) })
      });
  
      if (res.ok) {
        showCreateModal = false;
        reports = [];
        loading = true;
        await loadData();
      } else {
        alert('Failed to create report');
      }
    }
  
    onMount(() => {
      loadData();
    });
  </script>
  
  {#if loading}
    <p class="px-6 py-8">Loading reports...</p>
  {:else}
    <section class="px-6 py-8">
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-xl font-semibold text-[#2F2F2F]">Reports</h1>
        <button
          on:click={() => (showCreateModal = true)}
          class="bg-[#3396ff] text-white px-4 py-2 rounded text-sm hover:opacity-90"
        >
          Manually Create Report
        </button>
      </div>
  
      <table class="w-full border border-[#E1E1E1] text-sm text-[#2F2F2F]">
        <thead class="bg-[#F0F4F8] text-left">
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
              <td class="p-3">{new Date(report.timestamp).toLocaleString()}</td>
              <td class="p-3">
                <button
                  on:click={() => deleteReport(report)}
                  class="text-red-500 hover:underline text-xs"
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
  
        <div class="grid gap-4">
          <select bind:value={form.type} class="border p-2 rounded">
            <option value="library">Library</option>
            <option value="room">Room</option>
          </select>
  
          <select bind:value={form.id} class="border p-2 rounded">
            <option value="" disabled selected>Select Location</option>
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
  
          <input
            class="border p-2 rounded"
            placeholder="Fullness (1–5)"
            bind:value={form.fullness}
            type="number"
            min="1"
            max="5"
          />
        </div>
  
        <div class="flex justify-end gap-2 mt-6">
          <button
            on:click={() => (showCreateModal = false)}
            class="border px-4 py-2 rounded text-sm"
          >
            Cancel
          </button>
          <button
            on:click={submitReport}
            class="bg-[#3396ff] text-white px-4 py-2 rounded text-sm hover:opacity-90"
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  {/if}
  