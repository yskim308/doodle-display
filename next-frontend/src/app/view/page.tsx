"use client";

import React from "react";
import { Box, Container, CssBaseline } from "@mui/material";
import { AppHeader } from "@/components/drawings/app-header";
import { PollControls } from "@/components/drawings/poll-controls";
import { ErrorAlert } from "@/components/drawings/error-alert";
import { EmptyState } from "@/components/drawings/empty-state";
import { DrawingsGrid } from "@/components/drawings/drawings-grid";
import { FabControls } from "@/components/drawings/fab-controls";
import { useDrawingPolling } from "@/hooks/use-drawing-polling";

export default function Page() {
  const backendBase = process.env.NEXT_PUBLIC_BACKEND_BASE_URL;
  if (!backendBase) {
    throw new Error(
      "backend base url not set in .env (NEXT_PUBLIC_BACKEND_BASE_URL)",
    );
  }

  const {
    images,
    isPolling,
    pollInterval,
    isLoading,
    error,
    lastUpdate,
    setError,
    setPollInterval,
    togglePolling,
    refresh,
  } = useDrawingPolling({ backendBase, defaultInterval: 1000 });

  const showEmpty = !isLoading && images.length === 0;
  const showInitialLoader = isLoading && images.length === 0;

  return (
    <>
      <CssBaseline />
      <AppHeader
        total={images.length}
        isPolling={isPolling}
        pollInterval={pollInterval}
        lastUpdate={lastUpdate}
        isLoading={isLoading}
        onRefresh={refresh}
        onToggle={togglePolling}
      />

      <Box
        sx={{
          minHeight: "100vh",
          background: "linear-gradient(135deg, #FAFAFA 0%, #F1F5F9 100%)",
          pb: 8,
        }}
      >
        <Container maxWidth="xl" sx={{ pt: 4 }}>
          <PollControls
            pollInterval={pollInterval}
            isPolling={isPolling}
            isLoading={isLoading}
            onSetInterval={setPollInterval}
            onRefresh={refresh}
            onToggle={togglePolling}
          />

          <ErrorAlert error={error} onClose={() => setError(null)} />

          {showInitialLoader && <EmptyState loading />}
          {showEmpty && <EmptyState />}

          {images.length > 0 && <DrawingsGrid images={images} />}
        </Container>
      </Box>
    </>
  );
}
