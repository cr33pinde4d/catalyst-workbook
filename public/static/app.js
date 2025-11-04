// State management
const state = {
  user: null,
  token: localStorage.getItem('catalyst_token'),
  currentView: 'login',
  trainingDays: [],
  currentDay: null,
  currentDaySteps: [],
  currentStep: null,
  userProgress: [],
  userResponses: {}
};

// API configuration
const API_BASE = '/api';
axios.defaults.baseURL = API_BASE;

// Set auth token if exists
if (state.token) {
  axios.defaults.headers.common['Authorization'] = `Bearer ${state.token}`;
}

// API calls
const api = {
  async register(email, name, password) {
    const { data } = await axios.post('/auth/register', { email, name, password });
    return data;
  },
  
  async login(email, password) {
    const { data } = await axios.post('/auth/login', { email, password });
    return data;
  },
  
  async getMe() {
    const { data } = await axios.get('/auth/me');
    return data;
  },
  
  async getTrainingDays() {
    const { data } = await axios.get('/training/days');
    return data;
  },
  
  async getTrainingDay(dayId) {
    const { data } = await axios.get(`/training/days/${dayId}`);
    return data;
  },
  
  async getUserProgress() {
    const { data } = await axios.get('/progress');
    return data;
  },
  
  async getDayProgress(dayId) {
    const { data } = await axios.get(`/progress/day/${dayId}`);
    return data;
  },
  
  async updateStepProgress(stepId, status, dayId) {
    const { data } = await axios.post(`/progress/step/${stepId}`, { status, day_id: dayId });
    return data;
  },
  
  async getUserResponses() {
    const { data } = await axios.get('/responses');
    return data;
  },
  
  async getStepResponses(stepId) {
    const { data } = await axios.get(`/responses/step/${stepId}`);
    return data;
  },
  
  async saveResponse(dayId, stepId, fieldName, fieldValue) {
    const { data } = await axios.post('/responses', {
      day_id: dayId,
      step_id: stepId,
      field_name: fieldName,
      field_value: fieldValue
    });
    return data;
  },
  
  async batchSaveResponses(responses) {
    const { data } = await axios.post('/responses/batch', { responses });
    return data;
  }
};

// Auth functions
async function handleRegister(e) {
  e.preventDefault();
  const email = document.getElementById('reg-email').value;
  const name = document.getElementById('reg-name').value;
  const password = document.getElementById('reg-password').value;
  
  try {
    const data = await api.register(email, name, password);
    state.token = data.token;
    state.user = data.user;
    localStorage.setItem('catalyst_token', data.token);
    axios.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
    await loadUserData();
    showView('dashboard');
  } catch (error) {
    alert('Regisztráció sikertelen: ' + (error.response?.data?.error || error.message));
  }
}

async function handleLogin(e) {
  e.preventDefault();
  const email = document.getElementById('login-email').value;
  const password = document.getElementById('login-password').value;
  
  try {
    const data = await api.login(email, password);
    state.token = data.token;
    state.user = data.user;
    localStorage.setItem('catalyst_token', data.token);
    axios.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
    await loadUserData();
    showView('dashboard');
  } catch (error) {
    alert('Bejelentkezés sikertelen: ' + (error.response?.data?.error || error.message));
  }
}

function handleLogout() {
  state.token = null;
  state.user = null;
  state.trainingDays = [];
  state.userProgress = [];
  state.userResponses = {};
  localStorage.removeItem('catalyst_token');
  delete axios.defaults.headers.common['Authorization'];
  showView('login');
}

// Data loading
async function loadUserData() {
  try {
    const [daysData, progressData, responsesData] = await Promise.all([
      api.getTrainingDays(),
      api.getUserProgress(),
      api.getUserResponses()
    ]);
    
    state.trainingDays = daysData.days;
    state.userProgress = progressData.progress;
    
    // Convert responses to map for easy lookup
    state.userResponses = {};
    responsesData.responses.forEach(r => {
      const key = `${r.day_id}-${r.step_id}-${r.field_name}`;
      state.userResponses[key] = r.field_value;
    });
  } catch (error) {
    console.error('Error loading user data:', error);
  }
}

// View management
function showView(viewName, params = {}) {
  state.currentView = viewName;
  const app = document.getElementById('app');
  
  switch(viewName) {
    case 'login':
      app.innerHTML = renderLoginView();
      break;
    case 'dashboard':
      app.innerHTML = renderDashboardView();
      break;
    case 'day':
      state.currentDay = params.day;
      state.currentDaySteps = params.steps;
      app.innerHTML = renderDayView();
      break;
    case 'step':
      state.currentStep = params.step;
      app.innerHTML = renderStepView();
      break;
  }
}

