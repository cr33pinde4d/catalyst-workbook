# Catalyst Tanulási Napló

Interaktív online munkafüzet vezetői fejlesztéshez - strukturált problémamegoldás és stratégiai végrehajtás.

## 🎯 Projekt áttekintés

A Catalyst Tanulási Napló egy full-stack webalkalmazás, amely digitalizálja a 6 napos Catalyst vezetői fejlesztő programot. A platform lehetővé teszi a vezetők számára, hogy lépésről lépésre dolgozzanak át komplex vezetői problémákat, nyomon kövessék haladásukat, és strukturáltan dokumentálják tanulási folyamatukat.

## ✨ Főbb funkciók

### ✅ Jelenleg implementált funkciók

- **🔐 Felhasználói autentikáció**: Biztonságos regisztráció és bejelentkezés JWT tokenekkel
- **📊 Haladás követés**: Real-time progresszió tracking minden egyes lépéshez
- **💾 Automatikus mentés**: Válaszok és jegyzetek automatikus mentése D1 adatbázisban
- **📱 Responsive design**: Mobilbarát, modern UI Tailwind CSS-sel
- **🎓 6 tréningnap**: Teljes kurzus struktúra 8 lépéssel naponta
- **📝 Dinamikus mezők**: Kontextus-érzékeny input mezők minden lépéshez
- **🎯 Státusz menedzsment**: "Folyamatban" és "Befejezett" státuszok
- **📈 Dashboard**: Vizuális áttekintés az összes tréningnapról és haladásról
- **🔗 Progresszív adatáramlás**: Lépések egymásra épülnek - az előző lépés adatai automatikusan importálódnak a következőbe
- **🛠️ Eszköz One-Pagerek**: 15+ vezetői eszköz teljes dokumentációval, kattintható modal ablakokban
- **📋 Strukturált táblázatok**: Hatáselemzés, priorizálás, adatgyűjtés táblázatos formában

### 🔄 Folyamatban lévő funkciók

- **📄 PDF Export**: Kitöltött munkafüzet exportálása PDF formátumba
- **🔍 Keresés**: Válaszok és jegyzetek közötti keresés
- **📊 Analitika**: Részletes statisztikák és insights

## 🏗 Architektúra

### Frontend
- **Framework**: Vanilla JavaScript (SPA architecture)
- **UI**: Tailwind CSS, Font Awesome icons
- **State Management**: Simple state object with localStorage persistence
- **HTTP Client**: Axios

### Backend
- **Framework**: Hono (lightweight edge framework)
- **Runtime**: Cloudflare Workers
- **Database**: Cloudflare D1 (SQLite)
- **Authentication**: JWT with bcrypt password hashing

## 📊 Adatbázis struktúra

### Táblák

- **users**: Felhasználói adatok (email, név, jelszó hash)
- **training_days**: 6 tréningnap mester adatai
- **training_steps**: Lépések minden naphoz (összesen ~48 lépés)
- **user_progress**: Felhasználói haladás tracking (státusz, időbélyegek)
- **user_responses**: Felhasználói válaszok és jegyzetek
- **sessions**: Munkamenet kezelés

## 🚀 Használat

### Helyi fejlesztés

```bash
# Függőségek telepítése
npm install

# D1 migráció alkalmazása (lokálisan)
npm run db:migrate:local

# Build
npm run build

# Fejlesztői szerver indítása PM2-vel
pm2 start ecosystem.config.cjs

# Szerver tesztelése
npm run test

# Logok megtekintése
pm2 logs catalyst --nostream

# Szerver leállítása
pm2 stop catalyst
```

### Publikus URL

**Development**: https://3000-ildzif0p6yl6272ppdpuy-5c13a017.sandbox.novita.ai

### API Endpointok

#### Autentikáció
- `POST /api/auth/register` - Új felhasználó regisztráció
- `POST /api/auth/login` - Bejelentkezés
- `GET /api/auth/me` - Aktuális felhasználó adatai (protected)

#### Tréning adatok
- `GET /api/training/days` - Összes tréningnap (protected)
- `GET /api/training/days/:dayId` - Egy nap részletei + lépések (protected)
- `GET /api/training/steps/:stepId` - Egy lépés részletei (protected)

#### Haladás tracking
- `GET /api/progress` - Felhasználó összes haladása (protected)
- `GET /api/progress/day/:dayId` - Egy nap haladása (protected)
- `POST /api/progress/step/:stepId` - Lépés státusz frissítése (protected)

#### Válaszok
- `GET /api/responses` - Összes válasz (protected)
- `GET /api/responses/day/:dayId` - Egy nap válaszai (protected)
- `GET /api/responses/step/:stepId` - Egy lépés válaszai (protected)
- `POST /api/responses` - Válasz mentése (protected)
- `POST /api/responses/batch` - Több válasz mentése egyszerre (protected)

## 📚 Tréningnapok

### 1. Nap: Vezetői tudatosság és problémamegoldás ✅
8 lépés - Strukturált problémafeltárás, hatáselemzés, gyökérok-elemzés
- **Progresszív flow**: Minden lépés építi az előzőt
- **5 probléma → 3 elemzés → 1 kiválasztás → 5W1H → SWOT → Adatok → Gyökérok**

