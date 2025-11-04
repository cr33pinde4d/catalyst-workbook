-- Day 2 completed
INSERT INTO process_steps (process_id, day_id, step_id, completed, completed_at) 
SELECT 1, 2, id, 1, datetime('now', '-12 days') FROM training_steps WHERE day_id = 2;

-- Day 3 partially (2 completed, 6 not)
INSERT INTO process_steps (process_id, day_id, step_id, completed, completed_at) 
SELECT 1, 3, id, 
  CASE WHEN step_number <= 2 THEN 1 ELSE 0 END,
  CASE WHEN step_number <= 2 THEN datetime('now', '-9 days') ELSE NULL END
FROM training_steps WHERE day_id = 3;

-- Days 4-6 not started
INSERT INTO process_steps (process_id, day_id, step_id, completed, completed_at) 
SELECT 1, day_id, id, 0, NULL FROM training_steps WHERE day_id >= 4;

-- Sample responses Day 1
INSERT INTO process_responses (process_id, day_id, step_id, field_name, response_text) VALUES
(1, 1, 1, 'problem_1', 'Hálózati teljesítmény ingadozása csúcsidőben'),
(1, 1, 1, 'problem_2', 'Vevői panaszok növekedése áramszünetekkel'),
(1, 1, 1, 'problem_3', 'Reaktív karbantartás magas költségei'),
(1, 1, 2, 'selected_problem', 'Nincs valós idejű hálózati láthatóság'),
(1, 1, 3, 'analysis', 'IoT szenzorok hiánya miatt nincs valós idejű adatgyűjtés'),
(1, 1, 5, 'what', 'IoT monitoring rendszer bevezetése'),
(1, 1, 5, 'why', 'Proaktív karbantartás és költségcsökkentés'),
(1, 1, 5, 'who', 'IT csapat + Műszaki csapat + Külső partner'),
(1, 1, 5, 'when', 'Pilot: 3 hó, Teljes: 18 hó'),
(1, 1, 6, 'strengths', 'Tapasztalt csapat, Stabil pénzügyi helyzet'),
(1, 1, 6, 'weaknesses', 'Korlátozott IoT tapasztalat'),
(1, 1, 6, 'opportunities', '20-30% költségcsökkentés'),
(1, 1, 6, 'threats', 'Technológiai változások, Adatbiztonság');
