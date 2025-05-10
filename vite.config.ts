import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === 'development' && componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  // Add environment variable handling for HTML template
  define: {
    'import.meta.env.VITE_OG_IMAGE_URL': JSON.stringify(process.env.VITE_OG_IMAGE_URL || 'https://lovable.dev/opengraph-image-p98pqg.png'),
    'import.meta.env.VITE_TWITTER_HANDLE': JSON.stringify(process.env.VITE_TWITTER_HANDLE || '@lovable_dev'),
  }
}));