// View renderers
function renderLoginView() {
  return `
    <div class="min-h-screen gradient-bg flex items-center justify-center p-4">
      <div class="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl shadow-2xl animate-slide-in">
        <div class="text-center">
          <h1 class="text-4xl font-bold text-gray-900 mb-2">
            <i class="fas fa-rocket text-purple-600"></i> Catalyst
          </h1>
          <p class="text-gray-600">Tanulási Napló</p>
        </div>
        
        <div class="space-y-4">
          <div id="login-form" class="space-y-4">
            <h2 class="text-2xl font-semibold text-gray-800">Bejelentkezés</h2>
            <form onsubmit="handleLogin(event)" class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input type="email" id="login-email" required
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent">
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Jelszó</label>
                <input type="password" id="login-password" required
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent">
              </div>
              <button type="submit" 
                class="w-full bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 transition">
                Bejelentkezés
              </button>
            </form>
            <button onclick="toggleAuthForm()" class="w-full text-purple-600 hover:text-purple-700">
              Nincs még fiókod? Regisztrálj!
            </button>
          </div>
          
          <div id="register-form" class="space-y-4 hidden">
            <h2 class="text-2xl font-semibold text-gray-800">Regisztráció</h2>
            <form onsubmit="handleRegister(event)" class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Név</label>
                <input type="text" id="reg-name" required
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent">
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input type="email" id="reg-email" required
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent">
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-1">Jelszó</label>
                <input type="password" id="reg-password" required minlength="6"
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent">
              </div>
              <button type="submit" 
                class="w-full bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 transition">
                Regisztráció
              </button>
            </form>
            <button onclick="toggleAuthForm()" class="w-full text-purple-600 hover:text-purple-700">
              Van már fiókod? Jelentkezz be!
            </button>
          </div>
        </div>
      </div>
    </div>
  `;
}

function toggleAuthForm() {
  const loginForm = document.getElementById('login-form');
  const registerForm = document.getElementById('register-form');
  loginForm.classList.toggle('hidden');
  registerForm.classList.toggle('hidden');
}

function renderDashboardView() {
  const completedSteps = state.userProgress.filter(p => p.status === 'completed').length;
  const inProgressSteps = state.userProgress.filter(p => p.status === 'in_progress').length;
  const totalSteps = state.trainingDays.reduce((sum, day) => {
    // Estimate 8 steps per day based on migration data
    return sum + 8;
  }, 0);
  const progressPercentage = totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0;
  
  return `
    <div class="min-h-screen bg-gray-50">
      <!-- Header -->
      <header class="gradient-bg text-white shadow-lg">
        <div class="max-w-7xl mx-auto px-4 py-6">
          <div class="flex justify-between items-center">
            <div>
              <h1 class="text-3xl font-bold">
                <i class="fas fa-rocket"></i> Catalyst Tanulási Napló
              </h1>
              <p class="text-purple-100 mt-1">Üdv, ${state.user.name}!</p>
            </div>
            <button onclick="handleLogout()" 
              class="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition">
              <i class="fas fa-sign-out-alt"></i> Kilépés
            </button>
          </div>
        </div>
      </header>

      <!-- Progress Overview -->
      <div class="max-w-7xl mx-auto px-4 py-8">
        <div class="bg-white rounded-xl shadow-md p-6 mb-8 animate-slide-in">
          <h2 class="text-2xl font-bold text-gray-800 mb-4">
            <i class="fas fa-chart-line text-purple-600"></i> Előrehaladásod
          </h2>
          <div class="space-y-4">
            <div>
              <div class="flex justify-between mb-2">
                <span class="text-gray-700 font-medium">Összesített haladás</span>
                <span class="text-purple-600 font-bold">${progressPercentage}%</span>
              </div>
              <div class="w-full bg-gray-200 rounded-full h-4">
                <div class="bg-gradient-to-r from-purple-500 to-pink-500 h-4 rounded-full transition-all duration-500" 
                  style="width: ${progressPercentage}%"></div>
              </div>
            </div>
            <div class="grid grid-cols-3 gap-4 mt-4">
              <div class="bg-green-50 rounded-lg p-4 text-center">
                <div class="text-3xl font-bold text-green-600">${completedSteps}</div>
                <div class="text-sm text-gray-600">Befejezett</div>
              </div>
              <div class="bg-blue-50 rounded-lg p-4 text-center">
                <div class="text-3xl font-bold text-blue-600">${inProgressSteps}</div>
                <div class="text-sm text-gray-600">Folyamatban</div>
              </div>
              <div class="bg-gray-50 rounded-lg p-4 text-center">
                <div class="text-3xl font-bold text-gray-600">${totalSteps - completedSteps}</div>
                <div class="text-sm text-gray-600">Hátralévő</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Training Days -->
        <h2 class="text-2xl font-bold text-gray-800 mb-6">
          <i class="fas fa-calendar-alt text-purple-600"></i> Tréningnapok
        </h2>
        <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          ${state.trainingDays.map(day => renderDayCard(day)).join('')}
        </div>
      </div>
    </div>
  `;
}

