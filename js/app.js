/* ==========================================================================
   HOUSEHOLD - Main Application Router & Controller
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  // Subscribe to reactive state updates
  state.subscribe(renderApp);

  // Initial render
  renderApp(state.get());

  // Set up event listeners for navigation items
  setupNavigation();
});

function renderApp(appState) {
  const container = document.getElementById('main-view-container');
  if (!container) return;

  // Update navigation visual selection
  updateActiveNavStyles(appState.activeTab);

  // Render appropriate view module
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
    case 'calendario':
      container.innerHTML = renderCalendarModule(appState);
      break;
    case 'memorias':
      container.innerHTML = renderMemoriesModule(appState);
      break;
    case 'logros':
      container.innerHTML = renderAchievementsModule(appState);
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

// Global modal form submit handler for registering new expense
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
