/* ==========================================================================
   HOUSEHOLD - Central State Management & Live Supabase Integration
   Clean Data Engine (Zero Burned/Mock Figures)
   ========================================================================== */

const INITIAL_STATE = {
  activeTab: 'dashboard',
  selectedMonth: (typeof getCurrentMonthKey === 'function') ? getCurrentMonthKey() : '2026-10',
  currentMonth: (typeof getMonthLabel === 'function') ? getMonthLabel((typeof getCurrentMonthKey === 'function') ? getCurrentMonthKey() : '2026-10') : 'Octubre 2026',

  // Couple Profile & Incomes (Fran and Yox)
  userA: { id: 'person_a', name: 'Fran', income: 3500000, color: '#f472b6' },
  userB: { id: 'person_b', name: 'Yox', income: 2500000, color: '#8b5cf6' },

  // Motivation & Gamification (Real metrics)
  quote: "Cada peso que cuidamos nos acerca a lo que queremos. ❤️",
  savingsStreak: 0,
  couplePoints: 0,

  // Budget Limits by Category (Base targets, real spent computed from expenses)
  categoryBudgets: {
    'Arriendo': 900000,
    'Servicios': 250000,
    'Mercado': 600000,
    'Comida fuera': 200000,
    'Transporte': 250000,
    'Internet/celular': 120000,
    'Aseo': 150000,
    'Entretenimiento': 150000
  },

  // Registered Expenses (Clean array, zero burned data)
  expenses: [],

  // Smart Market List (Clean array, zero burned data)
  market: {
    budget: 0,
    items: []
  },

  // Savings Goals (Clean array, zero burned data)
  savingsGoals: [],

  // Debts & Pending Payments (Clean array, zero burned data)
  debts: [],

  // Financial Calendar Recurring Payments (Clean array, zero burned data)
  calendarPayments: [],

  // Life Goals (Clean array, zero burned data)
  lifeGoals: [],

  // Achievements & Trophies
  achievements: [],

  // Memories Album (Clean array, zero burned data)
  memories: []
};

