import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';

import App from './App.jsx';
import './index.css';
import { AuthProvider, SidebarProvider, BreadcrumbsProvider, ToasterProvider, CommitteeProvider } from './context';
import { ThemeProvider } from './context/ThemeContext';

import './i18n/i18n';

import i18n from 'i18next';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

document.documentElement.lang = i18n.language;
document.documentElement.dir = i18n.language === 'ar' ? 'rtl' : 'ltr';

i18n.on('languageChanged', lng => {
  document.documentElement.lang = lng;
  document.documentElement.dir = lng === 'ar' ? 'rtl' : 'ltr';
});

const queryClient = new QueryClient();
// const queryClient = new QueryClient({
//   defaultOptions: {
//     queries: {
//       retry: false,
//       retryOnMount: false,
//       refetchOnWindowFocus: false,
//       refetchOnReconnect: false,
//     },
//     mutations: {
//       retry: false,
//     },
//   },
// });

const basename = import.meta.env.BASE_URL.replace(/\/$/, '');

createRoot(document.getElementById('root')).render(
  <QueryClientProvider client={queryClient}>
    <BrowserRouter basename={basename || undefined}>
      <AuthProvider>
        <ThemeProvider>
          <SidebarProvider>
            <BreadcrumbsProvider>
              <CommitteeProvider>
                <ToasterProvider>
                  <App />
                  {/* <ReactQueryDevtools initialIsOpen={false} /> */}
                </ToasterProvider>
              </CommitteeProvider>
            </BreadcrumbsProvider>
          </SidebarProvider>
        </ThemeProvider>
      </AuthProvider>
    </BrowserRouter>
  </QueryClientProvider>
);
