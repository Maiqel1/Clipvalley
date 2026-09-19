"use client";

import { getAuth } from "firebase/auth";
import { clientApp } from "./client-app";

export function clientAuth() {
  return getAuth(clientApp());
}
