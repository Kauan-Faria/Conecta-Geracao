import { initializeApp } from 'firebase/app';

export const firebaseConfig = {
  apiKey: 'AIzaSyC85vol-4zUTqtUti0yrykidZ0CGvg7Oq4',
  authDomain: 'conecta-geracao.firebaseapp.com',
  projectId: 'conecta-geracao',
  storageBucket: 'conecta-geracao.firebasestorage.app',
  messagingSenderId: '678556404846',
  appId: '1:678556404846:web:1f3f55a7ab3a9443576a7f',
  measurementId: 'G-S17PM942N1',
};

export const firebaseApp = initializeApp(firebaseConfig);
