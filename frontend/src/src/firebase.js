// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDrcV0XLzwrrXLJyH10pW_QsHGtQSu23ps",
  authDomain: "recursive-336ea.firebaseapp.com",
  projectId: "recursive-336ea",
  storageBucket: "recursive-336ea.firebasestorage.app",
  messagingSenderId: "447164652069",
  appId: "1:447164652069:web:96d232b749799c786d3dcc",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export { auth };