// Global reactive State Proxy with LocalStorage & Supabase Realtime Sync
class StateManager {
  constructor() {
    const STATE_VERSION = 'household_v5_live_clean';
    const savedVersion = localStorage.getItem('household_state_version');
    const saved = localStorage.getItem('household_state');
    
    let loadedState = null;
    const currentRealMonthKey = (typeof getCurrentMonthKey === 'function') ? getCurrentMonthKey() : '2026-10';

    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (savedVersion === STATE_VERSION) {
          loadedState = { ...INITIAL_STATE, ...parsed };
        } else {
          // Migration from previous mock state:
          // Preserve custom incomes if modified by the user
          const incomeA = (parsed.userA && typeof parsed.userA.income === 'number') ? parsed.userA.income : INITIAL_STATE.userA.income;
          const incomeB = (parsed.userB && typeof parsed.userB.income === 'number') ? parsed.userB.income : INITIAL_STATE.userB.income;

          // Check if expenses were the dummy mock ones (IDs 1..7)
          const isMockExpenses = Array.isArray(parsed.expenses) && parsed.expenses.some(e => e.id <= 7 && e.fecha && e.fecha.startsWith('2026-09'));

          loadedState = {
            ...INITIAL_STATE,
            userA: { ...INITIAL_STATE.userA, income: incomeA },
            userB: { ...INITIAL_STATE.userB, income: incomeB },
            expenses: isMockExpenses ? [] : (Array.isArray(parsed.expenses) ? parsed.expenses : []),
            debts: (Array.isArray(parsed.debts) && parsed.debts.some(d => d.id === 301)) ? [] : (parsed.debts || []),
            market: {
              budget: (parsed.market && parsed.market.items && parsed.market.items.some(i => i.id === 101)) ? 0 : (parsed.market?.budget || 0),
              items: (parsed.market && parsed.market.items && parsed.market.items.some(i => i.id === 101)) ? [] : (parsed.market?.items || [])
            },
            savingsGoals: (Array.isArray(parsed.savingsGoals) && parsed.savingsGoals.some(g => g.id === 201)) ? [] : (parsed.savingsGoals || []),
            memories: (Array.isArray(parsed.memories) && parsed.memories.some(m => m.id === 501)) ? [] : (parsed.memories || []),
            categoryBudgets: (parsed.categoryBudgets && typeof parsed.categoryBudgets === 'object') ? parsed.categoryBudgets : INITIAL_STATE.categoryBudgets,
            calendarPayments: [],
            lifeGoals: [],
            achievements: [],
            savingsStreak: 0,
            couplePoints: 0,
            selectedMonth: currentRealMonthKey,
            currentMonth: (typeof getMonthLabel === 'function') ? getMonthLabel(currentRealMonthKey) : 'Octubre 2026'
          };
          localStorage.setItem('household_state_version', STATE_VERSION);
        }
      } catch (e) {
        loadedState = INITIAL_STATE;
        localStorage.setItem('household_state_version', STATE_VERSION);
      }
    } else {
      loadedState = INITIAL_STATE;
      localStorage.setItem('household_state_version', STATE_VERSION);
    }

    if (!loadedState.selectedMonth) {
      loadedState.selectedMonth = currentRealMonthKey;
    }
    loadedState.currentMonth = (typeof getMonthLabel === 'function') ? getMonthLabel(loadedState.selectedMonth) : 'Octubre 2026';

    this.data = loadedState;
    localStorage.setItem('household_state', JSON.stringify(this.data));
    this.listeners = [];
    this._realtimeChannel = null;
  }

  get() {
    const expenses = this.data.expenses || [];
    const savingsStreak = (typeof calculateSavingsStreak === 'function') 
      ? calculateSavingsStreak(expenses) 
      : (this.data.savingsStreak || 0);
    const achievements = (typeof calculateDynamicAchievements === 'function')
      ? calculateDynamicAchievements(this.data)
      : (this.data.achievements || []);
    const couplePoints = (typeof calculateCouplePoints === 'function')
      ? calculateCouplePoints(this.data)
      : (this.data.couplePoints || 0);

    return {
      ...this.data,
      savingsStreak,
      achievements,
      couplePoints
    };
  }

  set(updater) {
    if (typeof updater === 'function') {
      this.data = updater(this.data);
    } else {
      this.data = { ...this.data, ...updater };
    }

    // Keep currentMonth label always synced with selectedMonth
    if (this.data.selectedMonth && typeof getMonthLabel === 'function') {
      this.data.currentMonth = getMonthLabel(this.data.selectedMonth);
    }

    localStorage.setItem('household_state', JSON.stringify(this.data));
    this.notify();
  }

  subscribe(listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  notify() {
    this.listeners.forEach(listener => listener(this.data));
  }

  async syncWithSupabase() {
    const sb = typeof getSupabase === 'function' ? getSupabase() : null;
    if (!sb) return;

    try {
      // 1. Fetch expenses (order by date descending)
      const { data: expenses } = await sb.from('expenses').select('*').order('fecha', { ascending: false });
      // 2. Fetch debts
      const { data: debts } = await sb.from('debts').select('*').order('id', { ascending: false });
      // 3. Fetch savings_goals
      const { data: savings } = await sb.from('savings_goals').select('*').order('id', { ascending: true });
      // 4. Fetch market_items
      const { data: marketItems } = await sb.from('market_items').select('*').order('id', { ascending: true });
      // 5. Fetch memories
      const { data: memories } = await sb.from('memories').select('*').order('id', { ascending: false });

      // 6. Fetch custom settings (incomes, category_budgets, couple_quote, calendar_payments, life_goals)
      let customIncomes = null;
      let customBudgets = null;
      let customQuote = null;
      let customCalendar = null;
      let customLifeGoals = null;
      try {
        const { data: incSettings } = await sb.from('household_settings').select('*').eq('id', 'incomes').maybeSingle();
        if (incSettings && incSettings.data) customIncomes = incSettings.data;
        const { data: bSettings } = await sb.from('household_settings').select('*').eq('id', 'category_budgets').maybeSingle();
        if (bSettings && bSettings.data) customBudgets = bSettings.data;
        const { data: qSettings } = await sb.from('household_settings').select('*').eq('id', 'couple_quote').maybeSingle();
        if (qSettings && qSettings.data && qSettings.data.quote) customQuote = qSettings.data.quote;
        const { data: calSettings } = await sb.from('household_settings').select('*').eq('id', 'calendar_payments').maybeSingle();
        if (calSettings && calSettings.data && Array.isArray(calSettings.data.payments)) customCalendar = calSettings.data.payments;
        const { data: lifeSettings } = await sb.from('household_settings').select('*').eq('id', 'life_goals').maybeSingle();
        if (lifeSettings && lifeSettings.data && Array.isArray(lifeSettings.data.goals)) customLifeGoals = lifeSettings.data.goals;
      } catch (e) {
        // Table may not exist yet, fallback to state
      }

      this.set(current => ({
        ...current,
        expenses: Array.isArray(expenses) ? expenses : current.expenses,
        debts: Array.isArray(debts) ? debts.map(d => ({ ...d, dueDate: d.due_date || d.dueDate })) : current.debts,
        savingsGoals: Array.isArray(savings) ? savings : current.savingsGoals,
        market: {
          ...current.market,
          items: Array.isArray(marketItems) ? marketItems : current.market.items
        },
        memories: Array.isArray(memories) ? memories.map(m => ({ ...m, desc: m.description || m.desc, image: m.image_url || m.image })) : current.memories,
        userA: (customIncomes && customIncomes.incomeA !== undefined) ? { ...current.userA, income: customIncomes.incomeA } : current.userA,
        userB: (customIncomes && customIncomes.incomeB !== undefined) ? { ...current.userB, income: customIncomes.incomeB } : current.userB,
        categoryBudgets: (customBudgets && typeof customBudgets === 'object' && Object.keys(customBudgets).length > 0) ? customBudgets : current.categoryBudgets,
        quote: customQuote || current.quote,
        calendarPayments: Array.isArray(customCalendar) ? customCalendar : current.calendarPayments,
        lifeGoals: Array.isArray(customLifeGoals) ? customLifeGoals : current.lifeGoals
      }));

      // Setup Realtime live syncing
      this.setupRealtime(sb);
    } catch (err) {
      console.warn('Supabase sync warning:', err);
    }
  }

  setupRealtime(sb) {
    if (this._realtimeChannel) return;
    this._realtimeChannel = sb.channel('household-live')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'expenses' }, async () => {
        const { data } = await sb.from('expenses').select('*').order('fecha', { ascending: false });
        if (Array.isArray(data)) this.set(c => ({ ...c, expenses: data }));
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'debts' }, async () => {
        const { data } = await sb.from('debts').select('*').order('id', { ascending: false });
        if (Array.isArray(data)) this.set(c => ({ ...c, debts: data.map(d => ({ ...d, dueDate: d.due_date || d.dueDate })) }));
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'savings_goals' }, async () => {
        const { data } = await sb.from('savings_goals').select('*').order('id', { ascending: true });
        if (Array.isArray(data)) this.set(c => ({ ...c, savingsGoals: data }));
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'market_items' }, async () => {
        const { data } = await sb.from('market_items').select('*').order('id', { ascending: true });
        if (Array.isArray(data)) this.set(c => ({ ...c, market: { ...c.market, items: data } }));
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'memories' }, async () => {
        const { data } = await sb.from('memories').select('*').order('id', { ascending: false });
        if (Array.isArray(data)) this.set(c => ({ ...c, memories: data.map(m => ({ ...m, desc: m.description || m.desc, image: m.image_url || m.image })) }));
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'household_settings' }, async (payload) => {
        if (payload.new && payload.new.id === 'incomes' && payload.new.data) {
          this.set(c => ({
            ...c,
            userA: { ...c.userA, income: payload.new.data.incomeA },
            userB: { ...c.userB, income: payload.new.data.incomeB }
          }));
        }
        if (payload.new && payload.new.id === 'category_budgets' && payload.new.data) {
          this.set(c => ({
            ...c,
            categoryBudgets: payload.new.data
          }));
        }
        if (payload.new && payload.new.id === 'couple_quote' && payload.new.data?.quote) {
          this.set(c => ({
            ...c,
            quote: payload.new.data.quote
          }));
        }
        if (payload.new && payload.new.id === 'calendar_payments' && Array.isArray(payload.new.data?.payments)) {
          this.set(c => ({
            ...c,
            calendarPayments: payload.new.data.payments
          }));
        }
        if (payload.new && payload.new.id === 'life_goals' && Array.isArray(payload.new.data?.goals)) {
          this.set(c => ({
            ...c,
            lifeGoals: payload.new.data.goals
          }));
        }
      })
      .subscribe();
  }
}

const state = new StateManager();
