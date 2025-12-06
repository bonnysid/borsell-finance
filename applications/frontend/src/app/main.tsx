import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import { App } from './App';

import '@devbonnysid/ui-kit-default/styles.css';
import { initAuthInterceptor } from '@entities/auth';
import { queryClient } from '@shared/api';
import i18n, { I18N_NS } from '@shared/i18n';
import { QueryClientProvider } from '@tanstack/react-query';
import { I18nextProvider } from 'react-i18next';
import { BrowserRouter } from 'react-router';

initAuthInterceptor();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <I18nextProvider i18n={i18n} defaultNS={I18N_NS}>
        <QueryClientProvider client={queryClient}>
          <App />
        </QueryClientProvider>
      </I18nextProvider>
    </BrowserRouter>
  </StrictMode>,
);