function renderDayCard(day) {
  const dayProgress = state.userProgress.filter(p => p.day_id === day.id);
  const completed = dayProgress.filter(p => p.status === 'completed').length;
  const total = 8; // Estimated steps per day
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
  
  let statusColor = 'bg-gray-100 text-gray-600';
  let statusIcon = 'fa-circle';
  
  if (percentage === 100) {
    statusColor = 'bg-green-100 text-green-600';
    statusIcon = 'fa-check-circle';
  } else if (percentage > 0) {
    statusColor = 'bg-blue-100 text-blue-600';
    statusIcon = 'fa-clock';
  }
  
  return `
    <div class="step-card bg-white rounded-xl shadow-md overflow-hidden cursor-pointer"
      onclick="navigateToDay(${day.id})">
      <div class="gradient-bg text-white p-6">
        <h3 class="text-2xl font-bold mb-2">${day.title}</h3>
        <p class="text-purple-100 text-sm">${day.subtitle}</p>
      </div>
      <div class="p-6">
        <p class="text-gray-600 mb-4">${day.description}</p>
        <div class="space-y-2">
          <div class="flex justify-between items-center">
            <span class="${statusColor} px-3 py-1 rounded-full text-sm font-medium">
              <i class="fas ${statusIcon}"></i> ${percentage}% kész
            </span>
            <span class="text-gray-500 text-sm">${completed}/${total} lépés</span>
          </div>
          <div class="w-full bg-gray-200 rounded-full h-2">
            <div class="bg-purple-500 h-2 rounded-full transition-all" style="width: ${percentage}%"></div>
          </div>
        </div>
      </div>
    </div>
  `;
}

async function navigateToDay(dayId) {
  try {
    const { day, steps } = await api.getTrainingDay(dayId);
    showView('day', { day, steps });
  } catch (error) {
    alert('Hiba a nap betöltésekor: ' + error.message);
  }
}

function renderDayView() {
  const day = state.currentDay;
  const steps = state.currentDaySteps;
  
  return `
    <div class="min-h-screen bg-gray-50">
      <!-- Header -->
      <header class="gradient-bg text-white shadow-lg">
        <div class="max-w-7xl mx-auto px-4 py-6">
          <button onclick="showView('dashboard')" 
            class="text-white hover:text-purple-200 mb-4 flex items-center">
            <i class="fas fa-arrow-left mr-2"></i> Vissza a Dashboard-ra
          </button>
          <h1 class="text-3xl font-bold">${day.title}</h1>
          <p class="text-purple-100 mt-2">${day.subtitle}</p>
          <p class="text-sm text-purple-200 mt-2">${day.description}</p>
        </div>
      </header>

      <!-- Steps -->
      <div class="max-w-5xl mx-auto px-4 py-8">
        <h2 class="text-2xl font-bold text-gray-800 mb-6">
          <i class="fas fa-list-ol text-purple-600"></i> Lépések
        </h2>
        <div class="space-y-4">
          ${steps.map(step => renderStepCard(step)).join('')}
        </div>
      </div>
    </div>
  `;
}

function renderStepCard(step) {
  const progress = state.userProgress.find(p => p.step_id === step.id);
  const status = progress ? progress.status : 'not_started';
  
  let statusColor = 'bg-gray-100 text-gray-600 border-gray-300';
  let statusIcon = 'fa-circle';
  let statusText = 'Még nem kezdted el';
  
  if (status === 'completed') {
    statusColor = 'bg-green-50 text-green-600 border-green-300';
    statusIcon = 'fa-check-circle';
    statusText = 'Befejezve';
  } else if (status === 'in_progress') {
    statusColor = 'bg-blue-50 text-blue-600 border-blue-300';
    statusIcon = 'fa-clock';
    statusText = 'Folyamatban';
  }
  
  return `
    <div class="step-card bg-white rounded-lg shadow-md border-l-4 ${statusColor} p-6 cursor-pointer"
      onclick="navigateToStep(${step.id})">
      <div class="flex justify-between items-start mb-3">
        <h3 class="text-xl font-bold text-gray-800">
          ${step.step_number}. ${step.title}
        </h3>
        <span class="${statusColor} px-3 py-1 rounded-full text-sm font-medium">
          <i class="fas ${statusIcon}"></i> ${statusText}
        </span>
      </div>
      <p class="text-gray-600 mb-3">${step.description}</p>
      ${step.tools ? `
        <div class="flex flex-wrap gap-2 mt-3">
          ${JSON.parse(step.tools).map(tool => 
            `<span class="bg-purple-100 text-purple-700 px-2 py-1 rounded text-xs">
              <i class="fas fa-tools"></i> ${tool}
            </span>`
          ).join('')}
        </div>
      ` : ''}
    </div>
  `;
}

async function navigateToStep(stepId) {
  try {
    const step = state.currentDaySteps.find(s => s.id === stepId);
    if (!step) {
      alert('Lépés nem található');
      return;
    }
    
    // Load step responses
    const { responses } = await api.getStepResponses(stepId);
    step.responses = responses;
    
    showView('step', { step });
  } catch (error) {
    alert('Hiba a lépés betöltésekor: ' + error.message);
  }
}

