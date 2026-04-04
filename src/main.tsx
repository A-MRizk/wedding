import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import WeddingInvitation from './WeddingInvitation.tsx';
import './wedding-invitation.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <WeddingInvitation />
  </StrictMode>,
);
