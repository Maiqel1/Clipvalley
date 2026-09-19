"use client";

import { getApp, getApps, initializeApp } from "firebase/app";
import { firebaseConfig } from "./config";

export function clientApp() {
  return getApps().length ? getApp() : initializeApp(firebaseConfig);
}
