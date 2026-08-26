"use client";

import { getApp, getApps, initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { firebaseConfig } from "./config";

function app() {
  return getApps().length ? getApp() : initializeApp(firebaseConfig);
}

export function clientAuth() {
  return getAuth(app());
}

export function clientDb() {
  return getFirestore(app());
}

export function clientStorage() {
  return getStorage(app());
}
