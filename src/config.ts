// ─── App settings ──────────────────────────────────────────────────────────────
// These Firebase values are safe to keep in public code. Your data is protected by
// the login and the Firestore rules, not by hiding these.
export const firebaseConfig = {
  apiKey: "AIzaSyBwCRA5ksNWqtTyIG7laURDoiXxDadta5A",
  authDomain: "our-planner-736e7.firebaseapp.com",
  projectId: "our-planner-736e7",
  appId: "1:1074885631859:web:3d48774c77df07083daf06",
};

/** One entry per person. Each email is a user in Firebase Authentication. Order matters: first = partner 1. */
export const logins = [
  { name: "Boyet", email: "sabadojerald762@gmail.com" },
  { name: "Peachy", email: "karenarellano576@gmail.com" },
] as const;

/** The month this planner covers. MONTH is 0-based (0 = January, 4 = May). */
export const YEAR = 2027;
export const MONTH = 4;

/** Where the shared plan is stored in Firestore. Keep this the same so your existing data carries over. */
export const PLAN_DOC = { collection: "planner", id: "may2027" } as const;
