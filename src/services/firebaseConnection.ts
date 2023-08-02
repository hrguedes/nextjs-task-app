import { initializeApp } from "firebase/app";
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: "AIzaSyA7A4mSnFWQlbBHpfvRnq634GzPWJCWaGg",
  authDomain: "taskappplus.firebaseapp.com",
  projectId: "taskappplus",
  storageBucket: "taskappplus.appspot.com",
  messagingSenderId: "580244840955",
  appId: "1:580244840955:web:4bd121c80c4ca4d0462b5e"
};

const firebaseApp = initializeApp(firebaseConfig);

const db = getFirestore(firebaseApp)

export { db }