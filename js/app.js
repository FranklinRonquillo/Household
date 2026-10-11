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
      if (typeof closeMarketToExpenseModal === 'function') closeMarketToExpenseModal();
      if (typeof closeSavingsModal === 'function') closeSavingsModal();
      if (typeof closeSavingsDepositModal === 'function') closeSavingsDepositModal();
      if (typeof closeMemoryModal === 'function') closeMemoryModal();
      if (typeof closeQuoteModal === 'function') closeQuoteModal();
      if (typeof closeCalendarPaymentModal === 'function') closeCalendarPaymentModal();
      if (typeof closeLifeGoalModal === 'function') closeLifeGoalModal();
      if (typeof closeIncomeModal === 'function') closeIncomeModal();
      if (typeof closeCategoryBudgetsModal === 'function') closeCategoryBudgetsModal();
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

  // Dynamic Header Month Sync
  const currentRealKey = (typeof getCurrentMonthKey === 'function') ? getCurrentMonthKey() : '2026-10';
  const selectedMonth = appState.selectedMonth || currentRealKey;
  const isViewingCurrent = selectedMonth === currentRealKey;
  const monthLabel = (typeof getMonthLabel === 'function') ? getMonthLabel(selectedMonth) : 'Octubre 2026';

  const headerMonthLabel = document.getElementById('header-current-month-label');
  if (headerMonthLabel) {
    headerMonthLabel.textContent = `${monthLabel} ${isViewingCurrent ? '· (Mes Actual)' : '· (Histórico)'}`;
  }

  const headerSelect = document.getElementById('header-month-select');
  if (headerSelect && typeof getAvailableMonthKeys === 'function') {
    const available = getAvailableMonthKeys(appState.expenses, 12);
    headerSelect.innerHTML = available.map(mKey => {
      const isCur = mKey === currentRealKey;
      const isSel = mKey === selectedMonth;
      const label = getMonthLabel(mKey);
      return `<option value="${mKey}" ${isSel ? 'selected' : ''}>${label}${isCur ? ' · Actual' : ''}</option>`;
    }).join('');
  }

  const btnToday = document.getElementById('btn-today-month');
  if (btnToday) {
    btnToday.style.display = isViewingCurrent ? 'none' : 'inline-flex';
  }

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

// Time Travel & Month History Navigation Handlers
function changeSelectedMonth(monthKey) {
  if (!monthKey) return;
  state.set(current => ({
    ...current,
    selectedMonth: monthKey,
    currentMonth: (typeof getMonthLabel === 'function') ? getMonthLabel(monthKey) : monthKey
  }));
}

function navigateMonth(step) {
  const current = state.get().selectedMonth || (typeof getCurrentMonthKey === 'function' ? getCurrentMonthKey() : '2026-10');
  const next = (typeof shiftMonthKey === 'function') ? shiftMonthKey(current, step) : current;
  changeSelectedMonth(next);
}

function goToCurrentMonth() {
  const current = (typeof getCurrentMonthKey === 'function') ? getCurrentMonthKey() : '2026-10';
  changeSelectedMonth(current);
}

