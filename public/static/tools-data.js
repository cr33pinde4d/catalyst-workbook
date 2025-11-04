// Eszközök one-pager definíciói
const toolsData = {
  "Brainstorming": {
    title: "Brainstorming",
    icon: "fa-lightbulb",
    description: "Gyors ötletgenerálás szabadon, strukturálatlanul.",
    when: "Amikor sok, változatos ötletre van szükség gyorsan.",
    howTo: [
      "1. Határozd meg a témát vagy problémát",
      "2. Állíts időkeretet (5-15 perc)",
      "3. Írj le MINDEN ötletet ítélkezés nélkül",
      "4. Ne szerkeszd, ne kritizáld közben",
      "5. Mennyiség > minőség ebben a fázisban",
      "6. Utána csoportosítsd és értékeld"
    ],
    tips: "Használj Post-it lapokat vagy digitális táblát. Minél vadabb az ötlet, annál jobb!"
  },
  
  "5 Miért módszer": {
    title: "5 Miért módszer (5 Whys)",
    icon: "fa-question-circle",
    description: "Gyökérok feltárása ismételt 'Miért?' kérdésekkel.",
    when: "Amikor a probléma mögötti valódi okot keresed.",
    howTo: [
      "1. Fogalmazd meg a problémát egyértelműen",
      "2. Kérdezd: 'Miért történik ez?'",
      "3. Válaszolj tényszerűen",
      "4. Az előző válaszra kérdezd újra: 'Miért?'",
      "5. Ismételd legalább 5-ször",
      "6. Az utolsó 'Miért' gyakran a gyökérok"
    ],
    tips: "Ne állj meg 3-nál! Az 5. vagy 6. miért-nél gyakran jön az áttörés.",
    example: "Probléma: A gép leállt → Miért? Túlterhelődött → Miért? Szűrő eldugult → Miért? Nem tisztították → Miért? Nincs karbantartási ütemterv → GYÖKÉROK!"
  },
  
  "Ishikawa diagram": {
    title: "Ishikawa (Halszálka) diagram",
    icon: "fa-project-diagram",
    description: "Vizuális ok-okozati elemzés kategóriákba rendezve.",
    when: "Komplex problémák strukturált elemzéséhez.",
    howTo: [
      "1. Rajzold le a 'halat': fej = probléma",
      "2. Húzz főágakat: Ember, Módszer, Gép, Anyag, Környezet, Mérés",
      "3. Minden főágra gyűjts okokat (mellékágak)",
      "4. Kérdezz: 'Mi okozza ezt?' minden ágon",
      "5. Mélyedj el ág mentén (al-okok)",
      "6. Elemezd, melyik ág a legsűrűbb"
    ],
    tips: "Csapatmunkában még hatékonyabb! Mindenki más perspektívát ad."
  },
  
  "SWOT-analízis": {
    title: "SWOT-analízis",
    icon: "fa-th-large",
    description: "Stratégiai helyzetelemzés 4 nézőpontból.",
    when: "Stratégiai tervezéshez, pozíció felméréshez.",
    howTo: [
      "1. Rajzolj 2×2 táblázatot",
      "2. Strengths (Erősségek): Miben vagy jó? Belső, pozitív",
      "3. Weaknesses (Gyengeségek): Mit javítanál? Belső, negatív",
      "4. Opportunities (Lehetőségek): Milyen trendek segítenek? Külső, pozitív",
      "5. Threats (Veszélyek): Mi akadályoz? Külső, negatív",
      "6. Elemezd a keresztkapcsolatokat (S+O, W+T)"
    ],
    tips: "Légy őszinte! A valódi SWOT ereje az objektivitásban van."
  },
  
  "Pareto-elemzés": {
    title: "Pareto-elemzés (80/20 szabály)",
    icon: "fa-chart-bar",
    description: "A kevés kritikus tényező azonosítása, ami a legnagyobb hatást okozza.",
    when: "Amikor priorizálni kell a sok probléma között.",
    howTo: [
      "1. Listázd az okokat/problémákat",
      "2. Mérj számszerűen (gyakorisága, költsége, ideje)",
      "3. Rendezd csökkenő sorrendbe",
      "4. Számold a kumulatív százalékot",
      "5. Készíts oszlopdiagramot",
      "6. Fókuszálj az első 20%-ra (ami 80% hatást okoz)"
    ],
    tips: "Az első 2-3 ok gyakran a problémák 70-80%-át okozza!"
  },
  
  "Cost-Benefit elemzés": {
    title: "Cost-Benefit Analysis (CBA)",
    icon: "fa-balance-scale",
    description: "Költségek és hasznok pénzügyi összehasonlítása.",
    when: "Befektetési döntéseknél, nagyobb változásoknál.",
    howTo: [
      "1. Listázd az összes költséget (közvetlen + közvetett)",
      "2. Listázd az összes hasznot (pénzügyi + nem pénzügyi)",
      "3. Pénzügyi értéket rendelj mindenhez",
      "4. Számítsd: Nettó haszon = Hasznok - Költségek",
      "5. Számítsd: Benefit/Cost ráta = Hasznok / Költségek",
      "6. Ha B/C > 1, akkor megéri"
    ],
    tips: "Ne felejtsd el a rejtett költségeket (idő, képzés, változás ellenállás)!"
  },
  
  "FMEA": {
    title: "FMEA (Failure Mode and Effects Analysis)",
    icon: "fa-exclamation-triangle",
    description: "Hibamód és hatáselemzés a kockázatok előrejelzésére.",
    when: "Új folyamat tervezésekor, kockázatkezeléshez.",
    howTo: [
      "1. Listázd a lehetséges hibamódokat",
      "2. Értékeld Severity (súlyosság): 1-10",
      "3. Értékeld Occurrence (előfordulás): 1-10",
      "4. Értékeld Detection (észlelhetőség): 1-10",
      "5. Számítsd: RPN = S × O × D",
      "6. Priorizálj magas RPN értékekre"
    ],
    tips: "RPN > 100 már komoly kockázat! Azonnali akció kell."
  },
  
  "Golden Circle": {
    title: "Golden Circle (Simon Sinek)",
    icon: "fa-bullseye",
    description: "Start with WHY - A motiváció magja.",
    when: "Stratégia kommunikálásához, csapat inspirálásához.",
    howTo: [
      "1. WHY (Miért): Mi a mély cél, hit, ok?",
      "2. HOW (Hogyan): Hogyan valósítod meg? Mi a különleges módszer?",
      "3. WHAT (Mit): Mi a konkrét termék/szolgáltatás?",
      "4. Mindig BELÜLRŐL KIFELÉ kommunikálj!",
      "5. Az emberek nem azt veszik, amit csinálsz, hanem azt, AMIÉRT csinálod"
    ],
    tips: "A legtöbb cég a WHAT-tal kezdi. Te kezdd a WHY-jal!",
    example: "Apple: WHY = Kihívjuk a status quo-t → HOW = Gyönyörű design → WHAT = Számítógépek"
  },
  
  "SMART célok": {
    title: "SMART célkitűzések",
    icon: "fa-crosshairs",
    description: "Konkrét, mérhető célok meghatározása.",
    when: "Bármilyen cél vagy projekt indításakor.",
    howTo: [
      "Specific (Konkrét): Pontosan MIT akarsz elérni?",
      "Measurable (Mérhető): Hogyan méred? Mi a szám?",
      "Achievable (Elérhető): Reális-e? Van-e erőforrás?",
      "Relevant (Releváns): Kapcsolódik a nagy célhoz?",
      "Time-bound (Határidős): Mikorra? Konkrét dátum!"
    ],
    tips: "Ha nem tudod számmal mérni, nem SMART cél!",
    example: "❌ 'Fejleszteni a kommunikációt' → ✅ 'Heti 1 csapatmegbeszélés, 90% részvétel, Q2 végéig'"
  },
  
  "OKR": {
    title: "OKR (Objectives & Key Results)",
    icon: "fa-tasks",
    description: "Ambiciózus célok + mérhető kulcseredmények.",
    when: "Negyedéves tervezéshez, startup környezetben.",
    howTo: [
      "1. Objective: Inspiráló, minőségi cél (1-5 db)",
      "2. Key Results: 3-5 mérhető eredmény objektívumonként",
      "3. KR-ek 0-100% skálázhatóak",
      "4. Cél: 70-80% elérése (nem 100%!)",
      "5. Negyedévente felülvizsgálat",
      "6. Nyilvános az egész csapat számára"
    ],
    tips: "Ha minden OKR-t 100%-ra teljesítesz, nem voltál elég ambiciózus!",
    example: "O: Forradalmasítjuk az ügyfélélményt → KR1: NPS 45→65, KR2: Válaszidő <2h, KR3: Ügyfélmegtartás 80%→92%"
  },
  
  "Eisenhower-mátrix": {
    title: "Eisenhower-mátrix",
    icon: "fa-th",
    description: "Priorizálás sürgősség és fontosság alapján.",
    when: "Amikor túl sok feladatod van, és nem tudod, hol kezdj.",
    howTo: [
      "Rajzolj 2×2 táblát: Fontos/Nem fontos × Sürgős/Nem sürgős",
      "1. Fontos + Sürgős: CSINÁLD MOST (krízis)",
      "2. Fontos + Nem sürgős: TERVEZD BE (fejlesztés, stratégia)",
      "3. Nem fontos + Sürgős: DELEGÁLD (megszakítások)",
      "4. Nem fontos + Nem sürgős: DOBD EL (időpocsékolás)"
    ],
    tips: "A legtöbb ember a 1-es és 3-as kvadránsban él. A 2-es kvadráns a siker titka!"
  },
  
  "RACI mátrix": {
    title: "RACI mátrix",
    icon: "fa-users-cog",
    description: "Szerepek és felelősségek tisztázása.",
    when: "Projekt indításkor, felelősségi zavarok esetén.",
    howTo: [
      "Készíts táblázatot: Feladatok × Személyek",
      "R (Responsible): Ki végzi? (1 fő/feladat)",
      "A (Accountable): Ki a felelős? (csak 1 fő!)",
      "C (Consulted): Kit kell megkérdezni? (input)",
      "I (Informed): Kit kell tájékoztatni? (output)",
      "Töltsd ki minden cellát"
    ],
    tips: "Ha egy feladatnak 2 'A'-ja van, baj lesz! Pontosan 1 accountable személynek kell lennie."
  },
  
  "Goleman 6 vezetői stílusa": {
    title: "6 Vezetői Stílus (Daniel Goleman)",
    icon: "fa-user-tie",
    description: "Situációs vezetői stílusok.",
    when: "Vezetői fejlődéshez, csapat menedzsmenthez.",
    howTo: [
      "1. Irányító (Coercive): Krízisben, gyors döntés kell",
      "2. Tekintélyalapú (Authoritative): Új irány, vízió",
      "3. Kapcsolatalapú (Affiliative): Bizalom építés, team building",
      "4. Demokratikus: Input kell, döntés előtt",
      "5. Tempót diktáló (Pacesetting): Magas teljesítmény, példamutatás",
      "6. Fejlesztő (Coaching): Hosszú távú fejlődés, mentorálás"
    ],
    tips: "Nincs 'legjobb' stílus! A helyzet diktálja, melyik kell. A jó vezető tud váltani."
  },
  
  "Pulse check": {
    title: "Pulse Check",
    icon: "fa-heartbeat",
    description: "Gyors csapat-hangulat mérés.",
    when: "Hetente/kéthetente, változások közben.",
    howTo: [
      "1. Gyors survey (1-2 perc kitöltés)",
      "2. 3-5 kérdés, 1-5 skála",
      "3. Pl: Mennyire vagy motivált? Mennyire érzed támogatva magad?",
      "4. Azonnal összesítsd",
      "5. Beszéljétek meg a trendeket",
      "6. Cselekvési terv, ha kell"
    ],
    tips: "Névtelenül hatékonyabb! Heti rendszeresség = korai figyelmeztető jelzések."
  },
  
  "Stakeholder-elemzés": {
    title: "Stakeholder Analysis",
    icon: "fa-sitemap",
    description: "Érintettek feltérképezése és kezelési stratégia.",
    when: "Változásmenedzsmentnél, politikai helyzetekben.",
    howTo: [
      "1. Listázd az érintetteket",
      "2. Mérj: Hatalom (alacsony/magas) × Érdeklődés (alacsony/magas)",
      "3. Magas hatalom + Magas érdeklődés: Szorosan kezelj (key players)",
      "4. Magas hatalom + Alacsony érdeklődés: Elégedetten tarts",
      "5. Alacsony hatalom + Magas érdeklődés: Tájékoztasd",
      "6. Alacsony hatalom + Alacsony érdeklődés: Monitorozd"
    ],
    tips: "Ne felejtsd el a 'csendes' stakeholdereket, akik később előjöhetnek!"
  },
  
  "Folyamatábra": {
    title: "Folyamatábra (Flowchart)",
    icon: "fa-stream",
    description: "Vizuális folyamatleírás lépésről lépésre.",
    when: "Folyamat dokumentálásához, szűk keresztmetszet kereséséhez.",
    howTo: [
      "1. Kezdőpont (ovális)",
      "2. Folyamat lépés (téglalap)",
      "3. Döntési pont (rombusz)",
      "4. Végpont (ovális)",
      "5. Nyilak összekötik",
      "6. Jelöld az időket, felelősöket"
    ],
    tips: "Járd végig fizikálisan! Sok rejtett lépés úgy jön elő."
  },
  
  "Belbin szerepek": {
    title: "Belbin Csapatszerepek",
    icon: "fa-users",
    description: "9 csapatszerep, ami a sikeres csapat alapja.",
    when: "Csapat összeállításakor, csapatdinamika elemzéséhez.",
    howTo: [
      "1. Koordinátor: Világos célok, delegálás, döntések",
      "2. Formáló (Shaper): Drive, dinamikus, kihívást keres",
      "3. Megvalósító (Implementer): Gyakorlatias, fegyelmezett, megbízható",
      "4. Csapatjátékos: Együttműködő, diplomata, rugalmas",
      "5. Kutató-felderítő (Resource Investigator): Kifelé néző, kapcsolatok, lehetőségek",
      "6. Ötletadó (Plant): Kreatív, innovatív, szabadgondolkodó",
      "7. Monitor-értékelő: Stratégiai, józan ítélet, objektív",
      "8. Befejező (Completer-Finisher): Alapos, határidőkre odafigyel, perfekcionista",
      "9. Szakértő (Specialist): Elkötelezett, szűk szakterület, mély tudás"
    ],
    tips: "Egy emberben több szerep is lehet! A kiegyensúlyozott csapatban minden szerepre van valaki.",
    example: "Startup: kell Formáló (alapító), Ötletadó (innováció), Megvalósító (szállítás), Befejező (minőség)"
  },
  
  "Skills Matrix": {
    title: "Skills Matrix (Kompetencia Mátrix)",
    icon: "fa-th",
    description: "Vizuális készségtérkép a csapat kompetenciáiról.",
    when: "Csapat képességfelméréshez, hiányelemzéshez, tréning tervezéshez.",
    howTo: [
      "1. Készíts táblázatot: Kompetenciák × Csapattagok",
      "2. Határozd meg a releváns kompetenciákat (tech, soft skills, domain tudás)",
      "3. Értékeld minden tag szintjét (pl. 1-5 skála)",
      "4. 1 = Kezdő, 3 = Kompetens, 5 = Expert",
      "5. Színkódold (piros=hiány, zöld=erősség)",
      "6. Azonosítsd a kritikus hiányokat",
      "7. Tervezd a fejlesztést vagy toborzást"
    ],
    tips: "Frissítsd negyedévente! Kérdezd meg a csapatot is (önértékelés + peer review).",
    example: "Ha senki nem 3+ Python-ban, de az új projekt Python-t igényel → tréning vagy toborzás!"
  },
  
  "360° értékelés": {
    title: "360 fokos visszajelzés",
    icon: "fa-user-circle",
    description: "Több irányú visszajelzés: főnök, kollégák, beosztottak, önértékelés.",
    when: "Vezetőfejlesztéshez, teljesítményértékeléshez, vak foltok feltárásához.",
    howTo: [
      "1. Válassz értékelőket: felettes, peers (3-5 fő), beosztottak (ha van)",
      "2. Azonos kérdések mindenkinek (pl. kommunikáció, vezetés, együttműködés)",
      "3. Anonim válaszok (bizalom!)",
      "4. Skálázott válaszok (1-5) + szöveges megjegyzések",
      "5. Összesítés és elemzés",
      "6. Önértékelés összehasonlítása másokéval",
      "7. Fejlesztési terv a gap-ek alapján"
    ],
    tips: "A legnagyobb tanulság: önértékelés vs mások értékelése közti különbség! Ez mutatja a vak foltokat.",
    example: "Ha te 5-ösre értékeled a kommunikációdat, de mások 2-3-ra → van mit fejleszteni!"
  },
  
  "Kompetencia gap elemzés": {
    title: "Competency Gap Analysis",
    icon: "fa-tasks",
    description: "Jelenlegi vs szükséges kompetenciák különbségének elemzése.",
    when: "Stratégiai tervezéshez, szervezeti átalakuláshoz, készségfejlesztéshez.",
    howTo: [
      "1. Határozd meg a SZÜKSÉGES kompetenciákat (jövőbeli célokhoz)",
      "2. Mérjed fel a JELENLEGI kompetenciákat (skills matrix, értékelések)",
      "3. Számítsd a GAP-et: Szükséges szint - Jelenlegi szint",
      "4. Priorizálás: Melyik gap kritikus? (hatás × sürgősség)",
      "5. Megoldási opciók: Tréning? Toborzás? Külső partner? Átszervezés?",
      "6. Költség-haszon elemzés minden opcióra",
      "7. Akcióterv: Ki, Mit, Mikor, Mennyiért"
    ],
    tips: "Ne csak a hiányokra fókuszálj! Az erősségek is fontosak – építs rájuk!",
    example: "Gap: Data Science. Opciók: 1) Jelenlegi mérnököket képzed (6 hó, olcsóbb), 2) Data scientist-et toborozhatsz (gyorsabb, drágább)"
  },
  
  "Kompetencia mátrix": {
    title: "Kompetencia Mátrix",
    icon: "fa-chart-bar",
    description: "Skills Matrix szinonimája - lásd Skills Matrix.",
    when: "Lásd Skills Matrix.",
    howTo: [
      "Ez az eszköz ugyanaz, mint a Skills Matrix.",
      "Lásd a 'Skills Matrix' eszközt részletes útmutatóért."
    ],
    tips: "Használd a 'Skills Matrix' eszközt!"
  }
};

