<script lang="ts">
    const year = new Date().getFullYear();
  
    const links = [
      { name: 'Libraries', href: '/libraries' },
      { name: 'Rooms', href: '/rooms' },
      { name: 'Reports', href: '/reports' }
    ];
</script>
  
<footer class="w-full bg-[#FAFAFC] border-t border-[#E1E1E1] text-[#2F2F2F] text-sm px-6 py-10">
    <div class="max-w-screen-xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
      <p class="font-light" style="font-family: 'Inter', 'Mulish', sans-serif;">
        &copy; {year} BookedUp
      </p>
      <nav class="flex gap-6">
        {#each links as link}
          <a href={link.href} class="hover:text-[#3396ff] duration-200 font-medium">
            {link.name}
          </a>
        {/each}
      </nav>
    </div>
</footer>  