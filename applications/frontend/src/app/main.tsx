import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import { App } from './ui';

import '@devbonnysid/ui-kit-default/styles.css';
import '@shared/assets/styles/global.scss';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
