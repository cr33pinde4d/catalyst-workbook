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
  userResponses: {},
  // Process management
  processes: [],
  currentProcess: null,
  processResponses: {},
  isProcessMode: false
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
  },
  
  // Process management APIs
  async getProcesses() {
    const { data } = await axios.get('/processes');
    return data;
  },
  
  async getProcess(processId) {
    const { data } = await axios.get(`/processes/${processId}`);
    return data;
  },
  
  async createProcess(title, description) {
    const { data } = await axios.post('/processes', { title, description });
    return data;
  },
  
  async updateProcess(processId, updates) {
    const { data } = await axios.put(`/processes/${processId}`, updates);
    return data;
  },
  
  async deleteProcess(processId) {
    const { data } = await axios.delete(`/processes/${processId}`);
    return data;
  },
  
  async getProcessResponses(processId) {
    const { data } = await axios.get(`/processes/${processId}/responses`);
    return data;
  },
  
  async saveProcessResponses(processId, responses) {
    const { data } = await axios.post(`/processes/${processId}/responses`, { responses });
    return data;
  },
  
  async completeProcessStep(processId, stepId) {
    const { data } = await axios.post(`/processes/${processId}/steps/${stepId}/complete`);
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
    const [daysData, progressData, responsesData, processesData] = await Promise.all([
      api.getTrainingDays(),
      api.getUserProgress(),
      api.getUserResponses(),
      api.getProcesses()
    ]);
    
    state.trainingDays = daysData.days;
    state.userProgress = progressData.progress;
    state.processes = processesData.processes;
    
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
    case 'landing':
      app.innerHTML = renderLandingView();
      break;
    case 'login':
      app.innerHTML = renderLoginView();
      break;
    case 'dashboard':
      app.innerHTML = renderDashboardView();
      break;
    case 'guide':
      app.innerHTML = renderGuideView();
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
    case 'processes':
      app.innerHTML = renderProcessesView();
      break;
    case 'process-day':
      state.currentDay = params.day;
      state.currentDaySteps = params.steps;
      state.currentProcess = params.process;
      state.isProcessMode = true;
      app.innerHTML = renderProcessDayView();
      break;
    case 'process-step':
      state.currentStep = params.step;
      state.currentProcess = params.process;
      state.isProcessMode = true;
      app.innerHTML = renderProcessStepView();
      break;
  }
}

