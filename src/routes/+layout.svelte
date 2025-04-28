<script lang="ts">
	import "../app.css";
	import Header from '../components/Header.svelte';
	import Footer from '../components/Footer.svelte';
	import { onMount } from 'svelte';
	import { afterNavigate } from '$app/navigation';
  
	let y = 0;
  
	
	function goTop() {
	  window.scrollTo({ top: 0, behavior: 'smooth' });
	}
  
	onMount(() => {
	  const handleScroll = () => {
		y = window.scrollY;
	  };
  
	  window.addEventListener('scroll', handleScroll);
  
	  afterNavigate(() => {
		y = window.scrollY;
	  });
  
	  return () => window.removeEventListener('scroll', handleScroll);
	});
</script>
  
<div class="flex flex-col min-h-screen w-full text-sm sm:text-base bg-[#FAFAFC] text-[#2F2F2F]">
	<Header {y} />
  
	{#if y > 0}
	  <div class="fixed bottom-6 right-6 z-50">
		<!-- svelte-ignore a11y_consider_explicit_label -->
		<button on:click={goTop} class="rounded-full bg-[#2F2F2F] text-[#3396ff] p-3 hover:bg-[#1f1f1f] duration-200 shadow-md">
		  <svg class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
			<path stroke-linecap="round" stroke-linejoin="round" d="M5 15l7-7 7 7" />
		  </svg>
		</button>
	  </div>
	{/if}
  
	<main class="flex-1">
	  <slot />
	</main>
  
	<Footer />
</div>
  