import { defineConfig } from "@lovable.dev/vite-tanstack-config";

// Force Nitro to build for Vercel (outputs to .vercel/output)
process.env.NITRO_PRESET = "vercel";

export default defineConfig({
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this
    server: { entry: "server" },
  },
});
