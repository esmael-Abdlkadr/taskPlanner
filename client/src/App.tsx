import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "react-hot-toast";
import { ThemeProvider } from "./hooks/useTheme";
import AppRouter from "./routes";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // 1 minute
      refetchOnWindowFocus: false,
      retry: 1,
      refetchOnMount: true,
    },
    mutations: {
      retry: 0,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AppRouter />

        <Toaster
          position="top-center"
          toastOptions={{

            duration: 4000,
            success: {
              style: {
                border: "1px solid #10B981",
                padding: "16px",
              },
              iconTheme: {
                primary: "#10B981",
                secondary: "#FFFFFF",
              },
            },
            error: {
              style: {
                border: "1px solid #EF4444",
                padding: "16px",
              },
              iconTheme: {
                primary: "#EF4444",
                secondary: "#FFFFFF",
              },
            },
           
            style: {
              borderRadius: "8px",
              background: "var(--background)",
              color: "var(--foreground)",
            },
          }}
        />
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
