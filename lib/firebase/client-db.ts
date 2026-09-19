"use client";

import { getFirestore } from "firebase/firestore";
import { clientApp } from "./client-app";

export function clientDb() {
  return getFirestore(clientApp());
}
