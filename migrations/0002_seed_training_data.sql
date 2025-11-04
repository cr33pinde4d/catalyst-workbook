-- Seed training days
INSERT OR IGNORE INTO training_days (id, title, subtitle, description, order_num) VALUES 
(1, '1. Nap', 'Vezetői tudatosság és problémamegoldás', 'Strukturált problémafeltárás és gyökérok-elemzés', 1),
(2, '2. Nap', 'Vezetői stílus és stratégiaalkotás', 'Jövőkép megfogalmazása és akciótervezés', 2),
(3, '3. Nap', 'Csapat kialakítása', 'Szerepek, felelősségek és kompetenciák', 3),
(4, '4. Nap', 'Teljesítménymenedzsment', 'KPI-ok, mérés és visszajelzési rendszerek', 4),
(5, '5. Nap', 'Csapatmenedzsment', 'Delegálás, motiváció és konfliktuskezelés', 5),
(6, '6. Nap', 'Fenntartás & adaptáció', 'Változás beépítése és folyamatos fejlődés', 6);

-- Seed training steps for Day 1
INSERT OR IGNORE INTO training_steps (day_id, step_number, title, description, tools, importance, limitations, instructions) VALUES 
(1, 1, 'Problémák, kihívások azonosítása', 
 'Összegyűjtsd azokat a problémákat és kihívásokat, amelyek a saját munkakörnyezetedben valóban jelen vannak, és amelyekre van ráhatásod.',
 '["Brainstorming", "Pulse check", "Megfigyelés", "Interjúk", "Adatok áttekintése"]',
 'A jól megválasztott probléma az egész feladat és a tanulási folyamat sikerének alapja.',
 'A túl nagy, túl általános vagy a saját befolyási körön kívül eső problémák kezelhetetlenek lesznek.',
 'Írd fel az 5 legégetőbb szervezeti/üzleti problémát. Ne gondolkozz sokat – írj gyorsan, intuitívan. Légy konkrét, fókuszálj olyan problémákra, amelyekre van ráhatásod.'),

(1, 2, 'Hatáselemzés',
 'Feltérképezd, milyen hatásai vannak a problémának a szervezet különböző területeire.',
 '["Cost-Benefit elemzés", "FMEA", "Erőtér-elemzés", "ROI"]',
 'Világossá teszi a probléma következményeit és így támogatja a tudatos döntéshozatalt.',
 'Az eredmények a feltételezések és adatok megbízhatóságától függenek.',
 'Válaszd ki a 3 legfontosabb problémát. Minden problémához válassz 1 eszközt. Töltsd ki az elemzési táblát.'),

(1, 3, 'Problémaelemzés',
 'A probléma részeire bontva, rendszerezve megértsük, mi alkotja a teljes képet.',
 '["Pareto-elemzés", "Affinitás-diagram", "Folyamatábra", "DILO/WILO"]',
 'A problémák gyakran sokféle apró tényezőből állnak össze. Ha nem strukturáljuk, könnyen rossz területre fordítjuk az erőforrást.',
 'Az elemzéshez sok és pontos adat kell, különben torz képet ad.',
 'Válaszd ki az elemzendő problémát. Válassz eszközt a táblázatból. Végezd el az elemzést.'),

(1, 4, 'Priorizálás',
 'Eldöntsd, a sok azonosított probléma közül melyik a legfontosabb és legsürgetőbb.',
 '["Hatás-Ráfordítás mátrix", "Döntési mátrix", "Pareto-elv", "Eisenhower-mátrix"]',
 'Nem minden problémát lehet egyszerre kezelni. Ha nincs fókusz, a szervezet szétforgácsolja erőforrásait.',
 'Szubjektív értékelés könnyen torzíthatja az eredményt.',
 'Értékelj minden problémát 1-5 skálán hatás és erőfeszítés alapján. Helyezd el őket a mátrixon.'),

(1, 5, 'Problémameghatározás',
 'Világosan, röviden és mindenki számára érthetően rögzítsd, pontosan miről van szó.',
 '["5W1H keretrendszer", "SMART logika", "Canvas módszer", "Probléma definíció sablon"]',
 'A rosszul definiált problémát nem lehet helyesen megoldani.',
 'Gyakori hiba, hogy a megfogalmazás már tartalmazza a megoldást.',
 'Válaszolj minden kérdésre konkrétan és részletesen az 5W1H keretrendszer szerint.'),

