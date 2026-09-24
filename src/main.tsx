import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { I18nProvider } from "./lib/i18n";
import "./styles.css";
import "katex/dist/katex.min.css";

// Pages
import HomePage from "./routes/HomePage";
import Index from "./routes/index";

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <I18nProvider>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/app" element={<Index />} />
            <Route path="/chat" element={<Index />} />
            <Route path="/workspace" element={<Index />} />
            <Route path="/lens" element={<Index />} />
          </Routes>
        </BrowserRouter>
      </QueryClientProvider>
    </I18nProvider>
  </React.StrictMode>
);
