import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyChZV_mKPmfaT8xr8RMsqflwkZqqmoAPvE",
  authDomain: "focus-buddy-40292.firebaseapp.com",
  projectId: "focus-buddy-40292",
  storageBucket: "focus-buddy-40292.firebasestorage.app",
  messagingSenderId: "498449184620",
  appId: "1:498449184620:web:c4ebaf2af1e72edb4ae549",
  measurementId: "G-732DVWDN1E"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const analytics = getAnalytics(app);
export default app;