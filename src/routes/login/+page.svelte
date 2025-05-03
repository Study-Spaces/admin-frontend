<script lang="ts">
  function login() {
    window.location.href = 'https://backend-saml.onrender.com/login';
  }
</script>

<main class="flex flex-col items-center justify-center min-h-screen bg-[#FAFAFC] text-[#2F2F2F] px-6">
  <div class="bg-white border border-[#E1E1E1] rounded-lg shadow-sm p-8 w-full max-w-md text-center">
    <h1 class="text-2xl font-semibold mb-4">Login</h1>
    <p class="text-sm text-[#555] mb-6">Please login with your Cornell NetID to access the dashboard.</p>

    <button
      on:click={login}
      class="bg-[#3396ff] text-white px-6 py-2 rounded hover:opacity-90 text-sm"
    >
      Login with NetID
    </button>
  </div>
</main>
