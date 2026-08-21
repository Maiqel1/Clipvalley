"use client";

import { useSyncExternalStore } from "react";
import { canCopyImages, canShareFiles } from "./clipboard";

const noopSubscribe = () => () => {};

export function useIsClient() {
  return useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  );
}

function subscribeToDesktop(onChange: () => void) {
  const query = window.matchMedia("(min-width: 768px)");
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

export function useIsDesktop() {
  return useSyncExternalStore(
    subscribeToDesktop,
    () => window.matchMedia("(min-width: 768px)").matches,
    () => false,
  );
}

export function useCanShareFiles() {
  return useSyncExternalStore(noopSubscribe, canShareFiles, () => false);
}

export function useCanCopyImages() {
  return useSyncExternalStore(noopSubscribe, canCopyImages, () => true);
}

function subscribeToCoarsePointer(onChange: () => void) {
  const query = window.matchMedia("(hover: none)");
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

export function useIsTouch() {
  return useSyncExternalStore(
    subscribeToCoarsePointer,
    () => window.matchMedia("(hover: none)").matches,
    () => false,
  );
}
