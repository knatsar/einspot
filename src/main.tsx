import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { AnalyticsProvider } from './components/AnalyticsProvider.tsx'

createRoot(document.getElementById("root")!).render(
  <AnalyticsProvider 
    gaTrackingId="GA_MEASUREMENT_ID" 
    gscVerificationCode="GSC_VERIFICATION_CODE"
  >
    <App />
  </AnalyticsProvider>
);
