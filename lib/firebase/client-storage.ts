"use client";

import { getStorage } from "firebase/storage";
import { clientApp } from "./client-app";

export function clientStorage() {
  return getStorage(clientApp());
}