function onMonthSelectChange(event) {
  if (event && event.target && event.target.value) {
    changeSelectedMonth(event.target.value);
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

// 1. Expense Modal Handlers (Add, Edit, Delete)
function openExpenseModal(expenseId = null) {
  const modal = document.getElementById('modal-expense');
  if (!modal) return;

  if (typeof updateExpenseCategoryOptions === 'function') {
    updateExpenseCategoryOptions();
  }

  const titleEl = document.getElementById('modal-expense-title');
  const submitBtn = document.getElementById('modal-expense-submit-btn');
  const idInput = document.getElementById('expense-id');
  const descInput = document.getElementById('expense-descripcion');
  const dateInput = document.getElementById('expense-date');
  const amountInput = document.getElementById('expense-monto');
  const catInput = document.getElementById('expense-category-select');
  const paidByInput = document.getElementById('expense-pagado-por');
  const typeInput = document.getElementById('expense-tipo-gasto');

  if (expenseId !== null && expenseId !== undefined && expenseId !== '') {
    // Edit mode
    const expenses = state.get().expenses || [];
    const expense = expenses.find(e => String(e.id) === String(expenseId));
    if (expense) {
      if (titleEl) titleEl.textContent = '✏️ Modificar Gasto';
      if (submitBtn) submitBtn.textContent = 'Guardar Cambios';
      if (idInput) idInput.value = expense.id;
      if (descInput) descInput.value = expense.descripcion || '';
      if (dateInput) dateInput.value = expense.fecha ? String(expense.fecha).substring(0, 10) : ((typeof formatDateToISO === 'function') ? formatDateToISO(new Date()) : new Date().toISOString().split('T')[0]);
      if (amountInput) amountInput.value = expense.monto || '';
      if (catInput) catInput.value = expense.categoria || 'Mercado';
      if (paidByInput) paidByInput.value = expense.pagado_por || 'person_a';
      if (typeInput) typeInput.value = expense.tipo_gasto || 'compartido';
    }
  } else {
    // Create mode
    if (titleEl) titleEl.textContent = '💸 Registrar Nuevo Gasto';
    if (submitBtn) submitBtn.textContent = 'Guardar Gasto';
    if (idInput) idInput.value = '';
    if (descInput) descInput.value = '';
    if (dateInput) dateInput.value = (typeof formatDateToISO === 'function') ? formatDateToISO(new Date()) : new Date().toISOString().split('T')[0];
    if (amountInput) amountInput.value = '';
    if (catInput) catInput.value = 'Mercado';
    if (paidByInput) paidByInput.value = 'person_a';
    if (typeInput) typeInput.value = 'compartido';
  }

  modal.classList.add('active');
}

function closeExpenseModal() {
  const modal = document.getElementById('modal-expense');
  if (modal) {
    modal.classList.remove('active');
  }
}

function handleNewExpenseSubmit(event) {
  event.preventDefault();
  const form = event.target;
  const expenseId = form.expenseId ? form.expenseId.value : '';
  const descripcion = (form.descripcion.value || '').trim();
  const fecha = (form.fecha && form.fecha.value) ? form.fecha.value : ((typeof formatDateToISO === 'function') ? formatDateToISO(new Date()) : new Date().toISOString().split('T')[0]);
  const monto = parseInt(form.monto.value, 10) || 0;
  const categoria = form.categoria.value;
  const pagado_por = form.pagado_por.value;
  const tipo_gasto = form.tipo_gasto.value;

  if (!descripcion || monto <= 0) {
    alert('Por favor completa todos los campos requeridos con un monto válido.');
    return;
  }

  const expenseMonthKey = fecha.substring(0, 7);
  const sb = typeof getSupabase === 'function' ? getSupabase() : null;

  if (expenseId) {
    // UPDATE existing expense
    const idToUpdate = isNaN(Number(expenseId)) ? expenseId : Number(expenseId);
    state.set(current => ({
      ...current,
      selectedMonth: expenseMonthKey,
      currentMonth: (typeof getMonthLabel === 'function') ? getMonthLabel(expenseMonthKey) : expenseMonthKey,
      expenses: (current.expenses || []).map(e => {
        if (String(e.id) === String(expenseId)) {
          return { ...e, descripcion, monto, categoria, pagado_por, tipo_gasto, fecha };
        }
        return e;
      })
    }));

    if (sb) {
      sb.from('expenses').update({
        descripcion,
        monto,
        categoria,
        pagado_por,
        tipo_gasto,
        fecha
      }).eq('id', idToUpdate).then(({ error }) => {
        if (error) console.error('Error actualizando gasto en Supabase:', error);
      });
    }
  } else {
    // INSERT new expense
    const newExpense = {
      id: Date.now(),
      descripcion,
      monto,
      categoria,
      pagado_por,
      tipo_gasto,
      fecha
    };

    state.set(current => ({
      ...current,
      selectedMonth: expenseMonthKey,
      currentMonth: (typeof getMonthLabel === 'function') ? getMonthLabel(expenseMonthKey) : expenseMonthKey,
      expenses: [newExpense, ...current.expenses]
    }));

    if (sb) {
      sb.from('expenses').insert([{
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
  }

  form.reset();
  closeExpenseModal();
}

function deleteExpense(id) {
  const expenses = state.get().expenses || [];
  const exp = expenses.find(e => String(e.id) === String(id));
  const desc = exp ? exp.descripcion : 'este gasto';

  if (!confirm(`¿Eliminar permanentemente "${desc}"?`)) {
    return;
  }

  const idNum = isNaN(Number(id)) ? id : Number(id);

  state.set(current => ({
    ...current,
    expenses: (current.expenses || []).filter(e => String(e.id) !== String(id))
  }));

  const sb = typeof getSupabase === 'function' ? getSupabase() : null;
  if (sb) {
    sb.from('expenses').delete().eq('id', idNum).then(({ error }) => {
      if (error) console.error('Error eliminando gasto en Supabase:', error);
    });
  }
}

// 2. Debt Modal Handlers (Add, Edit, Delete, Toggle Status)
function openDebtModal(debtId = null) {
  const modal = document.getElementById('modal-debt');
  if (!modal) return;

  const titleEl = document.getElementById('modal-debt-title');
  const submitBtn = document.getElementById('modal-debt-submit-btn');
  const idInput = document.getElementById('debt-id');
  const conceptInput = document.getElementById('debt-concept');
  const amountInput = document.getElementById('debt-amount');
  const dueInput = document.getElementById('debt-due-date');
  const typeInput = document.getElementById('debt-type');

  if (debtId !== null && debtId !== undefined && debtId !== '') {
    // Edit mode
    const debts = state.get().debts || [];
    const debt = debts.find(d => String(d.id) === String(debtId));
    if (debt) {
      if (titleEl) titleEl.textContent = '✏️ Modificar Deuda / Cuota';
      if (submitBtn) submitBtn.textContent = 'Guardar Cambios';
      if (idInput) idInput.value = debt.id;
      if (conceptInput) conceptInput.value = debt.concept || '';
      if (amountInput) amountInput.value = debt.amount || '';
      if (dueInput) dueInput.value = debt.dueDate ? String(debt.dueDate).substring(0, 10) : ((typeof formatDateToISO === 'function') ? formatDateToISO(new Date()) : new Date().toISOString().split('T')[0]);
      if (typeInput) typeInput.value = debt.type || 'Servicio';
    }
  } else {
    // Create mode
    if (titleEl) titleEl.textContent = '🧾 Registrar Deuda / Cuota Pendiente';
    if (submitBtn) submitBtn.textContent = 'Guardar Deuda';
    if (idInput) idInput.value = '';
    if (conceptInput) conceptInput.value = '';
    if (amountInput) amountInput.value = '';
    if (dueInput) dueInput.value = (typeof formatDateToISO === 'function') ? formatDateToISO(new Date()) : new Date().toISOString().split('T')[0];
    if (typeInput) typeInput.value = 'Servicio';
  }

  modal.classList.add('active');
}

function closeDebtModal() {
  const modal = document.getElementById('modal-debt');
  if (modal) {
    modal.classList.remove('active');
  }
}

function handleNewDebtSubmit(event) {
  event.preventDefault();
  const form = event.target;
  const debtId = form.debtId ? form.debtId.value : '';
  const concept = (form.concept.value || '').trim();
  const amount = parseInt(form.amount.value, 10) || 0;
  const dueDate = form.dueDate.value || ((typeof formatDateToISO === 'function') ? formatDateToISO(new Date()) : new Date().toISOString().split('T')[0]);
  const type = form.type.value;

  if (!concept || amount <= 0) return;

  const sbDebt = typeof getSupabase === 'function' ? getSupabase() : null;

  if (debtId) {
    // UPDATE existing debt
    const idToUpdate = isNaN(Number(debtId)) ? debtId : Number(debtId);
    state.set(current => ({
      ...current,
      debts: (current.debts || []).map(d => {
        if (String(d.id) === String(debtId)) {
          return { ...d, concept, amount, dueDate, type };
        }
        return d;
      })
    }));

    if (sbDebt) {
      sbDebt.from('debts').update({
        concept,
        amount,
        due_date: dueDate,
        type
      }).eq('id', idToUpdate).then(({ error }) => {
        if (error) console.error('Error actualizando deuda en Supabase:', error);
      });
    }
  } else {
    // INSERT new debt
    const newDebt = {
      id: Date.now(),
      concept,
      amount,
      dueDate,
      type,
      status: 'pendiente'
    };

    state.set(current => ({
      ...current,
      debts: [newDebt, ...current.debts]
    }));

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
  }

  form.reset();
  closeDebtModal();
}

function toggleDebtStatus(id) {
  const debts = state.get().debts || [];
  const debt = debts.find(d => String(d.id) === String(id));
  if (!debt) return;

  const newStatus = (debt.status === 'pagado' || debt.status === 'paid') ? 'pendiente' : 'pagado';
  const idNum = isNaN(Number(id)) ? id : Number(id);

  state.set(current => ({
    ...current,
    debts: (current.debts || []).map(d => {
      if (String(d.id) === String(id)) {
        return { ...d, status: newStatus };
      }
      return d;
    })
  }));

  const sb = typeof getSupabase === 'function' ? getSupabase() : null;
  if (sb) {
    sb.from('debts').update({ status: newStatus }).eq('id', idNum).then(({ error }) => {
      if (error) console.error('Error actualizando estado de deuda en Supabase:', error);
    });
  }
}

function deleteDebt(id) {
  const debts = state.get().debts || [];
  const debt = debts.find(d => String(d.id) === String(id));
  const concept = debt ? debt.concept : 'esta deuda';

  if (!confirm(`¿Eliminar permanentemente "${concept}"?`)) {
    return;
  }

  const idNum = isNaN(Number(id)) ? id : Number(id);

  state.set(current => ({
    ...current,
    debts: (current.debts || []).filter(d => String(d.id) !== String(id))
  }));

  const sb = typeof getSupabase === 'function' ? getSupabase() : null;
  if (sb) {
    sb.from('debts').delete().eq('id', idNum).then(({ error }) => {
      if (error) console.error('Error eliminando deuda en Supabase:', error);
    });
  }
}

// 3. Market Item Modal Handlers (Add, Edit, Delete & Add to Expenses)
function openMarketModal(itemId = null) {
  const modal = document.getElementById('modal-market');
  if (!modal) return;

  const titleEl = document.getElementById('modal-market-title');
  const idInput = document.getElementById('market-item-id');
  const nameInput = document.getElementById('market-item-name');
  const priceInput = document.getElementById('market-item-price');
  const catInput = document.getElementById('market-item-category');
  const submitBtn = document.getElementById('modal-market-submit-btn');

  if (itemId !== null && itemId !== undefined && itemId !== '') {
    // Edit Mode
    const items = state.get().market?.items || [];
    const item = items.find(i => String(i.id) === String(itemId));
    if (item) {
      if (titleEl) titleEl.textContent = `✏️ Modificar Precio: ${item.name}`;
      if (idInput) idInput.value = item.id;
      if (nameInput) nameInput.value = item.name;
      if (priceInput) priceInput.value = item.price;
      if (catInput) catInput.value = item.category || 'Despensa';
      if (submitBtn) submitBtn.textContent = 'Guardar Cambios';
    }
  } else {
    // Create Mode
    if (titleEl) titleEl.textContent = '🛒 Agregar Producto al Mercado';
    if (idInput) idInput.value = '';
    if (nameInput) nameInput.value = '';
    if (priceInput) priceInput.value = '';
    if (catInput) catInput.value = 'Despensa';
    if (submitBtn) submitBtn.textContent = 'Agregar a la Lista';
  }

  modal.classList.add('active');
  if (itemId && priceInput) {
    setTimeout(() => { priceInput.focus(); priceInput.select(); }, 120);
  } else if (nameInput) {
    setTimeout(() => nameInput.focus(), 120);
  }
}

function closeMarketModal() {
  const modal = document.getElementById('modal-market');
  if (modal) modal.classList.remove('active');
}

function handleMarketItemSubmit(event) {
  event.preventDefault();
  const form = event.target;
  const itemId = form.itemId ? form.itemId.value : '';
  const name = form.name.value.trim();
  const price = parseInt(form.price.value, 10) || 0;
  const category = form.category.value;

  if (!name) return;

  const sbMarket = typeof getSupabase === 'function' ? getSupabase() : null;

  if (itemId) {
    // UPDATE existing item
    const idToUpdate = isNaN(Number(itemId)) ? itemId : Number(itemId);
    state.set(current => ({
      ...current,
      market: {
        ...current.market,
        items: (current.market?.items || []).map(item => {
          if (String(item.id) === String(itemId)) {
            return { ...item, name, price, category };
          }
          return item;
        })
      }
    }));

    if (sbMarket) {
      sbMarket.from('market_items').update({
        name,
        price,
        category
      }).eq('id', idToUpdate).then(({ error }) => {
        if (error) console.error('Error actualizando producto en Supabase:', error);
      });
    }
  } else {
    // INSERT new item
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
        items: [...(current.market?.items || []), newItem]
      }
    }));

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
  }

  form.reset();
  closeMarketModal();
}
const handleNewMarketItemSubmit = handleMarketItemSubmit;

function deleteMarketItem(id) {
  const items = state.get().market?.items || [];
  const item = items.find(i => String(i.id) === String(id));
  const itemName = item ? item.name : 'este producto';

  if (!confirm(`¿Eliminar "${itemName}" de la lista de mercado?`)) {
    return;
  }

  const idNum = isNaN(Number(id)) ? id : Number(id);

  state.set(current => ({
    ...current,
    market: {
      ...current.market,
      items: (current.market?.items || []).filter(i => String(i.id) !== String(id))
    }
  }));

  const sbMarket = typeof getSupabase === 'function' ? getSupabase() : null;
  if (sbMarket) {
    sbMarket.from('market_items').delete().eq('id', idNum).then(({ error }) => {
      if (error) console.error('Error eliminando producto de Supabase:', error);
    });
  }
}

function uncheckAllMarketItems() {
  state.set(current => ({
    ...current,
    market: {
      ...current.market,
      items: (current.market?.items || []).map(i => ({ ...i, checked: false }))
    }
  }));

  const sbMarket = typeof getSupabase === 'function' ? getSupabase() : null;
  if (sbMarket) {
    sbMarket.from('market_items').update({ checked: false }).neq('checked', false).then(({ error }) => {
      if (error) console.error('Error desmarcando productos en Supabase:', error);
    });
  }
}

// 3b. Market to Expense Conversion Handlers
function openMarketToExpenseModal() {
  const modal = document.getElementById('modal-market-to-expense');
  if (!modal) return;

  const currentAppState = state.get();
  const items = currentAppState.market?.items || [];
  const checkedItems = items.filter(i => i.checked);

  const cartTotal = checkedItems.reduce((sum, i) => sum + (Number(i.price) || 0), 0);
  const allTotal = items.reduce((sum, i) => sum + (Number(i.price) || 0), 0);

  const finalAmount = cartTotal > 0 ? cartTotal : allTotal;
  const defaultDesc = checkedItems.length > 0 
    ? `Mercado (${checkedItems.length} productos)` 
    : `Compra de Mercado`;

  const descInput = document.getElementById('market-expense-desc');
  const amountInput = document.getElementById('market-expense-amount');
  const dateInput = document.getElementById('market-expense-date');
  const resetCheckbox = document.getElementById('market-expense-reset-checked');

  if (descInput) descInput.value = defaultDesc;
  if (amountInput) amountInput.value = finalAmount;
  if (dateInput) {
    dateInput.value = (typeof formatDateToISO === 'function') 
      ? formatDateToISO(new Date()) 
      : new Date().toISOString().split('T')[0];
  }
  if (resetCheckbox) resetCheckbox.checked = true;

  modal.classList.add('active');
}

function closeMarketToExpenseModal() {
  const modal = document.getElementById('modal-market-to-expense');
  if (modal) modal.classList.remove('active');
}

function handleMarketToExpenseSubmit(event) {
  event.preventDefault();
  const form = event.target;
  const descripcion = form.descripcion.value.trim();
  const monto = parseInt(form.monto.value, 10) || 0;
  const fecha = form.fecha.value || ((typeof formatDateToISO === 'function') ? formatDateToISO(new Date()) : new Date().toISOString().split('T')[0]);
  const pagado_por = form.pagado_por.value;
  const tipo_gasto = form.tipo_gasto.value;
  const resetChecked = form.resetChecked ? form.resetChecked.checked : false;

  if (!descripcion || monto <= 0) {
    alert('Por favor especifica una descripción y un monto válido.');
    return;
  }

  const newExpense = {
    id: Date.now(),
    descripcion,
    monto,
    categoria: 'Mercado',
    pagado_por,
    tipo_gasto,
    fecha
  };

  const expenseMonthKey = fecha.substring(0, 7);

  // 1. Add expense & Optionally reset checked items in state
  state.set(current => {
    let nextMarket = current.market;
    if (resetChecked && current.market?.items) {
      nextMarket = {
        ...current.market,
        items: current.market.items.map(item => ({ ...item, checked: false }))
      };
    }

    return {
      ...current,
      selectedMonth: expenseMonthKey,
      currentMonth: (typeof getMonthLabel === 'function') ? getMonthLabel(expenseMonthKey) : expenseMonthKey,
      expenses: [newExpense, ...current.expenses],
      market: nextMarket
    };
  });

  // 2. Sync expense with Supabase
  const sb = typeof getSupabase === 'function' ? getSupabase() : null;
  if (sb) {
    sb.from('expenses').insert([{
      descripcion: newExpense.descripcion,
      monto: newExpense.monto,
      categoria: 'Mercado',
      pagado_por: newExpense.pagado_por,
      tipo_gasto: newExpense.tipo_gasto,
      fecha: newExpense.fecha
    }]).then(({ error }) => {
      if (error) console.error('Error insertando gasto de mercado en Supabase:', error);
    });

    // 3. If unchecking items, sync market_items checked status in Supabase
    if (resetChecked) {
      sb.from('market_items').update({ checked: false }).neq('checked', false).then(({ error }) => {
        if (error) console.error('Error reseteando checkboxes de mercado en Supabase:', error);
      });
    }
  }

  form.reset();
  closeMarketToExpenseModal();

  alert(`🎉 ¡Gasto de mercado registrado exitosamente por ${formatCurrency(monto)} en Gastos!`);
}

// 3c. Quick Add Market to Expenses (1-Click, Sin Formularios)
function quickAddMarketToExpenses(payerId = 'person_a') {
  const currentAppState = state.get();
  const items = currentAppState.market?.items || [];

  if (items.length === 0) {
    alert('Tu lista de mercado está vacía. Carga la lista básica o agrega productos primero.');
    return;
  }

  const checkedItems = items.filter(i => i.checked);
  const cartTotal = checkedItems.reduce((sum, i) => sum + (Number(i.price) || 0), 0);
  const allTotal = items.reduce((sum, i) => sum + (Number(i.price) || 0), 0);

  const amount = cartTotal > 0 ? cartTotal : allTotal;
  if (amount <= 0) {
    alert('El monto del mercado debe ser mayor a $0. Configura los precios con el botón ✏️ Editar.');
    return;
  }

  const payerName = payerId === 'person_a' ? 'Fran' : 'Yox';
  const countLabel = checkedItems.length > 0 
    ? `${checkedItems.length} producto(s) en carrito` 
    : `toda la lista (${items.length} productos)`;
  const descripcion = `Mercado del Hogar (${countLabel})`;

  const today = (typeof formatDateToISO === 'function') 
    ? formatDateToISO(new Date()) 
    : new Date().toISOString().split('T')[0];
  const expenseMonthKey = today.substring(0, 7);

  const newExpense = {
    id: Date.now(),
    descripcion,
    monto: amount,
    categoria: 'Mercado',
    pagado_por: payerId,
    tipo_gasto: 'compartido',
    fecha: today
  };

  // 1. Update State: add expense and uncheck items for the next market
  state.set(current => {
    const uncheckAll = (current.market?.items || []).map(i => ({ ...i, checked: false }));
    return {
      ...current,
      selectedMonth: expenseMonthKey,
      currentMonth: (typeof getMonthLabel === 'function') ? getMonthLabel(expenseMonthKey) : expenseMonthKey,
      expenses: [newExpense, ...(current.expenses || [])],
      market: {
        ...current.market,
        items: uncheckAll
      }
    };
  });

  // 2. Sync to Supabase in background
  const sb = typeof getSupabase === 'function' ? getSupabase() : null;
  if (sb) {
    sb.from('expenses').insert([{
      descripcion: newExpense.descripcion,
      monto: newExpense.monto,
      categoria: 'Mercado',
      pagado_por: newExpense.pagado_por,
      tipo_gasto: newExpense.tipo_gasto,
      fecha: newExpense.fecha
    }]).then(({ error }) => {
      if (error) console.error('Error insertando gasto rápido de mercado en Supabase:', error);
    });

    sb.from('market_items').update({ checked: false }).neq('checked', false).then();
  }

  alert(`🎉 ¡Listo! Se añadió el mercado por ${formatCurrency(amount)} a los Gastos del Hogar.\n\n• Pagado por: ${payerName}\n• Cuota: Compartida proporcionalmente\n• Los productos se han desmarcado automáticamente para el próximo mercado.`);
}

// 3d. Cargar Lista Base de Despensa Sugerida (15 productos comunes)
const SUGGESTED_MARKET_ITEMS = [
  { name: 'Huevos AA x30', price: 18000, category: 'Lácteos' },
  { name: 'Pechuga de Pollo 1kg', price: 18500, category: 'Carnes' },
  { name: 'Carne Molida 500g', price: 14000, category: 'Carnes' },
  { name: 'Arroz Diana 5kg', price: 22000, category: 'Despensa' },
  { name: 'Aceite Vegetal 1L', price: 12000, category: 'Despensa' },
  { name: 'Leche entera x6 bolsa', price: 21000, category: 'Lácteos' },
  { name: 'Queso Tajado Colanta', price: 9500, category: 'Lácteos' },
  { name: 'Pan Tajado', price: 7500, category: 'Despensa' },
  { name: 'Café Sello Rojo 500g', price: 15000, category: 'Despensa' },
  { name: 'Azúcar / Panela', price: 5500, category: 'Despensa' },
  { name: 'Frutas y Verduras surtidas', price: 35000, category: 'Verduras' },
  { name: 'Papel Higiénico x12', price: 18000, category: 'Aseo' },
  { name: 'Detergente y Lavaplatos', price: 16000, category: 'Aseo' },
  { name: 'Suavizante de Ropa', price: 11000, category: 'Aseo' },
  { name: 'Galletas y Snacks', price: 8000, category: 'Despensa' }
];

function loadSuggestedMarketItems() {
  const currentItems = state.get().market?.items || [];
  if (currentItems.length > 0) {
    if (!confirm('¿Deseas agregar los 15 productos sugeridos de la despensa a tu lista actual?')) {
      return;
    }
  }

  const baseTime = Date.now();
  const newItems = SUGGESTED_MARKET_ITEMS.map((item, idx) => ({
    id: baseTime + idx,
    name: item.name,
    price: item.price,
    category: item.category,
    checked: false
  }));

  state.set(current => ({
    ...current,
    market: {
      ...current.market,
      items: [...(current.market?.items || []), ...newItems]
    }
  }));

  const sb = typeof getSupabase === 'function' ? getSupabase() : null;
  if (sb) {
    sb.from('market_items').insert(newItems.map(i => ({
      name: i.name,
      price: i.price,
      category: i.category,
      checked: false
    }))).then(({ error }) => {
      if (error) console.error('Error insertando productos base en Supabase:', error);
    });
  }
}

// 4. Savings Goal Modal Handlers (Add, Edit, Delete & Deposit)
function openSavingsModal(goalId = null) {
  const modal = document.getElementById('modal-savings');
  if (!modal) return;

  const titleEl = document.getElementById('modal-savings-title');
  const submitBtn = document.getElementById('modal-savings-submit-btn');
  const idInput = document.getElementById('savings-goal-id');
  const titleInput = document.getElementById('savings-goal-title');
  const targetInput = document.getElementById('savings-goal-target');
  const iconInput = document.getElementById('savings-goal-icon');

  if (goalId !== null && goalId !== undefined && goalId !== '') {
    // Edit mode
    const goals = state.get().savingsGoals || [];
    const goal = goals.find(g => String(g.id) === String(goalId));
    if (goal) {
      if (titleEl) titleEl.textContent = '✏️ Modificar Meta de Ahorro';
      if (submitBtn) submitBtn.textContent = 'Guardar Cambios';
      if (idInput) idInput.value = goal.id;
      if (titleInput) titleInput.value = goal.title || '';
      if (targetInput) targetInput.value = goal.target || '';
      if (iconInput) iconInput.value = goal.icon || '🏠';
    }
  } else {
    // Create mode
    if (titleEl) titleEl.textContent = '🎯 Crear Nueva Meta de Ahorro';
    if (submitBtn) submitBtn.textContent = 'Guardar Meta';
    if (idInput) idInput.value = '';
    if (titleInput) titleInput.value = '';
    if (targetInput) targetInput.value = '';
    if (iconInput) iconInput.value = '🏠';
  }

  modal.classList.add('active');
}

function closeSavingsModal() {
  const modal = document.getElementById('modal-savings');
  if (modal) modal.classList.remove('active');
}

function handleNewSavingsGoalSubmit(event) {
  event.preventDefault();
  const form = event.target;
  const goalId = form.goalId ? form.goalId.value : '';
  const title = (form.title.value || '').trim();
  const target = parseInt(form.target.value, 10) || 1000000;
  const icon = form.icon.value;

  if (!title || target <= 0) return;

  const sbSavings = typeof getSupabase === 'function' ? getSupabase() : null;

  if (goalId) {
    // UPDATE existing goal
    const idToUpdate = isNaN(Number(goalId)) ? goalId : Number(goalId);
    state.set(current => ({
      ...current,
      savingsGoals: (current.savingsGoals || []).map(g => {
        if (String(g.id) === String(goalId)) {
          return { ...g, title, target, icon };
        }
        return g;
      })
    }));

    if (sbSavings) {
      sbSavings.from('savings_goals').update({
        title,
        target,
        icon
      }).eq('id', idToUpdate).then(({ error }) => {
        if (error) console.error('Error actualizando meta de ahorro en Supabase:', error);
      });
    }
  } else {
    // INSERT new goal
    const newGoal = {
      id: Date.now(),
      title,
      current: 0,
      target,
      icon
    };

    state.set(current => ({
      ...current,
      savingsGoals: [...(current.savingsGoals || []), newGoal]
    }));

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
  }

  form.reset();
  closeSavingsModal();
}

function deleteSavingsGoal(id) {
  const goals = state.get().savingsGoals || [];
  const goal = goals.find(g => String(g.id) === String(id));
  const goalTitle = goal ? goal.title : 'esta meta';

  if (!confirm(`¿Eliminar la meta de ahorro "${goalTitle}"?`)) {
    return;
  }

  const idNum = isNaN(Number(id)) ? id : Number(id);

  state.set(current => ({
    ...current,
    savingsGoals: (current.savingsGoals || []).filter(g => String(g.id) !== String(id))
  }));

  const sbSavings = typeof getSupabase === 'function' ? getSupabase() : null;
  if (sbSavings) {
    sbSavings.from('savings_goals').delete().eq('id', idNum).then(({ error }) => {
      if (error) console.error('Error eliminando meta de ahorro de Supabase:', error);
    });
  }
}

// 4b. Savings Deposit Modal Handlers
function openSavingsDepositModal(goalId) {
  const modal = document.getElementById('modal-savings-deposit');
  if (!modal) return;

  const goals = state.get().savingsGoals || [];
  const goal = goals.find(g => String(g.id) === String(goalId));
  if (!goal) return;

  const idInput = document.getElementById('deposit-goal-id');
  const titleEl = document.getElementById('deposit-goal-title');
  const currentEl = document.getElementById('deposit-goal-current');
  const targetEl = document.getElementById('deposit-goal-target');
  const amountInput = document.getElementById('deposit-amount');

  if (idInput) idInput.value = goal.id;
  if (titleEl) titleEl.textContent = `${goal.icon || '🎯'} ${goal.title}`;
  if (currentEl) currentEl.textContent = formatCurrency(goal.current || 0);
  if (targetEl) targetEl.textContent = formatCurrency(goal.target || 0);
  if (amountInput) {
    amountInput.value = '';
    amountInput.placeholder = 'ej: 100000';
  }

  modal.classList.add('active');
  if (amountInput) setTimeout(() => amountInput.focus(), 100);
}

function closeSavingsDepositModal() {
  const modal = document.getElementById('modal-savings-deposit');
  if (modal) modal.classList.remove('active');
}

function handleSavingsDepositSubmit(event) {
  event.preventDefault();
  const form = event.target;
  const goalId = form.goalId ? form.goalId.value : '';
  const amount = parseInt(form.amount.value, 10) || 0;

  if (!goalId || amount <= 0) {
    alert('Ingresa un monto de abono válido.');
    return;
  }

  const goals = state.get().savingsGoals || [];
  const goal = goals.find(g => String(g.id) === String(goalId));
  if (!goal) return;

  const updatedCurrent = (Number(goal.current) || 0) + amount;
  const idToUpdate = isNaN(Number(goalId)) ? goalId : Number(goalId);

  state.set(current => ({
    ...current,
    savingsGoals: (current.savingsGoals || []).map(g => {
      if (String(g.id) === String(goalId)) {
        return { ...g, current: updatedCurrent };
      }
      return g;
    })
  }));

  const sbSavings = typeof getSupabase === 'function' ? getSupabase() : null;
  if (sbSavings) {
    sbSavings.from('savings_goals').update({ current: updatedCurrent }).eq('id', idToUpdate).then(({ error }) => {
      if (error) console.error('Error guardando abono en Supabase:', error);
    });
  }

  closeSavingsDepositModal();
  alert(`🎉 ¡Abonaste ${formatCurrency(amount)} a "${goal.title}" con éxito!`);
}

// 5. Memory Photo Modal Handlers (Add, Edit, Delete)
function openMemoryModal(memId = null) {
  const modal = document.getElementById('modal-memory');
  if (!modal) return;

  const titleEl = document.getElementById('modal-memory-title');
  const submitBtn = document.getElementById('modal-memory-submit-btn');
  const idInput = document.getElementById('memory-id');
  const titleInput = document.getElementById('memory-title');
  const dateInput = document.getElementById('memory-date');
  const descInput = document.getElementById('memory-desc');
  const imgInput = document.getElementById('memory-image');

  if (memId !== null && memId !== undefined && memId !== '') {
    // Edit mode
    const memories = state.get().memories || [];
    const mem = memories.find(m => String(m.id) === String(memId));
    if (mem) {
      if (titleEl) titleEl.textContent = '✏️ Modificar Recuerdo';
      if (submitBtn) submitBtn.textContent = 'Guardar Cambios';
      if (idInput) idInput.value = mem.id;
      if (titleInput) titleInput.value = mem.title || '';
      if (dateInput) dateInput.value = mem.date || '';
      if (descInput) descInput.value = mem.desc || '';
      if (imgInput) imgInput.value = mem.image || '';
    }
  } else {
    // Create mode
    if (titleEl) titleEl.textContent = '📸 Guardar Nuevo Recuerdo del Hogar';
    if (submitBtn) submitBtn.textContent = 'Guardar Recuerdo';
    if (idInput) idInput.value = '';
    if (titleInput) titleInput.value = '';
    if (dateInput) dateInput.value = (typeof formatDateToISO === 'function') ? formatDateToISO(new Date()) : new Date().toISOString().split('T')[0];
    if (descInput) descInput.value = '';
    if (imgInput) imgInput.value = 'https://images.unsplash.com/photo-1518895949257-7621c3c786d7?auto=format&fit=crop&w=600&q=80';
  }

  modal.classList.add('active');
}

function closeMemoryModal() {
  const modal = document.getElementById('modal-memory');
  if (modal) modal.classList.remove('active');
}

function handleNewMemorySubmit(event) {
  event.preventDefault();
  const form = event.target;
  const memoryId = form.memoryId ? form.memoryId.value : '';
  const title = (form.title.value || '').trim();
  const date = (form.date.value || '').trim() || 'Hoy';
  const desc = (form.desc.value || '').trim();
  const image = (form.image.value || '').trim();

  if (!title || !desc) return;

  const sbMemory = typeof getSupabase === 'function' ? getSupabase() : null;

  if (memoryId) {
    // UPDATE existing memory
    const idToUpdate = isNaN(Number(memoryId)) ? memoryId : Number(memoryId);
    state.set(current => ({
      ...current,
      memories: (current.memories || []).map(m => {
        if (String(m.id) === String(memoryId)) {
          return { ...m, title, date, desc, image };
        }
        return m;
      })
    }));

    if (sbMemory) {
      sbMemory.from('memories').update({
        title,
        date,
        description: desc,
        image_url: image
      }).eq('id', idToUpdate).then(({ error }) => {
        if (error) console.error('Error actualizando recuerdo en Supabase:', error);
      });
    }
  } else {
    // INSERT new memory
    const newMemory = {
      id: Date.now(),
      title,
      date,
      desc,
      image: image || 'https://images.unsplash.com/photo-1518895949257-7621c3c786d7?auto=format&fit=crop&w=600&q=80'
    };

    state.set(current => ({
      ...current,
      memories: [newMemory, ...(current.memories || [])]
    }));

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
  }

  form.reset();
  closeMemoryModal();
}

function deleteMemory(id) {
  const memories = state.get().memories || [];
  const mem = memories.find(m => String(m.id) === String(id));
  const title = mem ? mem.title : 'este recuerdo';

  if (!confirm(`¿Eliminar permanentemente "${title}"?`)) {
    return;
  }

  const idNum = isNaN(Number(id)) ? id : Number(id);

  state.set(current => ({
    ...current,
    memories: (current.memories || []).filter(m => String(m.id) !== String(id))
  }));

  const sbMemory = typeof getSupabase === 'function' ? getSupabase() : null;
  if (sbMemory) {
    sbMemory.from('memories').delete().eq('id', idNum).then(({ error }) => {
      if (error) console.error('Error eliminando recuerdo de Supabase:', error);
    });
  }
}

// 5b. Household Motto / Quote Handlers
function openQuoteModal() {
  const modal = document.getElementById('modal-quote');
  if (!modal) return;
  const quoteInput = document.getElementById('quote-input');
  if (quoteInput) {
    quoteInput.value = state.get().quote || '';
  }
  modal.classList.add('active');
  if (quoteInput) setTimeout(() => quoteInput.focus(), 100);
}

function closeQuoteModal() {
  const modal = document.getElementById('modal-quote');
  if (modal) modal.classList.remove('active');
}

function handleQuoteSubmit(event) {
  event.preventDefault();
  const form = event.target;
  const newQuote = (form.quote.value || '').trim();
  if (!newQuote) return;

  state.set(current => ({
    ...current,
    quote: newQuote
  }));

  const sb = typeof getSupabase === 'function' ? getSupabase() : null;
  if (sb) {
    sb.from('household_settings').upsert({
      id: 'couple_quote',
      data: { quote: newQuote, updated_at: new Date().toISOString() }
    }).then(({ error }) => {
      if (error) console.error('Error actualizando frase en Supabase:', error);
    });
  }

  closeQuoteModal();
}

// 5c. Key Calendar Payment Date Handlers
function openCalendarPaymentModal(paymentId = null) {
  const modal = document.getElementById('modal-calendar-payment');
  if (!modal) return;

  const titleEl = document.getElementById('modal-calendar-title');
  const idInput = document.getElementById('calendar-payment-id');
  const dayInput = document.getElementById('calendar-payment-day');
  const nameInput = document.getElementById('calendar-payment-title');
  const amountInput = document.getElementById('calendar-payment-amount');

  if (paymentId !== null && paymentId !== undefined && paymentId !== '') {
    // Edit mode
    const payments = state.get().calendarPayments || [];
    const pay = payments.find(p => String(p.id) === String(paymentId));
    if (pay) {
      if (titleEl) titleEl.textContent = '✏️ Modificar Fecha de Pago';
      if (idInput) idInput.value = pay.id;
      if (dayInput) dayInput.value = pay.day;
      if (nameInput) nameInput.value = pay.title;
      if (amountInput) amountInput.value = pay.amount;
    }
  } else {
    // Create mode
    if (titleEl) titleEl.textContent = '🗓️ Fecha Clave de Pago Mensual';
    if (idInput) idInput.value = '';
    if (dayInput) dayInput.value = new Date().getDate();
    if (nameInput) nameInput.value = '';
    if (amountInput) amountInput.value = '';
  }

  modal.classList.add('active');
}

function closeCalendarPaymentModal() {
  const modal = document.getElementById('modal-calendar-payment');
  if (modal) modal.classList.remove('active');
}

function handleCalendarPaymentSubmit(event) {
  event.preventDefault();
  const form = event.target;
  const paymentId = form.paymentId ? form.paymentId.value : '';
  const day = Math.min(31, Math.max(1, parseInt(form.day.value, 10) || 1));
  const title = (form.title.value || '').trim();
  const amount = Math.max(0, parseInt(form.amount.value, 10) || 0);

  if (!title) return;

  let updatedPayments = [];
  const currentPayments = state.get().calendarPayments || [];

  if (paymentId) {
    // UPDATE
    updatedPayments = currentPayments.map(p => {
      if (String(p.id) === String(paymentId)) {
        return { ...p, day, title, amount };
      }
      return p;
    });
  } else {
    // INSERT
    const newPay = {
      id: 'pay_' + Date.now(),
      day,
      title,
      amount,
      status: 'pending'
    };
    updatedPayments = [...currentPayments, newPay];
  }

  // Sort by day of month
  updatedPayments.sort((a, b) => a.day - b.day);

  state.set(current => ({
    ...current,
    calendarPayments: updatedPayments
  }));

  const sb = typeof getSupabase === 'function' ? getSupabase() : null;
  if (sb) {
    sb.from('household_settings').upsert({
      id: 'calendar_payments',
      data: { payments: updatedPayments, updated_at: new Date().toISOString() }
    }).then(({ error }) => {
      if (error) console.error('Error guardando fecha de pago en Supabase:', error);
    });
  }

  form.reset();
  closeCalendarPaymentModal();
}

function toggleCalendarPaymentStatus(id) {
  const currentPayments = state.get().calendarPayments || [];
  const updatedPayments = currentPayments.map(p => {
    if (String(p.id) === String(id)) {
      const isPaid = p.status === 'paid' || p.status === 'pagado';
      return { ...p, status: isPaid ? 'pending' : 'paid' };
    }
    return p;
  });

  state.set(current => ({
    ...current,
    calendarPayments: updatedPayments
  }));

  const sb = typeof getSupabase === 'function' ? getSupabase() : null;
  if (sb) {
    sb.from('household_settings').upsert({
      id: 'calendar_payments',
      data: { payments: updatedPayments, updated_at: new Date().toISOString() }
    }).then(({ error }) => {
      if (error) console.error('Error alternando estado de fecha de pago en Supabase:', error);
    });
  }
}

function deleteCalendarPayment(id) {
  const currentPayments = state.get().calendarPayments || [];
  const pay = currentPayments.find(p => String(p.id) === String(id));
  const payTitle = pay ? pay.title : 'este recordatorio';

  if (!confirm(`¿Eliminar el recordatorio "${payTitle}"?`)) {
    return;
  }

  const updatedPayments = currentPayments.filter(p => String(p.id) !== String(id));

  state.set(current => ({
    ...current,
    calendarPayments: updatedPayments
  }));

  const sb = typeof getSupabase === 'function' ? getSupabase() : null;
  if (sb) {
    sb.from('household_settings').upsert({
      id: 'calendar_payments',
      data: { payments: updatedPayments, updated_at: new Date().toISOString() }
    }).then(({ error }) => {
      if (error) console.error('Error eliminando fecha de pago en Supabase:', error);
    });
  }
}

// 5d. Couple Life Goals Handlers
function openLifeGoalModal(lifeGoalId = null) {
  const modal = document.getElementById('modal-life-goal');
  if (!modal) return;

  const titleEl = document.getElementById('modal-life-goal-title');
  const idInput = document.getElementById('life-goal-id');
  const titleInput = document.getElementById('life-goal-title');

  if (lifeGoalId !== null && lifeGoalId !== undefined && lifeGoalId !== '') {
    // Edit mode
    const goals = state.get().lifeGoals || [];
    const goal = goals.find(g => String(g.id) === String(lifeGoalId));
    if (goal) {
      if (titleEl) titleEl.textContent = '✏️ Modificar Objetivo de Pareja';
      if (idInput) idInput.value = goal.id;
      if (titleInput) titleInput.value = goal.title;
    }
  } else {
    // Create mode
    if (titleEl) titleEl.textContent = '✨ Nuevo Objetivo de Pareja';
    if (idInput) idInput.value = '';
    if (titleInput) titleInput.value = '';
  }

  modal.classList.add('active');
  if (titleInput) setTimeout(() => titleInput.focus(), 100);
}

function closeLifeGoalModal() {
  const modal = document.getElementById('modal-life-goal');
  if (modal) modal.classList.remove('active');
}

function handleLifeGoalSubmit(event) {
  event.preventDefault();
  const form = event.target;
  const lifeGoalId = form.lifeGoalId ? form.lifeGoalId.value : '';
  const title = (form.title.value || '').trim();

  if (!title) return;

  const currentGoals = state.get().lifeGoals || [];
  let updatedGoals = [];

  if (lifeGoalId) {
    // UPDATE
    updatedGoals = currentGoals.map(g => {
      if (String(g.id) === String(lifeGoalId)) {
        return { ...g, title };
      }
      return g;
    });
  } else {
    // INSERT
    const newGoal = {
      id: 'goal_' + Date.now(),
      title,
      completed: false
    };
    updatedGoals = [...currentGoals, newGoal];
  }

  state.set(current => ({
    ...current,
    lifeGoals: updatedGoals
  }));

  const sb = typeof getSupabase === 'function' ? getSupabase() : null;
  if (sb) {
    sb.from('household_settings').upsert({
      id: 'life_goals',
      data: { goals: updatedGoals, updated_at: new Date().toISOString() }
    }).then(({ error }) => {
      if (error) console.error('Error guardando objetivo de pareja en Supabase:', error);
    });
  }

  form.reset();
  closeLifeGoalModal();
}

function toggleLifeGoalStatus(id) {
  const currentGoals = state.get().lifeGoals || [];
  const updatedGoals = currentGoals.map(g => {
    if (String(g.id) === String(id)) {
      return { ...g, completed: !g.completed };
    }
    return g;
  });

  state.set(current => ({
    ...current,
    lifeGoals: updatedGoals
  }));

  const sb = typeof getSupabase === 'function' ? getSupabase() : null;
  if (sb) {
    sb.from('household_settings').upsert({
      id: 'life_goals',
      data: { goals: updatedGoals, updated_at: new Date().toISOString() }
    }).then(({ error }) => {
      if (error) console.error('Error alternando objetivo en Supabase:', error);
    });
  }
}

function deleteLifeGoal(id) {
  const currentGoals = state.get().lifeGoals || [];
  const goal = currentGoals.find(g => String(g.id) === String(id));
  const goalTitle = goal ? goal.title : 'este objetivo';

  if (!confirm(`¿Eliminar el objetivo "${goalTitle}"?`)) {
    return;
  }

  const updatedGoals = currentGoals.filter(g => String(g.id) !== String(id));

  state.set(current => ({
    ...current,
    lifeGoals: updatedGoals
  }));

  const sb = typeof getSupabase === 'function' ? getSupabase() : null;
  if (sb) {
    sb.from('household_settings').upsert({
      id: 'life_goals',
      data: { goals: updatedGoals, updated_at: new Date().toISOString() }
    }).then(({ error }) => {
      if (error) console.error('Error eliminando objetivo de pareja en Supabase:', error);
    });
  }
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

// 7. Category Budgets Customizer Modal Handlers
const CATEGORY_ICONS = {
  'Arriendo': '🏠',
  'Servicios': '💡',
  'Mercado': '🛒',
  'Comida fuera': '🍔',
  'Transporte': '🚌',
  'Internet/celular': '📱',
  'Aseo': '🧴',
  'Entretenimiento': '🎮',
  'Gastos personales': '🩷',
  'Salud': '🏥',
  'Mascotas': '🐾',
  'Educación': '📚',
  'Ropa': '👕',
  'Viajes': '✈️',
  'Otros': '📦'
};

function getCategoryIcon(catName) {
  return CATEGORY_ICONS[catName] || '🏷️';
}

function openCategoryBudgetsModal(focusCatName = null) {
  renderCategoryBudgetsList(focusCatName);
  updateCategoryBudgetsPreview();
  const modal = document.getElementById('modal-category-budgets');
  if (modal) modal.classList.add('active');

  if (focusCatName) {
    setTimeout(() => {
      const targetInput = document.querySelector(`input[data-cat-name="${focusCatName}"]`);
      if (targetInput) {
        targetInput.focus();
        targetInput.select();
        targetInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 120);
  }
}

function closeCategoryBudgetsModal() {
  const modal = document.getElementById('modal-category-budgets');
  if (modal) modal.classList.remove('active');
}

function renderCategoryBudgetsList(highlightCat = null) {
  const listContainer = document.getElementById('category-budgets-list');
  if (!listContainer) return;

  const currentBudgets = state.get().categoryBudgets || {};
  const entries = Object.entries(currentBudgets);

  if (entries.length === 0) {
    listContainer.innerHTML = '<div style="color: var(--text-muted); font-size: 0.85rem; text-align: center; padding: 1rem;">No hay categorías configuradas. Agrega una abajo.</div>';
    return;
  }

  listContainer.innerHTML = entries.map(([catName, limit]) => {
    const icon = getCategoryIcon(catName);
    const isHighlighted = highlightCat && highlightCat === catName;
    return `
      <div 
        class="category-budget-row" 
        data-category-row="${catName}"
        style="display: flex; align-items: center; justify-content: space-between; gap: 0.75rem; background: ${isHighlighted ? 'rgba(var(--primary-rgb, 236, 72, 153), 0.12)' : 'var(--bg-glass)'}; padding: 0.65rem 0.85rem; border-radius: var(--radius-md); border: 1px solid ${isHighlighted ? 'var(--primary)' : 'var(--border-glass)'}; transition: all var(--transition-fast);"
      >
        <div style="font-weight: 600; font-size: 0.9rem; flex: 1; word-break: break-word; display: flex; align-items: center; gap: 0.4rem;">
          <span>${icon}</span>
          <span class="cat-row-name">${catName}</span>
        </div>
        <div style="display: flex; align-items: center; gap: 0.5rem;">
          <div style="display: flex; align-items: center; gap: 0.25rem;">
            <span style="font-size: 0.8rem; color: var(--text-muted); font-weight: 600;">$</span>
            <input 
              type="number" 
              data-cat-name="${catName}" 
              value="${limit}" 
              class="form-input cat-budget-input" 
              style="width: 125px; font-size: 0.9rem; font-weight: 600; padding: 0.35rem 0.55rem; text-align: right;" 
              min="0" 
              step="10000"
              oninput="updateCategoryBudgetsPreview()"
            >
          </div>
          <button 
            type="button" 
            class="btn btn-secondary btn-sm" 
            onclick="removeCategoryRow('${catName.replace(/'/g, "\\'")}')" 
            title="Eliminar categoría ${catName}" 
            style="padding: 4px 7px; color: var(--expense-color); font-size: 0.75rem;"
          >
            🗑️
          </button>
        </div>
      </div>
    `;
  }).join('');
}

function addNewCategoryRow() {
  const nameInput = document.getElementById('new-cat-name');
  const limitInput = document.getElementById('new-cat-limit');
  if (!nameInput) return;

  const catName = nameInput.value.trim();
  const limit = Math.max(0, parseInt(limitInput?.value || 0, 10) || 0);

  if (!catName) {
    alert('Ingresa el nombre de la nueva categoría.');
    nameInput.focus();
    return;
  }

  // Check if already exists in currently rendered rows
  const existing = document.querySelector(`.category-budget-row[data-category-row="${catName}"]`);
  if (existing) {
    alert(`La categoría "${catName}" ya existe en la lista.`);
    return;
  }

  const listContainer = document.getElementById('category-budgets-list');
  if (!listContainer) return;

  const icon = getCategoryIcon(catName);
  const rowHtml = `
    <div 
      class="category-budget-row" 
      data-category-row="${catName}"
      style="display: flex; align-items: center; justify-content: space-between; gap: 0.75rem; background: rgba(16, 185, 129, 0.08); padding: 0.65rem 0.85rem; border-radius: var(--radius-md); border: 1px solid var(--income-color); transition: all var(--transition-fast);"
    >
      <div style="font-weight: 600; font-size: 0.9rem; flex: 1; word-break: break-word; display: flex; align-items: center; gap: 0.4rem;">
        <span>${icon}</span>
        <span class="cat-row-name">${catName}</span>
      </div>
      <div style="display: flex; align-items: center; gap: 0.5rem;">
        <div style="display: flex; align-items: center; gap: 0.25rem;">
          <span style="font-size: 0.8rem; color: var(--text-muted); font-weight: 600;">$</span>
          <input 
            type="number" 
            data-cat-name="${catName}" 
            value="${limit}" 
            class="form-input cat-budget-input" 
            style="width: 125px; font-size: 0.9rem; font-weight: 600; padding: 0.35rem 0.55rem; text-align: right;" 
            min="0" 
            step="10000"
            oninput="updateCategoryBudgetsPreview()"
          >
        </div>
        <button 
          type="button" 
          class="btn btn-secondary btn-sm" 
          onclick="removeCategoryRow('${catName.replace(/'/g, "\\'")}')" 
          title="Eliminar categoría ${catName}" 
          style="padding: 4px 7px; color: var(--expense-color); font-size: 0.75rem;"
        >
          🗑️
        </button>
      </div>
    </div>
  `;

  listContainer.insertAdjacentHTML('beforeend', rowHtml);
  nameInput.value = '';
  if (limitInput) limitInput.value = '';

  updateCategoryBudgetsPreview();
}

function removeCategoryRow(catName) {
  if (!confirm(`¿Eliminar la categoría "${catName}" de los presupuestos?`)) {
    return;
  }
  const row = document.querySelector(`.category-budget-row[data-category-row="${catName}"]`);
  if (row) {
    row.remove();
    updateCategoryBudgetsPreview();
  }
}

function updateCategoryBudgetsPreview() {
  const inputs = document.querySelectorAll('.cat-budget-input');
  let total = 0;
  inputs.forEach(input => {
    total += Math.max(0, parseInt(input.value, 10) || 0);
  });

  const previewTotal = document.getElementById('preview-total-budgeted');
  if (previewTotal) previewTotal.textContent = formatCurrency(total);

  const current = state.get();
  const incomeA = current.userA?.income || 0;
  const incomeB = current.userB?.income || 0;
  const totalIncome = incomeA + incomeB;

  const previewIncome = document.getElementById('preview-household-income');
  if (previewIncome) {
    const pct = totalIncome > 0 ? ((total / totalIncome) * 100).toFixed(0) : 0;
    previewIncome.textContent = `${formatCurrency(totalIncome)} (${pct}% asignado)`;
  }
}

function handleCategoryBudgetsSubmit(event) {
  event.preventDefault();
  const inputs = document.querySelectorAll('.cat-budget-input');
  const updatedBudgets = {};

  inputs.forEach(input => {
    const catName = input.getAttribute('data-cat-name');
    if (catName) {
      const val = Math.max(0, parseInt(input.value, 10) || 0);
      updatedBudgets[catName] = val;
    }
  });

  if (Object.keys(updatedBudgets).length === 0) {
    alert('Debes tener al menos una categoría de presupuesto.');
    return;
  }

  // 1. Update State
  state.set(current => ({
    ...current,
    categoryBudgets: updatedBudgets
  }));

  // 2. Sync to Supabase household_settings
  const sb = typeof getSupabase === 'function' ? getSupabase() : null;
  if (sb) {
    sb.from('household_settings').upsert({
      id: 'category_budgets',
      data: updatedBudgets,
      updated_at: new Date().toISOString()
    }).then(({ error }) => {
      if (error) console.error('Error guardando presupuestos en Supabase:', error);
    });
  }

  // 3. Update expense category select options if open
  updateExpenseCategoryOptions();

  closeCategoryBudgetsModal();
}

function updateExpenseCategoryOptions() {
  const select = document.getElementById('expense-category-select');
  if (!select) return;

  const currentBudgets = state.get().categoryBudgets || {};
  const catNames = Object.keys(currentBudgets);

  const options = catNames.map(cat => {
    const icon = getCategoryIcon(cat);
    return `<option value="${cat}">${icon} ${cat}</option>`;
  });

  if (!catNames.includes('Gastos personales')) {
    options.push('<option value="Gastos personales">🩷 Gastos personales</option>');
  }
  if (!catNames.includes('Otros')) {
    options.push('<option value="Otros">📦 Otros</option>');
  }

  select.innerHTML = options.join('');
}