// Eszköz modal megnyitása
function openToolModal(toolName) {
  const tool = toolsData[toolName];
  if (!tool) {
    console.warn('Tool not found:', toolName);
    return;
  }
  
  const modal = document.createElement('div');
  modal.id = 'tool-modal';
  modal.className = 'fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 animate-slide-in';
  modal.onclick = (e) => {
    if (e.target === modal) closeToolModal();
  };
  
  modal.innerHTML = `
    <div class="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto" onclick="event.stopPropagation()">
      <!-- Header -->
      <div class="gradient-bg text-white p-6 rounded-t-2xl">
        <div class="flex justify-between items-start">
          <div class="flex items-center gap-4">
            <div class="bg-white/20 w-16 h-16 rounded-full flex items-center justify-center">
              <i class="fas ${tool.icon} text-3xl"></i>
            </div>
            <div>
              <h2 class="text-3xl font-bold">${tool.title}</h2>
              <p class="text-purple-100 mt-1">${tool.description}</p>
            </div>
          </div>
          <button onclick="closeToolModal()" 
            class="text-white hover:text-purple-200 text-2xl">
            <i class="fas fa-times"></i>
          </button>
        </div>
      </div>
      
      <!-- Content -->
      <div class="p-6 space-y-6">
        <!-- When to use -->
        <div class="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg">
          <h3 class="font-bold text-blue-900 mb-2 flex items-center gap-2">
            <i class="fas fa-clock"></i> Mikor használd?
          </h3>
          <p class="text-blue-800">${tool.when}</p>
        </div>
        
        <!-- How to -->
        <div>
          <h3 class="font-bold text-gray-800 mb-3 flex items-center gap-2 text-xl">
            <i class="fas fa-list-ol text-purple-600"></i> Hogyan működik?
          </h3>
          <div class="space-y-2">
            ${Array.isArray(tool.howTo) 
              ? tool.howTo.map(step => `
                <div class="flex items-start gap-3 bg-gray-50 p-3 rounded-lg">
                  <i class="fas fa-check-circle text-green-500 mt-1"></i>
                  <p class="text-gray-700">${step}</p>
                </div>
              `).join('')
              : `<p class="text-gray-700 bg-gray-50 p-4 rounded-lg">${tool.howTo}</p>`
            }
          </div>
        </div>
        
        <!-- Tips -->
        ${tool.tips ? `
          <div class="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded-r-lg">
            <h3 class="font-bold text-yellow-900 mb-2 flex items-center gap-2">
              <i class="fas fa-lightbulb"></i> Pro tipp
            </h3>
            <p class="text-yellow-800">${tool.tips}</p>
          </div>
        ` : ''}
        
        <!-- Example -->
        ${tool.example ? `
          <div class="bg-green-50 border-l-4 border-green-500 p-4 rounded-r-lg">
            <h3 class="font-bold text-green-900 mb-2 flex items-center gap-2">
              <i class="fas fa-graduation-cap"></i> Példa
            </h3>
            <p class="text-green-800">${tool.example}</p>
          </div>
        ` : ''}
      </div>
      
      <!-- Footer -->
      <div class="bg-gray-50 p-4 rounded-b-2xl text-center">
        <button onclick="closeToolModal()" 
          class="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition">
          <i class="fas fa-check"></i> Értem
        </button>
      </div>
    </div>
  `;
  
  document.body.appendChild(modal);
  document.body.style.overflow = 'hidden';
}

function closeToolModal() {
  const modal = document.getElementById('tool-modal');
  if (modal) {
    modal.remove();
    document.body.style.overflow = '';
  }
}

// ESC key to close modal
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    closeToolModal();
  }
});
