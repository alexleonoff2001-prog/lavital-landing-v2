import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import LandingPage from '../app/LandingPage';
import '../app/globals.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <LandingPage />
  </StrictMode>,
);
