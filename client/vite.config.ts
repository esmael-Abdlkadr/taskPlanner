import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import tailwindcss from "@tailwindcss/vite";
export default defineConfig(({ mode }) => {
  console.log(`Building for ${mode} mode.`);
  return {
    plugins: [react(), tailwindcss()],
    define: {
      __API_URL__:
        mode === "production"
          ? JSON.stringify("https://taskplanner-api.up.railway.app/api")
          : JSON.stringify("http://localhost:5000/api"),
    },
  };
});
