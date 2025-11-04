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
            </h2>
            <div class="flex flex-wrap gap-3">
              ${JSON.parse(step.tools).map(tool => 
                `<span class="bg-purple-100 text-purple-700 px-4 py-2 rounded-lg font-medium">
                  ${tool}
                </span>`
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
  
  // Get saved responses
  const getResponse = (fieldName) => {
    const key = `${dayId}-${step.id}-${fieldName}`;
    return state.userResponses[key] || '';
  };
  
  // Day 1 specific fields
  if (dayId === 1) {
    if (stepNum === 1) {
      return `
        <div class="space-y-4">
          <p class="text-gray-700 font-medium">Írd fel az 5 legégetőbb szervezeti/üzleti problémát:</p>
          ${[1,2,3,4,5].map(i => `
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Probléma #${i}</label>
              <textarea name="problem_${i}" rows="2" 
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                placeholder="Írj konkrét problémát...">${getResponse(`problem_${i}`)}</textarea>
            </div>
          `).join('')}
        </div>
      `;
    } else if (stepNum === 5) {
      return `
        <div class="space-y-4">
          <p class="text-gray-700 font-medium mb-4">5W1H Keretrendszer:</p>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">What? (Mi a probléma?)</label>
            <textarea name="what" rows="3" 
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500">${getResponse('what')}</textarea>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Why? (Miért fontos?)</label>
            <textarea name="why" rows="3" 
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500">${getResponse('why')}</textarea>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Who? (Kit érint?)</label>
            <textarea name="who" rows="2" 
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500">${getResponse('who')}</textarea>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">When? (Mikor történik?)</label>
            <textarea name="when" rows="2" 
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500">${getResponse('when')}</textarea>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Where? (Hol?)</label>
            <textarea name="where" rows="2" 
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500">${getResponse('where')}</textarea>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">How? (Hogyan nyilvánul meg?)</label>
            <textarea name="how" rows="3" 
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500">${getResponse('how')}</textarea>
          </div>
        </div>
      `;
    }
  }
  
  // Generic text area for other steps
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
