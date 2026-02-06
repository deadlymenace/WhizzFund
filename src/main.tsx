import { StrictMode, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.tsx';
import './styles/base.css';
import './globals.css';                // user-editable
import './poof-styling.css';        // poof-owned, loaded last
import { init } from '@tarobase/js-sdk';
import ErrorBoundary from './ErrorBoundary';
import { setupGlobalErrorHandlers } from './lib/errorReporting';
import { TAROBASE_CONFIG, UI_CONFIG } from './lib/config';
import poofLogo from './assets/poof-logo.png';
const { appId, chain, rpcUrl, authMethod, wsApiUrl, apiUrl, authApiUrl } = TAROBASE_CONFIG;
const { showPreviewBar, errorReportUrl } = UI_CONFIG;

const SHOW_PREVIEW_BAR = showPreviewBar && chain !== 'solana_mainnet';
const SHOW_INTEGRATION_WARNING_BAR = false;
const SHOW_FLOATING_POOF_BUTTON = chain === 'solana_mainnet';

setupGlobalErrorHandlers(errorReportUrl);

(async () => {
  try {
    // Check if PRIVY_CUSTOM_APP_ID exists in constants
    let privyCustomAppId: string | undefined;
    try {
      const constantsModule = await import('./lib/constants');
      privyCustomAppId = (constantsModule as any).PRIVY_CUSTOM_APP_ID;
    } catch (e) {
      // Constants file doesn't exist or PRIVY_CUSTOM_APP_ID doesn't exist
    }

    // Base configuration
    const baseConfig = {
      apiKey: "",
      wsApiUrl,
      apiUrl,
      authApiUrl,
      appId,
      authMethod,
      chain,
      rpcUrl,
      skipBackendInit: true
    };

    // Add privyConfig if PRIVY_CUSTOM_APP_ID is available
    const config = privyCustomAppId ? {
      ...baseConfig,
      privyConfig: {
        appId: privyCustomAppId,
        config: {
          appearance: {
            walletChainType: 'solana-only',
          },
        }
      }
    } : baseConfig;

    await init(config);
    console.log("App initialized" + (privyCustomAppId ? " with custom Privy config" : ""));
  } catch (err) {
    console.error("Failed to init app", err);
    throw err;
  }
})();

const PreviewBar = () => (
  <div
    id="poof-preview-bar"
    className="poof-preview-bar text-white px-6 flex items-center justify-between"
    style={{
      fontFamily: "'Montserrat Variable', 'Hanken Grotesk', sans-serif",
      boxShadow: "0 2px 10px rgba(0,0,0,0.2)",
      backgroundColor: '#0084b4'
    }}
  >
    <div className="flex items-center gap-2">
      <img src={poofLogo} alt="Poof Logo" className="h-12" />
      <span style={{ fontWeight: 500, letterSpacing: "0.05em" }} className="text-xs text-white">
        This is a preview app built with{" "}
        <a href="https://poof.new" target="_blank" rel="noopener noreferrer"
          className="underline font-semibold hover:text-blue-200 transition-colors">poof.new</a>
      </span>
    </div>
    <div className="text-xs font-light hidden md:block text-white" style={{ letterSpacing: "0.05em" }}>
      <span className='text-white'>Preview apps use Solana Devnet. </span>
      <a href="https://medium.com/future-vision/how-to-switch-to-solana-devnet-in-phantom-wallet-c1515625d78e"
        target="_blank" rel="noopener noreferrer"
        className="underline hover:text-blue-200 transition-colors">Need help?</a>
    </div>
  </div>
);

const IntegrationWarningBar = () => (
  <div
    id="poof-integration-warning-bar"
    className="poof-integration-warning-bar text-white px-6 flex items-center justify-between"
    style={{
      fontFamily: "'Montserrat Variable', 'Hanken Grotesk', sans-serif",
      boxShadow: "0 2px 10px rgba(0,0,0,0.2)"
    }}
  >
    <span style={{ fontWeight: 500, letterSpacing: "0.05em" }} className="text-xs">
      This is a UI preview only. You may ask in chat for an integration task to connect it to a database and smart contracts when you are happy with the UI.
    </span>
  </div>
);

const FloatingPoofButton = () => {
  const [showModal, setShowModal] = useState(false);
  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="fixed bottom-4 left-4 z-50 hover:opacity-80 transition-all duration-300 hover:scale-105 overflow-hidden"
        style={{ height: '70px', width: 'auto', border: 'none', background: 'transparent', padding: 0 }}
      >
        <img src={poofLogo} alt="Poof Logo" style={{ height: '100%', width: 'auto', objectFit: 'contain' }} />
      </button>
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-lg p-10 max-w-md mx-4 shadow-2xl relative"
            onClick={(e) => e.stopPropagation()}
            style={{ fontFamily: "'Montserrat Variable', 'Hanken Grotesk', sans-serif" }}>
            <button onClick={() => setShowModal(false)}
              className="absolute top-2 right-2 text-gray-600 hover:text-gray-800 font-dark text-xl"
              style={{ border: 'none', background: 'transparent', padding: '8px', cursor: 'pointer' }}
              aria-label="Close modal">x</button>
            <div className="text-gray-600 space-y-3">
              <p>This app was built using <a href="https://poof.new" target="_blank" rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 underline">poof.new</a>.</p>
              <p>Create Solana dApps in minutes using natural language.</p>
              <p className="text-sm text-gray-500 font-medium">Use at your own risk.</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

const AppWithChrome = () => {
  const shellClasses = [
    SHOW_PREVIEW_BAR && 'poof--with-preview',
    SHOW_INTEGRATION_WARNING_BAR && 'poof--with-warning',
  ].filter(Boolean).join(' ');

  return (
    <div id="poof-chrome" className={shellClasses}>
      {SHOW_PREVIEW_BAR && <PreviewBar />}
      {SHOW_INTEGRATION_WARNING_BAR && <IntegrationWarningBar />}
      {SHOW_FLOATING_POOF_BUTTON && <FloatingPoofButton />}
      <App />
    </div>
  );
};

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary errorReportUrl={errorReportUrl}>
      <BrowserRouter>
        <AppWithChrome />
      </BrowserRouter>
    </ErrorBoundary>
  </StrictMode>,
);
