import { initializeApp } from "firebase/app";
import { initializeFirestore, CACHE_SIZE_UNLIMITED } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
    apiKey: "AIzaSyAjlwe3zThnEbr6rGHB7YP19-IBHGNcz6I",
    authDomain: "admin-pro-hvac.firebaseapp.com",
    projectId: "admin-pro-hvac",
    storageBucket: "admin-pro-hvac.firebasestorage.app",
    messagingSenderId: "385210564068",
    appId: "1:385210564068:web:b5b5f4137727b294991bf1",
    measurementId: "G-ZH9567SWGR"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore with settings to improve stability
export const db = initializeFirestore(app, {
    experimentalForceLongPolling: true, // Fixes "Client is offline" issues on some networks
    cacheSizeBytes: CACHE_SIZE_UNLIMITED
});

export const auth = getAuth(app);
export const storage = getStorage(app);
export const analytics = getAnalytics(app);