(1, 6, 'Kontextus leírása',
 'Feltárni a probléma hátterét, környezetét és kapcsolódó tényezőit.',
 '["SWOT-analízis", "PESTEL-elemzés", "Stakeholder-elemzés"]',
 'A problémák gyakran más tényezők következményei. Ha nem értjük a környezetet, a megoldás sem lesz tartós.',
 'Könnyen túl szélesre nyúlhat, ha minden tényezőt megpróbálunk vizsgálni.',
 'Helyezd kontextusba a problémát a szervezeti környezetben SWOT és stakeholder elemzéssel.'),

(1, 7, 'Adatok és tények gyűjtése',
 'Összegyűjteni minden releváns információt: mérőszámokat, statisztikákat, visszajelzéseket.',
 '["Adatgyűjtő lap", "Kérdőívek", "KPI mérések", "Dokumentumelemzés"]',
 'Az adatok nemcsak igazolják a probléma létezését, de baseline-ként szolgálnak a későbbi javulás méréséhez.',
 'Nem minden problémánál áll rendelkezésre elegendő adat.',
 'Határozd meg, milyen adatra van szükséged. Gyűjtsd össze és számszerűsítsd a jelenlegi állapotot.'),

(1, 8, 'Gyökérok-elemzés',
 'Biztosítani, hogy ne csak a felszínt kapargassuk, hanem a probléma gyökeréig leássunk.',
 '["5 Miért módszer", "Ishikawa diagram", "Pareto-elemzés"]',
 'Gyakran egy tüneti kezeléssel csak átmeneti javulást érünk el.',
 'Nehéz lehet a valódi gyökérokot elválasztani a másodlagos okoktól.',
 'Kérdezz rá sorozatban legalább ötször a "Miért?" kérdésre. Használd az Ishikawa diagramot.');

-- Seed training steps for Day 2
INSERT OR IGNORE INTO training_steps (day_id, step_number, title, description, tools, importance, limitations, instructions) VALUES 
(2, 1, 'Miért? – Start with Why',
 'Megtalálni és megfogalmazni a mélyebb célodat, azt a "Miért"-et, ami motivál.',
 '["Golden Circle", "Purpose Canvas", "5 Whys (Purpose verzió)"]',
 'Az emberek nem azt veszik meg, amit csinálsz, hanem azt, amiért csinálod.',
 'A "Miért" megtalálása nehéz – őszinte önreflexiót igényel.',
 'Töltsd ki a Golden Circle: Mit csinálsz? Hogyan csinálod? Miért csinálod?'),

(2, 2, 'Vízió megfogalmazása',
 'Egy világos, inspiráló képet alkotni arról, hogyan fog kinézni a jövő.',
 '["Jövőbeli én", "Vision Board", "SMART Vision"]',
 'A vízió ad irányt, motivációt és összefogja a csapatot egy közös cél köré.',
 'Túl általános vízió nem inspirál. Túl részletes vízió megkötöz.',
 'Fogalmazd meg a víziódat: Mi a sikeres jövőállapot? Milyen hatásai vannak?'),

(2, 3, 'Stratégiai célok meghatározása',
 'A víziódat lebontani konkrét, mérhető célokra.',
 '["SMART célok", "OKR", "Balanced Scorecard"]',
 'A vízió nélkül célok = csak számmászás. Célok nélküli vízió = álmodozás.',
 'Túl sok cél = elveszett fókusz.',
 'Határozz meg 3-5 SMART célt: Specific, Measurable, Achievable, Relevant, Time-bound.'),

(2, 4, 'Vezetői stílus azonosítása',
 'Megérteni, milyen vezetői stílussal dolgozol természetesen.',
 '["Goleman 6 vezetői stílusa", "Situational Leadership", "Leadership Compass"]',
 'Nincs "legjobb" vezetői stílus – minden helyzethez más kell.',
 'A stílus-váltás nehéz és gyakorlást igényel.',
 'Értékeld magad az 6 vezetői stílus szerint 1-10 skálán. Mikor melyiket alkalmazod?'),

(2, 5, 'Akcióterv kidolgozása',
 'A stratégiai célokat lebontani konkrét, végrehajtható lépésekre.',
 '["Action Plan Template", "Gantt Chart", "RACI Matrix"]',
 'A stratégia nélkül a végrehajtás értelmetlen. A végrehajtás nélkül a stratégia haszontalan.',
 'Túl részletes terv merevvé válik.',
 'Készíts akciótervet: akció, felelős, határidő, erőforrás, KPI, státusz.'),

