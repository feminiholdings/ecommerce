import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NotificationProvider, useNotification } from './context/NotificationContext';
import { ThemeProvider } from './context/ThemeContext';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Layout } from './components/Layout';
import { LoginView } from './views/LoginView';
import { DashboardView } from './views/DashboardView';
import { PosView } from './views/PosView';
import { ProductsView } from './views/ProductsView';
import { InventoryView } from './views/InventoryView';
import { StockTransfersView } from './views/StockTransfersView';
import { QuotationsView } from './views/QuotationsView';
import { InvoicesView } from './views/InvoicesView';
import { ReceiptsView } from './views/ReceiptsView';
import { CustomersView } from './views/CustomersView';
import { SuppliersView } from './views/SuppliersView';
import { PurchasesView } from './views/PurchasesView';
import { ExpensesView } from './views/ExpensesView';
import { FinancialReportsView } from './views/FinancialReportsView';
import { KraEtimsView } from './views/KraEtimsView';
import { UsersView } from './views/UsersView';
import { AuditLogsView } from './views/AuditLogsView';
import { SettingsView } from './views/SettingsView';
import { PortalView } from './views/PortalView';
import { AboutView } from './views/pages/AboutView';
import { PolicyView } from './views/pages/PolicyView';
import { ContactUsView } from './views/pages/ContactUsView';
import { UniformsView } from './views/pages/UniformsView';
import { ProductDetailView } from './views/pages/ProductDetailView';
import { GalleryView } from './views/pages/GalleryView';
import { DocumentGeneratorView } from './views/DocumentGeneratorView';
import { getSessionSnapshot, saveSessionSnapshot } from './utils/sessionManager';

