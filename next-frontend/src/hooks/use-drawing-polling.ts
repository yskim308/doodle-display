"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { ImageObject } from "@/types/image-object";

interface UseDrawingPollingOptions {
  backendBase: string;
  defaultInterval?: number;
}

export function useDrawingPolling({
  backendBase,
  defaultInterval = 1000,
}: UseDrawingPollingOptions) {
  const [images, setImages] = useState<ImageObject[]>([]);
  const [isPolling, setIsPolling] = useState(true);
  const [pollInterval, setPollInterval] = useState<number>(defaultInterval);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  const intervalRef = useRef<number | null>(null);
  const renderedIdsRef = useRef<Set<string>>(new Set());

  const fetchImages = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const res = await fetch(`${backendBase}/getAll`, { cache: "no-store" });
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

      const data = (await res.json()) as ImageObject[];
      const newImages = data.filter(
        (img) => !renderedIdsRef.current.has(img.imageId),
      );

      if (newImages.length > 0) {
        setImages((prev) => [...prev, ...newImages]);
        newImages.forEach((img) => renderedIdsRef.current.add(img.imageId));
        setLastUpdate(new Date());
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Failed to fetch images";
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  }, [backendBase]);

  // Polling effect
  useEffect(() => {
    if (isPolling) {
      void fetchImages();
      intervalRef.current = window.setInterval(() => {
        void fetchImages();
      }, pollInterval);
    }
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isPolling, pollInterval, fetchImages]);

  const togglePolling = () => setIsPolling((p) => !p);
  const refresh = () => void fetchImages();

  return {
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
  };
}