(2, 6, 'Döntéshozatali folyamat',
 'Kialakítani egy strukturált módszert a döntésekhez.',
 '["Döntési mátrix", "Pros & Cons", "Decision Tree"]',
 'A jó vezetők következetesen és strukturáltan döntenek.',
 'Minden döntési keretnek vannak korlátai.',
 'Definiáld a döntési folyamatodat: Mi alapján döntesz? Ki kell bevonni?'),

(2, 7, 'Kommunikációs terv',
 'Hogyan fogod kommunikálni a változást és stratégiát?',
 '["Stakeholder Map", "Kommunikációs mátrix", "Elevator Pitch"]',
 'A legjobb stratégia is kudarcot vall, ha nem kommunikálod megfelelően.',
 'A kommunikáció egyirányú lehet, ha nem figyelsz a visszajelzésekre.',
 'Készíts kommunikációs tervet: Ki? Mit? Mikor? Hogyan?'),

(2, 8, 'Kockázatelemzés és tervezés',
 'Azonosítsd a potenciális kockázatokat és készülj fel rájuk.',
 '["SWOT", "Risk Matrix", "Contingency Planning"]',
 'A felkészültség csökkenti a meglepetések hatását.',
 'Nem lehet minden kockázatra felkészülni.',
 'Végezz kockázatelemzést: Mi mehet rosszul? Milyen valószínű? Milyen hatása van?');

-- Additional days will be added similarly (Day 3-6)
-- For now, adding placeholder structure for Days 3-6

INSERT OR IGNORE INTO training_steps (day_id, step_number, title, description, tools, importance, limitations, instructions) VALUES 
(3, 1, 'Csapatszerepek azonosítása', 'Határozd meg, milyen szerepekre van szükség a csapatban.', '["Belbin szerepek", "RACI mátrix", "Kompetencia mátrix"]', 'A tiszta szerepek csökkentik az átfedéseket és konfliktusokat.', 'A szerepek idővel változhatnak.', 'Térképezd fel a szükséges szerepeket és kompetenciákat.'),
(3, 2, 'Kompetencia felmérés', 'Mérjed fel a csapat jelenlegi kompetenciáit.', '["Skills Matrix", "360° értékelés", "Kompetencia gap elemzés"]', 'A reális helyzet ismerete a fejlesztés alapja.', 'Az önértékelés torzíthat.', 'Végezz kompetencia felmérést és azonosítsd a hiányokat.'),

(4, 1, 'KPI rendszer kialakítása', 'Határozd meg a teljesítmény mérésének mutatóit.', '["Balanced Scorecard", "OKR", "KPI piramis"]', 'Amit mérünk, azt tudjuk fejleszteni.', 'Nem minden fontos dolog mérhető könnyen.', 'Válaszd ki a 3-5 legfontosabb KPI-t.'),
(4, 2, 'Teljesítmény monitoring', 'Hozz létre folyamatos nyomon követési rendszert.', '["Dashboard", "Weekly review", "Data visualization"]', 'A folyamatos mérés lehetővé teszi a gyors korrekciót.', 'A túl sok adat béníthat.', 'Készíts monitoring tervet és dashboardot.'),

(5, 1, 'Delegálás mestere', 'Tanuld meg a hatékony delegálás művészetét.', '["Delegálási mátrix", "Eisenhower módszer", "SMART delegálás"]', 'A delegálás fejleszti a csapatot és felszabadít téged.', 'Rossz delegálás demotiváló.', 'Gyakorold a delegálást: Mit? Kinek? Mikor? Hogyan?'),
(5, 2, 'Motivációs stratégiák', 'Ismerd meg, mi motiválja a csapattagjaidat.', '["Herzberg elmélet", "Személyre szabott motiváció", "Elismerési rendszer"]', 'A motivált csapat hatékonyabb és elkötelezettebb.', 'Ami az egyiket motiválja, az másikat nem.', 'Térképezd fel az egyéni motivációs tényezőket.'),

(6, 1, 'Változás beépítése', 'Hogyan válik a változás a mindennapok részévé?', '["Change Management", "Habit formation", "Reinforcement"]', 'A fenntartás nélkül a változás elhal.', 'A visszacsúszás természetes, kezelni kell.', 'Készíts fenntartási tervet: rutinok, mérések, visszajelzések.'),
(6, 2, 'Folyamatos fejlődés kultúrája', 'Hozz létre tanulószervezetet.', '["Kaizen", "Learning loops", "Retrospektívák"]', 'A folyamatos fejlődés versenyelőnyt teremt.', 'Kultúraváltás lassú folyamat.', 'Építsd be a folyamatos tanulás rutinját.');
