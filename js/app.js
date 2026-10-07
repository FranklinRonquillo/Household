/* ==========================================================================
   HOUSEHOLD - Main Application Router & Controller (5 Unified Views)
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  // Initialize Theme (Dark / Light)
  initTheme();

  // Initialize Supabase Live Sync
  state.syncWithSupabase();

  // Subscribe to reactive state updates
  state.subscribe(renderApp);

  // Initial render
  renderApp(state.get());

  // Set up event listeners for navigation items
  setupNavigation();
});

// Theme Palettes Catalog
const THEME_PALETTES = {
  pink: { name: 'Rosa Romance', category: 'femenino', emoji: '🌸', color: '#ec4899' },
  lavender: { name: 'Lavanda & Lila', category: 'femenino', emoji: '🌷', color: '#a855f7' },
  blue: { name: 'Azul Zafiro', category: 'masculino', emoji: '💙', color: '#3b82f6' },
  emerald: { name: 'Verde Esmeralda', category: 'masculino', emoji: '🌿', color: '#10b981' },
  purple: { name: 'Morado Real', category: 'pareja', emoji: '💜', color: '#8b5cf6' },
  gold: { name: 'Dorado Imperial', category: 'pareja', emoji: '👑', color: '#f59e0b' },
  cyan: { name: 'Cian Eléctrico', category: 'pareja', emoji: '⚡', color: '#06b6d4' },
  ruby: { name: 'Rubí Pasión', category: 'pareja', emoji: '🔥', color: '#ef4444' }
};

function initTheme() {
  const savedMode = localStorage.getItem('household_theme_mode') || localStorage.getItem('household_theme') || 'dark';
  const savedColor = localStorage.getItem('household_theme_color') || 'pink';
  document.documentElement.setAttribute('data-theme', savedMode);
  document.documentElement.setAttribute('data-color', savedColor);
  updateThemeUI();

  // Close modals on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeThemeModal();
      if (typeof closeExpenseModal === 'function') closeExpenseModal();
      if (typeof closeDebtModal === 'function') closeDebtModal();
      if (typeof closeMarketModal === 'function') closeMarketModal();
      if (typeof closeSavingsModal === 'function') closeSavingsModal();
      if (typeof closeMemoryModal === 'function') closeMemoryModal();
      if (typeof closeIncomeModal === 'function') closeIncomeModal();
    }
  });
}

function setThemeMode(mode) {
  document.documentElement.setAttribute('data-theme', mode);
  localStorage.setItem('household_theme_mode', mode);
  localStorage.setItem('household_theme', mode);
  updateThemeUI();
}

function setThemeColor(colorId) {
  if (!THEME_PALETTES[colorId]) return;
  document.documentElement.setAttribute('data-color', colorId);
  localStorage.setItem('household_theme_color', colorId);
  updateThemeUI();
}

function updateThemeUI() {
  const currentMode = document.documentElement.getAttribute('data-theme') || 'dark';
  const currentColor = document.documentElement.getAttribute('data-color') || 'pink';

  // Update mode pills
  const pillDark = document.getElementById('mode-pill-dark');
  const pillLight = document.getElementById('mode-pill-light');
  if (pillDark && pillLight) {
    pillDark.classList.toggle('active', currentMode === 'dark');
    pillLight.classList.toggle('active', currentMode === 'light');
  }

  // Update active card in modal
  const cards = document.querySelectorAll('.theme-palette-card');
  cards.forEach(card => {
    const cardColor = card.getAttribute('data-color-id');
    card.classList.toggle('active', cardColor === currentColor);
  });

  // Update live preview label in modal
  const previewName = document.getElementById('theme-active-preview-name');
  if (previewName) {
    const palette = THEME_PALETTES[currentColor] || THEME_PALETTES.pink;
    const modeLabel = currentMode === 'dark' ? 'Modo Oscuro' : 'Modo Claro';
    previewName.textContent = `${palette.emoji} ${palette.name} · ${modeLabel}`;
  }

  // Update theme current dot on gear button
  const currentDot = document.getElementById('theme-current-dot');
  if (currentDot && THEME_PALETTES[currentColor]) {
    currentDot.style.background = THEME_PALETTES[currentColor].color;
    currentDot.style.boxShadow = `0 0 8px ${THEME_PALETTES[currentColor].color}`;
  }
}

function openThemeModal() {
  const modal = document.getElementById('modal-theme');
  if (modal) {
    updateThemeUI();
    modal.classList.add('active');
  }
}

function closeThemeModal() {
  const modal = document.getElementById('modal-theme');
  if (modal) {
    modal.classList.remove('active');
  }
}

function renderApp(appState) {
  const container = document.getElementById('main-view-container');
  if (!container) return;

  // Show "+ Nuevo Gasto" button ONLY in the 'gastos' tab
  const topAddBtn = document.getElementById('top-add-expense-btn');
  if (topAddBtn) {
    topAddBtn.style.display = appState.activeTab === 'gastos' ? 'inline-flex' : 'none';
  }

  // Update navigation visual selection
  updateActiveNavStyles(appState.activeTab);

  // Render appropriate view module (5 unified views)
  switch (appState.activeTab) {
    case 'dashboard':
      container.innerHTML = renderDashboardModule(appState);
      break;
    case 'gastos':
      container.innerHTML = renderExpensesModule(appState);
      break;
    case 'mercado':
      container.innerHTML = renderMarketModule(appState);
      break;
    case 'ahorros':
      container.innerHTML = renderSavingsModule(appState);
      break;
    case 'memorias':
      container.innerHTML = renderMemoriesModule(appState);
      break;
    default:
      container.innerHTML = renderDashboardModule(appState);
  }
}

function setupNavigation() {
  const navItems = document.querySelectorAll('[data-tab]');
  navItems.forEach(item => {
    item.addEventListener('click', (e) => {
      const targetTab = item.getAttribute('data-tab');
      if (targetTab) {
        state.set(current => ({ ...current, activeTab: targetTab }));
      }
    });
  });
}

function updateActiveNavStyles(activeTab) {
  const navItems = document.querySelectorAll('[data-tab]');
  navItems.forEach(item => {
    if (item.getAttribute('data-tab') === activeTab) {
      item.classList.add('active');
    } else {
      item.classList.remove('active');
    }
  });
}

// 1. Expense Modal Handlers
function openExpenseModal() {
  document.getElementById('modal-expense').classList.add('active');
}
function closeExpenseModal() {
  document.getElementById('modal-expense').classList.remove('active');
}
function handleNewExpenseSubmit(event) {
  event.preventDefault();
  const form = event.target;
  const descripcion = form.descripcion.value;
  const monto = parseInt(form.monto.value) || 0;
  const categoria = form.categoria.value;
  const pagado_por = form.pagado_por.value;
  const tipo_gasto = form.tipo_gasto.value;

  if (!descripcion || monto <= 0) {
    alert('Por favor completa los campos requeridos');
    return;
  }

  const newExpense = {
    id: Date.now(),
    descripcion,
    monto,
    categoria,
    pagado_por,
    tipo_gasto,
    fecha: new Date().toISOString().split('T')[0]
  };

  state.set(current => ({
    ...current,
    expenses: [newExpense, ...current.expenses]
  }));

  // Sync to Supabase in background
  const sbExpense = typeof getSupabase === 'function' ? getSupabase() : null;
  if (sbExpense) {
    sbExpense.from('expenses').insert([{
      descripcion,
      monto,
      categoria,
      pagado_por,
      tipo_gasto,
      fecha: newExpense.fecha
    }]).then(({ error }) => {
      if (error) console.error('Error sincronizando gasto con Supabase:', error);
    });
  }

  form.reset();
  closeExpenseModal();
}

// 2. Debt Modal Handlers
function openDebtModal() {
  document.getElementById('modal-debt').classList.add('active');
}
function closeDebtModal() {
  document.getElementById('modal-debt').classList.remove('active');
}
function handleNewDebtSubmit(event) {
  event.preventDefault();
  const form = event.target;
  const concept = form.concept.value;
  const amount = parseInt(form.amount.value) || 0;
  const dueDate = form.dueDate.value;
  const type = form.type.value;

  if (!concept || amount <= 0) return;

  const newDebt = {
    id: Date.now(),
    concept,
    amount,
    dueDate: dueDate || '2026-10-15',
    type,
    status: 'pendiente'
  };

  state.set(current => ({
    ...current,
    debts: [newDebt, ...current.debts]
  }));

  // Sync to Supabase in background
  const sbDebt = typeof getSupabase === 'function' ? getSupabase() : null;
  if (sbDebt) {
    sbDebt.from('debts').insert([{
      concept: newDebt.concept,
      amount: newDebt.amount,
      due_date: newDebt.dueDate,
      type: newDebt.type,
      status: newDebt.status
    }]).then(({ error }) => {
      if (error) console.error('Error sincronizando deuda con Supabase:', error);
    });
  }

  form.reset();
  closeDebtModal();
}

// 3. Market Item Modal Handlers
function openMarketModal() {
  document.getElementById('modal-market').classList.add('active');
}
function closeMarketModal() {
  document.getElementById('modal-market').classList.remove('active');
}
function handleNewMarketItemSubmit(event) {
  event.preventDefault();
  const form = event.target;
  const name = form.name.value;
  const price = parseInt(form.price.value) || 0;
  const category = form.category.value;

  if (!name) return;

  const newItem = {
    id: Date.now(),
    name,
    price,
    category,
    checked: false
  };

  state.set(current => ({
    ...current,
    market: {
      ...current.market,
      items: [...current.market.items, newItem]
    }
  }));

  // Sync to Supabase in background
  const sbMarket = typeof getSupabase === 'function' ? getSupabase() : null;
  if (sbMarket) {
    sbMarket.from('market_items').insert([{
      name: newItem.name,
      price: newItem.price,
      category: newItem.category,
      checked: false
    }]).then(({ error }) => {
      if (error) console.error('Error sincronizando producto con Supabase:', error);
    });
  }

  form.reset();
  closeMarketModal();
}

// 4. Savings Goal Modal Handlers
function openSavingsModal() {
  document.getElementById('modal-savings').classList.add('active');
}
function closeSavingsModal() {
  document.getElementById('modal-savings').classList.remove('active');
}
function handleNewSavingsGoalSubmit(event) {
  event.preventDefault();
  const form = event.target;
  const title = form.title.value;
  const target = parseInt(form.target.value) || 1000000;
  const icon = form.icon.value;

  if (!title || target <= 0) return;

  const newGoal = {
    id: Date.now(),
    title,
    current: 0,
    target,
    icon
  };

  state.set(current => ({
    ...current,
    savingsGoals: [...current.savingsGoals, newGoal]
  }));

  // Sync to Supabase in background
  const sbSavings = typeof getSupabase === 'function' ? getSupabase() : null;
  if (sbSavings) {
    sbSavings.from('savings_goals').insert([{
      title: newGoal.title,
      current: 0,
      target: newGoal.target,
      icon: newGoal.icon
    }]).then(({ error }) => {
      if (error) console.error('Error sincronizando meta con Supabase:', error);
    });
  }

  form.reset();
  closeSavingsModal();
}

// 5. Memory Photo Modal Handlers
function openMemoryModal() {
  document.getElementById('modal-memory').classList.add('active');
}
function closeMemoryModal() {
  document.getElementById('modal-memory').classList.remove('active');
}
function handleNewMemorySubmit(event) {
  event.preventDefault();
  const form = event.target;
  const title = form.title.value;
  const date = form.date.value;
  const desc = form.desc.value;
  const image = form.image.value;

  if (!title || !desc) return;

  const newMemory = {
    id: Date.now(),
    title,
    date: date || 'Hoy',
    desc,
    image: image || 'https://images.unsplash.com/photo-1518895949257-7621c3c786d7?auto=format&fit=crop&w=600&q=80'
  };

  state.set(current => ({
    ...current,
    memories: [newMemory, ...current.memories]
  }));

  // Sync to Supabase in background
  const sbMemory = typeof getSupabase === 'function' ? getSupabase() : null;
  if (sbMemory) {
    sbMemory.from('memories').insert([{
      title: newMemory.title,
      date: newMemory.date,
      description: newMemory.desc,
      image_url: newMemory.image
    }]).then(({ error }) => {
      if (error) console.error('Error sincronizando recuerdo con Supabase:', error);
    });
  }

  form.reset();
  closeMemoryModal();
}

// 6. Incomes Modal Handlers
function openIncomeModal() {
  const current = state.get();
  const inputA = document.getElementById('input-income-a');
  const inputB = document.getElementById('input-income-b');
  if (inputA && inputB) {
    inputA.value = current.userA ? current.userA.income : 3500000;
    inputB.value = current.userB ? current.userB.income : 2500000;
  }
  updateIncomeModalPreview();
  const modal = document.getElementById('modal-income');
  if (modal) modal.classList.add('active');
}

function closeIncomeModal() {
  const modal = document.getElementById('modal-income');
  if (modal) modal.classList.remove('active');
}

function updateIncomeModalPreview() {
  const inputA = document.getElementById('input-income-a');
  const inputB = document.getElementById('input-income-b');
  const previewA = document.getElementById('preview-income-a');
  const previewB = document.getElementById('preview-income-b');
  const previewTotal = document.getElementById('preview-income-total');
  const barA = document.getElementById('bar-income-a');
  const barB = document.getElementById('bar-income-b');
  const ratioA = document.getElementById('preview-ratio-a');
  const ratioB = document.getElementById('preview-ratio-b');

  const valA = Math.max(0, parseInt(inputA ? inputA.value : 0) || 0);
  const valB = Math.max(0, parseInt(inputB ? inputB.value : 0) || 0);
  const total = valA + valB;

  if (previewA) previewA.textContent = formatCurrency(valA);
  if (previewB) previewB.textContent = formatCurrency(valB);
  if (previewTotal) previewTotal.textContent = formatCurrency(total);

  const pctA = total > 0 ? (valA / total) * 100 : 50;
  const pctB = total > 0 ? (valB / total) * 100 : 50;

  if (barA) barA.style.width = `${pctA}%`;
  if (barB) barB.style.width = `${pctB}%`;
  if (ratioA) ratioA.textContent = `Fran: ${pctA.toFixed(1)}%`;
  if (ratioB) ratioB.textContent = `Yox: ${pctB.toFixed(1)}%`;
}

function handleIncomeSubmit(event) {
  event.preventDefault();
  const form = event.target;
  const incomeA = Math.max(0, parseInt(form.incomeA.value) || 0);
  const incomeB = Math.max(0, parseInt(form.incomeB.value) || 0);

  state.set(current => ({
    ...current,
    userA: { ...current.userA, income: incomeA },
    userB: { ...current.userB, income: incomeB }
  }));

  // Sync to Supabase if household_settings table exists
  const sb = typeof getSupabase === 'function' ? getSupabase() : null;
  if (sb) {
    sb.from('household_settings').upsert({
      id: 'incomes',
      data: { incomeA, incomeB, updated_at: new Date().toISOString() }
    }).then();
  }

  closeIncomeModal();
}