// View renderers
function renderLandingView() {
  return `
    <div class="min-h-screen gradient-bg">
      <!-- Hero Section -->
      <div class="container mx-auto px-4 py-16">
        <div class="max-w-4xl mx-auto">
          <!-- Header -->
          <div class="text-center mb-12 animate-slide-in">
            <h1 class="text-5xl font-bold text-white mb-4">
              <i class="fas fa-rocket"></i> Catalyst Munkafüzet
            </h1>
            <p class="text-2xl text-purple-100">
              Strukturált vezetői problémamegoldás és stratégiai végrehajtás
            </p>
          </div>

          <!-- Introduction Card -->
          <div class="bg-white rounded-2xl shadow-2xl p-8 mb-8 animate-slide-in">
            <h2 class="text-3xl font-bold text-gray-900 mb-6">
              <i class="fas fa-book-open text-purple-600"></i> Hogyan használd ezt a munkafüzetet?
            </h2>
            
            <div class="space-y-4 text-gray-700 text-lg">
              <p>
                A Catalyst Tanulási Napló egy <strong>interaktív online munkafüzet</strong>, amely végigvezet 
                a vezetői problémamegoldás és stratégiai végrehajtás teljes folyamatán.
              </p>
              
              <div class="bg-purple-50 border-l-4 border-purple-500 p-6 rounded-r-lg">
                <h3 class="font-bold text-purple-900 mb-3 text-xl">
                  <i class="fas fa-layer-group"></i> Munkafüzet felépítése:
                </h3>
                <ul class="space-y-2">
                  <li><i class="fas fa-check text-green-500"></i> <strong>6 tréningnap</strong> – mindegyik egy-egy vezetői készségre fókuszál</li>
                  <li><i class="fas fa-check text-green-500"></i> Minden naphoz: <strong>miért fontos, 8 lépés, eszközök, gyakorlati példák</strong></li>
                  <li><i class="fas fa-check text-green-500"></i> <strong>Részletes eszközleírások</strong> 15+ vezetői eszközhöz (kattintható modal-okban)</li>
                  <li><i class="fas fa-check text-green-500"></i> <strong>Progresszív adatáramlás</strong> – minden lépés építi az előzőt</li>
                </ul>
              </div>
            </div>
          </div>

          <!-- 6 Days Overview -->
          <div class="bg-white rounded-2xl shadow-2xl p-8 mb-8 animate-slide-in">
            <h2 class="text-3xl font-bold text-gray-900 mb-6">
              <i class="fas fa-calendar-alt text-purple-600"></i> Tréningnapok áttekintése
            </h2>
            <p class="text-gray-700 mb-6 text-lg">
              Minden nap a következőre épít, végigkísérve a <strong>problémától a fenntartható megoldásig</strong>.
            </p>
            
            <div class="grid md:grid-cols-2 gap-6">
              <!-- Day 1 -->
              <div class="border-l-4 border-blue-500 bg-blue-50 p-6 rounded-r-lg hover:shadow-lg transition">
                <h3 class="font-bold text-blue-900 text-xl mb-2">
                  <span class="bg-blue-500 text-white px-3 py-1 rounded-full mr-2">1</span>
                  Vezetői tudatosság
                </h3>
                <p class="text-gray-700">Problémafeltárás, hatáselemzés, gyökérok-elemzés</p>
              </div>

              <!-- Day 2 -->
              <div class="border-l-4 border-green-500 bg-green-50 p-6 rounded-r-lg hover:shadow-lg transition">
                <h3 class="font-bold text-green-900 text-xl mb-2">
                  <span class="bg-green-500 text-white px-3 py-1 rounded-full mr-2">2</span>
                  Stratégiaalkotás
                </h3>
                <p class="text-gray-700">Golden Circle, vízió, SMART célok, akcióterv</p>
              </div>

              <!-- Day 3 -->
              <div class="border-l-4 border-yellow-500 bg-yellow-50 p-6 rounded-r-lg hover:shadow-lg transition">
                <h3 class="font-bold text-yellow-900 text-xl mb-2">
                  <span class="bg-yellow-500 text-white px-3 py-1 rounded-full mr-2">3</span>
                  Csapat kialakítása
                </h3>
                <p class="text-gray-700">Szerepek, RACI, kompetenciák, struktúra</p>
              </div>

              <!-- Day 4 -->
              <div class="border-l-4 border-red-500 bg-red-50 p-6 rounded-r-lg hover:shadow-lg transition">
                <h3 class="font-bold text-red-900 text-xl mb-2">
                  <span class="bg-red-500 text-white px-3 py-1 rounded-full mr-2">4</span>
                  Teljesítménymenedzsment
                </h3>
                <p class="text-gray-700">KPI-ok, dashboard, visszajelzés, folyamatos fejlesztés</p>
              </div>

              <!-- Day 5 -->
              <div class="border-l-4 border-purple-500 bg-purple-50 p-6 rounded-r-lg hover:shadow-lg transition">
                <h3 class="font-bold text-purple-900 text-xl mb-2">
                  <span class="bg-purple-500 text-white px-3 py-1 rounded-full mr-2">5</span>
                  Csapatmenedzsment
                </h3>
                <p class="text-gray-700">Delegálás, motiváció, konfliktus, coaching</p>
              </div>

              <!-- Day 6 -->
              <div class="border-l-4 border-indigo-500 bg-indigo-50 p-6 rounded-r-lg hover:shadow-lg transition">
                <h3 class="font-bold text-indigo-900 text-xl mb-2">
                  <span class="bg-indigo-500 text-white px-3 py-1 rounded-full mr-2">6</span>
                  Fenntartás & adaptáció
                </h3>
                <p class="text-gray-700">Változásbeépítés, monitoring, tanulási kultúra, utódlás</p>
              </div>
            </div>
          </div>

          <!-- CTA Buttons -->
          <div class="text-center space-y-4 animate-slide-in">
            <button onclick="showView('login')" 
              class="bg-white text-purple-600 px-12 py-4 rounded-xl text-xl font-bold hover:bg-purple-50 transition shadow-lg">
              <i class="fas fa-sign-in-alt"></i> Bejelentkezés / Regisztráció
            </button>
            <div>
              <button onclick="showView('guide')" 
                class="text-white hover:text-purple-100 underline">
                <i class="fas fa-book"></i> Részletes útmutató
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

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

function renderGuideView() {
  return `
    <div class="min-h-screen bg-gray-50">
      <!-- Header -->
      <header class="gradient-bg text-white shadow-lg">
        <div class="max-w-7xl mx-auto px-4 py-6">
          <div class="flex justify-between items-center">
            <div>
              <h1 class="text-3xl font-bold">
                <i class="fas fa-book"></i> Útmutató
              </h1>
              <p class="text-purple-100 mt-1">Hogyan használd a Catalyst Munkafüzetet</p>
            </div>
            <button onclick="${state.user ? "showView('dashboard')" : "showView('landing')"}" 
              class="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition">
              <i class="fas fa-arrow-left"></i> Vissza
            </button>
          </div>
        </div>
      </header>

      <!-- Content -->
      <div class="max-w-5xl mx-auto px-4 py-8">
        <!-- Introduction -->
        <div class="bg-white rounded-xl shadow-md p-8 mb-6 animate-slide-in">
          <h2 class="text-3xl font-bold text-gray-900 mb-4">
            <i class="fas fa-info-circle text-purple-600"></i> Bevezetés
          </h2>
          <div class="prose prose-lg max-w-none text-gray-700 space-y-4">
            <p>
              A <strong>Catalyst Tanulási Napló</strong> egy interaktív online munkafüzet, amely végigvezet a 
              vezetői problémamegoldás és stratégiai végrehajtás teljes folyamatán. A program 6 tréningnapból áll, 
              mindegyik naphoz 8 strukturált lépéssel.
            </p>
            <p>
              Minden lépés építi az előzőt – a <strong>progresszív adatáramlásnak</strong> köszönhetően az előző 
              lépésekben megadott válaszaid automatikusan megjelennek a következő lépésekben, így valóban 
              egymásra épülő folyamatot kapsz.
            </p>
          </div>
        </div>

        <!-- How to Use -->
        <div class="bg-white rounded-xl shadow-md p-8 mb-6 animate-slide-in">
          <h2 class="text-3xl font-bold text-gray-900 mb-6">
            <i class="fas fa-tasks text-purple-600"></i> Hogyan használd?
          </h2>
          <div class="space-y-6">
            <div class="flex gap-4">
              <div class="flex-shrink-0 w-12 h-12 bg-purple-500 text-white rounded-full flex items-center justify-center text-xl font-bold">
                1
              </div>
              <div>
                <h3 class="text-xl font-bold text-gray-900 mb-2">Válassz egy napot</h3>
                <p class="text-gray-700">
                  A Dashboard-on válaszd ki, melyik nappal szeretnél dolgozni. Javasoljuk, hogy sorban haladj, 
                  mert minden nap az előzőre épül.
                </p>
              </div>
            </div>

            <div class="flex gap-4">
              <div class="flex-shrink-0 w-12 h-12 bg-purple-500 text-white rounded-full flex items-center justify-center text-xl font-bold">
                2
              </div>
              <div>
                <h3 class="text-xl font-bold text-gray-900 mb-2">Dolgozd végig a lépéseket</h3>
                <p class="text-gray-700">
                  Minden naphoz 8 lépés tartozik. Töltsd ki a mezőket, használd az eszközöket (kattintható badge-ek), 
                  és mentsd el a válaszaidat.
                </p>
              </div>
            </div>

            <div class="flex gap-4">
              <div class="flex-shrink-0 w-12 h-12 bg-purple-500 text-white rounded-full flex items-center justify-center text-xl font-bold">
                3
              </div>
              <div>
                <h3 class="text-xl font-bold text-gray-900 mb-2">Mentés és státusz</h3>
                <p class="text-gray-700">
                  Két gomb áll rendelkezésedre: <strong>"Mentés"</strong> (folyamatban jelölés) és 
                  <strong>"Befejezés"</strong> (befejezett jelölés). Nyugodtan térj vissza később – minden mentve marad.
                </p>
              </div>
            </div>

            <div class="flex gap-4">
              <div class="flex-shrink-0 w-12 h-12 bg-purple-500 text-white rounded-full flex items-center justify-center text-xl font-bold">
                4
              </div>
              <div>
                <h3 class="text-xl font-bold text-gray-900 mb-2">Használd az eszközöket</h3>
                <p class="text-gray-700">
                  A lépések alatt találsz <span class="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800">
                  <i class="fas fa-tools mr-1"></i> Eszköz</span> badge-eket. Kattints rájuk a részletes dokumentációért!
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- 6 Days Structure -->
        <div class="bg-white rounded-xl shadow-md p-8 mb-6 animate-slide-in">
          <h2 class="text-3xl font-bold text-gray-900 mb-6">
            <i class="fas fa-calendar-alt text-purple-600"></i> 6 Tréningnap áttekintése
          </h2>
          <p class="text-gray-700 mb-6">
            Minden nap a következőre épít, végigkísérve a <strong>problémától a fenntartható megoldásig</strong>.
          </p>
          
          <div class="space-y-4">
            <!-- Day 1 -->
            <div class="border-l-4 border-blue-500 bg-blue-50 p-6 rounded-r-lg">
              <h3 class="font-bold text-blue-900 text-xl mb-2">
                <span class="bg-blue-500 text-white px-3 py-1 rounded-full mr-2">1. Nap</span>
                Vezetői tudatosság és problémamegoldás
              </h3>
              <p class="text-gray-700 mb-2">
                Strukturált problémafeltárás, hatáselemzés, problémaelemzés, priorizálás, 
                problémameghatározás, kontextus leírása, adatgyűjtés, gyökérok-elemzés
              </p>
              <div class="text-sm text-gray-600">
                <strong>Cél:</strong> Azonosítsd és értsd meg mélyen a problémádat
              </div>
            </div>

            <!-- Day 2 -->
            <div class="border-l-4 border-green-500 bg-green-50 p-6 rounded-r-lg">
              <h3 class="font-bold text-green-900 text-xl mb-2">
                <span class="bg-green-500 text-white px-3 py-1 rounded-full mr-2">2. Nap</span>
                Vezetői stílus és stratégiaalkotás
              </h3>
              <p class="text-gray-700 mb-2">
                Start with Why (Golden Circle), vízió megfogalmazása, stratégiai célok (SMART), 
                vezetői stílus, akcióterv, döntéshozatal, kommunikációs terv, kockázatelemzés
              </p>
              <div class="text-sm text-gray-600">
                <strong>Cél:</strong> Alakítsd ki a stratégiádat és vezetői megközelítésedet
              </div>
            </div>

            <!-- Day 3 -->
            <div class="border-l-4 border-yellow-500 bg-yellow-50 p-6 rounded-r-lg">
              <h3 class="font-bold text-yellow-900 text-xl mb-2">
                <span class="bg-yellow-500 text-white px-3 py-1 rounded-full mr-2">3. Nap</span>
                Csapat kialakítása
              </h3>
              <p class="text-gray-700 mb-2">
                Szerepek azonosítása, kompetencia-elemzés, RACI mátrix, csapatstruktúra, 
                tehetségértékelés (9-Box), gap analízis, toborzás/fejlesztés, csapat finalizálás
              </p>
              <div class="text-sm text-gray-600">
                <strong>Cél:</strong> Építs fel egy hatékony csapatot
              </div>
            </div>

            <!-- Day 4 -->
            <div class="border-l-4 border-red-500 bg-red-50 p-6 rounded-r-lg">
              <h3 class="font-bold text-red-900 text-xl mb-2">
                <span class="bg-red-500 text-white px-3 py-1 rounded-full mr-2">4. Nap</span>
                Teljesítménymenedzsment
              </h3>
              <p class="text-gray-700 mb-2">
                KPI meghatározása, mérési rendszer, adatgyűjtés, dashboard & reporting, 
                visszajelzési rendszer, teljesítményértékelés, korrekciós mechanizmusok, folyamatos fejlesztés
              </p>
              <div class="text-sm text-gray-600">
                <strong>Cél:</strong> Mérj, értékelj és fejlessz folyamatosan
              </div>
            </div>

            <!-- Day 5 -->
            <div class="border-l-4 border-purple-500 bg-purple-50 p-6 rounded-r-lg">
              <h3 class="font-bold text-purple-900 text-xl mb-2">
                <span class="bg-purple-500 text-white px-3 py-1 rounded-full mr-2">5. Nap</span>
                Csapatmenedzsment
              </h3>
              <p class="text-gray-700 mb-2">
                Delegálási stratégia, motivációs tényezők, konfliktuskezelés, pszichológiai biztonság, 
                coaching & mentoring, nehéz beszélgetések, csapatkohézió, vezetői jelenlét
              </p>
              <div class="text-sm text-gray-600">
                <strong>Cél:</strong> Vezess hatékonyan és fejleszd a csapatod
              </div>
            </div>

            <!-- Day 6 -->
            <div class="border-l-4 border-indigo-500 bg-indigo-50 p-6 rounded-r-lg">
              <h3 class="font-bold text-indigo-900 text-xl mb-2">
                <span class="bg-indigo-500 text-white px-3 py-1 rounded-full mr-2">6. Nap</span>
                Fenntartás & adaptáció
              </h3>
              <p class="text-gray-700 mb-2">
                Változásbeépítési terv, SOPs & dokumentáció, tudástranszfer, monitoring & korai figyelmeztetés, 
                agilitás fejlesztése, tanulási kultúra, sikerkommunikáció, átadás & utódlástervezés
              </p>
              <div class="text-sm text-gray-600">
                <strong>Cél:</strong> Tedd fenntarthatóvá a változásokat
              </div>
            </div>
          </div>
        </div>

        <!-- Tools Info -->
        <div class="bg-gradient-to-r from-purple-50 to-pink-50 border-l-4 border-purple-500 rounded-r-xl shadow-md p-8 mb-6 animate-slide-in">
          <h2 class="text-3xl font-bold text-purple-900 mb-4">
            <i class="fas fa-toolbox"></i> 15+ Vezetői eszköz
          </h2>
          <p class="text-gray-700 mb-4">
            A munkafüzetben több mint 15 vezetői eszköz részletes dokumentációja érhető el. Ezek az eszközök 
            <strong>kattintható badge-ek formájában</strong> jelennek meg a lépésekben.
          </p>
          <div class="flex flex-wrap gap-2">
            <span class="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800">
              <i class="fas fa-tools mr-1"></i> Brainstorming
            </span>
            <span class="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800">
              <i class="fas fa-tools mr-1"></i> 5 Whys
            </span>
            <span class="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800">
              <i class="fas fa-tools mr-1"></i> Ishikawa
            </span>
            <span class="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800">
              <i class="fas fa-tools mr-1"></i> SWOT
            </span>
            <span class="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800">
              <i class="fas fa-tools mr-1"></i> Golden Circle
            </span>
            <span class="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800">
              <i class="fas fa-tools mr-1"></i> SMART
            </span>
            <span class="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800">
              <i class="fas fa-tools mr-1"></i> OKR
            </span>
            <span class="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800">
              <i class="fas fa-tools mr-1"></i> RACI
            </span>
            <span class="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800">
              <i class="fas fa-tools mr-1"></i> 9-Box Talent Grid
            </span>
            <span class="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800">
              <i class="fas fa-tools mr-1"></i> GROW Model
            </span>
            <span class="text-gray-500">...és még sok más!</span>
          </div>
        </div>

        <!-- CTA -->
        <div class="text-center">
          <button onclick="${state.user ? "showView('dashboard')" : "showView('landing')"}" 
            class="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-4 rounded-xl text-lg font-bold hover:from-purple-700 hover:to-pink-700 transition shadow-lg">
            <i class="fas fa-arrow-left mr-2"></i> ${state.user ? 'Vissza a Dashboard-ra' : 'Vissza a főoldalra'}
          </button>
        </div>
      </div>
    </div>
  `;
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
            <div class="flex gap-3">
              <button onclick="showView('guide')" 
                class="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition">
                <i class="fas fa-book"></i> Útmutató
              </button>
              <button onclick="showProcessesView()" 
                class="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition">
                <i class="fas fa-briefcase"></i> Folyamataim
              </button>
              <button onclick="handleLogout()" 
                class="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition">
                <i class="fas fa-sign-out-alt"></i> Kilépés
              </button>
            </div>
          </div>
        </div>
      </header>

      <!-- Main Content -->
      <div class="max-w-7xl mx-auto px-4 py-8">
        ${renderDashboardProcesses()}

        <!-- Progress Overview -->
        <div class="bg-white rounded-xl shadow-md p-6 mb-8 animate-slide-in">
          <h2 class="text-2xl font-bold text-gray-800 mb-4">
            <i class="fas fa-chart-line text-purple-600"></i> Tréning előrehaladás
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

function renderDashboardProcesses() {
  // Filter active processes (not archived)
  const activeProcesses = state.processes.filter(p => p.status !== 'archived');
  
  if (activeProcesses.length === 0) {
    return `
      <div class="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl shadow-md p-6 mb-8 border-2 border-blue-200 animate-slide-in">
        <div class="flex justify-between items-start">
          <div class="flex-1">
            <h2 class="text-2xl font-bold text-gray-800 mb-2">
              <i class="fas fa-briefcase text-blue-600"></i> Valós problémák elemzése
            </h2>
            <p class="text-gray-600 mb-4">
              A tréning után alkalmazd a tanult módszertant valós problémákra. 
              Hozz létre folyamatokat és kövesd nyomon az előrehaladásod!
            </p>
          </div>
          <button onclick="showCreateProcessModal()" 
            class="bg-blue-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-blue-700 transition shadow-lg whitespace-nowrap ml-4">
            <i class="fas fa-plus-circle"></i> Új folyamat
          </button>
        </div>
      </div>
    `;
  }
  
  return `
    <div class="bg-white rounded-xl shadow-md p-6 mb-8 animate-slide-in">
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-2xl font-bold text-gray-800">
          <i class="fas fa-briefcase text-blue-600"></i> Folyamataim (${activeProcesses.length})
        </h2>
        <div class="flex gap-3">
          <button onclick="showCreateProcessModal()" 
            class="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-blue-700 transition">
            <i class="fas fa-plus-circle"></i> Új folyamat
          </button>
          <button onclick="showProcessesView()" 
            class="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-300 transition">
            <i class="fas fa-list"></i> Mind
          </button>
        </div>
      </div>
      
      <div class="grid md:grid-cols-2 gap-4">
        ${activeProcesses.slice(0, 4).map(process => renderDashboardProcessCard(process)).join('')}
      </div>
      
      ${activeProcesses.length > 4 ? `
        <div class="text-center mt-4">
          <button onclick="showProcessesView()" 
            class="text-blue-600 hover:text-blue-700 font-medium">
            <i class="fas fa-arrow-right"></i> További ${activeProcesses.length - 4} folyamat megtekintése
          </button>
        </div>
      ` : ''}
    </div>
  `;
}

function renderDashboardProcessCard(process) {
  const statusColors = {
    active: 'border-blue-500 bg-blue-50',
    completed: 'border-green-500 bg-green-50'
  };
  
  const statusIcons = {
    active: 'fa-play-circle text-blue-600',
    completed: 'fa-check-circle text-green-600'
  };
  
  const statusTexts = {
    active: 'Aktív',
    completed: 'Befejezett'
  };
  
  const borderColor = statusColors[process.status] || statusColors.active;
  const statusIcon = statusIcons[process.status] || statusIcons.active;
  const statusText = statusTexts[process.status] || statusTexts.active;
  
  const progress = process.progress || 0;
  const lastUpdate = new Date(process.updated_at).toLocaleDateString('hu-HU', { 
    month: 'short', 
    day: 'numeric' 
  });
  
  return `
    <div class="border-l-4 ${borderColor} p-4 rounded-r-lg hover:shadow-md transition">
      <div class="flex justify-between items-start mb-2">
        <h3 class="text-lg font-bold text-gray-800 flex-1 pr-2">
          ${process.title}
        </h3>
        <span class="text-xs font-medium whitespace-nowrap">
          <i class="fas ${statusIcon}"></i> ${statusText}
        </span>
      </div>
      
      ${process.description ? `
        <p class="text-sm text-gray-600 mb-3 line-clamp-2">${process.description}</p>
      ` : ''}
      
      <div class="space-y-2">
        <div class="flex justify-between text-xs text-gray-500">
          <span><i class="fas fa-calendar"></i> ${lastUpdate}</span>
          <span><i class="fas fa-layer-group"></i> Nap ${process.current_day}/6</span>
          <span class="font-bold text-blue-600">${progress}%</span>
        </div>
        
        <div class="w-full bg-gray-200 rounded-full h-2">
          <div class="bg-blue-500 h-2 rounded-full transition-all" style="width: ${progress}%"></div>
        </div>
      </div>
      
      <button onclick="navigateToProcess(${process.id})" 
        class="w-full mt-3 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition font-medium text-sm">
        <i class="fas fa-arrow-right"></i> Folytatás
      </button>
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

function renderProcessesView() {
  return `
    <div class="min-h-screen bg-gray-50">
      <!-- Header -->
      <header class="gradient-bg text-white shadow-lg">
        <div class="max-w-7xl mx-auto px-4 py-6">
          <button onclick="showView('dashboard')" 
            class="text-white hover:text-purple-200 mb-4 flex items-center">
            <i class="fas fa-arrow-left mr-2"></i> Vissza a Dashboard-ra
          </button>
          <div class="flex justify-between items-center">
            <div>
              <h1 class="text-3xl font-bold">
                <i class="fas fa-briefcase"></i> Folyamataim
              </h1>
              <p class="text-purple-100 mt-1">Valós problémák elemzése a tréning módszertanával</p>
            </div>
            <button onclick="showCreateProcessModal()" 
              class="bg-white text-purple-600 px-6 py-3 rounded-lg font-bold hover:bg-purple-50 transition shadow-lg">
              <i class="fas fa-plus-circle"></i> Új folyamat
            </button>
          </div>
        </div>
      </header>

      <div class="max-w-7xl mx-auto px-4 py-8">
        ${state.processes.length === 0 ? `
          <!-- Empty State -->
          <div class="text-center py-16 bg-white rounded-xl shadow-md">
            <i class="fas fa-folder-open text-gray-300 text-6xl mb-4"></i>
            <h2 class="text-2xl font-bold text-gray-700 mb-2">Még nincs folyamatod</h2>
            <p class="text-gray-500 mb-6">Hozz létre egy új folyamatot egy valós probléma elemzéséhez</p>
            <button onclick="showCreateProcessModal()" 
              class="bg-purple-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-purple-700 transition">
              <i class="fas fa-plus-circle"></i> Új folyamat indítása
            </button>
          </div>
        ` : `
          <!-- Processes List -->
          <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            ${state.processes.map(process => renderProcessCard(process)).join('')}
          </div>
        `}
      </div>
    </div>
  `;
}

function renderProcessCard(process) {
  const statusColors = {
    active: 'bg-blue-100 text-blue-700 border-blue-300',
    completed: 'bg-green-100 text-green-700 border-green-300',
    archived: 'bg-gray-100 text-gray-700 border-gray-300'
  };
  
  const statusIcons = {
    active: 'fa-play-circle',
    completed: 'fa-check-circle',
    archived: 'fa-archive'
  };
  
  const statusTexts = {
    active: 'Aktív',
    completed: 'Befejezett',
    archived: 'Archivált'
  };
  
  const statusColor = statusColors[process.status] || statusColors.active;
  const statusIcon = statusIcons[process.status] || statusIcons.active;
  const statusText = statusTexts[process.status] || statusTexts.active;
  
  const progress = process.progress || 0;
  const lastUpdate = new Date(process.updated_at).toLocaleDateString('hu-HU');
  
  return `
    <div class="step-card bg-white rounded-xl shadow-md overflow-hidden border-l-4 ${statusColor}">
      <div class="p-6">
        <div class="flex justify-between items-start mb-3">
          <h3 class="text-xl font-bold text-gray-800 flex-1 pr-2">
            ${process.title}
          </h3>
          <span class="${statusColor} px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap">
            <i class="fas ${statusIcon}"></i> ${statusText}
          </span>
        </div>
        
        ${process.description ? `
          <p class="text-gray-600 mb-4 line-clamp-2">${process.description}</p>
        ` : ''}
        
        <div class="space-y-3">
          <div>
            <div class="flex justify-between text-sm mb-1">
              <span class="text-gray-600">Haladás</span>
              <span class="text-purple-600 font-bold">${progress}%</span>
            </div>
            <div class="w-full bg-gray-200 rounded-full h-2">
              <div class="bg-purple-500 h-2 rounded-full transition-all" style="width: ${progress}%"></div>
            </div>
          </div>
          
          <div class="flex justify-between text-sm text-gray-500">
            <span><i class="fas fa-calendar"></i> ${lastUpdate}</span>
            <span><i class="fas fa-layer-group"></i> Nap ${process.current_day || 1}</span>
          </div>
        </div>
        
        <div class="flex gap-2 mt-4">
          <button onclick="navigateToProcess(${process.id})" 
            class="flex-1 bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 transition">
            <i class="fas fa-arrow-right"></i> Folytatás
          </button>
          <button onclick="exportProcessToPDF(${process.id})" 
            class="bg-blue-100 text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-200 transition" 
            title="PDF Export">
            <i class="fas fa-file-pdf"></i>
          </button>
          <button onclick="deleteProcess(${process.id})" 
            class="bg-red-100 text-red-600 px-4 py-2 rounded-lg hover:bg-red-200 transition">
            <i class="fas fa-trash"></i>
          </button>
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

// Process management functions
async function showProcessesView() {
  try {
    const { processes } = await api.getProcesses();
    state.processes = processes;
    showView('processes');
  } catch (error) {
    alert('Hiba a folyamatok betöltésekor: ' + error.message);
  }
}

function showCreateProcessModal() {
  const modalHtml = `
    <div id="create-process-modal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onclick="closeCreateProcessModal(event)">
      <div class="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4 animate-slide-in" onclick="event.stopPropagation()">
        <div class="flex justify-between items-center mb-6">
          <h2 class="text-2xl font-bold text-gray-900">
            <i class="fas fa-plus-circle text-purple-600"></i> Új folyamat
          </h2>
          <button onclick="closeCreateProcessModal(event)" class="text-gray-400 hover:text-gray-600">
            <i class="fas fa-times text-xl"></i>
          </button>
        </div>
        <form onsubmit="handleCreateProcess(event)" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Folyamat címe <span class="text-red-500">*</span>
            </label>
            <input type="text" id="process-title" required
              placeholder="pl. Hatékonyság növelése a marketing csapatban"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent">
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              Probléma leírása (opcionális)
            </label>
            <textarea id="process-description" rows="4"
              placeholder="Rövid leírás arról, milyen problémán fogsz dolgozni..."
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"></textarea>
          </div>
          <div class="flex gap-3">
            <button type="submit" 
              class="flex-1 bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 transition">
              <i class="fas fa-check"></i> Létrehozás
            </button>
            <button type="button" onclick="closeCreateProcessModal(event)" 
              class="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400 transition">
              <i class="fas fa-times"></i> Mégse
            </button>
          </div>
        </form>
      </div>
    </div>
  `;
  document.body.insertAdjacentHTML('beforeend', modalHtml);
}

function closeCreateProcessModal(event) {
  event?.stopPropagation();
  const modal = document.getElementById('create-process-modal');
  if (modal) {
    modal.remove();
  }
}

async function handleCreateProcess(e) {
  e.preventDefault();
  const title = document.getElementById('process-title').value;
  const description = document.getElementById('process-description').value;
  
  try {
    const result = await api.createProcess(title, description);
    closeCreateProcessModal();
    alert('Folyamat sikeresen létrehozva!');
    showProcessesView(); // Refresh the list
  } catch (error) {
    alert('Hiba a folyamat létrehozásakor: ' + error.message);
  }
}

async function navigateToProcess(processId) {
  try {
    const { process, steps } = await api.getProcess(processId);
    const { responses } = await api.getProcessResponses(processId);
    
    state.currentProcess = process;
    state.isProcessMode = true;
    
    // Convert responses to map
    state.processResponses = {};
    responses.forEach(r => {
      const key = `${r.day_id}-${r.step_id}-${r.field_name}`;
      state.processResponses[key] = r.response_text;
    });
    
    // Navigate to first day
    const dayId = process.current_day || 1;
    const { day, steps: daySteps } = await api.getTrainingDay(dayId);
    showView('process-day', { day, steps: daySteps, process });
  } catch (error) {
    alert('Hiba a folyamat betöltésekor: ' + error.message);
  }
}

async function deleteProcess(processId) {
  if (!confirm('Biztosan törölni szeretnéd ezt a folyamatot?')) {
    return;
  }
  
  try {
    await api.deleteProcess(processId);
    alert('Folyamat törölve');
    showProcessesView(); // Refresh the list
  } catch (error) {
    alert('Hiba a folyamat törlésekor: ' + error.message);
  }
}

function exportProcessToPDF(processId) {
  // Open export template in new window with process ID and token
  const exportUrl = `/export-template.html?processId=${processId}&token=${state.token}`;
  window.open(exportUrl, '_blank', 'width=1400,height=900');
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
      </div>
    </div>
  `;
}

// Process-specific view renderers
function renderProcessDayView() {
  const day = state.currentDay;
  const steps = state.currentDaySteps;
  const process = state.currentProcess;
  
  return `
    <div class="min-h-screen bg-gray-50">
      <!-- Header -->
      <header class="gradient-bg text-white shadow-lg">
        <div class="max-w-7xl mx-auto px-4 py-6">
          <button onclick="showProcessesView()" 
            class="text-white hover:text-purple-200 mb-4 flex items-center">
            <i class="fas fa-arrow-left mr-2"></i> Vissza a folyamatokhoz
          </button>
          <div class="flex justify-between items-center">
            <div class="flex-1">
              <h1 class="text-3xl font-bold">${day.title}</h1>
              <p class="text-purple-100 mt-2">${day.subtitle}</p>
            </div>
            <div class="bg-white/20 px-4 py-2 rounded-lg">
              <div class="text-sm text-purple-100">Folyamat:</div>
              <div class="font-bold">${process.title}</div>
            </div>
          </div>
        </div>
      </header>

      <!-- Steps -->
      <div class="max-w-5xl mx-auto px-4 py-8">
        <h2 class="text-2xl font-bold text-gray-800 mb-6">
          <i class="fas fa-list-ol text-purple-600"></i> Lépések
        </h2>
        <div class="space-y-4">
          ${steps.map(step => renderProcessStepCard(step)).join('')}
        </div>
      </div>
    </div>
  `;
}

function renderProcessStepCard(step) {
  const process = state.currentProcess;
  
  // Check completion status (simplified for now - could be enhanced)
  let statusColor = 'bg-gray-100 text-gray-600 border-gray-300';
  let statusIcon = 'fa-circle';
  let statusText = 'Még nem kezdted el';
  
  return `
    <div class="step-card bg-white rounded-lg shadow-md border-l-4 ${statusColor} p-6 cursor-pointer"
      onclick="navigateToProcessStep(${process.id}, ${step.id})">
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

async function navigateToProcessStep(processId, stepId) {
  try {
    const step = state.currentDaySteps.find(s => s.id === stepId);
    if (!step) {
      alert('Lépés nem található');
      return;
    }
    
    state.currentStep = step;
    showView('process-step', { step, process: state.currentProcess });
  } catch (error) {
    alert('Hiba a lépés betöltésekor: ' + error.message);
  }
}

function renderProcessStepView() {
  const step = state.currentStep;
  const day = state.currentDay;
  const process = state.currentProcess;
  
  return `
    <div class="min-h-screen bg-gray-50">
      <!-- Header -->
      <header class="gradient-bg text-white shadow-lg">
        <div class="max-w-7xl mx-auto px-4 py-6">
          <button onclick="navigateToProcess(${process.id})" 
            class="text-white hover:text-purple-200 mb-4 flex items-center">
            <i class="fas fa-arrow-left mr-2"></i> Vissza a ${day.title}-hoz
          </button>
          <div class="flex justify-between items-center">
            <h1 class="text-3xl font-bold">
              ${step.step_number}. ${step.title}
            </h1>
            <div class="bg-white/20 px-4 py-2 rounded-lg text-sm">
              <div class="text-purple-100">Folyamat:</div>
              <div class="font-bold">${process.title}</div>
            </div>
          </div>
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
          
          <form id="process-step-form" onsubmit="handleProcessStepSubmit(event)" class="space-y-6">
            ${renderProcessExerciseFields(step)}
            
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
      </div>
    </div>
  `;
}

function renderProcessExerciseFields(step) {
  // Temporarily swap userResponses with processResponses to reuse existing logic
  const originalResponses = state.userResponses;
  state.userResponses = state.processResponses;
  
  // Call the existing renderExerciseFields
  const result = renderExerciseFields(step);
  
  // Restore original userResponses
  state.userResponses = originalResponses;
  
  return result;
}

async function handleProcessStepSubmit(e) {
  e.preventDefault();
  const action = e.submitter.value;
  const form = e.target;
  const formData = new FormData(form);
  const step = state.currentStep;
  const process = state.currentProcess;
  
  // Collect form data
  const responses = {};
  formData.forEach((value, key) => {
    const responseKey = `${step.day_id}-${step.id}-${key}`;
    responses[responseKey] = value;
    state.processResponses[responseKey] = value; // Update local state
  });
  
  try {
    // Save responses to process
    await api.saveProcessResponses(process.id, responses);
    
    if (action === 'complete') {
      // Mark step as completed
      await api.completeProcessStep(process.id, step.id);
      alert('Lépés befejezve és mentve!');
    } else {
      alert('Válaszok elmentve!');
    }
    
    // Go back to process day view
    navigateToProcess(process.id);
  } catch (error) {
    alert('Hiba a mentés során: ' + error.message);
  }
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
  
  // Helper to get response from different day (for cross-day references)
  const getResponseFromDay = (targetDayId, fieldName, targetStepNum) => {
    // Look in all training days
    for (const day of state.trainingDays) {
      if (day.id === targetDayId) {
        // Find the step in that day
        const daySteps = state.currentDaySteps.filter(s => s.day_id === targetDayId);
        const targetStep = daySteps.find(s => s.step_number === targetStepNum);
        if (targetStep) {
          const key = `${targetDayId}-${targetStep.id}-${fieldName}`;
          return state.userResponses[key] || '';
        }
      }
    }
    // Fallback: search in userResponses directly
    for (const [key, value] of Object.entries(state.userResponses)) {
      const parts = key.split('-');
      if (parts.length >= 3) {
        const [respDayId, respStepId, ...respFieldParts] = parts;
        const respFieldName = respFieldParts.join('-');
        if (parseInt(respDayId) === targetDayId && respFieldName === fieldName) {
          return value;
        }
      }
    }
    return '';
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
  
  // Day 2: Strategy and Leadership Style - builds on Day 1 problem & root cause
  if (dayId === 2) {
    // Helper: Get final problem and root cause from Day 1
    const getProblemFromDay1 = () => {
      const selectedId = getResponseFromDay(1, 'selected_priority_problem', 4);
      return selectedId ? getResponseFromDay(1, `problem_${selectedId}`, 1) : '';
    };
    
    const getRootCauseFromDay1 = () => {
      return getResponseFromDay(1, 'root_cause', 8);
    };
    
    const getSolutionFromDay1 = () => {
      return getResponseFromDay(1, 'root_cause_solution', 8);
    };
    
    // Step 1: Start with WHY (Golden Circle)
    if (stepNum === 1) {
      const problem = getProblemFromDay1();
      const rootCause = getRootCauseFromDay1();
      
      return `
        <div class="space-y-6">
          ${problem ? `
            <div class="bg-gradient-to-r from-purple-50 to-blue-50 p-4 rounded-lg border-l-4 border-purple-500">
              <p class="text-sm text-purple-800 font-medium">
                <i class="fas fa-link"></i> 1. Napból: Probléma
              </p>
              <p class="text-purple-900 mt-2 font-semibold">${problem}</p>
              ${rootCause ? `
                <p class="text-sm text-purple-700 mt-2">
                  <strong>Gyökérok:</strong> ${rootCause}
                </p>
              ` : ''}
            </div>
          ` : `
            <div class="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-lg">
              <p class="text-yellow-800">
                <i class="fas fa-exclamation-triangle"></i> 
                Ajánlott előbb befejezni az 1. Napot!
              </p>
            </div>
          `}
          
          <p class="text-gray-700 font-medium">
            <i class="fas fa-bullseye text-purple-500"></i> 
            Golden Circle: Miért akarod megoldani ezt a problémát?
          </p>
          
          <div class="bg-white border-2 border-blue-300 rounded-lg p-6">
            <label class="block font-semibold text-blue-900 mb-2">
              <i class="fas fa-heart"></i> MIÉRT? (WHY) - A mély cél
            </label>
            <p class="text-sm text-gray-600 mb-2">Mi a valódi motivációd? Miért fontos ez neked és a szervezetnek?</p>
            <textarea name="why_purpose" rows="4" required
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Pl. Azért, mert hiszem, hogy az emberek megérdemlik...">${getResponse('why_purpose')}</textarea>
          </div>
          
          <div class="bg-white border-2 border-green-300 rounded-lg p-6">
            <label class="block font-semibold text-green-900 mb-2">
              <i class="fas fa-cogs"></i> HOGYAN? (HOW) - Az egyedi módszer
            </label>
            <p class="text-sm text-gray-600 mb-2">Milyen egyedi módon közelíted meg? Mi a te különleges módszered?</p>
            <textarea name="how_method" rows="4" required
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              placeholder="Pl. Egy innovatív megközelítéssel, amely...">${getResponse('how_method')}</textarea>
          </div>
          
          <div class="bg-white border-2 border-purple-300 rounded-lg p-6">
            <label class="block font-semibold text-purple-900 mb-2">
              <i class="fas fa-box"></i> MIT? (WHAT) - A konkrét kimenet
            </label>
            <p class="text-sm text-gray-600 mb-2">Mi a konkrét eredmény, termék, szolgáltatás?</p>
            <textarea name="what_output" rows="4" required
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              placeholder="Pl. Egy új folyamat, ami...">${getResponse('what_output')}</textarea>
          </div>
          
          <div class="bg-blue-50 p-4 rounded-lg">
            <p class="text-sm text-blue-800">
              <i class="fas fa-info-circle"></i> 
              <strong>Simon Sinek:</strong> "Az emberek nem azt veszik meg, amit csinálsz, hanem azt, AMIÉRT csinálod."
            </p>
          </div>
        </div>
      `;
    }
    
    // Step 2: Vision
    if (stepNum === 2) {
      const why = getResponse('why_purpose', 1);
      
      return `
        <div class="space-y-6">
          ${why ? `
            <div class="bg-gradient-to-r from-purple-50 to-blue-50 p-4 rounded-lg border-l-4 border-purple-500">
              <p class="text-sm text-purple-800 font-medium">
                <i class="fas fa-link"></i> A te "MIÉRT"-ed (1. lépésből):
              </p>
              <p class="text-purple-900 mt-2">${why}</p>
            </div>
          ` : ''}
          
          <p class="text-gray-700 font-medium">
            <i class="fas fa-eye text-blue-500"></i> 
            Hogyan fog kinézni a jövő, amikor sikeresen megoldottad a problémát?
          </p>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              <i class="fas fa-calendar-alt"></i> Időhorizont (Mikor?)
            </label>
            <select name="vision_timeframe" required
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500">
              <option value="">-- Válassz időkeretet --</option>
              <option value="6months" ${getResponse('vision_timeframe') === '6months' ? 'selected' : ''}>6 hónap</option>
              <option value="1year" ${getResponse('vision_timeframe') === '1year' ? 'selected' : ''}>1 év</option>
              <option value="2years" ${getResponse('vision_timeframe') === '2years' ? 'selected' : ''}>2 év</option>
              <option value="5years" ${getResponse('vision_timeframe') === '5years' ? 'selected' : ''}>5 év</option>
            </select>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              <i class="fas fa-star"></i> Vízió (Inspiráló, pozitív jövőkép)
            </label>
            <textarea name="vision_statement" rows="6" required
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              placeholder="Képzeld el a sikeres jövőt! Írd le élénken, inspirálóan...">${getResponse('vision_statement')}</textarea>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              <i class="fas fa-chart-line"></i> Mérhető eredmények (3-5 konkrét)
            </label>
            ${[1,2,3].map(i => `
              <div class="mb-2">
                <input type="text" name="vision_metric_${i}" required
                  value="${getResponse(`vision_metric_${i}`)}"
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  placeholder="Pl. A csapat elégedettsége 85% fölött">
              </div>
            `).join('')}
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              <i class="fas fa-users"></i> Kit inspirál ez a vízió?
            </label>
            <textarea name="vision_stakeholders" rows="3" required
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              placeholder="Csapat, vezetőség, ügyfelek...">${getResponse('vision_stakeholders')}</textarea>
          </div>
        </div>
      `;
    }
    
    // Step 3: Strategic Goals (SMART/OKR)
    if (stepNum === 3) {
      const vision = getResponse('vision_statement', 2);
      
      return `
        <div class="space-y-6">
          ${vision ? `
            <div class="bg-gradient-to-r from-purple-50 to-blue-50 p-4 rounded-lg border-l-4 border-purple-500">
              <p class="text-sm text-purple-800 font-medium">
                <i class="fas fa-link"></i> A te vízióod (2. lépésből):
              </p>
              <p class="text-purple-900 mt-2 italic">"${vision}"</p>
            </div>
          ` : ''}
          
          <p class="text-gray-700 font-medium">
            <i class="fas fa-crosshairs text-green-500"></i> 
            Bontsd le 3-5 SMART célra:
          </p>
          
          ${[1,2,3].map(i => `
            <div class="bg-white border-2 border-green-300 rounded-lg p-6">
              <h4 class="font-bold text-gray-800 mb-4">
                <i class="fas fa-bullseye text-green-600"></i> Cél #${i}
              </h4>
              
              <div class="space-y-3">
                <div>
                  <label class="block text-xs font-medium text-gray-600 mb-1">
                    <strong>S</strong>pecific - Konkrét cél
                  </label>
                  <input type="text" name="goal_${i}_specific" required
                    value="${getResponse(`goal_${i}_specific`)}"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    placeholder="Pontosan mit akarsz elérni?">
                </div>
                
                <div>
                  <label class="block text-xs font-medium text-gray-600 mb-1">
                    <strong>M</strong>easurable - Mérőszám
                  </label>
                  <input type="text" name="goal_${i}_measurable" required
                    value="${getResponse(`goal_${i}_measurable`)}"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    placeholder="Hogyan méred? Mi a szám?">
                </div>
                
                <div class="grid grid-cols-2 gap-3">
                  <div>
                    <label class="block text-xs font-medium text-gray-600 mb-1">
                      <strong>A</strong>chievable - Elérhető?
                    </label>
                    <select name="goal_${i}_achievable" required
                      class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500">
                      <option value="">--</option>
                      <option value="yes" ${getResponse(`goal_${i}_achievable`) === 'yes' ? 'selected' : ''}>Igen, reális</option>
                      <option value="stretch" ${getResponse(`goal_${i}_achievable`) === 'stretch' ? 'selected' : ''}>Ambiciózus</option>
                      <option value="no" ${getResponse(`goal_${i}_achievable`) === 'no' ? 'selected' : ''}>Túl nehéz</option>
                    </select>
                  </div>
                  
                  <div>
                    <label class="block text-xs font-medium text-gray-600 mb-1">
                      <strong>R</strong>elevant - Releváns?
                    </label>
                    <select name="goal_${i}_relevant" required
                      class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500">
                      <option value="">--</option>
                      <option value="high" ${getResponse(`goal_${i}_relevant`) === 'high' ? 'selected' : ''}>Nagyon</option>
                      <option value="medium" ${getResponse(`goal_${i}_relevant`) === 'medium' ? 'selected' : ''}>Közepes</option>
                      <option value="low" ${getResponse(`goal_${i}_relevant`) === 'low' ? 'selected' : ''}>Alacsony</option>
                    </select>
                  </div>
                </div>
                
                <div>
                  <label class="block text-xs font-medium text-gray-600 mb-1">
                    <strong>T</strong>ime-bound - Határidő
                  </label>
                  <input type="date" name="goal_${i}_deadline" required
                    value="${getResponse(`goal_${i}_deadline`)}"
                    class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500">
                </div>
              </div>
            </div>
          `).join('')}
        </div>
      `;
    }
    
    // Step 4: Leadership Style (Goleman 6 styles)
    if (stepNum === 4) {
      return `
        <div class="space-y-6">
          <p class="text-gray-700 font-medium mb-4">
            <i class="fas fa-user-tie text-purple-500"></i> 
            Daniel Goleman 6 vezetői stílusa - Értékeld magad 1-10 skálán:
          </p>
          
          ${[
            {name: 'Irányító', key: 'coercive', desc: '"Csináld, amit mondok" - Gyors döntés, szigorú vezérlés', when: 'Válsághelyzetben', icon: 'fa-gavel'},
            {name: 'Tekintélyalapú', key: 'authoritative', desc: '"Gyere velem" - Vízió, inspiráció', when: 'Új irányvonal kell', icon: 'fa-flag'},
            {name: 'Kapcsolatalapú', key: 'affiliative', desc: '"Az emberek az elsők" - Harmónia', when: 'Bizalom építésénél', icon: 'fa-heart'},
            {name: 'Demokratikus', key: 'democratic', desc: '"Mi a véleményed?" - Részvétel', when: 'Konszenzus kell', icon: 'fa-users'},
            {name: 'Tempót diktáló', key: 'pacesetting', desc: '"Csináld úgy, ahogy én" - Példamutatás', when: 'Magas teljesítmény', icon: 'fa-tachometer-alt'},
            {name: 'Fejlesztő', key: 'coaching', desc: '"Próbáld ki ezt" - Tanítás', when: 'Fejlesztés, mentorálás', icon: 'fa-chalkboard-teacher'}
          ].map(style => `
            <div class="bg-white border-2 border-purple-200 rounded-lg p-4">
              <div class="flex items-start justify-between mb-3">
                <div class="flex-1">
                  <h4 class="font-bold text-gray-800 flex items-center gap-2">
                    <i class="fas ${style.icon} text-purple-600"></i>
                    ${style.name}
                  </h4>
                  <p class="text-sm text-gray-600 mt-1">${style.desc}</p>
                  <p class="text-xs text-green-700 mt-1">
                    <i class="fas fa-check-circle"></i> <strong>Mikor:</strong> ${style.when}
                  </p>
                </div>
              </div>
              
              <div class="flex items-center gap-3">
                <input type="range" name="style_${style.key}" min="1" max="10" 
                  value="${getResponse(`style_${style.key}`) || 5}"
                  class="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  oninput="document.getElementById('style_${style.key}_value').innerText = this.value">
                <span id="style_${style.key}_value" class="text-2xl font-bold text-purple-600 w-12 text-center">
                  ${getResponse(`style_${style.key}`) || 5}
                </span>
              </div>
            </div>
          `).join('')}
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              <i class="fas fa-lightbulb"></i> Melyik stílust szeretnéd fejleszteni?
            </label>
            <textarea name="style_develop" rows="3" required
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              placeholder="Melyik stílusban akarsz erősebb lenni és miért?">${getResponse('style_develop')}</textarea>
          </div>
        </div>
      `;
    }
    
    // Step 5: Action Plan
    if (stepNum === 5) {
      const goals = [1,2,3].map(i => ({
        id: i,
        specific: getResponse(`goal_${i}_specific`, 3),
        deadline: getResponse(`goal_${i}_deadline`, 3)
      })).filter(g => g.specific);
      
      return `
        <div class="space-y-6">
          ${goals.length > 0 ? `
            <div class="bg-gradient-to-r from-purple-50 to-blue-50 p-4 rounded-lg border-l-4 border-purple-500">
              <p class="text-sm text-purple-800 font-medium mb-2">
                <i class="fas fa-link"></i> Célok (3. lépésből):
              </p>
              <ul class="list-disc list-inside space-y-1 text-sm text-purple-900">
                ${goals.map(g => `<li>${g.specific} (${g.deadline})</li>`).join('')}
              </ul>
            </div>
          ` : ''}
          
          <p class="text-gray-700 font-medium">
            <i class="fas fa-tasks text-blue-500"></i> 
            Akcióterv: Bontsd le a célokat konkrét lépésekre
          </p>
          
          <div class="overflow-x-auto">
            <table class="w-full border-collapse bg-white shadow-sm rounded-lg overflow-hidden">
              <thead class="bg-blue-600 text-white text-sm">
                <tr>
                  <th class="px-3 py-2 text-left">Akció</th>
                  <th class="px-3 py-2 text-left w-32">Felelős</th>
                  <th class="px-3 py-2 text-left w-32">Határidő</th>
                  <th class="px-3 py-2 text-left w-32">Erőforrás</th>
                  <th class="px-3 py-2 text-left">KPI/Mérés</th>
                </tr>
              </thead>
              <tbody>
                ${[1,2,3,4,5].map(i => `
                  <tr class="border-b hover:bg-gray-50">
                    <td class="px-3 py-2">
                      <input type="text" name="action_${i}_task" ${i <= 3 ? 'required' : ''}
                        value="${getResponse(`action_${i}_task`)}"
                        class="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 text-sm"
                        placeholder="Mit kell csinálni?">
                    </td>
                    <td class="px-3 py-2">
                      <input type="text" name="action_${i}_owner" ${i <= 3 ? 'required' : ''}
                        value="${getResponse(`action_${i}_owner`)}"
                        class="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 text-sm"
                        placeholder="Ki?">
                    </td>
                    <td class="px-3 py-2">
                      <input type="date" name="action_${i}_deadline" ${i <= 3 ? 'required' : ''}
                        value="${getResponse(`action_${i}_deadline`)}"
                        class="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 text-sm">
                    </td>
                    <td class="px-3 py-2">
                      <input type="text" name="action_${i}_resource" ${i <= 3 ? 'required' : ''}
                        value="${getResponse(`action_${i}_resource`)}"
                        class="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 text-sm"
                        placeholder="Mi kell?">
                    </td>
                    <td class="px-3 py-2">
                      <input type="text" name="action_${i}_kpi" ${i <= 3 ? 'required' : ''}
                        value="${getResponse(`action_${i}_kpi`)}"
                        class="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 text-sm"
                        placeholder="Hogyan méred?">
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
          
          <div class="bg-blue-50 p-4 rounded-lg">
            <p class="text-sm text-blue-800">
              <i class="fas fa-info-circle"></i> 
              Legalább 3 akciót adj meg! A részletesebb terv könnyebb végrehajtást eredményez.
            </p>
          </div>
        </div>
      `;
    }
    
    // Step 6: Decision Making Process
    if (stepNum === 6) {
      return `
        <div class="space-y-6">
          <p class="text-gray-700 font-medium">
            <i class="fas fa-balance-scale text-purple-500"></i> 
            Hogyan fogsz dönteni a végrehajtás során?
          </p>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              <i class="fas fa-sitemap"></i> Döntési keretrendszer
            </label>
            <select name="decision_framework" required
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500">
              <option value="">-- Válassz keretrendszert --</option>
              <option value="consensus" ${getResponse('decision_framework') === 'consensus' ? 'selected' : ''}>Konszenzus alapú</option>
              <option value="consultative" ${getResponse('decision_framework') === 'consultative' ? 'selected' : ''}>Konzultatív (meghallgat, de te döntesz)</option>
              <option value="delegated" ${getResponse('decision_framework') === 'delegated' ? 'selected' : ''}>Delegált (mások döntenek)</option>
              <option value="autocratic" ${getResponse('decision_framework') === 'autocratic' ? 'selected' : ''}>Autokratikus (te döntesz egyedül)</option>
            </select>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              <i class="fas fa-users"></i> Kit vonsz be a döntésekbe?
            </label>
            <textarea name="decision_stakeholders" rows="3" required
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              placeholder="Csapattagok, szakértők, vezetőség...">${getResponse('decision_stakeholders')}</textarea>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              <i class="fas fa-clipboard-list"></i> Döntési kritériumok (Mi alapján döntesz?)
            </label>
            ${[1,2,3].map(i => `
              <div class="mb-2">
                <input type="text" name="decision_criteria_${i}" required
                  value="${getResponse(`decision_criteria_${i}`)}"
                  class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  placeholder="Pl. Költség-haszon arány">
              </div>
            `).join('')}
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              <i class="fas fa-stopwatch"></i> Mennyi időd van döntésre?
            </label>
            <select name="decision_timeframe" required
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500">
              <option value="">-- Válassz --</option>
              <option value="immediate" ${getResponse('decision_timeframe') === 'immediate' ? 'selected' : ''}>Azonnali (1-2 nap)</option>
              <option value="short" ${getResponse('decision_timeframe') === 'short' ? 'selected' : ''}>Rövid (1 hét)</option>
              <option value="medium" ${getResponse('decision_timeframe') === 'medium' ? 'selected' : ''}>Közepes (2-4 hét)</option>
              <option value="long" ${getResponse('decision_timeframe') === 'long' ? 'selected' : ''}>Hosszú (1+ hónap)</option>
            </select>
          </div>
        </div>
      `;
    }
    
    // Step 7: Communication Plan
    if (stepNum === 7) {
      const vision = getResponse('vision_statement', 2);
      
      return `
        <div class="space-y-6">
          ${vision ? `
            <div class="bg-gradient-to-r from-purple-50 to-blue-50 p-4 rounded-lg border-l-4 border-purple-500">
              <p class="text-sm text-purple-800 font-medium">
                <i class="fas fa-link"></i> Mit kommunikálsz? (Vízió):
              </p>
              <p class="text-purple-900 mt-2 italic">"${vision}"</p>
            </div>
          ` : ''}
          
          <p class="text-gray-700 font-medium">
            <i class="fas fa-bullhorn text-blue-500"></i> 
            Hogyan kommunikálod a változást és stratégiát?
          </p>
          
          <div class="overflow-x-auto">
            <table class="w-full border-collapse bg-white shadow-sm rounded-lg overflow-hidden">
              <thead class="bg-green-600 text-white text-sm">
                <tr>
                  <th class="px-3 py-2 text-left">Célcsoport</th>
                  <th class="px-3 py-2 text-left">Üzenet</th>
                  <th class="px-3 py-2 text-left w-32">Csatorna</th>
                  <th class="px-3 py-2 text-left w-32">Gyakoriság</th>
                </tr>
              </thead>
              <tbody>
                ${['Csapat', 'Vezetőség', 'Érintettek', 'Egyéb'].map((group, idx) => `
                  <tr class="border-b hover:bg-gray-50">
                    <td class="px-3 py-2 font-medium">${group}</td>
                    <td class="px-3 py-2">
                      <input type="text" name="comm_${idx}_message" required
                        value="${getResponse(`comm_${idx}_message`)}"
                        class="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-green-500 text-sm"
                        placeholder="Mit mondasz?">
                    </td>
                    <td class="px-3 py-2">
                      <select name="comm_${idx}_channel" required
                        class="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-green-500 text-sm">
                        <option value="">--</option>
                        <option value="meeting" ${getResponse(`comm_${idx}_channel`) === 'meeting' ? 'selected' : ''}>Meeting</option>
                        <option value="email" ${getResponse(`comm_${idx}_channel`) === 'email' ? 'selected' : ''}>Email</option>
                        <option value="presentation" ${getResponse(`comm_${idx}_channel`) === 'presentation' ? 'selected' : ''}>Prezentáció</option>
                        <option value="workshop" ${getResponse(`comm_${idx}_channel`) === 'workshop' ? 'selected' : ''}>Workshop</option>
                      </select>
                    </td>
                    <td class="px-3 py-2">
                      <select name="comm_${idx}_frequency" required
                        class="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-green-500 text-sm">
                        <option value="">--</option>
                        <option value="once" ${getResponse(`comm_${idx}_frequency`) === 'once' ? 'selected' : ''}>Egyszeri</option>
                        <option value="weekly" ${getResponse(`comm_${idx}_frequency`) === 'weekly' ? 'selected' : ''}>Heti</option>
                        <option value="monthly" ${getResponse(`comm_${idx}_frequency`) === 'monthly' ? 'selected' : ''}>Havi</option>
                        <option value="quarterly" ${getResponse(`comm_${idx}_frequency`) === 'quarterly' ? 'selected' : ''}>Negyedéves</option>
                      </select>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              <i class="fas fa-quote-left"></i> Elevator Pitch (30 másodperc)
            </label>
            <textarea name="elevator_pitch" rows="4" required
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
              placeholder="Ha 30 másodperced van, hogyan foglalnád össze a változást?">${getResponse('elevator_pitch')}</textarea>
          </div>
        </div>
      `;
    }
    
    // Step 8: Risk Analysis
    if (stepNum === 8) {
      return `
        <div class="space-y-6">
          <p class="text-gray-700 font-medium">
            <i class="fas fa-exclamation-triangle text-red-500"></i> 
            Mi mehet rosszul? Készülj fel!
          </p>
          
          <div class="overflow-x-auto">
            <table class="w-full border-collapse bg-white shadow-sm rounded-lg overflow-hidden">
              <thead class="bg-red-600 text-white text-sm">
                <tr>
                  <th class="px-3 py-2 text-left">Kockázat</th>
                  <th class="px-3 py-2 text-center w-24">Valószínűség (1-5)</th>
                  <th class="px-3 py-2 text-center w-24">Hatás (1-5)</th>
                  <th class="px-3 py-2 text-left">Megelőzés</th>
                  <th class="px-3 py-2 text-left">B terv</th>
                </tr>
              </thead>
              <tbody>
                ${[1,2,3,4,5].map(i => `
                  <tr class="border-b hover:bg-gray-50">
                    <td class="px-3 py-2">
                      <input type="text" name="risk_${i}_description" ${i <= 3 ? 'required' : ''}
                        value="${getResponse(`risk_${i}_description`)}"
                        class="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-red-500 text-sm"
                        placeholder="Mi a kockázat?">
                    </td>
                    <td class="px-3 py-2">
                      <input type="number" name="risk_${i}_probability" min="1" max="5" ${i <= 3 ? 'required' : ''}
                        value="${getResponse(`risk_${i}_probability`)}"
                        class="w-full px-2 py-1 border border-gray-300 rounded text-center focus:ring-2 focus:ring-red-500 text-sm">
                    </td>
                    <td class="px-3 py-2">
                      <input type="number" name="risk_${i}_impact" min="1" max="5" ${i <= 3 ? 'required' : ''}
                        value="${getResponse(`risk_${i}_impact`)}"
                        class="w-full px-2 py-1 border border-gray-300 rounded text-center focus:ring-2 focus:ring-red-500 text-sm">
                    </td>
                    <td class="px-3 py-2">
                      <input type="text" name="risk_${i}_prevention" ${i <= 3 ? 'required' : ''}
                        value="${getResponse(`risk_${i}_prevention`)}"
                        class="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-red-500 text-sm"
                        placeholder="Hogyan előzöd meg?">
                    </td>
                    <td class="px-3 py-2">
                      <input type="text" name="risk_${i}_contingency" ${i <= 3 ? 'required' : ''}
                        value="${getResponse(`risk_${i}_contingency`)}"
                        class="w-full px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-red-500 text-sm"
                        placeholder="Ha mégis bekövetkezik?">
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
          
          <div class="grid grid-cols-2 gap-4">
            <div class="bg-yellow-50 p-4 rounded-lg border-l-4 border-yellow-400">
              <label class="block font-semibold text-yellow-900 mb-2">
                <i class="fas fa-shield-alt"></i> Legnagyobb kockázat
              </label>
              <textarea name="biggest_risk" rows="3" required
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500"
                placeholder="Mi a #1 kockázat?">${getResponse('biggest_risk')}</textarea>
            </div>
            
            <div class="bg-green-50 p-4 rounded-lg border-l-4 border-green-400">
              <label class="block font-semibold text-green-900 mb-2">
                <i class="fas fa-check-double"></i> Legfontosabb megelőzés
              </label>
              <textarea name="top_mitigation" rows="3" required
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                placeholder="Mit teszel azonnal?">${getResponse('top_mitigation')}</textarea>
            </div>
          </div>
          
          <div class="bg-blue-50 p-4 rounded-lg">
            <p class="text-sm text-blue-800">
              <i class="fas fa-info-circle"></i> 
              <strong>Kockázat = Valószínűség × Hatás.</strong> Ha >= 15, azonnal cselekedj!
            </p>
          </div>
        </div>
      `;
    }
  }
  
  // Day 3: Team Building (8 steps)
  if (dayId === 3) {
    // Helper to get actions and goals from Day 2
    const getActionsFromDay2 = () => {
      const actions = [];
      for (let i = 1; i <= 5; i++) {
        const task = getResponseFromDay(2, `action_${i}_task`, 5);
        if (task) actions.push(task);
      }
      return actions;
    };

    // Step 1: Role identification
    if (stepNum === 1) {
      const actions = getActionsFromDay2();
      
      return `
        <div class="space-y-6">
          ${actions.length > 0 ? `
            <div class="bg-gradient-to-r from-purple-50 to-blue-50 p-4 rounded-lg border-l-4 border-purple-500">
              <p class="text-sm text-purple-800 font-medium mb-2">
                <i class="fas fa-link"></i> Akciók a 2. Napból:
              </p>
              <ul class="list-disc list-inside space-y-1 text-sm text-purple-900">
                ${actions.map(a => `<li>${a}</li>`).join('')}
              </ul>
            </div>
          ` : ''}

          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                1. Milyen szerepekre és pozíciókra van szükség a stratégia végrehajtásához?
              </label>
              <textarea name="required_roles" rows="5" 
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                placeholder="Sorold fel a kritikus szerepköröket (pl. projektvezető, technikai szakértő, üzleti elemző...)">${getResponse('required_roles')}</textarea>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                2. Milyen funkcióknak kell lefedve lennie? (WBS - Work Breakdown Structure)
              </label>
              <textarea name="functions" rows="4" 
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                placeholder="Pl. tervezés, végrehajtás, monitoring, kommunikáció, minőségbiztosítás...">${getResponse('functions')}</textarea>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                3. Átfedések és hiányok a szerepekben?
              </label>
              <textarea name="role_gaps" rows="3" 
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                placeholder="Milyen kritikus funkciók maradnak lefedetlen? Hol van túl sok ember?">${getResponse('role_gaps')}</textarea>
            </div>
          </div>
        </div>
      `;
    }

    // Step 2: Competency analysis
    if (stepNum === 2) {
      const roles = getResponse('required_roles', 1);
      
      return `
        <div class="space-y-6">
          ${roles ? `
            <div class="bg-gradient-to-r from-purple-50 to-blue-50 p-4 rounded-lg border-l-4 border-purple-500">
              <p class="text-sm text-purple-800 font-medium mb-2">
                <i class="fas fa-link"></i> Szerepek az 1. lépésből:
              </p>
              <p class="text-sm text-purple-900">${roles.substring(0, 150)}${roles.length > 150 ? '...' : ''}</p>
            </div>
          ` : ''}

          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                1. Kompetencia profilok - Minden szerepkörhöz szükséges készségek
              </label>
              <textarea name="competency_profiles" rows="6" 
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                placeholder="Szerepkör → Szükséges készségek, tudás, tapasztalat
Pl. Projektvezető: 5+ év tapasztalat, PMP certifikáció, agile módszertan, kommunikáció...">${getResponse('competency_profiles')}</textarea>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                2. T-alakú készségmodell - Széles tudás (T vízszintes) + Mély szakértelem (T függőleges)
              </label>
              <textarea name="t_shaped_skills" rows="4" 
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                placeholder="Mely területeken kell széles tudás? Hol kell mély szakértelem?">${getResponse('t_shaped_skills')}</textarea>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                3. Hard skills vs Soft skills - Mi a megfelelő egyensúly?
              </label>
              <textarea name="skills_balance" rows="3" 
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                placeholder="Technikai készségek és emberközpontú készségek aránya...">${getResponse('skills_balance')}</textarea>
            </div>
          </div>
        </div>
      `;
    }

    // Step 3: RACI Matrix
    if (stepNum === 3) {
      const actions = getActionsFromDay2();
      
      return `
        <div class="space-y-6">
          ${actions.length > 0 ? `
            <div class="bg-gradient-to-r from-purple-50 to-blue-50 p-4 rounded-lg border-l-4 border-purple-500">
              <p class="text-sm text-purple-800 font-medium mb-2">
                <i class="fas fa-link"></i> Főbb feladatok a 2. Napból:
              </p>
              <ul class="list-disc list-inside space-y-1 text-sm text-purple-900">
                ${actions.map(a => `<li>${a}</li>`).join('')}
              </ul>
            </div>
          ` : ''}

          <p class="text-gray-700 font-medium mb-4">
            <i class="fas fa-table text-blue-500"></i> 
            RACI: Responsible (felelős), Accountable (elszámoltatható), Consulted (konzultált), Informed (tájékoztatott)
          </p>

          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                1. RACI Mátrix - Főbb feladatok és döntések
              </label>
              <textarea name="raci_matrix" rows="10" 
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 font-mono text-sm"
                placeholder="Feladat/Döntés      | Személy1 | Személy2 | Személy3
--------------------|----------|----------|----------
Terv készítése      | R        | A        | C
Budget jóváhagyás   | C        | A        | I
...

R = Responsible (csinálja)
A = Accountable (felelős, csak 1!)  
C = Consulted (megkérdezzük)
I = Informed (tájékoztatjuk)">${getResponse('raci_matrix')}</textarea>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                2. Döntéshozatal - Ki dönt miről? Milyen szinten?
              </label>
              <textarea name="decision_authority" rows="4" 
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                placeholder="Stratégiai döntések: ...
Operatív döntések: ...
Napi döntések: ...">${getResponse('decision_authority')}</textarea>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                3. Felelősségi konfliktusok - Hol van duplikáció vagy hiány?
              </label>
              <textarea name="responsibility_conflicts" rows="3" 
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                placeholder="Mely feladatoknál nincs egyértelmű felelős (A)? Hol van több A?">${getResponse('responsibility_conflicts')}</textarea>
            </div>
          </div>
        </div>
      `;
    }

    // Step 4: Team structure design
    if (stepNum === 4) {
      const roles = getResponse('required_roles', 1);
      
      return `
        <div class="space-y-6">
          ${roles ? `
            <div class="bg-gradient-to-r from-purple-50 to-blue-50 p-4 rounded-lg border-l-4 border-purple-500">
              <p class="text-sm text-purple-800 font-medium mb-2">
                <i class="fas fa-link"></i> Szerepek:
              </p>
              <p class="text-sm text-purple-900">${roles.substring(0, 120)}${roles.length > 120 ? '...' : ''}</p>
            </div>
          ` : ''}

          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                1. Szervezeti struktúra - Hierarchikus, lapos, mátrix, agile?
              </label>
              <select name="org_structure" 
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500">
                <option value="">Válassz...</option>
                <option value="hierarchical" ${getResponse('org_structure') === 'hierarchical' ? 'selected' : ''}>Hierarchikus (tradicionális)</option>
                <option value="flat" ${getResponse('org_structure') === 'flat' ? 'selected' : ''}>Lapos (kevés szint)</option>
                <option value="matrix" ${getResponse('org_structure') === 'matrix' ? 'selected' : ''}>Mátrix (több jelentési vonal)</option>
                <option value="agile" ${getResponse('org_structure') === 'agile' ? 'selected' : ''}>Agile (önszerveződő csapatok)</option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                2. Span of Control - Hány ember tartozik egy vezetőhöz?
              </label>
              <textarea name="span_of_control" rows="3" 
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                placeholder="Optimális csapatméret és vezetési arány (pl. 1:5-7)">${getResponse('span_of_control')}</textarea>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                3. Kommunikációs vonalak - Kinek kinek kell jelentenie?
              </label>
              <textarea name="reporting_lines" rows="5" 
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                placeholder="Rajzold le a jelentési vonalakat (ki → kinek jelent)">${getResponse('reporting_lines')}</textarea>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                4. Meeting struktúra - Milyen gyakran és kikkel?
              </label>
              <textarea name="meeting_structure" rows="4" 
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                placeholder="Napi stand-up, heti sync, havi review...">${getResponse('meeting_structure')}</textarea>
            </div>
          </div>
        </div>
      `;
    }

    // Step 5: Talent assessment
    if (stepNum === 5) {
      return `
        <div class="space-y-6">
          <p class="text-gray-700 font-medium mb-4">
            <i class="fas fa-star text-blue-500"></i> 
            Értékeld a meglévő csapat tagjait kompetencia és potenciál alapján.
          </p>

          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                1. 9-Box Talent Grid - Teljesítmény × Potenciál
              </label>
              <textarea name="nine_box_grid" rows="8" 
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 font-mono text-sm"
                placeholder="           | Alacsony | Közepes | Magas
           | Potenciál| Potenciál| Potenciál
-----------|----------|----------|----------
Magas      |          |          |
Teljesítm. |          |          |
-----------|----------|----------|----------
Közepes    |          |          |
Teljesítm. |          |          |
-----------|----------|----------|----------
Alacsony   |          |          |
Teljesítm. |          |          |

Írd a neveket a megfelelő cellákba!">${getResponse('nine_box_grid')}</textarea>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                2. Erősségek - Ki miben kiemelkedő?
              </label>
              <textarea name="team_strengths" rows="5" 
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                placeholder="Név → Erősségek (kompetenciák, soft skills, tapasztalat...)">${getResponse('team_strengths')}</textarea>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                3. Fejlesztendő területek - Ki min dolgozzon?
              </label>
              <textarea name="development_areas" rows="5" 
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                placeholder="Név → Fejlesztendő területek, hiányzó készségek...">${getResponse('development_areas')}</textarea>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                4. Karrier potenciál - Ki tud feljebb lépni?
              </label>
              <textarea name="career_potential" rows="4" 
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                placeholder="High potential (HiPo) tehetségek azonosítása...">${getResponse('career_potential')}</textarea>
            </div>
          </div>
        </div>
      `;
    }

    // Step 6: Gap analysis
    if (stepNum === 6) {
      const requiredComp = getResponse('competency_profiles', 2);
      const teamStrengths = getResponse('team_strengths', 5);
      
      return `
        <div class="space-y-6">
          ${requiredComp || teamStrengths ? `
            <div class="bg-gradient-to-r from-purple-50 to-blue-50 p-4 rounded-lg border-l-4 border-purple-500">
              <p class="text-sm text-purple-800 font-medium mb-2">
                <i class="fas fa-link"></i> Korábbi lépésekből:
              </p>
              ${requiredComp ? `<p class="text-sm text-purple-900 mb-2"><strong>Szükséges kompetenciák:</strong> ${requiredComp.substring(0, 100)}...</p>` : ''}
              ${teamStrengths ? `<p class="text-sm text-purple-900"><strong>Csapat erősségei:</strong> ${teamStrengths.substring(0, 100)}...</p>` : ''}
            </div>
          ` : ''}

          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                1. Skills Gap Analysis - Kompetencia mátrix
              </label>
              <textarea name="skills_gap_matrix" rows="10" 
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 font-mono text-sm"
                placeholder="Kompetencia       | Szükséges | Jelenlegi | Gap | Prioritás
------------------|-----------|-----------|-----|----------
Projektmenedzsment| 5         | 3         | 2   | Magas
Adatelemzés       | 4         | 4         | 0   | -
Agile módszertan  | 5         | 2         | 3   | Kritikus
...

1-5 skála, Gap = Szükséges - Jelenlegi">${getResponse('skills_gap_matrix')}</textarea>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                2. Kritikus hiányosságok - Melyek akadályozzák a sikert?
              </label>
              <textarea name="critical_gaps" rows="4" 
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                placeholder="Listázd a top 3-5 hiányosságot, ami nélkül a projekt veszélyben van...">${getResponse('critical_gaps')}</textarea>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                3. FTE analízis - Mennyivel több/kevesebb ember kell?
              </label>
              <textarea name="fte_analysis" rows="3" 
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                placeholder="Jelenlegi FTE vs szükséges FTE szerepkörönként...">${getResponse('fte_analysis')}</textarea>
            </div>
          </div>
        </div>
      `;
    }

    // Step 7: Recruitment/development plan
    if (stepNum === 7) {
      const criticalGaps = getResponse('critical_gaps', 6);
      
      return `
        <div class="space-y-6">
          ${criticalGaps ? `
            <div class="bg-gradient-to-r from-purple-50 to-blue-50 p-4 rounded-lg border-l-4 border-purple-500">
              <p class="text-sm text-purple-800 font-medium mb-2">
                <i class="fas fa-link"></i> Kritikus hiányok a 6. lépésből:
              </p>
              <p class="text-sm text-purple-900">${criticalGaps.substring(0, 150)}${criticalGaps.length > 150 ? '...' : ''}</p>
            </div>
          ` : ''}

          <p class="text-gray-700 font-medium mb-4">
            <i class="fas fa-tasks text-blue-500"></i> 
            Make vs Buy vs Borrow - Kit fejlesztesz, kit toborzol, kit kölcsönzöl?
          </p>

          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                1. MAKE - Belső fejlesztés (70-20-10 modell)
              </label>
              <textarea name="make_development" rows="5" 
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                placeholder="70% learning on the job (projektmunka)
20% learning from others (mentorálás, coaching)
10% formal training (kurzusok, certifikációk)

Kit fejlesztesz? Milyen módszerrel?">${getResponse('make_development')}</textarea>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                2. BUY - Toborzás (új emberek)
              </label>
              <textarea name="buy_recruitment" rows="5" 
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                placeholder="Milyen pozíciókra toborozhatsz? 
Milyen időkeretek? Milyen költségek?
Hol hirdetesz? (LinkedIn, Profession.hu...)">${getResponse('buy_recruitment')}</textarea>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                3. BORROW - Külső partner, tanácsadó, contractor
              </label>
              <textarea name="borrow_external" rows="4" 
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                placeholder="Mely feladatokat adnál ki külső partnernek?
Ideiglenes vagy hosszú távú együttműködés?">${getResponse('borrow_external')}</textarea>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                4. Akcióterv - Ki, Mit, Mikor, Mennyiért
              </label>
              <textarea name="action_plan" rows="6" 
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 font-mono text-sm"
                placeholder="Akció           | Felelős | Határidő | Költség | Megoldás
----------------|---------|----------|---------|----------
Data scientist  | HR      | Q2       | 15M Ft  | Toborzás
Agile tréning   | L&D     | Q1       | 500k Ft | Fejlesztés
...">${getResponse('action_plan')}</textarea>
            </div>
          </div>
        </div>
      `;
    }

    // Step 8: Team composition finalization
    if (stepNum === 8) {
      const roles = getResponse('required_roles', 1);
      const structure = getResponse('org_structure', 4);
      
      return `
        <div class="space-y-6">
          <p class="text-gray-700 font-medium mb-4">
            <i class="fas fa-check-circle text-green-500"></i> 
            Véglegesítsd a csapat összetételét - A teljes "Ki-Mit-Mikor-Hogyan"
          </p>

          ${roles || structure ? `
            <div class="bg-gradient-to-r from-purple-50 to-blue-50 p-4 rounded-lg border-l-4 border-purple-500">
              <p class="text-sm text-purple-800 font-medium mb-2">
                <i class="fas fa-link"></i> Korábbi döntések:
              </p>
              ${roles ? `<p class="text-sm text-purple-900 mb-2"><strong>Szerepek:</strong> ${roles.substring(0, 80)}...</p>` : ''}
              ${structure ? `<p class="text-sm text-purple-900"><strong>Struktúra:</strong> ${structure}</p>` : ''}
            </div>
          ` : ''}

          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                1. Team Charter - A csapat küldetése és célja
              </label>
              <textarea name="team_charter" rows="5" 
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                placeholder="Mi a csapat célja? Mit fog elérni? Hogyan fog együtt dolgozni?
Értékek, szabályok, elvárások...">${getResponse('team_charter')}</textarea>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                2. Végleges szerepkör-leírások - Ki mit csinál pontosan?
              </label>
              <textarea name="final_role_descriptions" rows="8" 
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                placeholder="Szerepkör: ...
Felelősségek: ...
Elvárások: ...
KPI-ok: ...
--
Szerepkör: ...
...">${getResponse('final_role_descriptions')}</textarea>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                3. Csapatösszetételi mátrix - A teljes kép
              </label>
              <textarea name="team_composition_matrix" rows="8" 
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 font-mono text-sm"
                placeholder="Név      | Szerepkör     | Főbb felelősségek | Jelentés | Start
---------|---------------|-------------------|----------|-------
Kiss J.  | Projektvezető | Terv, koordináció | Igazgató | Azonnal
Nagy A.  | Tech Lead     | Architektúra      | Kiss J.  | Q1
...">${getResponse('team_composition_matrix')}</textarea>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                4. Kick-off terv - Hogyan indítod a csapatot?
              </label>
              <textarea name="kickoff_plan" rows="5" 
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                placeholder="Kick-off meeting: mikor, hol, kik?
Team building aktivitás?
Első 30/60/90 nap terv?
Kommunikációs szabályok?">${getResponse('kickoff_plan')}</textarea>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                5. Sikermutatók - Honnan tudod, hogy jól működik a csapat?
              </label>
              <textarea name="team_success_metrics" rows="4" 
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                placeholder="Teljesítmény KPI-ok, együttműködési mutatók, elégedettség...">${getResponse('team_success_metrics')}</textarea>
            </div>
          </div>
        </div>
      `;
    }
  }
  
  // Day 4: Performance Management (8 steps)
  if (dayId === 4) {
    // Helper to get goals from Day 2
    const getGoalsFromDay2 = () => {
      const goals = [];
      for (let i = 1; i <= 5; i++) {
        const specific = getResponseFromDay(2, `goal_${i}_specific`, 3);
        if (specific) goals.push(specific);
      }
      return goals;
    };

    // Step 1: KPI definition
    if (stepNum === 1) {
      const goals = getGoalsFromDay2();
      
      return `
        <div class="space-y-6">
          ${goals.length > 0 ? `
            <div class="bg-gradient-to-r from-purple-50 to-blue-50 p-4 rounded-lg border-l-4 border-purple-500">
              <p class="text-sm text-purple-800 font-medium mb-2">
                <i class="fas fa-link"></i> Stratégiai célok a 2. Napból:
              </p>
              <ul class="list-disc list-inside space-y-1 text-sm text-purple-900">
                ${goals.map(g => `<li>${g}</li>`).join('')}
              </ul>
            </div>
          ` : ''}

          <p class="text-gray-700 font-medium mb-4">
            <i class="fas fa-bullseye text-blue-500"></i> 
            Néhány jó KPI többet ér, mint sok rossz - válaszd ki a 3-7 legfontosabb mutatót!
          </p>

          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                1. KPI-ok meghatározása (SMART alapon)
              </label>
              <textarea name="kpis" rows="8" 
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 font-mono text-sm"
                placeholder="KPI név | Cél | Mértékegység | Célérték | Határidő
--------|-----|-------------|----------|----------
Pl. Ügyfél-elégedettség | Növelés | NPS | 65 | Q2 vége
Projektszállítás | Időre leadás | % | 95% | Folyamatos
...">${getResponse('kpis')}</textarea>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                2. Leading vs Lagging indicators - Mi a különbség?
              </label>
              <textarea name="leading_lagging" rows="5" 
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                placeholder="Leading (előrejelző): Korai figyelmeztetések (pl. képzési órák száma)
Lagging (késleltetett): Végeredmény mutatók (pl. eladási volumen)

Mely KPI-id mely kategóriába esik?">${getResponse('leading_lagging')}</textarea>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                3. Balanced Scorecard - Négy perspektíva
              </label>
              <textarea name="balanced_scorecard" rows="6" 
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                placeholder="Pénzügyi perspektíva: ...
Ügyfél perspektíva: ...
Belső folyamatok: ...
Tanulás és fejlődés: ...">${getResponse('balanced_scorecard')}</textarea>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                4. Prioritás - Mely 3 KPI a legkritikusabb?
              </label>
              <textarea name="top_kpis" rows="3" 
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                placeholder="1. ...\n2. ...\n3. ...">${getResponse('top_kpis')}</textarea>
            </div>
          </div>
        </div>
      `;
    }

    // Step 2: Measurement system design
    if (stepNum === 2) {
      const kpis = getResponse('kpis', 1);
      
      return `
        <div class="space-y-6">
          ${kpis ? `
            <div class="bg-gradient-to-r from-purple-50 to-blue-50 p-4 rounded-lg border-l-4 border-purple-500">
              <p class="text-sm text-purple-800 font-medium mb-2">
                <i class="fas fa-link"></i> KPI-ok az 1. lépésből:
              </p>
              <p class="text-sm text-purple-900 font-mono whitespace-pre-wrap">${kpis.substring(0, 200)}${kpis.length > 200 ? '...' : ''}</p>
            </div>
          ` : ''}

          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                1. Mérési terv - Hogyan gyűjtsük az adatokat?
              </label>
              <textarea name="measurement_plan" rows="8" 
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 font-mono text-sm"
                placeholder="KPI | Mérési módszer | Gyakoriság | Adatforrás | Felelős
----|---------------|-----------|-----------|----------
... | Automatikus   | Napi      | CRM       | Elemző
... | Manuális      | Heti      | Jelentés  | Vezető
...">${getResponse('measurement_plan')}</textarea>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                2. Adatminőség - Hogyan biztosítod a megbízhatóságot?
              </label>
              <textarea name="data_quality" rows="4" 
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                placeholder="Validációs szabályok, adattisztítás, minőségellenőrzés...">${getResponse('data_quality')}</textarea>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                3. Data governance - Ki felelős az adatokért?
              </label>
              <textarea name="data_governance" rows="3" 
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                placeholder="Adatgazda, adatkezelők, hozzáférési jogok...">${getResponse('data_governance')}</textarea>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                4. Automatizálás - Mit lehet automatizálni?
              </label>
              <textarea name="automation" rows="4" 
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                placeholder="Automatikus adatletöltések, API integrációk, ETL folyamatok...">${getResponse('automation')}</textarea>
            </div>
          </div>
        </div>
      `;
    }

    // Step 3: Data collection mechanisms
    if (stepNum === 3) {
      const plan = getResponse('measurement_plan', 2);
      
      return `
        <div class="space-y-6">
          ${plan ? `
            <div class="bg-gradient-to-r from-purple-50 to-blue-50 p-4 rounded-lg border-l-4 border-purple-500">
              <p class="text-sm text-purple-800 font-medium mb-2">
                <i class="fas fa-link"></i> Mérési terv a 2. lépésből:
              </p>
              <p class="text-sm text-purple-900 font-mono whitespace-pre-wrap">${plan.substring(0, 150)}...</p>
            </div>
          ` : ''}

          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                1. Adatgyűjtő eszközök és rendszerek
              </label>
              <textarea name="data_tools" rows="6" 
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                placeholder="Eszköz | Funkcionalitás | KPI
-------|---------------|-----
CRM    | Ügyfél adatok | ...
ERP    | Pénzügyi      | ...
Survey | Visszajelzés  | ...
...">${getResponse('data_tools')}</textarea>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                2. API integrációk - Milyen rendszerek beszélnek egymással?
              </label>
              <textarea name="api_integrations" rows="4" 
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                placeholder="Forrás → Cél rendszer, milyen adatok, milyen gyakran...">${getResponse('api_integrations')}</textarea>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                3. Manuális adatgyűjtés - Űrlapok, check-listák
              </label>
              <textarea name="manual_collection" rows="4" 
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                placeholder="Mit, mikor, ki tölti ki? Milyen sablon/űrlap?">${getResponse('manual_collection')}</textarea>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                4. Adattisztítás és validáció folyamat
              </label>
              <textarea name="data_validation" rows="3" 
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                placeholder="Hogyan szűröd ki a hibás/duplikált adatokat?">${getResponse('data_validation')}</textarea>
            </div>
          </div>
        </div>
      `;
    }

    // Step 4: Dashboard and reporting
    if (stepNum === 4) {
      const kpis = getResponse('top_kpis', 1);
      
      return `
        <div class="space-y-6">
          ${kpis ? `
            <div class="bg-gradient-to-r from-purple-50 to-blue-50 p-4 rounded-lg border-l-4 border-purple-500">
              <p class="text-sm text-purple-800 font-medium mb-2">
                <i class="fas fa-link"></i> Top KPI-ok:
              </p>
              <p class="text-sm text-purple-900">${kpis}</p>
            </div>
          ` : ''}

          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                1. Dashboard tervezés - Mit lásson az igazgatóság?
              </label>
              <textarea name="executive_dashboard" rows="5" 
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                placeholder="Top 3-5 KPI, trendek, összehasonlítások, alerts...
Milyen vizualizációk? (diagram típusok)">${getResponse('executive_dashboard')}</textarea>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                2. Operatív dashboard - Mit lássanak a csapatvezetők?
              </label>
              <textarea name="operational_dashboard" rows="5" 
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                placeholder="Napi metrikák, feladatok státusza, problémák, akciók...">${getResponse('operational_dashboard')}</textarea>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                3. BI eszközök - Milyen platformot használsz?
              </label>
              <select name="bi_tool" 
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500">
                <option value="">Válassz...</option>
                <option value="power_bi" ${getResponse('bi_tool') === 'power_bi' ? 'selected' : ''}>Power BI</option>
                <option value="tableau" ${getResponse('bi_tool') === 'tableau' ? 'selected' : ''}>Tableau</option>
                <option value="looker" ${getResponse('bi_tool') === 'looker' ? 'selected' : ''}>Looker / Google Data Studio</option>
                <option value="excel" ${getResponse('bi_tool') === 'excel' ? 'selected' : ''}>Excel / Spreadsheets</option>
                <option value="custom" ${getResponse('bi_tool') === 'custom' ? 'selected' : ''}>Egyedi fejlesztés</option>
                <option value="other" ${getResponse('bi_tool') === 'other' ? 'selected' : ''}>Egyéb</option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                4. Reporting ritmus - Milyen gyakran és kinek?
              </label>
              <textarea name="reporting_rhythm" rows="5" 
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                placeholder="Napi: ...
Heti: ...
Havi: ...
Negyedéves: ...
Kinek küldöd? Milyen formátumban?">${getResponse('reporting_rhythm')}</textarea>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                5. Vizualizációs best practices - Mit alkalmazol?
              </label>
              <textarea name="viz_best_practices" rows="3" 
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                placeholder="Színkódolás, egyszerűség, kontextus, interaktivitás...">${getResponse('viz_best_practices')}</textarea>
            </div>
          </div>
        </div>
      `;
    }

    // Step 5: Feedback system
    if (stepNum === 5) {
      return `
        <div class="space-y-6">
          <p class="text-gray-700 font-medium mb-4">
            <i class="fas fa-comments text-blue-500"></i> 
            A visszajelzés az egyik legerősebb fejlesztő eszköz - alakíts ki strukturált rendszert!
          </p>

          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                1. 1-on-1 meeting framework - Milyen gyakran, milyen struktúrával?
              </label>
              <textarea name="one_on_one" rows="6" 
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                placeholder="Gyakoriság: Heti/kétheti/havi
Időtartam: ...
Agenda:
- Általános állapot check
- KPI-ok áttekintése
- Akadályok, segítségkérés
- Fejlesztési célok
...">${getResponse('one_on_one')}</textarea>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                2. SBI modell (Situation-Behavior-Impact)
              </label>
              <textarea name="sbi_feedback" rows="5" 
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                placeholder="Situation: Milyen helyzetben történt?
Behavior: Mit csináltál/csinált konkrétan?
Impact: Mi volt ennek a hatása?

Példa: ...">${getResponse('sbi_feedback')}</textarea>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                3. Feedforward vs Feedback - Mikor melyiket?
              </label>
              <textarea name="feedforward" rows="4" 
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                placeholder="Feedback: Múltra vonatkozó
Feedforward: Jövőbeli javaslatok, előre tekintő

Mikor használod melyiket?">${getResponse('feedforward')}</textarea>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                4. 360° visszajelzés - Ki értékel kit?
              </label>
              <textarea name="360_feedback" rows="4" 
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                placeholder="Felettes + Peers + Beosztottak + Önértékelés
Milyen gyakran? Anonim? Milyen területeken?">${getResponse('360_feedback')}</textarea>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                5. Pozitív vs konstruktív visszajelzés aránya
              </label>
              <textarea name="feedback_ratio" rows="3" 
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                placeholder="Ideális arány: 5:1 (pozitív:konstruktív)
Mi a te gyakorlatod?">${getResponse('feedback_ratio')}</textarea>
            </div>
          </div>
        </div>
      `;
    }

    // Step 6: Performance evaluation process
    if (stepNum === 6) {
      const kpis = getResponse('kpis', 1);
      
      return `
        <div class="space-y-6">
          ${kpis ? `
            <div class="bg-gradient-to-r from-purple-50 to-blue-50 p-4 rounded-lg border-l-4 border-purple-500">
              <p class="text-sm text-purple-800 font-medium mb-2">
                <i class="fas fa-link"></i> KPI-ok az 1. lépésből:
              </p>
              <p class="text-sm text-purple-900 font-mono whitespace-pre-wrap">${kpis.substring(0, 150)}...</p>
            </div>
          ` : ''}

          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                1. Értékelési mátrix - Milyen kritériumok alapján?
              </label>
              <textarea name="evaluation_matrix" rows="8" 
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 font-mono text-sm"
                placeholder="Kritérium      | Súly | 1-5 értékelés
---------------|------|---------------
KPI teljesítés | 40%  | ...
Kompetenciák   | 30%  | ...
Együttműködés  | 20%  | ...
Innovativitás  | 10%  | ...
...">${getResponse('evaluation_matrix')}</textarea>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                2. OKR review process - Negyedéves értékelés
              </label>
              <textarea name="okr_review" rows="5" 
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                placeholder="Objective elérése: X%
Key Results:
- KR1: Y% (cél: Z%)
- KR2: ...

Mi ment jól? Mi nehezebb volt? Mit tanultunk?">${getResponse('okr_review')}</textarea>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                3. Calibration meeting - Hogyan biztosítod az objektivitást?
              </label>
              <textarea name="calibration" rows="4" 
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                placeholder="Vezetők együtt kalibrálják az értékeléseket
Forced distribution? Bell curve?
Példák összehasonlítása...">${getResponse('calibration')}</textarea>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                4. Értékelési gyakoriság és időzítés
              </label>
              <textarea name="evaluation_frequency" rows="4" 
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                placeholder="Évközi review: ...
Év végi értékelés: ...
Próbaidő értékelés: ...
Projektzáró értékelés: ...">${getResponse('evaluation_frequency')}</textarea>
            </div>
          </div>
        </div>
      `;
    }

    // Step 7: Corrective mechanisms
    if (stepNum === 7) {
      const topKpis = getResponse('top_kpis', 1);
      
      return `
        <div class="space-y-6">
          ${topKpis ? `
            <div class="bg-gradient-to-r from-purple-50 to-blue-50 p-4 rounded-lg border-l-4 border-purple-500">
              <p class="text-sm text-purple-800 font-medium mb-2">
                <i class="fas fa-link"></i> Kritikus KPI-ok:
              </p>
              <p class="text-sm text-purple-900">${topKpis}</p>
            </div>
          ` : ''}

          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                1. Alert rendszer és threshold-ok
              </label>
              <textarea name="alert_system" rows="6" 
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 font-mono text-sm"
                placeholder="KPI | Zöld (OK) | Sárga (Figyelem) | Piros (Vészhelyzet)
----|-----------|-----------------|------------------
... | > 90%     | 70-90%          | < 70%
... | ...       | ...             | ...

Ki kapja az alertet? Milyen csatornán?">${getResponse('alert_system')}</textarea>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                2. CAP - Corrective Action Plan sablon
              </label>
              <textarea name="cap_template" rows="6" 
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                placeholder="Probléma: ...
Gyökérok: ...
Korrekciós akció: ...
Felelős: ...
Határidő: ...
Ellenőrzés: ...">${getResponse('cap_template')}</textarea>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                3. Root cause analysis eszközök
              </label>
              <textarea name="root_cause_tools" rows="5" 
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                placeholder="5 Whys: Ismételt miért kérdések
Fishbone (Ishikawa): Ok-okozati diagram
Pareto: 80/20 szabály

Melyiket mikor használod?">${getResponse('root_cause_tools')}</textarea>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                4. PDCA ciklus (Plan-Do-Check-Act)
              </label>
              <textarea name="pdca_cycle" rows="5" 
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                placeholder="Plan: Mit változtatsz?
Do: Kis léptékű teszt
Check: Mi lett az eredmény?
Act: Standard vagy újratervezés

Példa PDCA ciklusodra...">${getResponse('pdca_cycle')}</textarea>
            </div>
          </div>
        </div>
      `;
    }

    // Step 8: Continuous improvement
    if (stepNum === 8) {
      return `
        <div class="space-y-6">
          <p class="text-gray-700 font-medium mb-4">
            <i class="fas fa-infinity text-green-500"></i> 
            A folyamatos fejlesztés fenntartja a rendszer relevanciáját és hatékonyságát!
          </p>

          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                1. Kaizen / Continuous Improvement kultúra
              </label>
              <textarea name="kaizen_culture" rows="5" 
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                placeholder="Hogyan építed be a folyamatos fejlesztést a kultúrába?
Ötletdoboz? Fejlesztési workshopok? Jutalmazás?
Ki az, aki bármi fejlesztést javasolhat?">${getResponse('kaizen_culture')}</textarea>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                2. Retrospektív meetings - Milyen gyakran?
              </label>
              <textarea name="retrospectives" rows="6" 
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                placeholder="Sprint retro (agile csapatoknál): 2 heti
Projekt retro: Projekt végén
Negyedéves retro: Q végén

Formátum:
- Mi ment jól? (Keep)
- Mi volt nehéz? (Drop)
- Mit próbáljunk ki? (Try)">${getResponse('retrospectives')}</textarea>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                3. A/B testing a mérési módszereknél
              </label>
              <textarea name="ab_testing" rows="4" 
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                placeholder="Tesztelj különböző KPI-okat, dashboard formátumokat, reporting ritmusokat
Mi működik jobban? Melyik ad jobb döntéseket?">${getResponse('ab_testing')}</textarea>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                4. Learning reviews - Mit tanultunk?
              </label>
              <textarea name="learning_reviews" rows="5" 
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                placeholder="Projekt végén, nagy mérföldköveknél:
- Mit tudtunk jól mérni?
- Hol hiányoztak adatok?
- Mely KPI-ok voltak valóban hasznosak?
- Mit változtatsz meg a következő ciklusban?">${getResponse('learning_reviews')}</textarea>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                5. KPI felülvizsgálat - Mikor frissíted a mutatókat?
              </label>
              <textarea name="kpi_review" rows="4" 
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                placeholder="Negyedévente? Évente? Stratégiai tervezésnél?
Melyik KPI-ok maradnak? Melyek változnak? Miért?">${getResponse('kpi_review')}</textarea>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                6. Következő lépések - Mi a fejlesztési roadmap?
              </label>
              <textarea name="improvement_roadmap" rows="5" 
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                placeholder="Q1: ...
Q2: ...
Q3: ...
Q4: ...

Mit fogsz fejleszteni a teljesítménymenedzsment rendszerben?">${getResponse('improvement_roadmap')}</textarea>
            </div>
          </div>
        </div>
      `;
    }
  }
  
  // Day 5: Team Management (8 steps)
  if (dayId === 5) {
    // Helper to get team info from Day 3
    const getTeamFromDay3 = () => {
      const charter = getResponseFromDay(3, 'team_charter', 8);
      const roles = getResponseFromDay(3, 'final_role_descriptions', 8);
      return { charter, roles };
    };

    // Step 1: Delegation strategy
    if (stepNum === 1) {
      const team = getTeamFromDay3();
      
      return `
        <div class="space-y-6">
          ${team.charter || team.roles ? `
            <div class="bg-gradient-to-r from-purple-50 to-blue-50 p-4 rounded-lg border-l-4 border-purple-500">
              <p class="text-sm text-purple-800 font-medium mb-2">
                <i class="fas fa-link"></i> Csapatod a 3. Napból:
              </p>
              ${team.charter ? `<p class="text-sm text-purple-900 mb-2"><strong>Team Charter:</strong> ${team.charter.substring(0, 100)}...</p>` : ''}
              ${team.roles ? `<p class="text-sm text-purple-900"><strong>Szerepek:</strong> ${team.roles.substring(0, 100)}...</p>` : ''}
            </div>
          ` : ''}

          <p class="text-gray-700 font-medium mb-4">
            <i class="fas fa-hand-holding text-blue-500"></i> 
            A jó delegálás fejleszti a csapatot és felszabadítja a vezetőt!
          </p>

          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                1. Eisenhower mátrix - Mit delegálsz, mit tartasz meg?
              </label>
              <textarea name="eisenhower_matrix" rows="8" 
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 font-mono text-sm"
                placeholder="           | Sürgős         | Nem sürgős
-----------|----------------|----------------
Fontos     | CSINÁLD MOST   | TERVEZD BE
           | (Krízis)       | (Fejlesztés)
-----------|----------------|----------------
Nem fontos | DELEGÁLD       | DOBD EL
           | (Zavaró)       | (Időpocsékolás)

Mit delegálsz? Kinek?">${getResponse('eisenhower_matrix')}</textarea>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                2. Skill-Will mátrix - Ki kapjon mit?
              </label>
              <textarea name="skill_will_matrix" rows="6" 
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                placeholder="Magas Skill + Magas Will = Delegálj, adj felhatalmazást
Magas Skill + Alacsony Will = Motiválj, érd meg miért fontos
Alacsony Skill + Magas Will = Tanítsd, coachingolj
Alacsony Skill + Alacsony Will = Irányíts vagy cserélj

Ki melyik kvadránsban van?">${getResponse('skill_will_matrix')}</textarea>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                3. Delegálási szintek (1-7) - Mennyi felhatalmazást adsz?
              </label>
              <textarea name="delegation_levels" rows="9" 
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 font-mono text-sm"
                placeholder="1. Megmondom, csináld! (teljes irányítás)
2. Eladok egy megoldást
3. Javaslok, kérdezz
4. Kérlek javaslatot, én döntök
5. Javaslatot kérek, te döntesz
6. Te döntesz, informálj
7. Te döntesz és csinálod (teljes autonomy)

Mely feladatoknál melyik szintet alkalmazod?">${getResponse('delegation_levels')}</textarea>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                4. SMART feladatátadás - Konkrét delegálási terv
              </label>
              <textarea name="smart_delegation" rows="7" 
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 font-mono text-sm"
                placeholder="Feladat | Kinek | Miért ő | Szint | Check-in | Siker kritérium
--------|-------|---------|-------|----------|------------------
...     | ...   | ...     | 5     | Heti     | ...
...     | ...   | ...     | 3     | Napi     | ...
...">${getResponse('smart_delegation')}</textarea>
            </div>
          </div>
        </div>
      `;
    }

    // Step 2: Motivation factors
    if (stepNum === 2) {
      const teamStrengths = getResponseFromDay(3, 'team_strengths', 5);
      
      return `
        <div class="space-y-6">
          ${teamStrengths ? `
            <div class="bg-gradient-to-r from-purple-50 to-blue-50 p-4 rounded-lg border-l-4 border-purple-500">
              <p class="text-sm text-purple-800 font-medium mb-2">
                <i class="fas fa-link"></i> Csapattagok erősségei a 3. Napból:
              </p>
              <p class="text-sm text-purple-900">${teamStrengths.substring(0, 150)}...</p>
            </div>
          ` : ''}

          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                1. Herzberg Two-Factor Theory - Higiénés vs Motivátor tényezők
              </label>
              <textarea name="herzberg_factors" rows="8" 
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                placeholder="Higiénés tényezők (ha hiányzik → demotiváció):
- Fizetés, benefit-ek
- Munkakörülmények
- Biztonság
- Politikák, szabályok

Motivátor tényezők (ha jelen → motiváció):
- Elismér��s, siker
- Felelősség, growth
- Érdekes munka
- Előrelépés lehetősége

Melyik hiányzik? Mit tudsz javítani?">${getResponse('herzberg_factors')}</textarea>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                2. Drive: Autonomy, Mastery, Purpose (Dan Pink)
              </label>
              <textarea name="drive_amp" rows="7" 
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                placeholder="Autonomy (Autonómia): Önállóság, döntési szabadság
- Hogyan növeled?

Mastery (Mesterség): Fejlődés, szakértelem építése
- Milyen tanulási lehetőségek?

Purpose (Cél): Nagyobb cél, jelentés
- Mi a WHY? Miben járul hozzá a csapat a nagyobb képhez?">${getResponse('drive_amp')}</textarea>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                3. Motivációs térkép - Ki mit értékel?
              </label>
              <textarea name="motivation_map" rows="8" 
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 font-mono text-sm"
                placeholder="Név | Pénz | Elismerés | Tanulás | Biztonság | Hatalom | Kapcsolat | Flexibilitás
-----|------|-----------|---------|-----------|---------|-----------|---------------
... | ⭐⭐⭐ | ⭐⭐      | ⭐⭐⭐⭐⭐ | ⭐⭐      | ⭐       | ⭐⭐⭐     | ⭐⭐⭐⭐
... | ...  | ...       | ...     | ...       | ...     | ...       | ...

(1-5 csillag, mi motiválja legjobban)">${getResponse('motivation_map')}</textarea>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                4. Stay Interview kérdések - Miért maradnak?
              </label>
              <textarea name="stay_interview" rows="6" 
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                placeholder="Kérdezz meg minden csapattagot:
- Mi az, ami miatt szívesen maradsz?
- Mi az, ami miatt fontolgatnád a távozást?
- Mit változtatnál, ha tehetnéd?
- Mit tanulsz/fejlődsz itt?
- Érted a nagyobb képet, célokat?

Mit tanultál belőle?">${getResponse('stay_interview')}</textarea>
            </div>
          </div>
        </div>
      `;
    }

    // Step 3: Conflict management
    if (stepNum === 3) {
      return `
        <div class="space-y-6">
          <p class="text-gray-700 font-medium mb-4">
            <i class="fas fa-handshake text-blue-500"></i> 
            A jól kezelt konfliktus nem romboló, hanem építő!
          </p>

          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                1. Thomas-Kilmann Conflict Mode (TKI) - 5 konfliktuskezelési stílus
              </label>
              <textarea name="tki_modes" rows="9" 
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                placeholder="Competing (Versengés): Asszertív, nem kooperatív → Ha gyors döntés kell
Collaborating (Együttműködés): Asszertív, kooperatív → Win-win megoldás
Compromising (Kompromisszum): Közepes asszertív+kooperatív → Gyors megoldás kell
Avoiding (Elkerülés): Nem asszertív, nem kooperatív → Triviális konfliktus
Accommodating (Alkalmazkodás): Nem asszertív, kooperatív → Kapcsolat fontosabb

Melyiket mikor használod? Mi a természetes stílusod?">${getResponse('tki_modes')}</textarea>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                2. Jelenlegi konfliktusok a csapatban
              </label>
              <textarea name="current_conflicts" rows="6" 
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                placeholder="Konfliktus | Kik között | Típus | Súlyosság | Kezelési terv
-----------|-----------|-------|-----------|---------------
...        | X vs Y    | ...   | Közepes   | ...
...        | ...       | ...   | ...       | ...

Típusok: Feladat, Folyamat, Kapcsolat, Érték">${getResponse('current_conflicts')}</textarea>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                3. Interest-Based Relational (IBR) Approach
              </label>
              <textarea name="ibr_approach" rows="6" 
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                placeholder="1. Válaszd el az embert a problémától
2. Fókuszálj az érdekekre, nem pozíciókra
3. Generálj win-win opciókat
4. Használj objektív kritériumokat

Hogyan alkalmaznád egy konkrét konfliktusnál?">${getResponse('ibr_approach')}</textarea>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                4. Non-violent Communication (NVC) - Megfigyelés, Érzés, Szükséglet, Kérés
              </label>
              <textarea name="nvc_framework" rows="6" 
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                placeholder="Megfigyelés: Mit láttál/hallottál konkrétan? (ítélet nélkül)
Érzés: Mit érzel ezzel kapcsolatban?
Szükséglet: Milyen szükségleted nem teljesült?
Kérés: Mit kérnél konkrétan?

Példa konfliktusodra alkalmazva:">${getResponse('nvc_framework')}</textarea>
            </div>
          </div>
        </div>
      `;
    }

    // Step 4: Psychological safety
    if (stepNum === 4) {
      return `
        <div class="space-y-6">
          <p class="text-gray-700 font-medium mb-4">
            <i class="fas fa-shield-alt text-green-500"></i> 
            A pszichológiai biztonság a magas teljesítmény alapja!
          </p>

          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                1. Google Project Aristotle tanulságai
              </label>
              <textarea name="project_aristotle" rows="7" 
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                placeholder="Top 5 team effectiveness faktor:
1. Pszichológiai biztonság (egyértelműen #1!)
2. Megbízhatóság (ígéretek betartása)
3. Struktúra és világosság (ki mit csinál)
4. Jelentés (munka értelme)
5. Hatás (a munka számít)

Melyik a legerősebb? Melyik a leggyengébb nálatok?">${getResponse('project_aristotle')}</textarea>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                2. Amy Edmondson Psychological Safety Index - Önértékelés
              </label>
              <textarea name="safety_index" rows="9" 
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                placeholder="1-7 skála (1=egyáltalán nem igaz, 7=teljesen igaz):
- Ebben a csapatban biztonságos kockáztatni ___
- A hibákat nem használják ellenem ___
- A csapattagok képesek nehéz kérdéseket felvetni ___
- Senkit nem utasítanak el másságuk miatt ___
- Bátran kérhetek segítséget ___
- Nem szabotálnak ___
- Egyedi készségeim értékeltek ___

Átlag: ___ (alacsony < 4, közepes 4-5, magas > 5)">${getResponse('safety_index')}</textarea>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                3. Blameless postmortem - Hogyan tanuljunk hibákból?
              </label>
              <textarea name="blameless_postmortem" rows="6" 
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                placeholder="Mi történt? (timeline, tények)
Mi volt a rendszerbeli ok? (nem személyes blame!)
Mit tanultunk?
Mit változtatunk meg?
Action items: ki, mit, mikor

Mikor alkalmazod legközelebb?">${getResponse('blameless_postmortem')}</textarea>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                4. Check-in rituals - Hogy vagy? Mit hozol ma?
              </label>
              <textarea name="checkin_rituals" rows="5" 
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                placeholder="Napi stand-up: Hogyan érzed magad 1-10?
Heti sync: Mi az, ami foglalkoztat?
Retro: Rózsák és tövések (mi ment jól/nehéz)

Milyen check-in rituálét építesz be?">${getResponse('checkin_rituals')}</textarea>
            </div>
          </div>
        </div>
      `;
    }

    // Step 5: Coaching and mentoring
    if (stepNum === 5) {
      const devAreas = getResponseFromDay(3, 'development_areas', 5);
      
      return `
        <div class="space-y-6">
          ${devAreas ? `
            <div class="bg-gradient-to-r from-purple-50 to-blue-50 p-4 rounded-lg border-l-4 border-purple-500">
              <p class="text-sm text-purple-800 font-medium mb-2">
                <i class="fas fa-link"></i> Fejlesztendő területek a 3. Napból:
              </p>
              <p class="text-sm text-purple-900">${devAreas.substring(0, 150)}...</p>
            </div>
          ` : ''}

          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                1. GROW modell - Coaching keretrendszer
              </label>
              <textarea name="grow_model" rows="9" 
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                placeholder="Goal (Cél): Mit szeretnél elérni?
- ...

Reality (Jelenlegi helyzet): Hol vagy most?
- ...

Options (Opciók): Milyen lehetőségeid vannak?
- ...

Will (Akarat/Akció): Mit fogsz tenni? Mikor?
- ...

Kivel alkalmaznád ezt a modellt?">${getResponse('grow_model')}</textarea>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                2. Socratic questioning - Kérdezz, ne tanácsolj!
              </label>
              <textarea name="socratic_questions" rows="8" 
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                placeholder="Tisztázó kérdések: Mit értesz ezen? Példát tudsz mondani?
Feltevések vizsgálata: Mi az feltételezés ebben? Honnan tudod?
Bizonyítékok: Mi támasztja alá? Van ellenpélda?
Perspektíva: Más hogyan látná? Mi lenne a másik oldal?
Következmények: Mi lenne az eredmény? Long term hatások?
Meta kérdések: Miért fontos ez? Mi a kérdés mögött?

Gyakorold ezeket!">${getResponse('socratic_questions')}</textarea>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                3. Active listening - Hallgass aktívan!
              </label>
              <textarea name="active_listening" rows="6" 
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                placeholder="Parafrazálás: Ha jól értem, azt mondod...
Tükrözés: Úgy tűnik, csalódott vagy...
Összegzés: Tehát a fő pontok...
Tisztázó kérdések: Mit értesz ezen?
Testbeszéd: Szemkontaktus, bólintás, nyitott tartás

Milyen akadályaid vannak az aktív hallgatásban?">${getResponse('active_listening')}</textarea>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                4. 70-20-10 fejlesztési modell
              </label>
              <textarea name="70_20_10" rows="6" 
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                placeholder="70% - On the job learning: Projektek, kihívások, stretch assignments
20% - Learning from others: Mentorálás, shadowing, coaching
10% - Formal training: Kurzusok, workshopok, certifikációk

Mit adsz a csapattagjaidnak mindhárom kategóriában?">${getResponse('70_20_10')}</textarea>
            </div>
          </div>
        </div>
      `;
    }

    // Step 6: Difficult conversations
    if (stepNum === 6) {
      return `
        <div class="space-y-6">
          <p class="text-gray-700 font-medium mb-4">
            <i class="fas fa-exclamation-triangle text-orange-500"></i> 
            A nehéz beszélgetések elkerülése súlyosbítja a problémát!
          </p>

          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                1. Crucial Conversations Framework
              </label>
              <textarea name="crucial_conversations" rows="9" 
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                placeholder="1. Start with Heart: Mi a valódi célod?
2. Learn to Look: Figyeld a biztonság jeleit
3. Make it Safe: Teremts biztonságos környezetet
4. Master My Stories: Kezeld az érzelmeidet
5. STATE my path:
   - Share facts
   - Tell your story
   - Ask for others' paths
   - Talk tentatively
   - Encourage testing

Milyen nehéz beszélgetésre készülsz?">${getResponse('crucial_conversations')}</textarea>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                2. SBI feedback (Situation-Behavior-Impact) - már ismered
              </label>
              <textarea name="sbi_difficult" rows="6" 
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                placeholder="Situation: Konkrét helyzet, kontextus
Behavior: Megfigyelhető viselkedés (ítélet nélkül)
Impact: Mi volt ennek a hatása?

Példa egy nehéz beszélgetésre:
Helyzet: Tegnapi meeting-en...
Viselkedés: Félbeszakítottad Annát 3x...
Hatás: Anna visszahúzódott, nem osztotta meg az ötletét...">${getResponse('sbi_difficult')}</textarea>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                3. PIE modell (Performance Improvement Expectations)
              </label>
              <textarea name="pie_model" rows="7" 
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                placeholder="Performance issue: Mi a konkrét probléma?
Improvement: Mit vársz el konkrétan?
Expectations: Mi történik, ha javul? Mi, ha nem?
Timeline: Mikorra? Mikor beszélünk újra?

Példa PIP (Performance Improvement Plan)-ra:
...">${getResponse('pie_model')}</textarea>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                4. Nehéz beszélgetés checklist - Előkészület
              </label>
              <textarea name="difficult_conv_checklist" rows="9" 
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                placeholder="Előtte:
☐ Mi a valódi célom?
☐ Tények vs interpretáció szétválasztása
☐ Empátia - mi lehet a másik perspektívája?
☐ Időpont, helyszín (privát, csendes)
☐ Érzelmi állapot rendben?

Közben:
☐ Aktív hallgatás
☐ Kérdezz, ne csak mondd
☐ Tényekre fókusz

Utána:
☐ Follow-up időpont egyeztetése">${getResponse('difficult_conv_checklist')}</textarea>
            </div>
          </div>
        </div>
      `;
    }

    // Step 7: Team cohesion
    if (stepNum === 7) {
      return `
        <div class="space-y-6">
          <p class="text-gray-700 font-medium mb-4">
            <i class="fas fa-users-cog text-blue-500"></i> 
            Erős, összetartó csapat = magas teljesítmény + alacsony fluktuáció!
          </p>

          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                1. Lencioni 5 Dysfunctions of a Team - Piramis
              </label>
              <textarea name="lencioni_pyramid" rows="11" 
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                placeholder="               Eredmények
              (Results Inattention)
            -------------------------
          Elszámoltathatóság hiánya
        (Avoidance of Accountability)
      ---------------------------------
    Elkötelezettség hiánya
  (Lack of Commitment)
----------------------------------
Konfliktus kerülése
(Fear of Conflict)
----------------------------------
BIZALOM hiánya (ALAP!)
(Absence of Trust)

Melyik szinten van a legnagyobb problémátok?">${getResponse('lencioni_pyramid')}</textarea>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                2. Team building tevékenységek - Mit csinálsz?
              </label>
              <textarea name="team_building" rows="8" 
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                placeholder="Bizalom építése:
- Személyes történetek megosztása
- Vulnerability exercises
- Trust falls (klasszikus, de működik)

Együttműködés:
- Közös problémamegoldás
- Escape room
- Közös sport/hobbi

Ünneplés:
- Sikerek megünneplése
- Team lunch/dinner
- Évfordulók, születésnapok

Milyen gyakran? Mire van szükség?">${getResponse('team_building')}</textarea>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                3. Tuckman stages - Forming, Storming, Norming, Performing
              </label>
              <textarea name="tuckman_stages" rows="9" 
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                placeholder="Forming: Udvarias, óvatos, irányításra vágyó
→ Mit tegyél: Világos cél és szerepek

Storming: Konfliktusok, power struggle, frusztráció
→ Mit tegyél: Facilitálj, hallgasd meg mindenkit

Norming: Szabályok kialakulása, együttműködés
→ Mit tegyél: Erősítsd a normákat

Performing: Magas teljesítmény, autonómia, flow
→ Mit tegyél: Delegálj, támogasd

Melyik fázisban van a csapatod?">${getResponse('tuckman_stages')}</textarea>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                4. Team rituals és hagyományok
              </label>
              <textarea name="team_rituals" rows="7" 
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                placeholder="Napi rituals:
- Stand-up formátum
- Check-in kérdések

Heti rituals:
- Team lunch pénteken
- Retro formátum

Havi/negyedéves:
- All-hands meeting
- Offsite, hackathon

Milyen rituálék jellemzik a csapatodat?">${getResponse('team_rituals')}</textarea>
            </div>
          </div>
        </div>
      `;
    }

    // Step 8: Leadership presence
    if (stepNum === 8) {
      return `
        <div class="space-y-6">
          <p class="text-gray-700 font-medium mb-4">
            <i class="fas fa-user-tie text-purple-500"></i> 
            A vezetői jelenlét modellt ad a csapatnak - légy tudatos!
          </p>

          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                1. Leadership Brand - Hogyan szeretnéd, hogy lássanak?
              </label>
              <textarea name="leadership_brand" rows="7" 
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                placeholder="Mit szeretnél, hogy mondjanak rólad mint vezetőről?
- 3 szó, ami leír:
- Amit jól csinálok:
- Amit fejlesztenem kell:
- Mit szeretnék, hogy emlékezzek rólam?

Példa: "Autentikus, fejlesztő, eredményorientált"
vs "Mikromenedzselő, impatiens, közelíthetetlen"">${getResponse('leadership_brand')}</textarea>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                2. 360° visszajelzés - Önkép vs mások képe
              </label>
              <textarea name="360_self_vs_others" rows="7" 
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                placeholder="Kérdezz meg:
- Felettesed: ...
- Peers: ...
- Beosztottjaid: ...

Énkép vs Mások véleménye:
- Hol van gap?
- Mi a vak folt?
- Mi a rejtett erősség?

Mit tanultál?">${getResponse('360_self_vs_others')}</textarea>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                3. Vezetői napló és reflekció
              </label>
              <textarea name="leadership_journal" rows="8" 
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                placeholder="Napi reflekció:
- Mi ment jól ma?
- Mi volt nehéz?
- Mit tanultam?
- Mit csinálnék másképp?

Heti reflekció:
- Mik voltak a highlights?
- Milyen vezetői döntést hoztam?
- Hogyan támogattam a csapatot?
- Mit fejleszteni jövő héten?

Elkötelezel-e magad napi/heti naplózásra?">${getResponse('leadership_journal')}</textarea>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                4. Executive Presence - Megjelenés, Kommunikáció, Karizma
              </label>
              <textarea name="executive_presence" rows="9" 
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                placeholder="Megjelenés (Gravitas):
- Magabiztosság, nyugalom nyomás alatt
- Döntésképesség
- Érzelmi intelligencia

Kommunikáció:
- Világos, tömör üzenetek
- Aktív hallgatás
- Storytelling

Karizma:
- Energia, pozitivitás
- Autenticitás
- Empátia

Melyik a legerősebb? Melyiket fejleszteni?">${getResponse('executive_presence')}</textarea>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                5. Személyes fejlesztési terv - Mi a következő 6 hónap?
              </label>
              <textarea name="leadership_dev_plan" rows="6" 
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                placeholder="1. Fejlesztési terület: ...
   Miért fontos: ...
   Akció: ...
   Mérés: Honnan tudom, hogy sikerült?

2. Fejlesztési terület: ...
   ...

3. Fejlesztési terület: ...">${getResponse('leadership_dev_plan')}</textarea>
            </div>
          </div>
        </div>
      `;
    }
  }

  // Day 6: Sustainability & Adaptation (8 steps)
  if (dayId === 6) {
    // Helper to get data from previous days
    const getFromDay5 = (fieldName, stepNum) => getResponseFromDay(5, fieldName, stepNum);
    const getFromDay4 = (fieldName, stepNum) => getResponseFromDay(4, fieldName, stepNum);
    const getFromDay3 = (fieldName, stepNum) => getResponseFromDay(3, fieldName, stepNum);
    const getFromDay2 = (fieldName, stepNum) => getResponseFromDay(2, fieldName, stepNum);
    const getFromDay1 = (fieldName, stepNum) => getResponseFromDay(1, fieldName, stepNum);

    // Step 1: Change anchoring plan
    if (stepNum === 1) {
      const strategicGoals = getFromDay2('strategic_goals_smart', 3) || '';
      const actionPlan = getFromDay2('action_plan', 5) || '';
      
      return `
        <div class="space-y-6">
          ${strategicGoals || actionPlan ? `
            <div class="bg-gradient-to-r from-green-50 to-emerald-50 border-l-4 border-green-500 p-4 rounded-lg">
              <h4 class="font-semibold text-green-800 mb-2">
                <i class="fas fa-anchor"></i> Referencia: Stratégia és akciók beépítése
              </h4>
              ${strategicGoals ? `<p class="text-sm text-gray-700"><strong>Stratégiai célok:</strong> ${strategicGoals.substring(0, 300)}...</p>` : ''}
              ${actionPlan ? `<p class="text-sm text-gray-700 mt-2"><strong>Akciók:</strong> ${actionPlan.substring(0, 300)}...</p>` : ''}
            </div>
          ` : ''}

          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                1. Kritikus új viselkedések/folyamatok azonosítása
              </label>
              <textarea name="critical_behaviors" rows="6" 
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                placeholder="Melyek azok a kulcsviselkedések, amelyek kritikusak a változás fennmaradásához?

Példák:
- Heti stand-up meeting csütörtök 9-10
- Minden döntéshez RACI használata
- Új projekt indításakor stakeholder mapping

Minimum 5 kritikus viselkedés/folyamat:">${getResponse('critical_behaviors')}</textarea>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                2. Habit Stacking - Kapcsolás meglévő rutinokhoz
              </label>
              <textarea name="habit_stacking" rows="7" 
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                placeholder="Minden új szokást kapcsolj egy meglévő rutinhoz:

SABLON: 'Után/közben hogy [MEGLÉVŐ RUTIN], csinálni fogom [ÚJ VISELKEDÉS].'

Példák:
- Hétfői vezetői meeting után átnézem a heti OKR progresszt
- Minden projektindítás előtt kitöltöm a stakeholder mátrixot
- Munkanap végén 10 perces reflection a vezetői naplóban

Írj minimum 5 habit stacking kapcsolatot:">${getResponse('habit_stacking')}</textarea>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                3. 90 napos változásbeépítési terv
              </label>
              <textarea name="90day_anchoring_plan" rows="9" 
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                placeholder="0-30 nap (Bevezetés és kommunikáció):
- Mit kommunikálok? Kinek?
- Mely viselkedéseket indítom?
- Milyen támogatást adok?

31-60 nap (Megerősítés):
- Mely viselkedések rögzültek?
- Hol van visszacsúszás?
- Mit kell korrigálni?

61-90 nap (Rutinná válás):
- Mely folyamatok működnek már automatikusan?
- Mit ünneplek/kommunikálok?
- Hosszú távú fenntartás terve?">${getResponse('90day_anchoring_plan')}</textarea>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                4. Megerősítési mechanizmusok és elismerés
              </label>
              <textarea name="reinforcement_mechanisms" rows="6" 
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                placeholder="Hogyan erősítem meg a kívánt viselkedéseket?

- Recognition program: Ki elismer? Mikor? Hogyan?
- Reward system: Mi a jutalom?
- Public celebration: Hogyan ünnepelünk?
- Role models: Ki a példakép?
- Stories: Milyen sikersztorikat mesélek el?

Konkrét mechanizmusok és felelősök:">${getResponse('reinforcement_mechanisms')}</textarea>
            </div>
          </div>
        </div>
      `;
    }

    // Step 2: SOPs and documentation
    if (stepNum === 2) {
      const criticalBehaviors = getResponse('critical_behaviors', 1) || '';
      
      return `
        <div class="space-y-6">
          ${criticalBehaviors ? `
            <div class="bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-500 p-4 rounded-lg">
              <h4 class="font-semibold text-blue-800 mb-2">
                <i class="fas fa-file-alt"></i> Referencia: Kritikus viselkedések (1. lépésből)
              </h4>
              <p class="text-sm text-gray-700">${criticalBehaviors.substring(0, 400)}...</p>
            </div>
          ` : ''}

          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                1. Top 10 kritikus folyamat azonosítása
              </label>
              <textarea name="top10_processes" rows="8" 
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Lista a 10 legkritikusabb folyamatról, amelyet dokumentálni kell:

1. Folyamat neve: ...
   Miért kritikus: ...
   Jelenlegi dokumentáció: van/nincs/elavult

2. Folyamat neve: ...
   ...

Példák:
- Új projekt indítási folyamat (RACI, stakeholder mapping)
- Teljesítményértékelési folyamat
- Konfliktuskezelési protokoll
- Döntéshozatali folyamat">${getResponse('top10_processes')}</textarea>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                2. SOP sablon és dokumentációs standard
              </label>
              <textarea name="sop_template" rows="9" 
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Standard SOP struktúra (MINDEN folyamathoz):

1. Folyamat neve és célja
2. Input (Mi kell hozzá?)
3. Output (Mit állít elő?)
4. Felelősök és szerepek (RACI)
5. Lépésről lépésre leírás (1-2-3...)
6. Időzítés/határidők
7. Eszközök és források
8. Minőségi kritériumok
9. Eskalációs protokoll (Mi van, ha elakad?)
10. Frissítési dátum és tulajdonos

Válaszd ki 1 kritikus folyamatot és dokumentáld SOP formában:">${getResponse('sop_template')}</textarea>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                3. Knowledge Base platform és hozzáférés
              </label>
              <textarea name="knowledge_base_plan" rows="6" 
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Hol és hogyan lesz elérhető a dokumentáció?

Platform választás: (SharePoint, Confluence, Google Drive, stb.)
Struktúra: Mapparendszer/kategóriák
Hozzáférés: Ki látja? Ki szerkesztheti?
Kereshetőség: Hogyan találják meg?
Frissítési protokoll: Ki frissíti? Milyen gyakran?
Archíválás: Elavult dokumentumok kezelése

Konkrét implementációs terv:">${getResponse('knowledge_base_plan')}</textarea>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                4. Visual work instructions - Vizualizáció
              </label>
              <textarea name="visual_instructions" rows="5" 
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Mely folyamatokat lehet flow chart-tal vagy vizualizációval egyszerűsíteni?

Példák:
- Döntési fa (flowchart): Mikor eszkalálok?
- Swimlane diagram: Ki mit csinál mikor?
- SIPOC diagram: Beszállítók-Input-Folyamat-Output-Ügyfelek

Lista és felelősök:">${getResponse('visual_instructions')}</textarea>
            </div>
          </div>
        </div>
      `;
    }

    // Step 3: Knowledge transfer
    if (stepNum === 3) {
      const teamStructure = getFromDay3('team_structure', 4) || '';
      
      return `
        <div class="space-y-6">
          ${teamStructure ? `
            <div class="bg-gradient-to-r from-yellow-50 to-amber-50 border-l-4 border-yellow-500 p-4 rounded-lg">
              <h4 class="font-semibold text-yellow-800 mb-2">
                <i class="fas fa-users"></i> Referencia: Csapatstruktúra (3. Napból)
              </h4>
              <p class="text-sm text-gray-700">${teamStructure.substring(0, 400)}...</p>
            </div>
          ` : ''}

          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                1. Kritikus tudás és birtokosai - Knowledge mapping
              </label>
              <textarea name="knowledge_mapping" rows="9" 
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500"
                placeholder="MÁTRIX: Kritikus tudás és birtokosai

Tudás terület | Birtokos(ok) | Kockázat | Duplikáció szükséges?
--------------------------------------------------------
1. [Pl: Költségvetés folyamat] | [Név] | Magas/Közepes/Alacsony | Igen/Nem
2. [Pl: Stakeholder kapcsolatok] | [Név] | ...
3. [Pl: Technikai specifikáció] | [Név] | ...

Azonosítsd:
- Mely tudás kritikus a működéshez?
- Ki az egyetlen birtokosa? (Single point of failure)
- Hol van legnagyobb kockázat? (fluktuáció, nyugdíj, stb.)

Minimum 8-10 kritikus tudás terület:">${getResponse('knowledge_mapping')}</textarea>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                2. Mentoring/Shadowing program terv
              </label>
              <textarea name="mentoring_program" rows="8" 
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500"
                placeholder="Párosítások és tudástranszfer terv:

Pár 1: [Mentor neve] → [Mentee neve]
Tudás terület: ...
Időtartam: X hónap
Gyakoriság: Hetente/kéthetente X óra
Módszertan: Shadowing, mentoring, gyakorlati projektek
Sikerkritérium: Mentee önállóan képes lesz ...

Pár 2: ...

Minimum 5 párosítás/tudástranszfer kapcsolat:">${getResponse('mentoring_program')}</textarea>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                3. Communities of Practice (CoP) - Szakmai közösségek
              </label>
              <textarea name="communities_of_practice" rows="7" 
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500"
                placeholder="Milyen szakmai közösségeket hozol létre?

CoP 1: [Téma, pl: Agile Practitioners]
Tagok: [Nevek/szerepkörök]
Találkozások: Havonta/Negyedévente
Cél: Tudásmegosztás, best practice, problémamegoldás
Platform: (Teams, Slack, stb.)

CoP 2: [Pl: Leadership Circle]
...

Minimum 3 CoP:">${getResponse('communities_of_practice')}</textarea>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                4. Train-the-Trainer program
              </label>
              <textarea name="train_the_trainer" rows="6" 
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500"
                placeholder="Ki lesz belső trainer/szakértő?

Trainer 1: [Név]
Témakör: ...
Képzési terv: Mikor tanítja? Kinek?
Előkészítés: Milyen támogatást kap?

Trainer 2: ...

Legalább 3-5 belső trainer azonosítása és fejlesztési terve:">${getResponse('train_the_trainer')}</textarea>
            </div>
          </div>
        </div>
      `;
    }

    // Step 4: Monitoring and early warning system
    if (stepNum === 4) {
      const kpisDefined = getFromDay4('kpis_defined', 1) || '';
      
      return `
        <div class="space-y-6">
          ${kpisDefined ? `
            <div class="bg-gradient-to-r from-red-50 to-rose-50 border-l-4 border-red-500 p-4 rounded-lg">
              <h4 class="font-semibold text-red-800 mb-2">
                <i class="fas fa-tachometer-alt"></i> Referencia: KPI-ok (4. Napból)
              </h4>
              <p class="text-sm text-gray-700">${kpisDefined.substring(0, 400)}...</p>
            </div>
          ` : ''}

          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                1. Fenntarthatósági KPI-ok meghatározása
              </label>
              <textarea name="sustainability_kpis" rows="9" 
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                placeholder="A fenntarthatóságot mérő mutatók (Leading Indicators!):

KPI 1: [Pl: Weekly Retrospective Completion Rate]
Mit mér: A csapatok hány %-a tart rendszeres retrospektívet
Target: 90%+
Gyakoriság: Heti
Riasztás: <70%

KPI 2: [Pl: SOP Documentation Coverage]
Mit mér: Kritikus folyamatok hány %-a van dokumentálva
Target: 100%
...

KPI 3: [Pl: Knowledge Transfer Completion]
...

Minimum 6-8 fenntarthatósági KPI:">${getResponse('sustainability_kpis')}</textarea>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                2. Dashboard design - Mi legyen rajta?
              </label>
              <textarea name="sustainability_dashboard" rows="7" 
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                placeholder="Dashboard elrendezés és tartalma:

TOP WIDGETS (látható első pillanatra):
1. [Widget neve]: Metrika, target, trend
2. ...

RIASZTÁSOK (Alert panel):
- Mely KPI-ok piros zónában?
- ...

TRENDEK (Idősorok):
- Mely mutatók javulnak/romlanak?

DRILL-DOWN:
- Mely részterületre lehet kattintani mélyebb elemzésért?

Sketch/leírás:">${getResponse('sustainability_dashboard')}</textarea>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                3. Red Flag Framework - Vörös zászlók
              </label>
              <textarea name="red_flags" rows="8" 
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                placeholder="Milyen korai figyelmeztető jelek utalnak problémára?

Red Flag 1: [Pl: Csapat meeting részvétel <60%]
Mit jelez: Elköteleződés/motiváció csökken
Akció: 1-on-1 beszélgetések, ok feltárása

Red Flag 2: [Pl: Visszacsúszás régi folyamatokhoz]
Mit jelez: ...
Akció: ...

Red Flag 3: [Pl: Új SOP-k nem használata]
...

Minimum 8 vörös zászló jelző:">${getResponse('red_flags')}</textarea>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                4. Quick Response mechanizmus - Gyors beavatkozás
              </label>
              <textarea name="quick_response" rows="6" 
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                placeholder="HA [RED FLAG], AKKOR [AKCIÓ] - protokoll

Red Flag → Döntési fa:
1. Ki értesül? (Riasztási lista)
2. Válaszidő? (24h, 48h, 1 hét?)
3. Ki avatkozik be? (Felelős)
4. Milyen eszköz? (5 Whys, Retrospektíva, Coaching?)
5. Kommunikáció? (Kinek kell tudni?)
6. Follow-up? (Mikor ellenőrizzük újra?)

Legalább 5 scenario és protokoll:">${getResponse('quick_response')}</textarea>
            </div>
          </div>
        </div>
      `;
    }

    // Step 5: Agility development
    if (stepNum === 5) {
      const okrsDefined = getFromDay2('strategic_goals_smart', 3) || '';
      
      return `
        <div class="space-y-6">
          ${okrsDefined ? `
            <div class="bg-gradient-to-r from-purple-50 to-pink-50 border-l-4 border-purple-500 p-4 rounded-lg">
              <h4 class="font-semibold text-purple-800 mb-2">
                <i class="fas fa-bullseye"></i> Referencia: Stratégiai célok (2. Napból)
              </h4>
              <p class="text-sm text-gray-700">${okrsDefined.substring(0, 400)}...</p>
            </div>
          ` : ''}

          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                1. Rövidebb tervezési ciklusok bevezetése
              </label>
              <textarea name="shorter_planning_cycles" rows="7" 
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                placeholder="Jelenlegi tervezési ciklus: [Pl: Éves stratégiai tervezés]

ÚJ tervezési ritmus:
- Quarterly Planning (negyedéves): OKR setting, Q review
- Monthly Check-in: Progress review, priorities adjustment
- Weekly Stand-ups: Gyors sync, blockers
- Daily Huddles (opcionális): 15 perc

Részletek:
- Mikor indítod?
- Ki vesz részt?
- Milyen formátum?
- Milyen output?

Konkrét implementációs terv:">${getResponse('shorter_planning_cycles')}</textarea>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                2. Cross-funkcionális gyors csapatok (Squad model)
              </label>
              <textarea name="cross_functional_squads" rows="8" 
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                placeholder="Milyen gyors csapatokat hozol létre?

Squad 1: [Név/Cél]
Tagok: [Szerepkörök: PO, Dev, UX, stb.]
Lifecycle: Időzített projekt / Folyamatos
Decision authority: Milyen döntéseket hozhat önállóan?
Ritmus: Daily standup, Sprint planning, Review, Retro

Squad 2: ...

Minimum 3 cross-functional csapat terve:">${getResponse('cross_functional_squads')}</textarea>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                3. Test-and-Learn kultúra - Kísérletezés
              </label>
              <textarea name="test_and_learn" rows="7" 
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                placeholder="Hogyan támogatod a kísérletezést?

1. Experiment Framework:
   - Hipotézis: Mit gondolunk?
   - Teszt: Hogyan ellenőrizzük?
   - Metrika: Mit mérünk?
   - Learning: Mit tanultunk?
   - Döntés: Scale/Pivot/Kill

2. Safe-to-fail experiments: Mely területeken?
3. Budget/időkeret: Mennyi erőforrás kísérletezésre?
4. Celebration: Hogyan ünnepeljük a tanulást?

Konkrét példa + keretrendszer:">${getResponse('test_and_learn')}</textarea>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                4. Retrospektívák rendszeresítése
              </label>
              <textarea name="regular_retrospectives" rows="6" 
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                placeholder="Retrospektíva ritmus és formátum:

Sprint/Project Retro:
- Gyakoriság: Sprint végén / Projekt mérföldkő
- Résztvevők: ...
- Formátum: Start-Stop-Continue, 4Ls, Sailboat, stb.
- Output: 3 action item (max!)

Quarterly Business Review:
- Mit tanultunk a negyedévben?
- ...

Konkrét terv és facilitátorok:">${getResponse('regular_retrospectives')}</textarea>
            </div>
          </div>
        </div>
      `;
    }

    // Step 6: Learning organization
    if (stepNum === 6) {
      const learningData = getFromDay5('learning_journal', 8) || getFromDay4('continuous_improvement', 8) || '';
      
      return `
        <div class="space-y-6">
          ${learningData ? `
            <div class="bg-gradient-to-r from-indigo-50 to-blue-50 border-l-4 border-indigo-500 p-4 rounded-lg">
              <h4 class="font-semibold text-indigo-800 mb-2">
                <i class="fas fa-graduation-cap"></i> Referencia: Tanulási gyakorlatok
              </h4>
              <p class="text-sm text-gray-700">${learningData.substring(0, 400)}...</p>
            </div>
          ` : ''}

          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                1. Peter Senge 5 Disciplines alkalmazása
              </label>
              <textarea name="senge_5_disciplines" rows="10" 
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                placeholder="Senge 5 fegyelme - Hogyan alkalmazod?

1. Personal Mastery (Személyes fejlődés):
   - Hogyan támogatod az egyéni tanulást?
   - Fejlesztési budget/idő?

2. Mental Models (Gondolkodási minták):
   - Hogyan kérdőjelezed meg az feltevéseket?
   - Reflection gyakorlatok?

3. Shared Vision (Közös jövőkép):
   - Hogyan alkotjátok közösen?

4. Team Learning (Csapattanulás):
   - Dialógus vs vita kultúrája?

5. Systems Thinking (Rendszerszemlélet):
   - Hogyan tanítod a rendszergondolkodást?

Konkrét akciók mindegyikhez:">${getResponse('senge_5_disciplines')}</textarea>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                2. After Action Review (AAR) bevezetése
              </label>
              <textarea name="after_action_review" rows="7" 
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                placeholder="AAR protokoll minden projekt/esemény után:

4 kérdés:
1. Mit akartunk elérni?
2. Mi történt valójában?
3. Miért volt különbség?
4. Mit tanultunk? (Mit csinálunk legközelebb másképp?)

Mikor használjuk:
- Projekt lezárása után
- Jelentős esemény után (siker vagy kudarc)
- ...

Ki facilitálja? Hogyan dokumentáljuk a tanulságokat?
Kinek kommunikáljuk?">${getResponse('after_action_review')}</textarea>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                3. Failure Celebration Framework - Produktív kudarcok ünneplése
              </label>
              <textarea name="failure_celebration" rows="7" 
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                placeholder="Hogyan ünnepeljük a tanulságos kudarcokat?

'Failure of the Month' award:
- Ki oszt? Mikor?
- Kritériumok: Bátor kísérlet + Őszinte tanulság
- Elismerés formája: ...

Blameless Postmortem:
- Nem 'Ki a hibás?', hanem 'Mi a rendszer hiba?'
- ...

FuckUp Nights / Learning Lunch:
- Osztás kudarcélményekről
- ...

Konkrét ceremóniák és formátumok:">${getResponse('failure_celebration')}</textarea>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                4. Innovation Time (Google 20% modell adaptálása)
              </label>
              <textarea name="innovation_time" rows="6" 
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                placeholder="Mennyit és hogyan adsz innovációs/tanulási időt?

Modell: [20%, 10%, Hack days, stb.]
Szabályok:
- Mit lehet csinálni? (Kísérlet, tanulás, új skill, stb.)
- Milyen elvárás? (Megosztás, prezentáció?)
- Budget: Van-e pénzkeret?

Példák, siker történetek:
- Mit fejlesztettek eddig?

Hogyan indítod?">${getResponse('innovation_time')}</textarea>
            </div>
          </div>
        </div>
      `;
    }

    // Step 7: Success communication
    if (stepNum === 7) {
      const communicationPlan = getFromDay2('communication_plan', 7) || '';
      
      return `
        <div class="space-y-6">
          ${communicationPlan ? `
            <div class="bg-gradient-to-r from-green-50 to-teal-50 border-l-4 border-green-500 p-4 rounded-lg">
              <h4 class="font-semibold text-green-800 mb-2">
                <i class="fas fa-bullhorn"></i> Referencia: Kommunikációs terv (2. Napból)
              </h4>
              <p class="text-sm text-gray-700">${communicationPlan.substring(0, 400)}...</p>
            </div>
          ` : ''}

          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                1. Quick Wins azonosítása és kommunikálása
              </label>
              <textarea name="quick_wins" rows="7" 
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                placeholder="Milyen gyors sikereket értek el és hogyan kommunikálod?

Quick Win 1: [Pl: Első sikeres OKR ciklus lezárása]
Amikor: ...
Mit kommunikálok: Számok, történet, tanulság
Kinek: Team, vezetőség, szélesebb szervezet
Hogyan: Email, all-hands, newsletter, dashboard

Quick Win 2: ...

Minimum 5 quick win és kommunikációs terv:">${getResponse('quick_wins')}</textarea>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                2. Success Story Template - Sztori formátum
              </label>
              <textarea name="success_story_template" rows="8" 
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                placeholder="Minden siker kommunikálásához használt sablon:

📖 TÖRTÉNET SABLON:
1. Context (Kontextus): Mi volt a kiindulási pont?
2. Challenge (Kihívás): Milyen problémát oldottunk meg?
3. Action (Akció): Mit csináltunk? Ki volt benne?
4. Result (Eredmény): Számok, tények, hatás
5. Learning (Tanulság): Mit tanultunk? Mit csinálnánk másképp?
6. What's Next (Következő lépések): Hova tartunk?

Válassz 1 sikert és írj story-t a sablon szerint:">${getResponse('success_story_template')}</textarea>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                3. Recognition Program - Elismerés és ünneplés
              </label>
              <textarea name="recognition_program" rows="7" 
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                placeholder="Strukturált elismerési program:

Mérföldkő események (amikor ünneplünk):
- Nap/Sprint vége
- Quarterly review
- Évforduló
- ...

Formátumok:
- Public shout-out (All-hands, email)
- Award/Recognition (Ki adja? Mi a díj?)
- Celebration event (Pizza party, off-site, stb.)
- Peer recognition platform

Példa ceremóniák és felelősök:">${getResponse('recognition_program')}</textarea>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                4. Kommunikációs csatornák és ritmus
              </label>
              <textarea name="communication_channels" rows="6" 
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                placeholder="Strukturált kommunikációs terv:

Napi/Heti:
- Csatorna: [Slack, Teams, Email?]
- Tartalom: Quick wins, shout-outs
- Ki felelős?

Havi:
- Newsletter: Success stories, metrics
- ...

Negyedéves:
- All-hands presentation
- ...

Éves:
- ...

Kommunikációs naptár:">${getResponse('communication_channels')}</textarea>
            </div>
          </div>
        </div>
      `;
    }

    // Step 8: Handover and succession planning
    if (stepNum === 8) {
      const teamData = getFromDay3('team_finalization', 8) || getFromDay3('talent_assessment', 5) || '';
      
      return `
        <div class="space-y-6">
          ${teamData ? `
            <div class="bg-gradient-to-r from-orange-50 to-red-50 border-l-4 border-orange-500 p-4 rounded-lg">
              <h4 class="font-semibold text-orange-800 mb-2">
                <i class="fas fa-user-friends"></i> Referencia: Csapat és tehetségek (3. Napból)
              </h4>
              <p class="text-sm text-gray-700">${teamData.substring(0, 400)}...</p>
            </div>
          ` : ''}

          <div class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                1. Potenciális utódok azonosítása (9-Box Grid)
              </label>
              <textarea name="potential_successors" rows="8" 
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                placeholder="9-Box Talent Grid alapján utódok:

HIGH POTENTIAL KANDIDÁNSOK:
1. [Név]
   Jelenlegi pozíció: ...
   Erősségek: ...
   Fejlesztendő területek: ...
   Időhorizont: Mikor lesz készen? (6-12-24 hónap)

2. [Név]
   ...

BACKUP OPCIÓK (ha első nem elérhető):
3. [Név]
   ...

Minimum 2-3 realisztikus utód jelölt:">${getResponse('potential_successors')}</textarea>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                2. Utódfejlesztési terv (6-12 hónap roadmap)
              </label>
              <textarea name="successor_development_plan" rows="9" 
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                placeholder="Minden utódjelölthez fejlesztési terv:

KANDIDÁNS: [Név]

0-3 hónap:
- Shadowing: [Mely területek?]
- Exposure: [Mely meetingek, projektek?]
- Skill gaps: [Milyen képzések?]

4-6 hónap:
- Acting role: [Mely területen próbálhatja ki magát?]
- Mentoring: [Ki mentorálja?]
- Stretch assignments: [Kihívó feladatok]

7-12 hónap:
- Interim leadership: [Temporary role?]
- Stakeholder introduction: [Kapcsolatok átadása]
- Final readiness assessment

Részletes roadmap legalább az első jelölthöz:">${getResponse('successor_development_plan')}</textarea>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                3. Transition Roadmap - Átadási ütemterv
              </label>
              <textarea name="transition_roadmap" rows="8" 
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                placeholder="Átadási terv (ha ténylegesen átadásra kerül sor):

30 NAPPAL ÁTADÁS ELŐTT:
- Stakeholder kommunikáció
- Knowledge transfer intenzív fázis
- ...

ÁTADÁS NAPJA:
- Hivatalos announcement
- Intro to key stakeholders
- ...

30 NAP UTÁN:
- Shadowing fordítva (régi vezető support-ol)
- Check-in meetings
- ...

90 NAP UTÁN:
- Teljes önállóság
- Final retrospektíva
- Lessons learned

Részletes ütemterv:">${getResponse('transition_roadmap')}</textarea>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                4. "Tribal Knowledge" átadása - A láthatatlan dolgok
              </label>
              <textarea name="tribal_knowledge" rows="9" 
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                placeholder="Mit kell átadni, ami nincs leírva?

1. KAPCSOLATI TÉRKÉP:
   - Kik a kulcsemberek?
   - Kinek mi a motivációja?
   - Kit kell bevonni mikor és miért?

2. POLITIKAI TÉRKÉP:
   - Milyen szövetségek/dinamikák vannak?
   - Kik a veto players?
   - Hogyan építesz konszenzust?

3. DÖNTÉSHOZATALI LOGIKA:
   - Mi az íratlan szabály?
   - Mikor eszkalálsz?
   - Milyen trade-off-ok vannak?

4. KULTURÁLIS NUANCES:
   - Mi működik itt?
   - Mi a tabu?

Konkrét példák és esettanulmányok átadásra:">${getResponse('tribal_knowledge')}</textarea>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">
                5. 30-60-90 napos terv az utód számára
              </label>
              <textarea name="successor_30_60_90_plan" rows="7" 
                class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                placeholder="Mit várunk az utódtól az első 90 napban?

ELSŐ 30 NAP (Tanulás):
- Figyelj, tanulj, kérdezz
- 1-on-1 minden stakeholderrel
- Megérteni a rendszert
- Quick wins: [1-2 gyors akció]

60 NAP (Hozzájárulás):
- Első változtatások
- ...

90 NAP (Ownership):
- Teljes felelősség átvétele
- Első stratégiai döntések
- ...

Világos elvárások és mérföldkövek:">${getResponse('successor_30_60_90_plan')}</textarea>
            </div>
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
    // Show landing page for first-time visitors
    showView('landing');
  }
}

// Run on page load
init();
