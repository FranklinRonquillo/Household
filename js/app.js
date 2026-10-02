/* ==========================================================================
   HOUSEHOLD - Main Application Router & Controller (5 Unified Views)
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  // Initialize Theme (Dark / Light)
  initTheme();

  // Subscribe to reactive state updates
  state.subscribe(renderApp);

  // Initial render
  renderApp(state.get());

  // Set up event listeners for navigation items
  setupNavigation();
});

function initTheme() {
  const savedTheme = localStorage.getItem('household_theme') || 'dark';
  document.documentElement.setAttribute('data-theme', savedTheme);
  updateThemeButtonUI(savedTheme);
}

function toggleTheme() {
  const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', newTheme);
  localStorage.setItem('household_theme', newTheme);
  updateThemeButtonUI(newTheme);
}

function updateThemeButtonUI(theme) {
  const btn = document.getElementById('theme-toggle-btn');
  if (btn) {
    btn.innerHTML = theme === 'dark' ? '☀️ Modo Claro' : '🌙 Modo Oscuro';
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

  form.reset();
  closeMemoryModal();
}