function renderStepView() {
  const step = state.currentStep;
  const day = state.currentDay;
  
  return `
    <div class="min-h-screen bg-gray-50">
      <!-- Header -->
      <header class="gradient-bg text-white shadow-lg">
        <div class="max-w-7xl mx-auto px-4 py-6">
          <button onclick="showView('day', { day: state.currentDay, steps: state.currentDaySteps })" 
            class="text-white hover:text-purple-200 mb-4 flex items-center">
            <i class="fas fa-arrow-left mr-2"></i> Vissza a ${day.title}-hoz
          </button>
          <h1 class="text-3xl font-bold">
            ${step.step_number}. ${step.title}
          </h1>
        </div>
      </header>

      <!-- Step Content -->
      <div class="max-w-4xl mx-auto px-4 py-8">
        <!-- Description -->
        <div class="bg-white rounded-xl shadow-md p-6 mb-6 animate-slide-in">
          <h2 class="text-xl font-bold text-gray-800 mb-3">
            <i class="fas fa-info-circle text-blue-500"></i> Cél
          </h2>
          <p class="text-gray-700">${step.description}</p>
        </div>

        ${step.tools ? `
          <div class="bg-white rounded-xl shadow-md p-6 mb-6">
            <h2 class="text-xl font-bold text-gray-800 mb-3">
              <i class="fas fa-toolbox text-purple-500"></i> Eszközök
              <span class="text-sm text-gray-500 font-normal ml-2">(Kattints a részletekért)</span>
            </h2>
            <div class="flex flex-wrap gap-3">
              ${JSON.parse(step.tools).map(tool => 
                `<button type="button" onclick="openToolModal('${tool.replace(/'/g, "\\'")}')" 
                  class="bg-purple-100 hover:bg-purple-200 text-purple-700 px-4 py-2 rounded-lg font-medium transition-all hover:scale-105 hover:shadow-md cursor-pointer">
                  <i class="fas fa-book-open"></i> ${tool}
                </button>`
              ).join('')}
            </div>
          </div>
        ` : ''}

        ${step.importance ? `
          <div class="bg-yellow-50 border-l-4 border-yellow-400 p-6 mb-6 rounded-r-xl">
            <h2 class="text-xl font-bold text-gray-800 mb-3">
              <i class="fas fa-exclamation-triangle text-yellow-500"></i> Fontosság
            </h2>
            <p class="text-gray-700">${step.importance}</p>
          </div>
        ` : ''}

        ${step.limitations ? `
          <div class="bg-red-50 border-l-4 border-red-400 p-6 mb-6 rounded-r-xl">
            <h2 class="text-xl font-bold text-gray-800 mb-3">
              <i class="fas fa-shield-alt text-red-500"></i> Korlátok
            </h2>
            <p class="text-gray-700">${step.limitations}</p>
          </div>
        ` : ''}

        ${step.instructions ? `
          <div class="bg-green-50 border-l-4 border-green-400 p-6 mb-6 rounded-r-xl">
            <h2 class="text-xl font-bold text-gray-800 mb-3">
              <i class="fas fa-tasks text-green-500"></i> Utasítások
            </h2>
            <p class="text-gray-700">${step.instructions}</p>
          </div>
        ` : ''}

        <!-- Exercise Form -->
        <div class="bg-white rounded-xl shadow-md p-6 mb-6">
          <h2 class="text-xl font-bold text-gray-800 mb-6">
            <i class="fas fa-pen text-purple-500"></i> Gyakorlat
          </h2>
          
          <form id="step-form" onsubmit="handleStepSubmit(event)" class="space-y-6">
            ${renderExerciseFields(step)}
            
            <!-- Submit Buttons -->
            <div class="flex gap-4 pt-6 border-t">
              <button type="submit" name="action" value="save"
                class="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition font-medium">
                <i class="fas fa-save"></i> Mentés
              </button>
              <button type="submit" name="action" value="complete"
                class="flex-1 bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition font-medium">
                <i class="fas fa-check"></i> Befejezés
              </button>
            </div>
          </form>
        </div>

        <!-- Status Update -->
        <div class="bg-white rounded-xl shadow-md p-6">
          <h2 class="text-xl font-bold text-gray-800 mb-4">
            <i class="fas fa-flag text-purple-500"></i> Státusz
          </h2>
          <div class="flex gap-3">
            <button onclick="updateStepStatus(${step.id}, 'in_progress')"
              class="flex-1 bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition">
              <i class="fas fa-play"></i> Folyamatban
            </button>
            <button onclick="updateStepStatus(${step.id}, 'completed')"
              class="flex-1 bg-green-500 text-white py-2 rounded-lg hover:bg-green-600 transition">
              <i class="fas fa-check"></i> Kész
            </button>
          </div>
        </div>
      </div>
    </div>
  `;
}

