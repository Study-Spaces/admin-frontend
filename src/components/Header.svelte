<script lang="ts">
  export let y: number;

  import { onMount } from 'svelte';

  let tabs = [
    { name: 'Libraries', link: '/libraries' },
    { name: 'Rooms', link: '/rooms' },
    { name: 'Reports', link: '/reports' }
  ];

  let user: Record<string, any> | null = null;
  let dropdownOpen = false;
  let mobileNavOpen = false;
  let loadingUser = true;

  async function fetchUser() {
    try {
      const res = await fetch('http://localhost:3001/me', {
        credentials: 'include'
      });

      if (res.ok) {
        const data = await res.json();
        user = data.user;
      } else {
        user = null;
      }
    } catch (err) {
      console.error('Failed to fetch user:', err);
      user = null;
    } finally {
      loadingUser = false;
    }
  }

  async function logout() {
    try {
      await fetch('http://localhost:3001/logout', {
        credentials: 'include'
      });
    } catch (err) {
      console.error('Logout failed:', err);
    } finally {
      window.location.href = '/login'; // Redirect after logout
    }
  }

  function toggleDropdown() {
    dropdownOpen = !dropdownOpen;
  }

  function closeDropdown() {
    dropdownOpen = false;
  }

  function toggleMobileNav() {
    mobileNavOpen = !mobileNavOpen;
  }

  function closeMobileNav() {
    mobileNavOpen = false;
  }

  onMount(() => {
    fetchUser();
  });
</script>


<header class={`sticky z-50 top-0 w-full duration-200 px-6 flex items-center justify-between ${
  y > 0 
    ? 'py-4 bg-[#FAFAFC] border-b-2 border-[#C19C6F] drop-shadow-sm' 
    : 'py-6 bg-transparent border-b-0'
}`}>
  <a href="/" class="flex items-center gap-2">
    <img src="/favicon.png" alt="Library Admin" class="h-8 w-auto" />
    <span class="text-xl font-bold text-[#2F2F2F] hidden sm:block">Study Spaces</span>
  </a>

  <!-- Mobile Hamburger Button -->
  <button
    class="sm:hidden ml-auto flex items-center"
    on:click={toggleMobileNav}
    aria-label="Toggle navigation"
  >
    <svg class="w-6 h-6 text-[#2F2F2F]" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  </button>

  <!-- Desktop Nav -->
  <nav class="sm:flex ml-auto pr-4 items-center gap-6 hidden text-[#2F2F2F] font-medium relative">
    {#each tabs as tab}
      <a href={tab.link} class="duration-200 hover:text-[#C19C6F]">
        {tab.name}
      </a>
    {/each}

    {#if user}
      <div class="relative">
        <button 
          on:click={toggleDropdown}
          class="flex items-center gap-2 cursor-pointer px-2 py-1 hover:bg-[#C19C6F] rounded"
        >
          <span class="text-sm">{user['urn:oid:2.5.4.3'] || 'User'}</span>
          <svg class="w-4 h-4 text-[#2F2F2F]" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path d="M19 9l-7 7-7-7" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
        </button>

        {#if dropdownOpen}
          <div class="absolute right-0 mt-2 w-44 bg-white border border-[#E1E1E1] rounded shadow-md z-50">
            <button 
              on:click={logout}
              class="w-full text-left px-4 py-3 text-sm text-[#2F2F2F] hover:bg-[#f5f7fa] duration-150"
            >
              Log out
            </button>
          </div>
        {/if}
      </div>
    {/if}
  </nav>

  <!-- Mobile Nav -->
  {#if mobileNavOpen}
    <nav class="sm:hidden absolute top-full left-0 right-0 bg-white px-6 py-4 border-t border-[#E1E1E1] z-40 text-[#2F2F2F] font-medium shadow-md">
      {#each tabs as tab}
        <a href={tab.link} class="block py-2" on:click={closeMobileNav}>
          {tab.name}
        </a>
      {/each}

      {#if user}
        <div class="border-t mt-2 pt-2">
          <button 
            on:click={logout}
            class="w-full text-left py-2"
          >
            Log out
          </button>
        </div>
      {/if}
    </nav>
  {/if}
</header>  