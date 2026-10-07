/* ==========================================================================
   HOUSEHOLD - Global Configuration & Supabase Init
   ========================================================================== */

const CONFIG = {
  APP_NAME: 'Household - Nuestro Hogar',
  CURRENCY_SYMBOL: '$',
  LOCALE: 'es-CO',
  // Supabase Configuration
  SUPABASE_URL: 'https://sxxvhvzgwfncksfplbpe.supabase.co',
  SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN4eHZodnpnd2ZuY2tzZnBsYnBlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTEzMzExNTgsImV4cCI6MjEwNjkwNzE1OH0.RGZKXx9TlZjYPh0_VZIxdSpnP7rphj83pdzXj9TVJPY',
  USE_LOCAL_STORAGE_FALLBACK: true
};

let _supabaseInstance = null;
function getSupabase() {
  if (_supabaseInstance) return _supabaseInstance;
  if (window.supabase && CONFIG.SUPABASE_URL && CONFIG.SUPABASE_ANON_KEY) {
    _supabaseInstance = window.supabase.createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_ANON_KEY);
  }
  return _supabaseInstance;
}

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
