import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    include: ["@supabase/supabase-js", "xlsx"],
  },
  build: {
    rollupOptions: {
      external: [],
    },
  },
  ssr: {
    noExternal: ["@supabase/supabase-js", "xlsx"],
  },
});
