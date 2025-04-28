<script lang="ts">
  import { onMount } from 'svelte';

  let user: Record<string, any> | null = null;
  let isAdmin: boolean = false;
  let loading: boolean = true;

  let libraries: { id: number; name: string }[] = [];
  let rooms: { id: number; name: string }[] = [];
  let reports: { id: number; type: string; location: string; fullness: number; timestamp: string }[] = [];
  let activity: { text: string; time: string }[] = [];

  async function getUser() {
    try {
      const res = await fetch('http://localhost:3001/me', {
        credentials: 'include'
      });
      if (res.ok) {
        const data = await res.json();
        user = data.user;
        isAdmin = data.isAdmin || false;
      }
    } catch (err) {
      console.error('Failed to fetch user info:', err);
    }
  }

  async function loadData() {
  try {
    const librariesRes = await fetch('http://localhost:8000/api/libraries/');
    const roomsRes = await fetch('http://localhost:8000/api/rooms/');

    if (librariesRes.ok) {
      const data = await librariesRes.json();
      libraries = data.libraries || [];
    }

    if (roomsRes.ok) {
      const data = await roomsRes.json();
      rooms = data.Rooms || [];
    }

    // Load reports for libraries
    reports = [];

    for (const lib of libraries) {
      const res = await fetch(`http://localhost:8000/api/libraries/${lib.id}/reports/`);
      if (res.ok) {
        const data = await res.json();
        for (const report of data.reports) {
          reports.push({
            id: report.id,
            type: 'Library',
            location: lib.name,
            fullness: report.fullness,
            timestamp: report.time_stamp
          });
        }
      }
    }

    // Load reports for rooms separately
    for (const room of rooms) {
      const res = await fetch(`http://localhost:8000/api/rooms/${room.id}/reports/`);
      if (res.ok) {
        const data = await res.json();
        for (const report of data.reports) {
          reports.push({
            id: report.id,
            type: 'Room',
            location: room.name,
            fullness: report.fullness,
            timestamp: report.time_stamp
          });
        }
      }
    }

    // Sort all reports
    reports.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    // Sample activity
    activity = [
      { text: "Logged in", time: "2m ago" },
      { text: "Viewed dashboard", time: "5m ago" },
      { text: "Checked latest reports", time: "8m ago" }
    ];
    
  } catch (err) {
    console.error('Error fetching libraries, rooms or reports:', err);
  } finally {
    loading = false;
  }
}

  onMount(async () => {
    await getUser();
    await loadData();
  });
</script>

{#if loading}
  <p class="text-center py-20">Loading dashboard...</p>

{:else if user}
  <section class="px-6 py-10 max-w-7xl mx-auto text-[#2F2F2F]">
    <div class="mb-8 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
      <div>
        <h1 class="text-2xl font-semibold">Welcome back, {user['urn:oid:2.5.4.3']}!</h1>
        <p class="text-sm text-[#555]">Admin Overview</p>
      </div>

      <div class="flex gap-4">
        <div class="bg-white border border-[#E1E1E1] px-4 py-2 rounded shadow-sm text-center">
          <p class="text-xs text-[#777]">Libraries</p>
          <p class="font-semibold">{libraries.length}</p>
        </div>
        <div class="bg-white border border-[#E1E1E1] px-4 py-2 rounded shadow-sm text-center">
          <p class="text-xs text-[#777]">Rooms</p>
          <p class="font-semibold">{rooms.length}</p>
        </div>
        <div class="bg-white border border-[#E1E1E1] px-4 py-2 rounded shadow-sm text-center">
          <p class="text-xs text-[#777]">Reports</p>
          <p class="font-semibold">{reports.length}</p>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
      <!-- Libraries -->
      <div class="border border-[#E1E1E1] rounded-lg bg-white p-5 shadow-sm">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-lg font-semibold">Libraries</h2>
          <a href="/libraries" class="text-sm text-[#3396ff] hover:underline">View All</a>
        </div>
        <ul class="text-sm space-y-2">
          {#each libraries.slice(0, 3) as lib}
            <li><a href={`/libraries/${lib.id}`} class="hover:underline">{lib.name}</a></li>
          {/each}
        </ul>
      </div>

      <!-- Rooms -->
      <div class="border border-[#E1E1E1] rounded-lg bg-white p-5 shadow-sm">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-lg font-semibold">Rooms</h2>
          <a href="/rooms" class="text-sm text-[#3396ff] hover:underline">View All</a>
        </div>
        <ul class="text-sm space-y-2">
          {#each rooms.slice(0, 3) as room}
            <li><a href={`/rooms/${room.id}`} class="hover:underline">{room.name}</a></li>
          {/each}
        </ul>
      </div>

      <!-- Recent Reports -->
      <div class="border border-[#E1E1E1] rounded-lg bg-white p-5 shadow-sm md:col-span-2">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-lg font-semibold">Recent Reports</h2>
          <a href="/reports" class="text-sm text-[#3396ff] hover:underline">Manage Reports</a>
        </div>
        <ul class="text-sm space-y-2">
          {#each reports.slice(0, 5) as report}
            <li class="flex justify-between">
              <span>{report.type}: {report.location} (Fullness {report.fullness})</span>
              <span class="text-xs text-[#888]">{new Date(report.timestamp).toLocaleString()}</span>
            </li>
          {/each}
        </ul>
      </div>

      <!-- Activity -->
      <div class="border border-[#E1E1E1] rounded-lg bg-white p-5 shadow-sm md:col-span-2">
        <h2 class="text-lg font-semibold mb-4">Recent Activity</h2>
        <ul class="text-sm space-y-2">
          {#each activity as item}
            <li class="flex justify-between">
              <span>{item.text}</span>
              <span class="text-xs text-[#888]">{item.time}</span>
            </li>
          {/each}
        </ul>
      </div>
    </div>
  </section>

{:else}
  <main class="text-center py-20">
    <p>You are not logged in. <a href="/login" class="text-[#3396ff] underline">Login here</a>.</p>
  </main>
{/if}
