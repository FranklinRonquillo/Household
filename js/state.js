/* ==========================================================================
   HOUSEHOLD - Central State Management & Mock Data Preload
   ========================================================================== */

const INITIAL_STATE = {
  activeTab: 'dashboard',
  currentMonth: 'Septiembre 2026',

  // Couple Profile & Incomes
  userA: { id: 'person_a', name: 'Fran', income: 3500000, color: '#f472b6' },
  userB: { id: 'person_b', name: 'Yox', income: 2500000, color: '#8b5cf6' },

  // Motivation & Gamification
  quote: "Cada peso que cuidamos nos acerca a lo que queremos. ❤️",
  savingsStreak: 12,
  couplePoints: 1250,

  // Budget Limits by Category
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

  // Registered Expenses (Explicit Payer and Type)
  expenses: [
    { id: 1, categoria: 'Arriendo', descripcion: 'Pago del apartamento', monto: 900000, pagado_por: 'person_a', tipo_gasto: 'compartido', fecha: '2026-09-01' },
    { id: 2, categoria: 'Mercado', descripcion: 'Mercado principal Éxito', monto: 500000, pagado_por: 'person_b', tipo_gasto: 'compartido', fecha: '2026-09-05' },
    { id: 3, categoria: 'Servicios', descripcion: 'Luz y agua EPM', monto: 210000, pagado_por: 'person_a', tipo_gasto: 'compartido', fecha: '2026-09-08' },
    { id: 4, categoria: 'Transporte', descripcion: 'Gasolina carro', monto: 140000, pagado_por: 'person_b', tipo_gasto: 'compartido', fecha: '2026-09-12' },
    { id: 5, categoria: 'Comida fuera', descripcion: 'Cena de aniversario', monto: 120000, pagado_por: 'person_a', tipo_gasto: 'compartido', fecha: '2026-09-15' },
    { id: 6, categoria: 'Gastos personales', descripcion: 'Ropa personal Fran', monto: 150000, pagado_por: 'person_a', tipo_gasto: 'personal_a', fecha: '2026-09-18' },
    { id: 7, categoria: 'Gastos personales', descripcion: 'Maquillaje y cuidado Yox', monto: 110000, pagado_por: 'person_b', tipo_gasto: 'personal_b', fecha: '2026-09-20' }
  ],

  // Smart Market List
  market: {
    budget: 250000,
    items: [
      { id: 101, name: 'Arroz 5kg', price: 22000, category: 'Despensa', checked: true },
      { id: 102, name: 'Panal de Huevos (30)', price: 18500, category: 'Despensa', checked: true },
      { id: 103, name: 'Pechuga de Pollo 2kg', price: 34000, category: 'Carnes', checked: true },
      { id: 104, name: 'Leche Alquería (6 pack)', price: 28000, category: 'Lácteos', checked: true },
      { id: 105, name: 'Verduras variadas y frutas', price: 45000, category: 'Verduras', checked: true },
      { id: 106, name: 'Detergente + Suavizante Aseo', price: 42000, category: 'Aseo', checked: true },
      { id: 107, name: 'Café molido especial', price: 19000, category: 'Despensa', checked: false },
      { id: 108, name: 'Aceite de Oliva', price: 29000, category: 'Despensa', checked: false }
    ]
  },

  // Savings Goals
  savingsGoals: [
    { id: 201, title: 'Comprar nuestra casa 🏠', current: 2450000, target: 10000000, icon: '🏠' },
    { id: 202, title: 'Fondo de emergencia 🆘', current: 1800000, target: 3000000, icon: '🆘' },
    { id: 203, title: 'Viaje a la playa ✈️', current: 900000, target: 2500000, icon: '✈️' },
    { id: 204, title: 'Renovar muebles sala 🛋️', current: 400000, target: 1500000, icon: '🛋️' }
  ],

  // Debts & Pending Payments
  debts: [
    { id: 301, concept: 'Cuota administración apto', amount: 180000, dueDate: '2026-10-05', type: 'Servicio', status: 'pendiente' },
    { id: 302, concept: 'Internet de la casa', amount: 115000, dueDate: '2026-10-07', type: 'Servicio', status: 'pendiente' },
    { id: 303, concept: 'Préstamo entre nosotros (Cena previa)', amount: 50000, dueDate: '2026-10-10', type: 'Pareja', status: 'pendiente' }
  ],

  // Financial Calendar Recurring Payments
  calendarPayments: [
    { day: 1, title: 'Pago del Arriendo 🏠', amount: 900000, status: 'paid' },
    { day: 5, title: 'Servicio de Internet 📶', amount: 115000, status: 'pending' },
    { day: 10, title: 'Mercado Principal 🛒', amount: 500000, status: 'pending' },
    { day: 15, title: 'Pago de Servicios (Luz/Agua) 💡', amount: 210000, status: 'pending' }
  ],

  // Life Goals (Non-financial)
  lifeGoals: [
    { id: 401, title: 'Mudarnos al nuevo apartamento', completed: true, date: 'Mayo 2026' },
    { id: 402, title: 'Ahorrar $10 millones juntos', completed: false, progress: 24 },
    { id: 403, title: 'Viajar juntos al mar', completed: false, progress: 36 },
    { id: 404, title: 'Crear nuestro emprendimiento', completed: false, progress: 10 }
  ],

  // Achievements & Trophies
  achievements: [
    { title: 'Primer mes viviendo juntos 🏆', date: 'Mayo 2026', icon: '🔑' },
    { title: 'Primer $1.000.000 ahorrado 🏆', date: 'Julio 2026', icon: '💰' },
    { title: 'Mes sin exceder presupuesto 🏆', date: 'Agosto 2026', icon: '🎯' },
    { title: 'Racha de 10 días ordenados 🏆', date: 'Septiembre 2026', icon: '🔥' }
  ],

  // Memories Album
  memories: [
    { 
      id: 501, 
      title: 'Primera compra para la casa 🛋️', 
      date: '15 Mayo 2026', 
      desc: 'El día que compramos el primer juego de sábanas y los platos del hogar.', 
      emoji: '🏠',
      image: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=600&q=80'
    },
    { 
      id: 502, 
      title: 'Primer mercado juntos 🛒', 
      date: '20 Mayo 2026', 
      desc: 'Llenamos el carrito por primera vez sin saber cuánto pollo comprar.', 
      emoji: '🛒',
      image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=600&q=80'
    }
  ]
};

// Global reactive State Proxy
class StateManager {
  constructor() {
    this.data = INITIAL_STATE;
    localStorage.setItem('household_state', JSON.stringify(this.data));
    this.listeners = [];
  }

  get() {
    return this.data;
  }

  set(updater) {
    if (typeof updater === 'function') {
      this.data = updater(this.data);
    } else {
      this.data = { ...this.data, ...updater };
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
}

const state = new StateManager();
