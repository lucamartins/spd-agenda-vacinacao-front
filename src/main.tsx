import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";
import { CssBaseline, GlobalStyles, ThemeProvider } from "@mui/material";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router";
import { AppRouter } from "./routes";
import { muiTheme } from "./theme";

const inputGlobalStyles = (
  <GlobalStyles
    styles={{
      "&body": {
        fontFamily: "Poppins, Roboto, sans-serif",
        margin: 0,
        padding: 0,
        boxSizing: "border-box",
        backgroundColor: "#f6f8fa",
      },
    }}
  />
);

const queryClient = new QueryClient();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <CssBaseline enableColorScheme />

    <ThemeProvider theme={muiTheme}>
      {inputGlobalStyles}

      <QueryClientProvider client={queryClient}>
        <RouterProvider router={AppRouter} />
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </ThemeProvider>
  </StrictMode>
);
