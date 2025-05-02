// vite.config.js
import tailwindcss from '@tailwindcss/vite';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
  // Pull in all VITE_… vars from .env
  const env = loadEnv(mode, process.cwd(), 'VITE_');

  return {
    plugins: [
      tailwindcss(),
      sveltekit()
    ],
    define: {
      'import.meta.env.VITE_API_BASE': JSON.stringify(env.VITE_API_BASE)
    }
  };
});
