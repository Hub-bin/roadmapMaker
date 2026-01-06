import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // xlsx-js-style이 stream을 찾을 때 브라우저용 버전을 사용하도록 설정
      stream: "stream-browserify",
    },
  },
});