function renderExerciseFields(step) {
  // Dynamic field rendering based on step
  const dayId = step.day_id;
  const stepNum = step.step_number;
  
  // Get saved responses (current or previous steps)
  const getResponse = (fieldName, targetStepNum = null) => {
    // If targetStepNum specified, get from that step, otherwise current step
    if (targetStepNum) {
      const targetStep = state.currentDaySteps.find(s => s.day_id === dayId && s.step_number === targetStepNum);
      if (targetStep) {
        const key = `${dayId}-${targetStep.id}-${fieldName}`;
        return state.userResponses[key] || '';
      }
    }
    const key = `${dayId}-${step.id}-${fieldName}`;
    return state.userResponses[key] || '';
  };
  
  // Get problems from Step 1 for reuse
  const getProblemsFromStep1 = () => {
    const problems = [];
    for (let i = 1; i <= 5; i++) {
      const prob = getResponse(`problem_${i}`, 1);
      if (prob.trim()) problems.push({ id: i, text: prob });
    }
    return problems;
  };
  
  // Day 1 specific fields - each step builds on previous
  if (dayId === 1) {
    // Step 1: Identify 5 problems
    if (stepNum === 1) {
      return `
        <div class="space-y-4">
          <p class="text-gray-700 font-medium mb-4">
            <i class="fas fa-exclamation-circle text-red-500"></i> 
            Írd fel az 5 legégetőbb szervezeti/üzleti problémát:
          </p>
          ${[1,2,3,4,5].map(i => `
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                Probléma #${i} <span class="text-red-500">*</span>
              </label>
              <textarea name="problem_${i}" rows="2" required
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                placeholder="Írj konkrét, mérhető problémát...">${getResponse(`problem_${i}`)}</textarea>
            </div>
          `).join('')}
          <div class="bg-blue-50 p-4 rounded-lg mt-4">
            <p class="text-sm text-blue-800">
              <i class="fas fa-info-circle"></i> 
              <strong>Tipp:</strong> Légy konkrét! Pl. "A projekt határidők 40%-ban csúsznak" 
              jobb, mint "Rossz projekttervezés"
            </p>
          </div>
        </div>
      `;
    }
    
    // Step 2: Impact analysis - choose 3 problems and analyze
    else if (stepNum === 2) {
      const problems = getProblemsFromStep1();
      
      if (problems.length === 0) {
        return `
          <div class="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-lg">
            <p class="text-yellow-800">
              <i class="fas fa-exclamation-triangle"></i> 
              <strong>Figyelem:</strong> Először töltsd ki az 1. lépést (Problémák azonosítása)!
            </p>
            <button type="button" onclick="navigateToStep(${state.currentDaySteps[0].id})"
              class="mt-3 bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700">
              <i class="fas fa-arrow-left"></i> Vissza az 1. lépéshez
            </button>
          </div>
        `;
      }
      
      return `
        <div class="space-y-6">
          <p class="text-gray-700 font-medium">
            <i class="fas fa-chart-line text-blue-500"></i> 
            Válaszd ki a 3 legfontosabb problémát és elemezd a hatásukat:
          </p>
          
          <!-- Imported problems from Step 1 -->
          <div class="bg-green-50 p-4 rounded-lg border-l-4 border-green-500">
            <p class="text-sm text-green-800 font-medium mb-2">
              <i class="fas fa-check-circle"></i> Az 1. lépésből importált problémák:
            </p>
            <ol class="list-decimal list-inside space-y-1 text-sm text-green-700">
              ${problems.map(p => `<li>${p.text}</li>`).join('')}
            </ol>
          </div>
          
          <!-- Impact analysis table -->
          <div class="overflow-x-auto">
            <table class="w-full border-collapse bg-white shadow-sm rounded-lg overflow-hidden">
              <thead class="bg-purple-600 text-white">
                <tr>
                  <th class="px-4 py-3 text-left">Probléma</th>
                  <th class="px-4 py-3 text-center w-32">Hatás (1-5)</th>
                  <th class="px-4 py-3 text-center w-32">Gyakoriság (1-5)</th>
                  <th class="px-4 py-3 text-left w-48">Eszköz</th>
                  <th class="px-4 py-3 text-left">Következmény</th>
                </tr>
              </thead>
              <tbody>
                ${[1, 2, 3].map(i => `
                  <tr class="border-b hover:bg-gray-50">
                    <td class="px-4 py-3">
                      <select name="selected_problem_${i}" required
                        class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500">
                        <option value="">-- Válassz problémát --</option>
                        ${problems.map(p => `
                          <option value="${p.id}" ${getResponse(`selected_problem_${i}`) == p.id ? 'selected' : ''}>
                            Probléma #${p.id}
                          </option>
                        `).join('')}
                      </select>
                    </td>
                    <td class="px-4 py-3">
                      <input type="number" name="impact_${i}" min="1" max="5" required
                        value="${getResponse(`impact_${i}`)}"
                        class="w-full px-3 py-2 border border-gray-300 rounded-lg text-center focus:ring-2 focus:ring-purple-500">
                    </td>
                    <td class="px-4 py-3">
                      <input type="number" name="frequency_${i}" min="1" max="5" required
                        value="${getResponse(`frequency_${i}`)}"
                        class="w-full px-3 py-2 border border-gray-300 rounded-lg text-center focus:ring-2 focus:ring-purple-500">
                    </td>
                    <td class="px-4 py-3">
                      <select name="tool_${i}" required
                        class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500">
                        <option value="">-- Válassz --</option>
                        <option value="CBA" ${getResponse(`tool_${i}`) === 'CBA' ? 'selected' : ''}>Cost-Benefit Analysis</option>
                        <option value="FMEA" ${getResponse(`tool_${i}`) === 'FMEA' ? 'selected' : ''}>FMEA</option>
                        <option value="Force Field" ${getResponse(`tool_${i}`) === 'Force Field' ? 'selected' : ''}>Erőtér-elemzés</option>
                        <option value="ROI" ${getResponse(`tool_${i}`) === 'ROI' ? 'selected' : ''}>ROI</option>
                      </select>
                    </td>
                    <td class="px-4 py-3">
                      <textarea name="consequence_${i}" rows="2" required
                        class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                        placeholder="Mi a hatás?">${getResponse(`consequence_${i}`)}</textarea>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
          
          <div class="bg-blue-50 p-4 rounded-lg">
            <p class="text-sm text-blue-800">
              <i class="fas fa-info-circle"></i> 
              <strong>Skála:</strong> 1 = Alacsony, 3 = Közepes, 5 = Magas
            </p>
          </div>
        </div>
      `;
    }
    
    // Step 3: Problem analysis - analyze selected problem
    else if (stepNum === 3) {
      const selectedProblemId = getResponse('selected_problem_1', 2) || getResponse('selected_problem_2', 2) || getResponse('selected_problem_3', 2);
      const problemText = selectedProblemId ? getResponse(`problem_${selectedProblemId}`, 1) : '';
      
      return `
        <div class="space-y-4">
          ${problemText ? `
            <div class="bg-green-50 p-4 rounded-lg border-l-4 border-green-500">
              <p class="text-sm text-green-800 font-medium">
                <i class="fas fa-check-circle"></i> Elemzendő probléma (2. lépésből):
              </p>
              <p class="text-green-900 mt-2 font-semibold">${problemText}</p>
            </div>
          ` : `
            <div class="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-lg">
              <p class="text-yellow-800">
                <i class="fas fa-exclamation-triangle"></i> 
                Először töltsd ki a 2. lépést (Hatáselemzés)!
              </p>
            </div>
          `}
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Válassz elemzési eszközt</label>
            <select name="analysis_tool" required
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500">
              <option value="">-- Válassz eszközt --</option>
              <option value="Pareto" ${getResponse('analysis_tool') === 'Pareto' ? 'selected' : ''}>Pareto-elemzés</option>
              <option value="Affinity" ${getResponse('analysis_tool') === 'Affinity' ? 'selected' : ''}>Affinitás-diagram</option>
              <option value="Flowchart" ${getResponse('analysis_tool') === 'Flowchart' ? 'selected' : ''}>Folyamatábra</option>
              <option value="DILO" ${getResponse('analysis_tool') === 'DILO' ? 'selected' : ''}>DILO/WILO</option>
            </select>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Elemzés eredménye</label>
            <textarea name="analysis_result" rows="8" required
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              placeholder="Írd le az elemzés főbb megállapításait...">${getResponse('analysis_result')}</textarea>
          </div>
        </div>
      `;
    }
    
    // Step 4: Prioritization matrix
    else if (stepNum === 4) {
      const problems = getProblemsFromStep1();
      
      return `
        <div class="space-y-6">
          <p class="text-gray-700 font-medium">
            <i class="fas fa-sort-amount-down text-purple-500"></i> 
            Értékeld minden problémát Hatás és Erőfeszítés alapján:
          </p>
          
          ${problems.length > 0 ? `
            <div class="space-y-4">
              ${problems.map(p => `
                <div class="bg-white border-2 border-gray-200 rounded-lg p-4">
                  <h4 class="font-semibold text-gray-800 mb-3">Probléma #${p.id}: ${p.text}</h4>
                  <div class="grid grid-cols-2 gap-4">
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-1">
                        Hatás (1-5) <span class="text-xs text-gray-500">Mennyire nagy?</span>
                      </label>
                      <input type="number" name="priority_impact_${p.id}" min="1" max="5" required
                        value="${getResponse(`priority_impact_${p.id}`)}"
                        class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500">
                    </div>
                    <div>
                      <label class="block text-sm font-medium text-gray-700 mb-1">
                        Erőfeszítés (1-5) <span class="text-xs text-gray-500">Mennyi munka?</span>
                      </label>
                      <input type="number" name="priority_effort_${p.id}" min="1" max="5" required
                        value="${getResponse(`priority_effort_${p.id}`)}"
                        class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500">
                    </div>
                  </div>
                </div>
              `).join('')}
            </div>
            
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">
                <i class="fas fa-star text-yellow-500"></i> Melyik problémára fókuszálsz? (prioritás alapján)
              </label>
              <select name="selected_priority_problem" required
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500">
                <option value="">-- Válaszd ki a legoptimálisabbat --</option>
                ${problems.map(p => `
                  <option value="${p.id}" ${getResponse('selected_priority_problem') == p.id ? 'selected' : ''}>
                    Probléma #${p.id}
                  </option>
                `).join('')}
              </select>
            </div>
          ` : '<p class="text-yellow-600">Először töltsd ki az 1. lépést!</p>'}
        </div>
      `;
    }
    
    // Step 5: Problem definition with 5W1H
    else if (stepNum === 5) {
      const selectedId = getResponse('selected_priority_problem', 4);
      const problemText = selectedId ? getResponse(`problem_${selectedId}`, 1) : '';
      
      return `
        <div class="space-y-4">
          ${problemText ? `
            <div class="bg-green-50 p-4 rounded-lg border-l-4 border-green-500">
              <p class="text-sm text-green-800 font-medium">
                <i class="fas fa-check-circle"></i> Kiválasztott probléma (4. lépésből):
              </p>
              <p class="text-green-900 mt-2 font-semibold">${problemText}</p>
            </div>
          ` : ''}
          
          <p class="text-gray-700 font-medium mb-4">5W1H Keretrendszer:</p>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">What? (Mi a probléma?)</label>
            <textarea name="what" rows="3" required
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500">${getResponse('what')}</textarea>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Why? (Miért fontos?)</label>
            <textarea name="why" rows="3" required
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500">${getResponse('why')}</textarea>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Who? (Kit érint?)</label>
            <textarea name="who" rows="2" required
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500">${getResponse('who')}</textarea>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">When? (Mikor történik?)</label>
            <textarea name="when" rows="2" required
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500">${getResponse('when')}</textarea>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Where? (Hol?)</label>
            <textarea name="where" rows="2" required
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500">${getResponse('where')}</textarea>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">How? (Hogyan nyilvánul meg?)</label>
            <textarea name="how" rows="3" required
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500">${getResponse('how')}</textarea>
          </div>
        </div>
      `;
    }
    
    // Step 6: Context with SWOT
    else if (stepNum === 6) {
      const problemText = getResponse('what', 5);
      
      return `
        <div class="space-y-6">
          ${problemText ? `
            <div class="bg-green-50 p-4 rounded-lg border-l-4 border-green-500">
              <p class="text-sm text-green-800 font-medium">
                <i class="fas fa-check-circle"></i> Definiált probléma (5. lépésből):
              </p>
              <p class="text-green-900 mt-2">${problemText}</p>
            </div>
          ` : ''}
          
          <p class="text-gray-700 font-medium">
            <i class="fas fa-th-large text-purple-500"></i> SWOT Elemzés:
          </p>
          
          <div class="grid grid-cols-2 gap-4">
            <div class="bg-green-50 p-4 rounded-lg border-2 border-green-300">
              <label class="block font-semibold text-green-800 mb-2">
                <i class="fas fa-plus-circle"></i> Strengths (Erősségek)
              </label>
              <textarea name="swot_strengths" rows="4" required
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                placeholder="Belső erősségek...">${getResponse('swot_strengths')}</textarea>
            </div>
            
            <div class="bg-red-50 p-4 rounded-lg border-2 border-red-300">
              <label class="block font-semibold text-red-800 mb-2">
                <i class="fas fa-minus-circle"></i> Weaknesses (Gyengeségek)
              </label>
              <textarea name="swot_weaknesses" rows="4" required
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                placeholder="Belső gyengeségek...">${getResponse('swot_weaknesses')}</textarea>
            </div>
            
            <div class="bg-blue-50 p-4 rounded-lg border-2 border-blue-300">
              <label class="block font-semibold text-blue-800 mb-2">
                <i class="fas fa-arrow-up"></i> Opportunities (Lehetőségek)
              </label>
              <textarea name="swot_opportunities" rows="4" required
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Külső lehetőségek...">${getResponse('swot_opportunities')}</textarea>
            </div>
            
            <div class="bg-yellow-50 p-4 rounded-lg border-2 border-yellow-300">
              <label class="block font-semibold text-yellow-800 mb-2">
                <i class="fas fa-exclamation-triangle"></i> Threats (Veszélyek)
              </label>
              <textarea name="swot_threats" rows="4" required
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500"
                placeholder="Külső veszélyek...">${getResponse('swot_threats')}</textarea>
            </div>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              <i class="fas fa-users"></i> Stakeholder elemzés
            </label>
            <textarea name="stakeholders" rows="4" required
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              placeholder="Kik az érintettek? Mi az érdekük?">${getResponse('stakeholders')}</textarea>
          </div>
        </div>
      `;
    }
    
    // Step 7: Data collection
    else if (stepNum === 7) {
      return `
        <div class="space-y-4">
          <p class="text-gray-700 font-medium mb-4">
            <i class="fas fa-database text-blue-500"></i> Adatok és tények gyűjtése:
          </p>
          
          <div class="overflow-x-auto">
            <table class="w-full border-collapse bg-white shadow-sm rounded-lg overflow-hidden">
              <thead class="bg-blue-600 text-white">
                <tr>
                  <th class="px-4 py-3 text-left">Adat típusa</th>
                  <th class="px-4 py-3 text-left">Konkrét szám/tény</th>
                  <th class="px-4 py-3 text-left">Forrás</th>
                  <th class="px-4 py-3 text-center w-32">Megbízhatóság (1-5)</th>
                </tr>
              </thead>
              <tbody>
                ${['KPI/mérőszám', 'Visszajelzés', 'Pénzügyi hatás', 'Egyéb'].map((type, idx) => `
                  <tr class="border-b hover:bg-gray-50">
                    <td class="px-4 py-3 font-medium">${type}</td>
                    <td class="px-4 py-3">
                      <input type="text" name="data_value_${idx}" required
                        value="${getResponse(`data_value_${idx}`)}"
                        class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="Pl. 40% csúszás">
                    </td>
                    <td class="px-4 py-3">
                      <input type="text" name="data_source_${idx}" required
                        value="${getResponse(`data_source_${idx}`)}"
                        class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="Pl. PM jelentés">
                    </td>
                    <td class="px-4 py-3">
                      <input type="number" name="data_reliability_${idx}" min="1" max="5" required
                        value="${getResponse(`data_reliability_${idx}`)}"
                        class="w-full px-3 py-2 border border-gray-300 rounded-lg text-center focus:ring-2 focus:ring-blue-500">
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
          
          <div class="bg-blue-50 p-4 rounded-lg">
            <p class="text-sm text-blue-800">
              <i class="fas fa-info-circle"></i> 
              A baseline adatok segítenek később mérni a javulást!
            </p>
          </div>
        </div>
      `;
    }
    
    // Step 8: Root cause analysis
    else if (stepNum === 8) {
      const problemText = getResponse('what', 5);
      
      return `
        <div class="space-y-6">
          ${problemText ? `
            <div class="bg-green-50 p-4 rounded-lg border-l-4 border-green-500">
              <p class="text-sm text-green-800 font-medium">
                <i class="fas fa-check-circle"></i> Elemzendő probléma:
              </p>
              <p class="text-green-900 mt-2">${problemText}</p>
            </div>
          ` : ''}
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              <i class="fas fa-question-circle text-purple-500"></i> 
              5 Miért elemzés:
            </label>
            ${[1,2,3,4,5].map(i => `
              <div class="mb-3">
                <label class="block text-xs font-medium text-gray-600 mb-1">Miért ${i}?</label>
                <textarea name="why_${i}" rows="2" required
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  placeholder="${i === 1 ? 'Miért történik a probléma?' : 'Miért történik az előző ok?'}">${getResponse(`why_${i}`)}</textarea>
              </div>
            `).join('')}
          </div>
          
          <div class="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg">
            <label class="block font-semibold text-red-900 mb-2">
              <i class="fas fa-crosshairs"></i> Gyökérok (az utolsó "Miért" alapján):
            </label>
            <textarea name="root_cause" rows="3" required
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
              placeholder="Mi a valódi gyökérok?">${getResponse('root_cause')}</textarea>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              <i class="fas fa-lightbulb text-yellow-500"></i> Javaslat a gyökérok kezelésére:
            </label>
            <textarea name="root_cause_solution" rows="4" required
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              placeholder="Hogyan kezeled a gyökérokot?">${getResponse('root_cause_solution')}</textarea>
          </div>
        </div>
      `;
    }
  }
  
  // Generic text area for other days
  return `
    <div>
      <label class="block text-sm font-medium text-gray-700 mb-1">Jegyzetek</label>
      <textarea name="notes" rows="10" 
        class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
        placeholder="Írd le a gondolataid, válaszaid...">${getResponse('notes')}</textarea>
    </div>
  `;
}

async function handleStepSubmit(e) {
  e.preventDefault();
  const form = e.target;
  const formData = new FormData(form);
  const action = e.submitter.value;
  
  const step = state.currentStep;
  const dayId = step.day_id;
  const stepId = step.id;
  
  try {
    // Collect all form fields
    const responses = [];
    for (let [key, value] of formData.entries()) {
      if (key !== 'action' && value.trim()) {
        responses.push({
          day_id: dayId,
          step_id: stepId,
          field_name: key,
          field_value: value
        });
      }
    }
    
    // Save responses
    if (responses.length > 0) {
      await api.batchSaveResponses(responses);
      
      // Update local state
      responses.forEach(r => {
        const key = `${r.day_id}-${r.step_id}-${r.field_name}`;
        state.userResponses[key] = r.field_value;
      });
    }
    
    // Update status if completing
    if (action === 'complete') {
      await api.updateStepProgress(stepId, 'completed', dayId);
      alert('✅ Lépés befejezve!');
    } else {
      await api.updateStepProgress(stepId, 'in_progress', dayId);
      alert('💾 Mentve!');
    }
    
    // Reload data
    await loadUserData();
    
    // Return to day view
    showView('day', { day: state.currentDay, steps: state.currentDaySteps });
    
  } catch (error) {
    alert('Hiba mentés közben: ' + error.message);
  }
}

async function updateStepStatus(stepId, status) {
  try {
    await api.updateStepProgress(stepId, status, state.currentDay.id);
    await loadUserData();
    alert(status === 'completed' ? '✅ Befejezve!' : '▶️ Folyamatban!');
    
    // Refresh current view
    const step = state.currentDaySteps.find(s => s.id === stepId);
    if (step) {
      const { responses } = await api.getStepResponses(stepId);
      step.responses = responses;
      showView('step', { step });
    }
  } catch (error) {
    alert('Hiba státusz frissítésekor: ' + error.message);
  }
}

// Initialize app
async function init() {
  if (state.token) {
    try {
      const data = await api.getMe();
      state.user = data.user;
      await loadUserData();
      showView('dashboard');
    } catch (error) {
      // Token expired or invalid
      handleLogout();
    }
  } else {
    showView('login');
  }
}

// Run on page load
init();