const AppContent: React.FC = () => {
  const { user, isLoading, restoredSessionSnapshot, consumeRestoredNotice } = useAuth();
  const { notify } = useNotification();
  const [currentView, setCurrentView] = useState<string>(() => {
    const snapshot = getSessionSnapshot();
    if (snapshot?.view) return snapshot.view;
    return localStorage.getItem('nais_active_view') || 'pos';
  });
  const path = window.location.pathname;

  // Auto-request full screen on the first user interaction (click, touch, or key)
  useEffect(() => {
    const handleFirstGesture = () => {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(() => {});
      }
      window.removeEventListener('click', handleFirstGesture);
      window.removeEventListener('keydown', handleFirstGesture);
      window.removeEventListener('touchstart', handleFirstGesture);
    };

    window.addEventListener('click', handleFirstGesture, { once: true });
    window.addEventListener('keydown', handleFirstGesture, { once: true });
    window.addEventListener('touchstart', handleFirstGesture, { once: true });

    return () => {
      window.removeEventListener('click', handleFirstGesture);
      window.removeEventListener('keydown', handleFirstGesture);
      window.removeEventListener('touchstart', handleFirstGesture);
    };
  }, []);

  // Sync active view to localStorage & session snapshot
  useEffect(() => {
    if (currentView) {
      localStorage.setItem('nais_active_view', currentView);
      saveSessionSnapshot({ view: currentView });
    }
  }, [currentView]);

  // Handle session restoration upon re-login after 2-minute inactivity timeout
  useEffect(() => {
    if (restoredSessionSnapshot && user) {
      if (restoredSessionSnapshot.view && restoredSessionSnapshot.view !== currentView) {
        setCurrentView(restoredSessionSnapshot.view);
      }
      notify({
        type: 'SUCCESS',
        title: 'Workspace Restored',
        message: `Welcome back, ${user.name}! Resumed directly to ${restoredSessionSnapshot.view.toUpperCase()} where you left off.`,
      });
      consumeRestoredNotice();
    }
  }, [restoredSessionSnapshot, user, notify, consumeRestoredNotice, currentView]);

  // Enforce search engine indexing rules:
  // Portal is default
  const normalizedPath = path.toLowerCase().replace(/\/$/, '') || '/';

  // Enforce search engine indexing rules:
  useEffect(() => {
    const setMeta = (name: string, content: string) => {
      let meta = document.querySelector(`meta[name="${name}"]`);
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute('name', name);
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', content);
    };

    const setLink = (rel: string, href: string) => {
      let link = document.querySelector(`link[rel="${rel}"]`);
      if (!link) {
        link = document.createElement('link');
        link.setAttribute('rel', rel);
        document.head.appendChild(link);
      }
      link.setAttribute('href', href);
    };

    let robotsMeta = document.querySelector('meta[name="robots"]') as HTMLMetaElement | null;
    if (!robotsMeta) {
      robotsMeta = document.createElement('meta');
      robotsMeta.name = 'robots';
      document.head.appendChild(robotsMeta);
    }

    const publicPaths = ['/', '/portal', '/about', '/policy', '/terms', '/terms-and-conditions', '/contact', '/school-uniforms', '/kmtc-uniforms', '/customized-uniforms'];
    const isProductPage = /^\/product\/[^/]+\/?$/.test(path);
    const isPublic = publicPaths.includes(path) || isProductPage;
    
    if (!isPublic) {
      robotsMeta.content = 'noindex, nofollow, noarchive, nosnippet';
      document.title = 'Naisia ERP - Staff & Administration Portal';
    } else {
      robotsMeta.content = 'index, follow, max-image-preview:large';
      setLink('canonical', window.location.origin + path);

      if (normalizedPath === '/' || normalizedPath === '/portal') {
        document.title = 'Uhuru Market Uniforms – Naisia Textiles | #1 Apparel Store in Nairobi';
        setMeta('description', 'Naisiae Textiles is the leading supplier of school and corporate apparel in Uhuru Market, Nairobi. Shop durable uniforms, medical scrubs, and custom branded wear.');
      } else if (normalizedPath === '/school-uniforms') {
        document.title = 'School Uniforms – Primary & High School Attire | Uhuru Market';
        setMeta('description', 'High-quality school uniforms at Uhuru Market. We manufacture and supply durable kits for primary and secondary schools across Kenya.');
      } else if (normalizedPath === '/kmtc-uniforms') {
        document.title = 'KMTC & Medical Scrubs Uniforms | Naisiae Textiles';
        setMeta('description', 'Durable KMTC scrubs and college clinical wear available at Uhuru Market Uniforms. Best quality medical apparel manufactured in Nairobi.');
      } else if (normalizedPath === '/customized-uniforms') {
        document.title = 'Corporate & Custom Branded Uniforms | Naisiae Textiles';
        setMeta('description', 'Custom branded corporate uniforms, security gear, and hospitality apparel manufactured in Uhuru Market, Nairobi. Premium quality and custom fits.');
      } else if (normalizedPath === '/about') {
        document.title = 'About Naisiae Textiles | Apparel Manufacturing in Nairobi';
        setMeta('description', 'Learn about Naisiae Textiles, a premier uniform manufacturer at Uhuru Market, Jogoo Road. Delivering durable, quality apparel since 2026.');
      } else if (normalizedPath === '/contact') {
        document.title = 'Contact Naisiae Textiles | Uhuru Market Store';
        setMeta('description', 'Contact Naisiae Textiles. Visit our flagship store at Stalls 412–415, Uhuru Market, Jogoo Road, Nairobi, or call 0792021496.');
      } else {
        document.title = 'Official Catalog | Uhuru Market Uniforms by Naisiae Textiles';
        setMeta('description', 'Explore the official catalog for quality school uniforms, medical college wear, and corporate apparel by Naisiae Textiles in Uhuru Market.');
      }
    }
  }, [path, user, currentView, normalizedPath]);

  const productPathMatch = normalizedPath.match(/^\/product\/([^/]+)$/);
  if (productPathMatch) return <ProductDetailView productId={decodeURIComponent(productPathMatch[1])} />;

  if (normalizedPath === '/' || normalizedPath === '/portal') {
    return <PortalView />;
  }
  if (normalizedPath === '/about') return <AboutView />;
  if (normalizedPath === '/policy' || normalizedPath === '/terms' || normalizedPath === '/terms-and-conditions') return <PolicyView />;
  if (normalizedPath === '/contact') return <ContactUsView />;
  if (normalizedPath === '/school-uniforms') return <UniformsView type="School Uniforms" />;
  if (normalizedPath === '/kmtc-uniforms') return <UniformsView type="KMTC Uniforms" />;
  if (normalizedPath === '/customized-uniforms') return <UniformsView type="Customized Uniforms" />;
  if (normalizedPath === '/docs' || normalizedPath === '/documents' || normalizedPath === '/quick-docs' || normalizedPath === '/billing-hub') {
    return <DocumentGeneratorView />;
  }

  // ERP Login and Admin
  if (normalizedPath === '/erp' || normalizedPath === '/login' || normalizedPath === '/admin') {
    if (isLoading) {
      return (
        <div className="min-h-screen bg-[#F4F4F4] flex flex-col items-center justify-center space-y-3">
          <img
            src="https://plain-eeur-prod-public.komododecks.com/202605/07/1sm3ITZIdJmYjyTcxmiP/image.png"
            alt="Naisiae Textiles Logo"
            className="w-16 h-16 object-contain animate-bounce drop-shadow-md"
          />
          <p className="text-xs font-bold text-slate-800 tracking-wider uppercase">
            Loading Naisiae ERP...
          </p>
        </div>
      );
    }
    if (!user) {
      return <LoginView />;
    }
    const renderView = () => {
      switch (currentView) {
        case 'pos':
          return <PosView />;
        case 'dashboard':
          return <DashboardView onNavigate={setCurrentView} />;
        case 'inventory':
          return <InventoryView />;
        case 'transfers':
          return <StockTransfersView />;
        case 'products':
          return <ProductsView />;
        case 'invoices':
          return <InvoicesView />;
        case 'quotations':
          return <QuotationsView />;
        case 'receipts':
          return <ReceiptsView />;
        case 'customers':
          return <CustomersView />;
        case 'suppliers':
          return <SuppliersView />;
        case 'purchases':
          return <PurchasesView />;
        case 'expenses':
          return <ExpensesView />;
        case 'financials':
          return <FinancialReportsView />;
        case 'kra':
          return <KraEtimsView />;
        case 'users':
          return <UsersView />;
        case 'audit':
          return <AuditLogsView />;
        case 'settings':
          return <SettingsView />;
        case 'gallery':
          return <GalleryView />;
        case 'documents':
          return <DocumentGeneratorView />;
        default:
          return <DashboardView onNavigate={setCurrentView} />;
      }
    };
    return (
      <Layout currentView={currentView} onNavigate={setCurrentView}>
        {renderView()}
      </Layout>
    );
  }
  
  // Default to portal for unknown paths
  return <PortalView />;
};

export default function App() {
  return (
    <ErrorBoundary>
      <NotificationProvider>
        <ThemeProvider>
          <AuthProvider>
            <AppContent />
          </AuthProvider>
        </ThemeProvider>
      </NotificationProvider>
    </ErrorBoundary>
  );
}