### 2. Nap: Vezetői stílus és stratégiaalkotás ✅
8 lépés - Start with Why, vízió, célok, akcióterv, döntéshozatal
- **Golden Circle**: WHY-HOW-WHAT
- **Vision statement** időkerettel
- **SMART célok** (3-5 db) részletes breakdown
- **Goleman 6 vezetői stílus** önértékelés (slider-ekkel)
- **Akcióterv táblázat** (feladat, felelős, határidő, KPI)
- **Döntéshozatali keretrendszer**
- **Kommunikációs mátrix** (ki-mit-hogyan-mikor)
- **Kockázatelemzés** (valószínűség × hatás)

### 3. Nap: Csapat kialakítása ✅
2 lépés - Szerepek, felelősségek és kompetenciák
- **1. lépés - Csapatszerepek azonosítása**: Belbin szerepek, RACI mátrix, jelenlegi csapat feltérképezése, hiányok és átfedések
- **2. lépés - Kompetencia felmérés**: Skills Matrix, jelenlegi vs szükséges kompetenciák, gap elemzés, akciók (tréning/toborzás/külső)

### 4. Nap: Teljesítménymenedzsment
KPI-ok, mérés, monitoring, visszajelzés

### 5. Nap: Csapatmenedzsment
Delegálás, motiváció, konfliktuskezelés

### 6. Nap: Fenntartás & adaptáció
Változás beépítése, folyamatos fejlődés kultúrája

## 🔒 Biztonság

- **Jelszavak**: bcrypt hash (10 rounds)
- **Autentikáció**: JWT tokenek (7 napos lejárat)
- **CORS**: Engedélyezett API útvonalakhoz
- **Input validáció**: Backend és frontend oldalon is

## 🛠 Technológiai stack

- **Language**: TypeScript
- **Framework**: Hono 4.10.4
- **Database**: Cloudflare D1 (SQLite)
- **Auth**: bcryptjs + jsonwebtoken
- **Build**: Vite 6.3.5
- **Deployment**: Cloudflare Pages + Workers
- **Process Manager**: PM2 (development)

## 📈 Következő lépések

1. ✅ ~~Alapvető CRUD műveletek~~
2. ✅ ~~Haladás tracking rendszer~~
3. ✅ ~~Dinamikus input mezők minden lépéshez~~
4. 🔄 PDF export funkció implementálása
5. 🔄 Keresési funkció
6. 🔄 Admin dashboard
7. 🔄 Email értesítések
8. 🔄 Collaborative features (csoportos munkafüzetek)

## 📝 Változásnapló

### 2025-11-04 - v1.4.0
- ✅ **3. Nap implementáció (2 lépés)**: Csapat kialakítása
  - 1. lépés: Csapatszerepek azonosítása (Belbin, RACI, jelenlegi csapat, hiányok)
  - 2. lépés: Kompetencia felmérés (Skills Matrix, gap elemzés, akciók)
- ✅ **Új eszközök hozzáadva**: Belbin szerepek, Skills Matrix, 360° értékelés, Kompetencia gap elemzés

### 2025-11-04 - v1.3.0
- ✅ **2. Nap teljes implementáció**: Stratégiaalkotás és vezetői stílus
  - Golden Circle (WHY-HOW-WHAT) Simon Sinek szerint
  - Vízió megfogalmazás időkerettel és mérőszámokkal
  - SMART célok részletes breakdown (3-5 cél)
  - Goleman 6 vezetői stílus önértékelés slider-ekkel
  - Akcióterv táblázat (min 3 akció kötelező)
  - Döntéshozatali keretrendszer és kritériumok
  - Kommunikációs mátrix (célcsoport × üzenet × csatorna)
  - Kockázatelemzés (valószínűség × hatás mátrix)
- ✅ **Cross-day adatimport**: 2. nap lát és használ 1. nap adatokat
- ✅ **Új UI elemek**: Range slider-ek, strukturált táblázatok, színkódolt mezők

### 2025-11-04 - v1.2.0
- ✅ **Progresszív adatáramlás**: 1. nap 8 lépése egymásra épül
  - Step 1 → Step 2: Problémák importálása hatáselemzésbe
  - Step 2 → Step 3: Kiválasztott probléma elemzése
  - Step 3 → Step 4: Priorizálás minden problémára
  - Step 4 → Step 5: Legfontosabb probléma 5W1H definíciója
  - Step 5 → Step 6: SWOT elemzés a definiált problémára
  - Step 6 → Step 7: Adatok gyűjtése strukturált táblázattal
  - Step 7 → Step 8: Gyökérok-elemzés 5 Miért módszerrel
- ✅ **Eszköz modalok**: 15+ vezetői eszköz one-pager dokumentációval
- ✅ **Strukturált input formok**: Táblázatok, dropdown-ok, validációk
- ✅ **Kontextus-érzékeny hibaüzenetek**: Ha előző lépés hiányzik

### 2025-11-04 - v1.0.0
- ✅ Teljes auth rendszer (register/login/JWT)
- ✅ 6 tréningnap + 48 lépés seed adatok
- ✅ Haladás tracking (not_started/in_progress/completed)
- ✅ Válaszok mentése és betöltése
- ✅ Batch mentés
- ✅ Responsive dashboard
- ✅ Dinamikus gyakorlat mezők (Day 1 specifikus)
- ✅ Real-time status frissítés

## 🤝 Közreműködés

Ez a projekt az MVM Catalyst Leadership Development Program része. A munkafüzet Balázs vezetésével készült.

## 📄 Licensz

Proprietary - MVM Group

---

**Készült**: 2025-11-04  
**Verzió**: 1.4.0  
**Státusz**: ✅ Működőképes (Development)  
**Tech Stack**: Hono + Cloudflare D1 + TypeScript + Tailwind CSS  
**Haladás**: 3/6 tréningnap implementálva (50%)
