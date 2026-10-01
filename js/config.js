/* ==========================================================================
   HOUSEHOLD - Global Configuration & Supabase Init
   ========================================================================== */

const CONFIG = {
  APP_NAME: 'Household - Nuestro Hogar',
  CURRENCY_SYMBOL: '$',
  LOCALE: 'es-CO',
  // Supabase Configuration (Configure with your credentials when ready)
  SUPABASE_URL: '',
  SUPABASE_ANON_KEY: '',
  USE_LOCAL_STORAGE_FALLBACK: true
};

// Global formatters
const formatCurrency = (amount) => {
  return new Intl.NumberFormat(CONFIG.LOCALE, {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0
  }).format(amount || 0);
};

const formatPercent = (value) => {
  return `${(value || 0).toFixed(1)}%`;
};
