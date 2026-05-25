-- Seed script: Batch 1 (May 18 Week), Batch 2 (May 25 Week) & Batch 3 (June 1 Week)
-- Run this in your Supabase SQL Editor

-- 1. Modify table to add meal_type column
ALTER TABLE weekly_plan_meals 
ADD COLUMN IF NOT EXISTS meal_type TEXT CHECK (meal_type IN ('Breakfast', 'Lunch', 'Dinner'));

-- 2. Clear old meals as they do not have meal_type and need full re-seeding
DELETE FROM weekly_plan_meals;

-- 3. Seed/Ensure Published Weekly Plans for May 18 (Batch 1), May 25 (Batch 2), and June 1 (Batch 3)
INSERT INTO published_weekly_plans (id, name, category, description, weekly_price, is_published, week_start_date)
VALUES 
  -- Batch 1: Previous week (May 18 - 24)
  (md5('plan-cut-prev')::uuid,  'Cut — May 18',  'Cutting', 'Lean Filipino recipes designed for a calorie deficit while keeping protein high.', 3999, true, '2026-05-18'),
  (md5('plan-bulk-prev')::uuid, 'Bulk — May 18', 'Bulking', 'High-calorie Filipino-inspired meals engineered for muscle gain.', 4999, true, '2026-05-18'),
  (md5('plan-maint-prev')::uuid, 'Maintenance — May 18', 'Maintenance', 'Balanced Filipino meals designed to maintain weight and support active lifestyles.', 4499, true, '2026-05-18'),
  
  -- Batch 2: Current week (May 25 - 31)
  (md5('plan-cut-curr')::uuid,  'Cut — May 25',  'Cutting', 'Lean Filipino recipes designed for a calorie deficit while keeping protein high.', 3999, true, '2026-05-25'),
  (md5('plan-bulk-curr')::uuid, 'Bulk — May 25', 'Bulking', 'High-calorie Filipino-inspired meals engineered for muscle gain.', 4999, true, '2026-05-25'),
  (md5('plan-maint-curr')::uuid, 'Maintenance — May 25', 'Maintenance', 'Balanced Filipino meals designed to maintain weight and support active lifestyles.', 4499, true, '2026-05-25'),
  
  -- Batch 3: Future week (June 1 - 7)
  (md5('plan-cut-next')::uuid,  'Pinoy Cutting Week',  'Cutting', 'Classic Filipino meals made lean, high-protein, and calorie-conscious.', 3999, true, '2026-06-01'),
  (md5('plan-bulk-next')::uuid, 'Pinoy Bulking Week', 'Bulking', 'High-calorie, nutrient-dense Filipino-inspired meals engineered for clean bulking.', 4999, true, '2026-06-01'),
  (md5('plan-maint-next')::uuid, 'Pinoy Maintenance Week', 'Maintenance', 'Balanced Filipino favorites portioned to keep you healthy, fit, and energized.', 4499, true, '2026-06-01')
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- BATCH 1: PREVIOUS WEEK (May 18 - 24)
-- ============================================================================

-- 4. Seed meals for CUTTING plan — May 18 (plan-cut-prev)
INSERT INTO weekly_plan_meals (id, plan_id, day_of_week, meal_type, meal_name, description, calories, protein_g, carbs_g, fats_g)
VALUES
  -- MONDAY
  (md5('cp-mon-bf')::uuid, md5('plan-cut-prev')::uuid, 'Monday', 'Breakfast', 'Garlic Mushrooms with Scrambled Egg Whites', 'Pan-seared button mushrooms tossed with fluffy scrambled egg whites and chopped chives.', 280, 22, 8, 14),
  (md5('cp-mon-lu')::uuid, md5('plan-cut-prev')::uuid, 'Monday', 'Lunch', 'Nilagang Manok Light Bowl', 'Ginger chicken breast soup with cabbage and green beans in a clear lean broth.', 370, 36, 18, 10),
  (md5('cp-mon-di')::uuid, md5('plan-cut-prev')::uuid, 'Monday', 'Dinner', 'Grilled Galunggong with Tomato Ensalada', 'Charcoal-grilled local round scad served with salted-egg-free tomato and onion salad.', 400, 38, 15, 14),
  
  -- TUESDAY
  (md5('cp-tue-bf')::uuid, md5('plan-cut-prev')::uuid, 'Tuesday', 'Breakfast', 'Sautéed Cabbage with Tofu Scramble', 'Shredded cabbage and carrots stir-fried with protein-packed crumbled firm tofu.', 270, 20, 15, 10),
  (md5('cp-tue-lu')::uuid, md5('plan-cut-prev')::uuid, 'Tuesday', 'Lunch', 'Sinigang na Hipon Bowl', 'Sour tamarind soup with fresh local shrimp, water spinach, radish, and okra.', 350, 32, 20, 9),
  (md5('cp-tue-di')::uuid, md5('plan-cut-prev')::uuid, 'Tuesday', 'Dinner', 'Steamed Fish in Tausi Sauce', 'Steamed white fish fillet bathed in savory salted black bean sauce and scallions.', 420, 40, 18, 12),
  
  -- WEDNESDAY
  (md5('cp-wed-bf')::uuid, md5('plan-cut-prev')::uuid, 'Wednesday', 'Breakfast', 'Chicken Arroz Caldo Light', 'Light ginger rice porridge simmered with shredded lean chicken breast and toasted garlic.', 360, 25, 40, 6),
  (md5('cp-wed-lu')::uuid, md5('plan-cut-prev')::uuid, 'Wednesday', 'Lunch', 'Chicken Afritada (No Potato)', 'Lean chicken pieces simmered in fresh tomato sauce, red bell peppers, and peas.', 460, 42, 22, 15),
  (md5('cp-wed-di')::uuid, md5('plan-cut-prev')::uuid, 'Wednesday', 'Dinner', 'Ginisang Pechay with Shrimp', 'Local bok choy quickly sautéed with garlic and juicy prawns in a light seasoning.', 290, 24, 12, 14),
  
  -- THURSDAY
  (md5('cp-thu-bf')::uuid, md5('plan-cut-prev')::uuid, 'Thursday', 'Breakfast', 'Egg White Omelette with Tomatoes', 'Low-calorie egg white omelette stuffed with diced tomatoes and native red onions.', 250, 18, 10, 12),
  (md5('cp-thu-lu')::uuid, md5('plan-cut-prev')::uuid, 'Thursday', 'Lunch', 'Ginisang Upo with Ground Turkey', 'Sautéed bottle gourd with lean ground turkey strips cooked with minimal oil.', 380, 32, 24, 12),
  (md5('cp-thu-di')::uuid, md5('plan-cut-prev')::uuid, 'Thursday', 'Dinner', 'Grilled Pusit with Tomato Salsa', 'Tender grilled local squid stuffed with ginger, tomatoes, onions, and calamansi dressing.', 390, 38, 14, 14),
  
  -- FRIDAY
  (md5('cp-fri-bf')::uuid, md5('plan-cut-prev')::uuid, 'Friday', 'Breakfast', 'Steamed Tofu with Soy Vinegar', 'Silken tofu blocks steamed and served with a dipping sauce of soy, vinegar, and onions.', 240, 20, 12, 8),
  (md5('cp-fri-lu')::uuid, md5('plan-cut-prev')::uuid, 'Friday', 'Lunch', 'Binagoongang Baboy (Lean Cut)', 'Lean pork loin chunks flavored with a minimal touch of local shrimp paste and eggplant.', 480, 38, 40, 18),
  (md5('cp-fri-di')::uuid, md5('plan-cut-prev')::uuid, 'Friday', 'Dinner', 'Tokwa Adobo with Cauliflower Rice', 'Pan-fried tofu cubes simmered in adobo sauce, served over a bed of riced cauliflower.', 320, 24, 20, 10),
  
  -- SATURDAY
  (md5('cp-sat-bf')::uuid, md5('plan-cut-prev')::uuid, 'Saturday', 'Breakfast', 'Skinless Chicken Longganisa with Egg', 'Two skinless chicken longganisa links served with one poached egg and cucumber slices.', 320, 26, 10, 16),
  (md5('cp-sat-lu')::uuid, md5('plan-cut-prev')::uuid, 'Saturday', 'Lunch', 'Baked Tilapia Fillet', 'Baked tilapia fillet seasoned with garlic powder, lemon juice, and ground pepper.', 380, 38, 12, 12),
  (md5('cp-sat-di')::uuid, md5('plan-cut-prev')::uuid, 'Saturday', 'Dinner', 'Grilled Chicken Breast with Mango Salsa', 'Lean chicken breast grilled with herbs and topped with a fresh green mango salsa.', 410, 44, 18, 10),
  
  -- SUNDAY
  (md5('cp-sun-bf')::uuid, md5('plan-cut-prev')::uuid, 'Sunday', 'Breakfast', 'Scrambled Egg with Tinapa & Spinach', 'Two eggs scrambled with flaked smoked fish and local spinach leaves.', 310, 24, 8, 18),
  (md5('cp-sun-lu')::uuid, md5('plan-cut-prev')::uuid, 'Sunday', 'Lunch', 'Beef Nilaga Lean Bowl', 'Lean beef sirloin boiled with cabbage, potatoes, and green beans in clear broth.', 400, 42, 20, 12),
  (md5('cp-sun-di')::uuid, md5('plan-cut-prev')::uuid, 'Sunday', 'Dinner', 'Grilled Bangus Belly', 'Marinated boneless milkfish belly grilled, served with native vinegar dip.', 390, 38, 10, 18)
ON CONFLICT (id) DO NOTHING;

-- 5. Seed meals for BULKING plan — May 18 (plan-bulk-prev)
INSERT INTO weekly_plan_meals (id, plan_id, day_of_week, meal_type, meal_name, description, calories, protein_g, carbs_g, fats_g)
VALUES
  -- MONDAY
  (md5('bp-mon-bf')::uuid, md5('plan-bulk-prev')::uuid, 'Monday', 'Breakfast', 'Loaded Beef Tapsilog', 'Tender cured beef strips with two fried eggs and garlic sinangag rice.', 780, 48, 80, 26),
  (md5('bp-mon-lu')::uuid, md5('plan-bulk-prev')::uuid, 'Monday', 'Lunch', 'Pork Menudo on White Rice', 'Traditional pork menudo rich in tomato sauce, liver, potatoes, carrots, and white rice.', 850, 50, 90, 28),
  (md5('bp-mon-di')::uuid, md5('plan-bulk-prev')::uuid, 'Monday', 'Dinner', 'Dinuguan with Puto', 'Savory Filipino pork blood stew served with soft sweet steamed rice cakes.', 800, 45, 85, 30),
  
  -- TUESDAY
  (md5('bp-tue-bf')::uuid, md5('plan-bulk-prev')::uuid, 'Tuesday', 'Breakfast', 'Bulking Longsilog', 'Garlic pork longganisa served with fried eggs, garlic rice, and native vinegar.', 860, 38, 90, 35),
  (md5('bp-tue-lu')::uuid, md5('plan-bulk-prev')::uuid, 'Tuesday', 'Lunch', 'Beef Mechado with White Rice', 'Hearty beef stew slow-cooked in tomato sauce and soy sauce with white rice.', 820, 52, 88, 24),
  (md5('bp-tue-di')::uuid, md5('plan-bulk-prev')::uuid, 'Tuesday', 'Dinner', 'Sisig with Garlic Rice & Egg', 'Crispy pork sisig served sizzled with a raw egg to mix in and garlic rice.', 900, 48, 90, 35),
  
  -- WEDNESDAY
  (md5('bp-wed-bf')::uuid, md5('plan-bulk-prev')::uuid, 'Wednesday', 'Breakfast', 'Loaded Tocilog', 'Sweet cured pork tocino paired with two fried eggs and sinangag garlic rice.', 820, 36, 95, 28),
  (md5('bp-wed-lu')::uuid, md5('plan-bulk-prev')::uuid, 'Wednesday', 'Lunch', 'Pork Humba on White Rice', 'Sweet and savory braised pork belly with black beans, banana blossoms, and white rice.', 870, 50, 92, 28),
  (md5('bp-wed-di')::uuid, md5('plan-bulk-prev')::uuid, 'Wednesday', 'Dinner', 'Chicken Pastel on White Rice', 'Creamy chicken stew baked with carrots, potatoes, sausage, and steamed white rice.', 830, 48, 88, 26),
  
  -- THURSDAY
  (md5('bp-thu-bf')::uuid, md5('plan-bulk-prev')::uuid, 'Thursday', 'Breakfast', 'Hearty Goto with Chicharron', 'Comforting ginger beef tripe congee topped with crispy pork rind and boiled egg.', 750, 38, 85, 25),
  (md5('bp-thu-lu')::uuid, md5('plan-bulk-prev')::uuid, 'Thursday', 'Lunch', 'Pork Adobo Flakes with Java Rice', 'Shredded crispy pork adobo served over savory java rice and sliced tomatoes.', 860, 48, 92, 30),
  (md5('bp-thu-di')::uuid, md5('plan-bulk-prev')::uuid, 'Thursday', 'Dinner', 'Beef Caldereta with Garlic Rice', 'Spicy beef stew cooked with cheese and liver spread, served with garlic rice.', 880, 54, 95, 28),
  
  -- FRIDAY
  (md5('bp-fri-bf')::uuid, md5('plan-bulk-prev')::uuid, 'Friday', 'Breakfast', 'Loaded Spamsilog', 'Three thick-cut spam slices grilled, served with two fried eggs and garlic sinangag.', 890, 32, 85, 45),
  (md5('bp-fri-lu')::uuid, md5('plan-bulk-prev')::uuid, 'Friday', 'Lunch', 'Pancit Palabok with Chicharon', 'Thick rice noodles in shrimp sauce topped with pork rinds, boiled eggs, and tinapa flakes.', 850, 45, 98, 25),
  (md5('bp-fri-di')::uuid, md5('plan-bulk-prev')::uuid, 'Friday', 'Dinner', 'Chicken Curry with Extra Potatoes & Rice', 'Rich chicken curry in coconut milk and curry powder with thick-cut potatoes and rice.', 800, 50, 85, 24),
  
  -- SATURDAY
  (md5('bp-sat-bf')::uuid, md5('plan-bulk-prev')::uuid, 'Saturday', 'Breakfast', 'Corned Beef Hash with Fried Potatoes', 'Sautéed corned beef with fried potatoes, garlic rice, and fried egg.', 780, 32, 80, 34),
  (md5('bp-sat-lu')::uuid, md5('plan-bulk-prev')::uuid, 'Saturday', 'Lunch', 'Crispy Pata with Java Rice', 'Deep-fried crispy pork leg chunks served with sweet-salty java rice.', 920, 52, 90, 38),
  (md5('bp-sat-di')::uuid, md5('plan-bulk-prev')::uuid, 'Saturday', 'Dinner', 'Lechon Kawali with White Rice', 'Crispy pork belly chunks served with lechon sauce and steaming white rice.', 890, 48, 95, 32),
  
  -- SUNDAY
  (md5('bp-sun-bf')::uuid, md5('plan-bulk-prev')::uuid, 'Sunday', 'Breakfast', 'Bangsilog Supreme', 'Crispy fried milkfish served with two fried eggs, garlic rice, and tomatoes.', 810, 44, 85, 28),
  (md5('bp-sun-lu')::uuid, md5('plan-bulk-prev')::uuid, 'Sunday', 'Lunch', 'Pork Adobo with Eggs & Rice', 'Classic pork adobo simmered until tender with boiled eggs, served on white rice.', 860, 50, 90, 28),
  (md5('bp-sun-di')::uuid, md5('plan-bulk-prev')::uuid, 'Sunday', 'Dinner', 'Beef Kare-Kare with Rice', 'Beef chunks and vegetables in peanut sauce, served with shrimp paste and rice.', 870, 52, 85, 30)
ON CONFLICT (id) DO NOTHING;

-- 6. Seed meals for MAINTENANCE plan — May 18 (plan-maint-prev)
INSERT INTO weekly_plan_meals (id, plan_id, day_of_week, meal_type, meal_name, description, calories, protein_g, carbs_g, fats_g)
VALUES
  -- MONDAY
  (md5('mp-mon-bf')::uuid, md5('plan-maint-prev')::uuid, 'Monday', 'Breakfast', 'Simple Tapsilog', 'Lean beef tapa with one fried egg and garlic brown rice.', 510, 32, 55, 14),
  (md5('mp-mon-lu')::uuid, md5('plan-maint-prev')::uuid, 'Monday', 'Lunch', 'Chicken Tinola with Chayote', 'Comforting chicken ginger soup with chayote, spinach, and jasmine rice.', 540, 38, 58, 15),
  (md5('mp-mon-di')::uuid, md5('plan-maint-prev')::uuid, 'Monday', 'Dinner', 'Pork Sinigang with Rice', 'Lean pork loin simmered in sour broth with local vegetables, with brown rice.', 580, 40, 60, 16),
  
  -- TUESDAY
  (md5('mp-tue-bf')::uuid, md5('plan-maint-prev')::uuid, 'Tuesday', 'Breakfast', 'Simple Longsilog', 'Skinless chicken longganisa with one boiled egg and garlic brown rice.', 490, 28, 50, 14),
  (md5('mp-tue-lu')::uuid, md5('plan-maint-prev')::uuid, 'Tuesday', 'Lunch', 'Beef Caldereta with Rice', 'Lean beef simmered in tomato sauce with potatoes, carrots, and white rice.', 610, 42, 65, 18),
  (md5('mp-tue-di')::uuid, md5('plan-maint-prev')::uuid, 'Tuesday', 'Dinner', 'Steamed Lapu-Lapu with Ginger & Rice', 'Steamed white fish fillet with ginger, soy sauce, and jasmine rice.', 520, 40, 50, 12),
  
  -- WEDNESDAY
  (md5('mp-wed-bf')::uuid, md5('plan-maint-prev')::uuid, 'Wednesday', 'Breakfast', 'Simple Tocilog', 'Skinless cured chicken tocino served with one egg and garlic brown rice.', 500, 30, 52, 12),
  (md5('mp-wed-lu')::uuid, md5('plan-maint-prev')::uuid, 'Wednesday', 'Lunch', 'Chicken Afritada with Rice', 'Chicken breast simmered in tomato sauce with potatoes, bell peppers, and rice.', 560, 36, 62, 14),
  (md5('mp-wed-di')::uuid, md5('plan-maint-prev')::uuid, 'Wednesday', 'Dinner', 'Grilled Pork Belly (Lean Cut)', 'Lean pork loin grilled, served with side salad and brown rice.', 590, 38, 50, 20),
  
  -- THURSDAY
  (md5('mp-thu-bf')::uuid, md5('plan-maint-prev')::uuid, 'Thursday', 'Breakfast', 'Sautéed Corned Beef with Brown Rice', 'Sautéed canned lean corned beef with onions, served with garlic brown rice.', 470, 24, 50, 15),
  (md5('mp-thu-lu')::uuid, md5('plan-maint-prev')::uuid, 'Thursday', 'Lunch', 'Ginisang Monggo with Malunggay & Rice', 'Nutritious mung bean soup cooked with shrimp, malunggay, and jasmine rice.', 530, 26, 65, 14),
  (md5('mp-thu-di')::uuid, md5('plan-maint-prev')::uuid, 'Thursday', 'Dinner', 'Chicken Pastel with Brown Rice', 'Creamy chicken pastel simmered with carrots and mushrooms, served with brown rice.', 580, 38, 60, 16),
  
  -- FRIDAY
  (md5('mp-fri-bf')::uuid, md5('plan-maint-prev')::uuid, 'Friday', 'Breakfast', 'Tortang Talong with Pandesal', 'Traditional eggplant omelette made with whole eggs, served with wheat pandesal.', 440, 18, 45, 15),
  (md5('mp-fri-lu')::uuid, md5('plan-maint-prev')::uuid, 'Friday', 'Lunch', 'Pancit Bihon with Chicken', 'Thin rice noodles stir-fried with shredded chicken breast and vegetables.', 510, 30, 68, 12),
  (md5('mp-fri-di')::uuid, md5('plan-maint-prev')::uuid, 'Friday', 'Dinner', 'Bistek Tagalog with Steamed Rice', 'Lean beef slices simmered in soy sauce and onion rings, served with white rice.', 570, 40, 58, 15),
  
  -- SATURDAY
  (md5('mp-sat-bf')::uuid, md5('plan-maint-prev')::uuid, 'Saturday', 'Breakfast', 'Scrambled Eggs with Brown Rice', 'Two eggs scrambled with tomatoes and onions, served with garlic brown rice.', 460, 22, 52, 15),
  (md5('mp-sat-lu')::uuid, md5('plan-maint-prev')::uuid, 'Saturday', 'Lunch', 'Daing na Bangus with Rice', 'Marinated milkfish baked and served with vinegar dipping sauce and rice.', 550, 38, 55, 15),
  (md5('mp-sat-di')::uuid, md5('plan-maint-prev')::uuid, 'Saturday', 'Dinner', 'Chicken Curry with Brown Rice', 'Mild chicken curry in coconut milk with carrots, potatoes, and brown rice.', 580, 36, 58, 18),
  
  -- SUNDAY
  (md5('mp-sun-bf')::uuid, md5('plan-maint-prev')::uuid, 'Sunday', 'Breakfast', 'Champorado with Evaporated Milk', 'Chocolate rice porridge served warm with a splash of milk and dry fish (tuyo).', 480, 18, 75, 10),
  (md5('mp-sun-lu')::uuid, md5('plan-maint-prev')::uuid, 'Sunday', 'Lunch', 'Beef Mechado with Steamed Rice', 'Hearty beef mechado slow-cooked in rich tomato gravy, served with white rice.', 600, 42, 60, 16),
  (md5('mp-sun-di')::uuid, md5('plan-maint-prev')::uuid, 'Sunday', 'Dinner', 'Sinigang na Hipon with Rice', 'Shrimp sinigang soup cooked with tamarind broth, water spinach, and white rice.', 510, 34, 58, 10)
ON CONFLICT (id) DO NOTHING;


-- ============================================================================
-- BATCH 2: CURRENT WEEK (May 25 - 31)
-- ============================================================================

-- 7. Seed meals for CUTTING plan — May 25 (plan-cut-curr)
INSERT INTO weekly_plan_meals (id, plan_id, day_of_week, meal_type, meal_name, description, calories, protein_g, carbs_g, fats_g)
VALUES
  -- MONDAY
  (md5('cc-mon-bf')::uuid, md5('plan-cut-curr')::uuid, 'Monday', 'Breakfast', 'Chicken Tapa Egg Scramble', 'Lean chicken breast tapa flakes scrambled with egg whites and spinach.', 320, 30, 10, 16),
  (md5('cc-mon-lu')::uuid, md5('plan-cut-curr')::uuid, 'Monday', 'Lunch', 'Grilled Tilapia with Pinakbet', 'Perfectly grilled tilapia fillet served with steamed local vegetables in a light broth.', 420, 40, 30, 12),
  (md5('cc-mon-di')::uuid, md5('plan-cut-curr')::uuid, 'Monday', 'Dinner', 'Chicken Tinola Bowl', 'Ginger-infused chicken soup with papaya and fresh malunggay leaves, served hot.', 380, 38, 18, 9),
  
  -- TUESDAY
  (md5('cc-tue-bf')::uuid, md5('plan-cut-curr')::uuid, 'Tuesday', 'Breakfast', 'Skinless Chicken Longganisa with Egg', 'High-protein skinless chicken longganisa with one sunny-side-up egg.', 340, 28, 12, 18),
  (md5('cc-tue-lu')::uuid, md5('plan-cut-curr')::uuid, 'Tuesday', 'Lunch', 'Chicken Adobo on Cauliflower Rice', 'Sautéed lean chicken breast simmered in soy-vinegar sauce over cauliflower rice.', 450, 42, 20, 16),
  (md5('cc-tue-di')::uuid, md5('plan-cut-curr')::uuid, 'Tuesday', 'Dinner', 'Ensaladang Talong with Tinapa Flakes', 'Roasted eggplant salad topped with smoky tinapa flakes and cherry tomatoes.', 290, 18, 15, 13),
  
  -- WEDNESDAY
  (md5('cc-wed-bf')::uuid, md5('plan-cut-curr')::uuid, 'Wednesday', 'Breakfast', 'Garlic Tofu Scramble with Spinach', 'Crumbled firm tofu sautéed with minced garlic, tomatoes, and baby spinach.', 280, 22, 14, 12),
  (md5('cc-wed-lu')::uuid, md5('plan-cut-curr')::uuid, 'Wednesday', 'Lunch', 'Steamed Lapu-Lapu with Ginger', 'Delicate steamed fish fillet flavored with fresh ginger, green onions, and light soy.', 410, 45, 10, 12),
  (md5('cc-wed-di')::uuid, md5('plan-cut-curr')::uuid, 'Wednesday', 'Dinner', 'Monggo Soup with Malunggay', 'Hearty mung bean stew cooked with lean pork strips and vitamin-rich malunggay leaves.', 340, 22, 38, 7),
  
  -- THURSDAY
  (md5('cc-thu-bf')::uuid, md5('plan-cut-curr')::uuid, 'Thursday', 'Breakfast', 'Egg White Tortang Talong', 'Roasted eggplant omelette prepared using egg whites for a low-fat, high-protein start.', 260, 20, 12, 10),
  (md5('cc-thu-lu')::uuid, md5('plan-cut-curr')::uuid, 'Thursday', 'Lunch', 'Chicken Tinola with Brown Rice', 'Comforting chicken ginger soup paired with a small portion of healthy brown rice.', 440, 38, 40, 10),
  (md5('cc-thu-di')::uuid, md5('plan-cut-curr')::uuid, 'Thursday', 'Dinner', 'Grilled Pork Belly (Lean Cut)', 'Trimmed lean pork loin grilled to perfection and served with side vinaigrette.', 480, 40, 10, 25),
  
  -- FRIDAY
  (md5('cc-fri-bf')::uuid, md5('plan-cut-curr')::uuid, 'Friday', 'Breakfast', 'Bangus Sardines in Olive Oil', 'Tender boneless milkfish slow-cooked in olive oil with carrots and olives.', 310, 24, 8, 18),
  (md5('cc-fri-lu')::uuid, md5('plan-cut-curr')::uuid, 'Friday', 'Lunch', 'Sinampalukang Manok', 'Sour soup made with tender chicken thighs, young tamarind leaves, and ginger.', 390, 36, 20, 12),
  (md5('cc-fri-di')::uuid, md5('plan-cut-curr')::uuid, 'Friday', 'Dinner', 'Grilled Bangus with Atchara', 'Boneless marinated milkfish grilled and served with a side of pickled green papaya.', 430, 42, 15, 16),
  
  -- SATURDAY
  (md5('cc-sat-bf')::uuid, md5('plan-cut-curr')::uuid, 'Saturday', 'Breakfast', 'Chicken Breast Tocino (Lean)', 'Homemade skinless chicken breast tocino cured with organic sweetener.', 330, 32, 15, 12),
  (md5('cc-sat-lu')::uuid, md5('plan-cut-curr')::uuid, 'Saturday', 'Lunch', 'Tokwa''t Kamatis Salad', 'Crispy baked tofu tossed with freshly diced tomatoes, onions, and light soy dressing.', 310, 22, 20, 14),
  (md5('cc-sat-di')::uuid, md5('plan-cut-curr')::uuid, 'Saturday', 'Dinner', 'Kangkong with Garlic and Tokwa', 'Water spinach stir-fried with fragrant garlic and cubes of firm tofu.', 280, 20, 18, 10),
  
  -- SUNDAY
  (md5('cc-sun-bf')::uuid, md5('plan-cut-curr')::uuid, 'Sunday', 'Breakfast', 'Salmon Tinapa with Scrambled Egg', 'Flaked salmon tinapa served alongside a light scrambled egg.', 350, 32, 8, 20),
  (md5('cc-sun-lu')::uuid, md5('plan-cut-curr')::uuid, 'Sunday', 'Lunch', 'Beef Giniling Lite with Cauli Rice', 'Lean minced beef cooked with carrots, green peas, and served with cauliflower rice.', 390, 35, 16, 15),
  (md5('cc-sun-di')::uuid, md5('plan-cut-curr')::uuid, 'Sunday', 'Dinner', 'Sinigang na Bangus (Soup)', 'Sour milkfish belly soup with native radish, okra, and eggplant.', 360, 35, 22, 10)
ON CONFLICT (id) DO NOTHING;

-- 8. Seed meals for BULKING plan — May 25 (plan-bulk-curr)
INSERT INTO weekly_plan_meals (id, plan_id, day_of_week, meal_type, meal_name, description, calories, protein_g, carbs_g, fats_g)
VALUES
  -- MONDAY
  (md5('bc-mon-bf')::uuid, md5('plan-bulk-curr')::uuid, 'Monday', 'Breakfast', 'Bulking Tapsilog', 'Premium beef tapa with two fried eggs and garlic white rice.', 750, 45, 75, 25),
  (md5('bc-mon-lu')::uuid, md5('plan-bulk-curr')::uuid, 'Monday', 'Lunch', 'Beef Caldereta on White Rice', 'Hearty beef stew cooked in rich tomato sauce with potatoes, carrots, and white rice.', 820, 55, 90, 24),
  (md5('bc-mon-di')::uuid, md5('plan-bulk-curr')::uuid, 'Monday', 'Dinner', 'Chicken Inasal with Garlic Rice', 'Charcoal-grilled chicken leg quarter basted in annatto oil, served with garlic rice.', 780, 60, 85, 20),
  
  -- TUESDAY
  (md5('bc-tue-bf')::uuid, md5('plan-bulk-curr')::uuid, 'Tuesday', 'Breakfast', 'Bulking Longsilog', 'Garlic pork longganisa paired with two fried eggs and a double portion of garlic rice.', 880, 40, 85, 38),
  (md5('bc-tue-lu')::uuid, md5('plan-bulk-curr')::uuid, 'Tuesday', 'Lunch', 'Pork Sinigang with Rice', 'Savory pork belly in tamarind broth with vegetables, served with hot white rice.', 850, 50, 95, 22),
  (md5('bc-tue-di')::uuid, md5('plan-bulk-curr')::uuid, 'Tuesday', 'Dinner', 'Longganisa with Fried Egg & Rice', 'Sweet longganisa served with fried eggs and steaming garlic white rice.', 900, 45, 100, 30),
  
  -- WEDNESDAY
  (md5('bc-wed-bf')::uuid, md5('plan-bulk-curr')::uuid, 'Wednesday', 'Breakfast', 'Bulking Tocilog', 'Cured pork tocino served with two fried eggs and garlic rice.', 810, 38, 95, 28),
  (md5('bc-wed-lu')::uuid, md5('plan-bulk-curr')::uuid, 'Wednesday', 'Lunch', 'Kare-Kare with Bagoong & Rice', 'Tender beef tripe and oxtail in peanut sauce with vegetables, bagoong, and white rice.', 870, 52, 88, 28),
  (md5('bc-wed-di')::uuid, md5('plan-bulk-curr')::uuid, 'Wednesday', 'Dinner', 'Tapsilog (Beef Tapa + Sinangag)', 'Cured beef strips served with a generous serving of garlic rice and fried eggs.', 830, 48, 92, 26),
  
  -- THURSDAY
  (md5('bc-thu-bf')::uuid, md5('plan-bulk-curr')::uuid, 'Thursday', 'Breakfast', 'Corned Beef Sinangag', 'Sautéed corned beef with potatoes, garlic white rice, and two fried eggs.', 780, 35, 80, 30),
  (md5('bc-thu-lu')::uuid, md5('plan-bulk-curr')::uuid, 'Thursday', 'Lunch', 'Lechon Kawali with Java Rice', 'Crispy deep-fried pork belly served with savory java rice and lechon sauce.', 920, 50, 95, 35),
  (md5('bc-thu-di')::uuid, md5('plan-bulk-curr')::uuid, 'Thursday', 'Dinner', 'Bistek Tagalog on White Rice', 'Thinly sliced beef simmered in soy sauce, calamansi, onions, and garlic on white rice.', 800, 55, 85, 22),
  
  -- FRIDAY
  (md5('bc-fri-bf')::uuid, md5('plan-bulk-curr')::uuid, 'Friday', 'Breakfast', 'Tortang Lunas Omelette', 'Hearty three-egg omelette stuffed with ground pork, potatoes, and garlic rice.', 760, 38, 75, 28),
  (md5('bc-fri-lu')::uuid, md5('plan-bulk-curr')::uuid, 'Friday', 'Lunch', 'Crispy Pata with Pancit Canton', 'Crispy deep-fried pork leg chunks paired with savory pancit canton noodles.', 950, 55, 100, 38),
  (md5('bc-fri-di')::uuid, md5('plan-bulk-curr')::uuid, 'Friday', 'Dinner', 'Bulalo with Corn on Brown Rice', 'Rich beef marrow stew with sweet corn, cabbage, and steaming white rice.', 880, 58, 90, 28),
  
  -- SATURDAY
  (md5('bc-sat-bf')::uuid, md5('plan-bulk-curr')::uuid, 'Saturday', 'Breakfast', 'Bulking Spamsilog', 'Two thick slices of spam served with two fried eggs and garlic sinangag.', 820, 30, 80, 40),
  (md5('bc-sat-lu')::uuid, md5('plan-bulk-curr')::uuid, 'Saturday', 'Lunch', 'Pork Menudo on White Rice', 'Traditional pork menudo with potatoes, raisins, liver, and hot white rice.', 850, 50, 90, 28),
  (md5('bc-sat-di')::uuid, md5('plan-bulk-curr')::uuid, 'Saturday', 'Dinner', 'Dinuguan with Puto', 'Savory pork blood stew served with soft, sweet steamed puto cakes.', 800, 45, 85, 30),
  
  -- SUNDAY
  (md5('bc-sun-bf')::uuid, md5('plan-bulk-curr')::uuid, 'Sunday', 'Breakfast', 'Crispy Bangsilog', 'Crispy fried marinated milkfish served with garlic rice and two eggs.', 790, 42, 80, 28),
  (md5('bc-sun-lu')::uuid, md5('plan-bulk-curr')::uuid, 'Sunday', 'Lunch', 'Chicken Curry with Rice', 'Creamy Filipino chicken curry with potatoes, bell peppers, and white rice.', 800, 50, 85, 24),
  (md5('bc-sun-di')::uuid, md5('plan-bulk-curr')::uuid, 'Sunday', 'Dinner', 'Beef Mechado with Rice', 'Tangy and savory beef stew simmered with potatoes, carrots, and white rice.', 820, 52, 88, 24)
ON CONFLICT (id) DO NOTHING;

-- 9. Seed meals for MAINTENANCE plan — May 25 (plan-maint-curr)
INSERT INTO weekly_plan_meals (id, plan_id, day_of_week, meal_type, meal_name, description, calories, protein_g, carbs_g, fats_g)
VALUES
  -- MONDAY
  (md5('mc-mon-bf')::uuid, md5('plan-maint-curr')::uuid, 'Monday', 'Breakfast', 'Clean Tapsilog', 'Lean beef tapa with one poached egg and garlic brown rice.', 520, 35, 50, 15),
  (md5('mc-mon-lu')::uuid, md5('plan-maint-curr')::uuid, 'Monday', 'Lunch', 'Chicken Afritada with Brown Rice', 'Chicken simmered in fresh tomato sauce, bell peppers, carrots, and brown rice.', 580, 40, 60, 16),
  (md5('mc-mon-di')::uuid, md5('plan-maint-curr')::uuid, 'Monday', 'Dinner', 'Pork Sinigang (Lean Cut) with Brown Rice', 'Lean pork loin chunks in sour tamarind broth with native vegetables and brown rice.', 600, 42, 55, 18),
  
  -- TUESDAY
  (md5('mc-tue-bf')::uuid, md5('plan-maint-curr')::uuid, 'Tuesday', 'Breakfast', 'Clean Longsilog', 'Skinless chicken longganisa with one boiled egg and brown rice.', 500, 30, 50, 14),
  (md5('mc-tue-lu')::uuid, md5('plan-maint-curr')::uuid, 'Tuesday', 'Lunch', 'Chicken Menudo with Rice', 'Traditional chicken menudo cooked with minimal oil, potatoes, and brown rice.', 570, 38, 62, 15),
  (md5('mc-tue-di')::uuid, md5('plan-maint-curr')::uuid, 'Tuesday', 'Dinner', 'Grilled Pork Chop with Ensaladang Mangga', 'Thick lean pork chop grilled and served with green mango salad.', 540, 42, 35, 18),
  
  -- WEDNESDAY
  (md5('mc-wed-bf')::uuid, md5('plan-maint-curr')::uuid, 'Wednesday', 'Breakfast', 'Clean Tocilog', 'Lean skinless chicken tocino served with one egg and garlic brown rice.', 510, 32, 52, 12),
  (md5('mc-wed-lu')::uuid, md5('plan-maint-curr')::uuid, 'Wednesday', 'Lunch', 'Daing na Bangus with Rice & Salted Egg', 'Baked baby bangus seasoned with vinegar and garlic, served with half a salted egg.', 620, 44, 58, 20),
  (md5('mc-wed-di')::uuid, md5('plan-maint-curr')::uuid, 'Wednesday', 'Dinner', 'Beef Tapa Plate with Ensaladang Talong', 'Sautéed beef tapa strips served with grilled eggplant salad and brown rice.', 560, 40, 40, 18),
  
  -- THURSDAY
  (md5('mc-thu-bf')::uuid, md5('plan-maint-curr')::uuid, 'Thursday', 'Breakfast', 'Sautéed Sardines with Misua & Egg', 'Local sardines sautéed with onions and misua noodles, served with a boiled egg.', 480, 25, 55, 12),
  (md5('mc-thu-lu')::uuid, md5('plan-maint-curr')::uuid, 'Thursday', 'Lunch', 'Chicken Binakol with Rice', 'Chicken soup cooked in fresh coconut water with papaya and lemon grass with brown rice.', 550, 38, 50, 15),
  (md5('mc-thu-di')::uuid, md5('plan-maint-curr')::uuid, 'Thursday', 'Dinner', 'Pork Steak Filipino Style with Rice', 'Lean pork slices simmered in lemon-soy sauce with caramelized onion rings.', 590, 38, 58, 18),
  
  -- FRIDAY
  (md5('mc-fri-bf')::uuid, md5('plan-maint-curr')::uuid, 'Friday', 'Breakfast', 'Tortang Talong with Brown Rice', 'Roasted eggplant omelette made with whole eggs and served with brown rice.', 450, 18, 48, 16),
  (md5('mc-fri-lu')::uuid, md5('plan-maint-curr')::uuid, 'Friday', 'Lunch', 'Ginisang Monggo with Tinapa & Rice', 'Creamy mung bean stew flavored with tinapa flakes and malunggay on brown rice.', 520, 28, 65, 12),
  (md5('mc-fri-di')::uuid, md5('plan-maint-curr')::uuid, 'Friday', 'Dinner', 'Grilled Tuna Belly with Kangkong', 'Savory grilled tuna belly steak served with garlic-sautéed water spinach.', 560, 45, 25, 22),
  
  -- SATURDAY
  (md5('mc-sat-bf')::uuid, md5('plan-maint-curr')::uuid, 'Saturday', 'Breakfast', 'Bangus Sardines with Pandesal', 'Flaked milkfish sardines in olive oil served with whole wheat pandesal rolls.', 470, 28, 40, 18),
  (md5('mc-sat-lu')::uuid, md5('plan-maint-curr')::uuid, 'Saturday', 'Lunch', 'Chicken Adobo with Rice & Tomatoes', 'Clean chicken adobo in light vinegar sauce served with rice and sliced tomatoes.', 580, 42, 60, 16),
  (md5('mc-sat-di')::uuid, md5('plan-maint-curr')::uuid, 'Saturday', 'Dinner', 'Beef Nilaga Bowl with Rice', 'Boiled beef brisket soup with potato, cabbage, and a side of brown rice.', 590, 40, 55, 18),
  
  -- SUNDAY
  (md5('mc-sun-bf')::uuid, md5('plan-maint-curr')::uuid, 'Sunday', 'Breakfast', 'Scrambled Eggs with Wheat Bread', 'Three scrambled eggs loaded with onions and tomatoes, with toasted wheat bread.', 420, 22, 30, 18),
  (md5('mc-sun-lu')::uuid, md5('plan-maint-curr')::uuid, 'Sunday', 'Lunch', 'Tortang Alimasag with Rice', 'Fluffy crab meat omelette served with a side of steamed rice and vinaigrette.', 530, 35, 50, 16),
  (md5('mc-sun-di')::uuid, md5('plan-maint-curr')::uuid, 'Sunday', 'Dinner', 'Sinigang na Hipon with Rice', 'Sour shrimp tamarind soup with radish, string beans, and a serving of brown rice.', 510, 36, 52, 10)
ON CONFLICT (id) DO NOTHING;


-- ============================================================================
-- BATCH 3: FUTURE WEEK (June 1 - 7)
-- ============================================================================

-- 10. Seed meals for CUTTING plan — June 1 (plan-cut-next)
INSERT INTO weekly_plan_meals (id, plan_id, day_of_week, meal_type, meal_name, description, calories, protein_g, carbs_g, fats_g)
VALUES
  -- MONDAY
  (md5('cn-mon-bf')::uuid, md5('plan-cut-next')::uuid, 'Monday', 'Breakfast', 'Skinless Chicken Tapa with Egg', 'Low-sodium skinless chicken tapa strips served with a single poached egg and cucumber.', 310, 28, 8, 15),
  (md5('cn-mon-lu')::uuid, md5('plan-cut-next')::uuid, 'Monday', 'Lunch', 'Chicken Inasal Lite', 'Lean chicken breast inasal marinated in native spices with ensaladang talong and garlic cauliflower rice.', 360, 46, 18, 9),
  (md5('cn-mon-di')::uuid, md5('plan-cut-next')::uuid, 'Monday', 'Dinner', 'Pork Sinigang Lite', 'Lean pork loin chunks in a sour tamarind broth with plenty of kangkong and radish.', 340, 36, 15, 11),
  
  -- TUESDAY
  (md5('cn-tue-bf')::uuid, md5('plan-cut-next')::uuid, 'Tuesday', 'Breakfast', 'Spinach and Tofu Scramble', 'Firm tofu crumbled and stir-fried with fresh spinach, tomatoes, and minimal canola oil.', 270, 22, 12, 12),
  (md5('cn-tue-lu')::uuid, md5('plan-cut-next')::uuid, 'Tuesday', 'Lunch', 'Tinolang Isda', 'Fresh local white fish simmered with ginger, moringa leaves, chili leaves, and green papaya slices.', 320, 38, 12, 8),
  (md5('cn-tue-di')::uuid, md5('plan-cut-next')::uuid, 'Tuesday', 'Dinner', 'Grilled Chicken Breast with Asparagus', 'Herb-rubbed lean chicken breast grilled and served with steamed asparagus spears.', 350, 42, 10, 10),
  
  -- WEDNESDAY
  (md5('cn-wed-bf')::uuid, md5('plan-cut-next')::uuid, 'Wednesday', 'Breakfast', 'Egg White Omelette with Mushrooms', 'Fluffy omelette cooked using egg whites and loaded with sautéed brown button mushrooms.', 240, 20, 8, 12),
  (md5('cn-wed-lu')::uuid, md5('plan-cut-next')::uuid, 'Wednesday', 'Lunch', 'Lean Beef Nilaga', 'Beef sirloin cubes boiled until tender with cabbage, green beans, and a light clear broth.', 390, 42, 16, 14),
  (md5('cn-wed-di')::uuid, md5('plan-cut-next')::uuid, 'Wednesday', 'Dinner', 'Tofu Sisig Lite', 'Crispy baked tofu bites seasoned with chopped green chilies, red onions, and light soy sauce.', 300, 24, 18, 10),
  
  -- THURSDAY
  (md5('cn-thu-bf')::uuid, md5('plan-cut-next')::uuid, 'Thursday', 'Breakfast', 'Sautéed Sardines with Lemon', 'Canned sardines in water drained and sautéed with red onion, finished with fresh calamansi.', 290, 26, 8, 14),
  (md5('cn-thu-lu')::uuid, md5('plan-cut-next')::uuid, 'Thursday', 'Lunch', 'Bangus Sisig Lite', 'Flaked milkfish simmered with onions and ginger, lightly seasoned with low-fat dressing.', 380, 36, 14, 15),
  (md5('cn-thu-di')::uuid, md5('plan-cut-next')::uuid, 'Thursday', 'Dinner', 'Chicken Tinola Soup (Soup Only)', 'Comforting chicken broth infused with ginger, lemongrass, and fresh chili leaves.', 310, 32, 12, 8),
  
  -- FRIDAY
  (md5('cn-fri-bf')::uuid, md5('plan-cut-next')::uuid, 'Friday', 'Breakfast', 'Hard Boiled Eggs with Cherry Tomatoes', 'Two hard-boiled eggs paired with fresh cherry tomatoes and cucumber slices.', 260, 18, 6, 16),
  (md5('cn-fri-lu')::uuid, md5('plan-cut-next')::uuid, 'Friday', 'Lunch', 'Chicken Adobo Fit', 'Lean skinless chicken breast slow-simmered in sugar-free soy sauce, garlic, and vinegar.', 410, 40, 15, 12),
  (md5('cn-fri-di')::uuid, md5('plan-cut-next')::uuid, 'Friday', 'Dinner', 'Grilled Squid with Onion Salsa', 'Tender squid grilled with garlic, served with a side of tomatoes and onion salsa.', 280, 32, 10, 8),
  
  -- SATURDAY
  (md5('cn-sat-bf')::uuid, md5('plan-cut-next')::uuid, 'Saturday', 'Breakfast', 'Chicken Tocino Lite', 'Skinless chicken breast thinly sliced, lightly cured in honey and pineapple juice.', 300, 28, 12, 10),
  (md5('cn-sat-lu')::uuid, md5('plan-cut-next')::uuid, 'Saturday', 'Lunch', 'Ginisang Monggo Protein Bowl', 'Local mung bean stew cooked with small shrimps, spinach, and firm tofu cubes.', 350, 26, 35, 8),
  (md5('cn-sat-di')::uuid, md5('plan-cut-next')::uuid, 'Saturday', 'Dinner', 'Steamed Fish Fillet', 'Fresh white fish fillet steamed with sliced ginger, green onions, and light soy seasoning.', 290, 35, 8, 10),
  
  -- SUNDAY
  (md5('cn-sun-bf')::uuid, md5('plan-cut-next')::uuid, 'Sunday', 'Breakfast', 'Poached Eggs on Wheat Toast', 'Two organic poached eggs served over a single slice of toasted whole wheat bread.', 320, 20, 22, 14),
  (md5('cn-sun-lu')::uuid, md5('plan-cut-next')::uuid, 'Sunday', 'Lunch', 'Grilled Tuna Panga', 'Local tuna jaw marinated in calamansi and ginger, grilled to a smoky finish.', 420, 44, 8, 18),
  (md5('cn-sun-di')::uuid, md5('plan-cut-next')::uuid, 'Sunday', 'Dinner', 'Kangkong with Garlic & Baked Tofu', 'Water spinach leaves flash-sautéed with crushed garlic and topped with baked tofu.', 270, 18, 16, 10)
ON CONFLICT (id) DO NOTHING;

-- 11. Seed meals for BULKING plan — June 1 (plan-bulk-next)
INSERT INTO weekly_plan_meals (id, plan_id, day_of_week, meal_type, meal_name, description, calories, protein_g, carbs_g, fats_g)
VALUES
  -- MONDAY
  (md5('bn-mon-bf')::uuid, md5('plan-bulk-next')::uuid, 'Monday', 'Breakfast', 'Longganisa Power Breakfast', 'Three native garlic longganisa links served with two fried eggs and sinangag garlic rice.', 820, 38, 80, 35),
  (md5('bn-mon-lu')::uuid, md5('plan-bulk-next')::uuid, 'Monday', 'Lunch', 'Chicken Tocino Rice Bowl', 'Sweet chicken tocino with a double serving of white rice and a sunny-side-up egg.', 850, 48, 95, 25),
  (md5('bn-mon-di')::uuid, md5('plan-bulk-next')::uuid, 'Monday', 'Dinner', 'Beef Caldereta with Garlic Rice', 'Beef brisket chunks simmered in thick tomato-liver sauce, served with garlic rice.', 880, 54, 90, 32),
  
  -- TUESDAY
  (md5('bn-tue-bf')::uuid, md5('plan-bulk-next')::uuid, 'Tuesday', 'Breakfast', 'Spam & Eggs Sinangag', 'Two thick spam slices grilled and paired with two eggs and double garlic rice.', 890, 32, 85, 42),
  (md5('bn-tue-lu')::uuid, md5('plan-bulk-next')::uuid, 'Tuesday', 'Lunch', 'Beef Caldereta', 'Rich and spicy beef stew with potatoes, carrots, bell peppers, and white rice.', 910, 56, 95, 30),
  (md5('bn-tue-di')::uuid, md5('plan-bulk-next')::uuid, 'Tuesday', 'Dinner', 'Pork Sinigang with Java Rice', 'Sour pork belly soup with local vegetables, served with a side of java rice.', 860, 48, 92, 28),
  
  -- WEDNESDAY
  (md5('bn-wed-bf')::uuid, md5('plan-bulk-next')::uuid, 'Wednesday', 'Breakfast', 'Bulking Tapsilog', 'Premium marinated beef tapa served with two sunny-side eggs and garlic sinangag.', 810, 46, 80, 28),
  (md5('bn-wed-lu')::uuid, md5('plan-bulk-next')::uuid, 'Wednesday', 'Lunch', 'Pork Humba Meal', 'Sweet and savory pork belly braised with black beans, banana blossoms, and white rice.', 920, 50, 98, 35),
  (md5('bn-wed-di')::uuid, md5('plan-bulk-next')::uuid, 'Wednesday', 'Dinner', 'Chicken Curry Supreme on Rice', 'Creamy chicken curry with potatoes, carrots, and sweet bell peppers, on white rice.', 830, 48, 85, 26),
  
  -- THURSDAY
  (md5('bn-thu-bf')::uuid, md5('plan-bulk-next')::uuid, 'Thursday', 'Breakfast', 'Tortang Lunas with Java Rice', 'Hearty pork omelette filled with chopped potatoes and served with java rice.', 780, 36, 75, 30),
  (md5('bn-thu-lu')::uuid, md5('plan-bulk-next')::uuid, 'Thursday', 'Lunch', 'Chicken Pastil Platter', 'Shredded seasoned chicken breast over a double mound of white rice with boiled egg.', 860, 45, 95, 28),
  (md5('bn-thu-di')::uuid, md5('plan-bulk-next')::uuid, 'Thursday', 'Dinner', 'Crispy Pata with Pancit Canton', 'Crispy deep-fried pork leg cuts served on top of stir-fried flour noodles.', 950, 55, 100, 38),
  
  -- FRIDAY
  (md5('bn-fri-bf')::uuid, md5('plan-bulk-next')::uuid, 'Friday', 'Breakfast', 'Loaded Omelette & Pandesal', 'Three-egg omelette with ham and cheese, served with buttered pandesal.', 790, 34, 78, 32),
  (md5('bn-fri-lu')::uuid, md5('plan-bulk-next')::uuid, 'Friday', 'Lunch', 'Bistek Tagalog Supreme', 'Savory soy-lime beef steak slices with caramelized onion rings and white rice.', 880, 54, 90, 28),
  (md5('bn-fri-di')::uuid, md5('plan-bulk-next')::uuid, 'Friday', 'Dinner', 'Pork Menudo with Sinangag', 'Traditional pork liver and pork loin menudo with garlic fried rice.', 850, 48, 92, 28),
  
  -- SATURDAY
  (md5('bn-sat-bf')::uuid, md5('plan-bulk-next')::uuid, 'Saturday', 'Breakfast', 'Spamsilog with Tomatoes', 'Two slices of pan-fried spam served with two sunny-side eggs and garlic rice.', 800, 30, 82, 36),
  (md5('bn-sat-lu')::uuid, md5('plan-bulk-next')::uuid, 'Saturday', 'Lunch', 'Longganisa Power Plate', 'Sweet longganisa links served with salted egg, fresh tomatoes, and garlic white rice.', 900, 42, 95, 38),
  (md5('bn-sat-di')::uuid, md5('plan-bulk-next')::uuid, 'Saturday', 'Dinner', 'Crispy Pork Sisig with Rice & Egg', 'Minced pork cheek sisig served with an egg cracked on top and garlic rice.', 920, 50, 90, 38),
  
  -- SUNDAY
  (md5('bn-sun-bf')::uuid, md5('plan-bulk-next')::uuid, 'Sunday', 'Breakfast', 'Corned Beef Sinangag', 'Lean corned beef sautéed with potatoes, served with two eggs and garlic rice.', 840, 36, 85, 34),
  (md5('bn-sun-lu')::uuid, md5('plan-bulk-next')::uuid, 'Sunday', 'Lunch', 'Crispy Bangus Belly', 'Crispy deep-fried milkfish belly served with spicy soy-vinegar dip and white rice.', 870, 45, 90, 32),
  (md5('bn-sun-di')::uuid, md5('plan-bulk-next')::uuid, 'Sunday', 'Dinner', 'Beef Mechado with Java Rice', 'Tangy beef stew slow-cooked with potatoes, carrots, and sweet bell pepper on rice.', 850, 52, 92, 26)
ON CONFLICT (id) DO NOTHING;

-- 12. Seed meals for MAINTENANCE plan — June 1 (plan-maint-next)
INSERT INTO weekly_plan_meals (id, plan_id, day_of_week, meal_type, meal_name, description, calories, protein_g, carbs_g, fats_g)
VALUES
  -- MONDAY
  (md5('mn-mon-bf')::uuid, md5('plan-maint-next')::uuid, 'Monday', 'Breakfast', 'Lean Tapsilog with Poached Egg', 'Sautéed beef tapa strips with one poached egg and garlic brown rice.', 520, 32, 50, 16),
  (md5('mn-mon-lu')::uuid, md5('plan-maint-next')::uuid, 'Monday', 'Lunch', 'Chicken Afritada', 'Simmered chicken breast in tomato sauce with carrots and bell peppers, on rice.', 580, 40, 60, 16),
  (md5('mn-mon-di')::uuid, md5('plan-maint-next')::uuid, 'Monday', 'Dinner', 'Grilled Pork Chop with Veggies', 'Lean grilled pork chop served with sautéed cabbage, carrots, and brown rice.', 560, 42, 45, 18),
  
  -- TUESDAY
  (md5('mn-tue-bf')::uuid, md5('plan-maint-next')::uuid, 'Tuesday', 'Breakfast', 'Skinless Chicken Longganisa with Egg', 'Skinless chicken longganisa (2 links) served with a hard-boiled egg and brown rice.', 500, 28, 50, 14),
  (md5('mn-tue-lu')::uuid, md5('plan-maint-next')::uuid, 'Tuesday', 'Lunch', 'Pork Sinigang Bowl', 'Lean pork cutlets in a sour tamarind broth with local vegetables and brown rice.', 590, 42, 58, 16),
  (md5('mn-tue-di')::uuid, md5('plan-maint-next')::uuid, 'Tuesday', 'Dinner', 'Steamed Fish Fillet with Rice', 'Steamed cod fillet seasoned with ginger juice, light soy sauce, and white rice.', 510, 38, 48, 12),
  
  -- WEDNESDAY
  (md5('mn-wed-bf')::uuid, md5('plan-maint-next')::uuid, 'Wednesday', 'Breakfast', 'Chicken Tocino with Garlic Rice', 'Marinated skinless chicken tocino cooked with minimal oil, egg, and brown rice.', 510, 30, 52, 12),
  (md5('mn-wed-lu')::uuid, md5('plan-maint-next')::uuid, 'Wednesday', 'Lunch', 'Chicken Menudo', 'Sautéed chicken in tomato sauce with potatoes, carrots, raisins, and brown rice.', 570, 38, 62, 15),
  (md5('mn-wed-di')::uuid, md5('plan-maint-next')::uuid, 'Wednesday', 'Dinner', 'Beef Tapa Plate with Ensaladang Talong', 'Tapsilog style beef strips paired with roasted eggplant and tomato side.', 560, 40, 40, 18),
  
  -- THURSDAY
  (md5('mn-thu-bf')::uuid, md5('plan-maint-next')::uuid, 'Thursday', 'Breakfast', 'Sautéed Sardines with Pandesal', 'Sautéed local sardines in tomato sauce with whole wheat pan de sal rolls.', 460, 22, 45, 16),
  (md5('mn-thu-lu')::uuid, md5('plan-maint-next')::uuid, 'Thursday', 'Lunch', 'Daing na Bangus Meal', 'Baked garlic-marinated milkfish served with brown rice and a side salad.', 610, 42, 56, 18),
  (md5('mn-thu-di')::uuid, md5('plan-maint-next')::uuid, 'Thursday', 'Dinner', 'Pork Steak with Brown Rice', 'Lean pork loin slices simmered in soy sauce and citrus, with brown rice.', 580, 38, 58, 16),
  
  -- FRIDAY
  (md5('mn-fri-bf')::uuid, md5('plan-maint-next')::uuid, 'Friday', 'Breakfast', 'Tortang Talong with Wheat Bread', 'Whole egg eggplant omelette cooked with minimal oil, with toasted wheat bread.', 430, 16, 42, 16),
  (md5('mn-fri-lu')::uuid, md5('plan-maint-next')::uuid, 'Friday', 'Lunch', 'Beef Tapa Plate', 'Marinated beef strips pan-fried, served with garlic brown rice and sliced tomato.', 590, 42, 55, 18),
  (md5('mn-fri-di')::uuid, md5('plan-maint-next')::uuid, 'Friday', 'Dinner', 'Grilled Squid with Rice', 'Grilled squid basted in light soy sauce, served with jasmine rice and cucumber.', 520, 38, 50, 12),
  
  -- SATURDAY
  (md5('mn-sat-bf')::uuid, md5('plan-maint-next')::uuid, 'Saturday', 'Breakfast', 'Scrambled Eggs with Wheat Roll', 'Two whole eggs scrambled with tomato and red onions, served with a wheat roll.', 420, 18, 35, 16),
  (md5('mn-sat-lu')::uuid, md5('plan-maint-next')::uuid, 'Saturday', 'Lunch', 'Chicken Binakol', 'Comforting chicken soup cooked in coconut water, with papaya and brown rice.', 550, 38, 50, 15),
  (md5('mn-sat-di')::uuid, md5('plan-maint-next')::uuid, 'Saturday', 'Dinner', 'Ginisang Monggo with Tinapa & Rice', 'Creamy mung bean stew seasoned with smoked fish flakes and spinach on rice.', 540, 30, 62, 14),
  
  -- SUNDAY
  (md5('mn-sun-bf')::uuid, md5('plan-maint-next')::uuid, 'Sunday', 'Breakfast', 'Egg Scramble with Mushrooms', 'Sautéed mushrooms scrambled with two organic eggs, served with brown rice.', 470, 22, 50, 15),
  (md5('mn-sun-lu')::uuid, md5('plan-maint-next')::uuid, 'Sunday', 'Lunch', 'Pork Steak Filipino Style', 'Tender pork loin simmered in soy sauce, citrus, and onions, on brown rice.', 600, 40, 60, 18),
  (md5('mn-sun-di')::uuid, md5('plan-maint-next')::uuid, 'Sunday', 'Dinner', 'Sinigang na Hipon with Rice', 'Sour tamarind soup with shrimp, radish, okra, served with steaming brown rice.', 510, 34, 58, 10)
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- BATCH 4: FUTURE WEEK (June 8 - 14)
-- ============================================================================

INSERT INTO published_weekly_plans (id, name, category, description, weekly_price, is_published, week_start_date)
VALUES 
  (md5('plan-cut-jun8')::uuid,  'Cut — June 8',  'Cutting', 'Lean, calorie-conscious Filipino meals designed for fat loss.', 3999, true, '2026-06-08'),
  (md5('plan-bulk-jun8')::uuid, 'Bulk — June 8', 'Bulking', 'High-calorie, nutrient-dense Filipino meals engineered for muscle gain.', 4999, true, '2026-06-08')
ON CONFLICT (id) DO NOTHING;

-- 13. Seed meals for CUTTING plan — June 8 (plan-cut-jun8)
INSERT INTO weekly_plan_meals (id, plan_id, day_of_week, meal_type, meal_name, description, calories, protein_g, carbs_g, fats_g)
VALUES
  -- MONDAY
  (md5('cj8-mon-bf')::uuid, md5('plan-cut-jun8')::uuid, 'Monday', 'Breakfast', 'Garlic Spinach Omelette', 'Two egg whites and one whole egg folded with fresh spinach and garlic.', 220, 18, 5, 14),
  (md5('cj8-mon-lu')::uuid, md5('plan-cut-jun8')::uuid, 'Monday', 'Lunch', 'Tuna Salpicao Fit', 'Seared tuna cubes in light soy-garlic sauce served with steamed cabbage.', 320, 38, 10, 12),
  (md5('cj8-mon-di')::uuid, md5('plan-cut-jun8')::uuid, 'Monday', 'Dinner', 'Chicken Inasal Lite Bowl', 'Grilled skinless chicken leg quarter with vinegar dip and a side of green salad.', 350, 42, 12, 15),
  
  -- TUESDAY
  (md5('cj8-tue-bf')::uuid, md5('plan-cut-jun8')::uuid, 'Tuesday', 'Breakfast', 'Bangus Belly (Small) with Tomatoes', 'A modest portion of baked bangus belly with diced fresh tomatoes.', 280, 22, 6, 18),
  (md5('cj8-tue-lu')::uuid, md5('plan-cut-jun8')::uuid, 'Tuesday', 'Lunch', 'Chicken Tinola Fit', 'Comforting ginger chicken soup with extra green papaya and malunggay leaves.', 330, 35, 15, 10),
  (md5('cj8-tue-di')::uuid, md5('plan-cut-jun8')::uuid, 'Tuesday', 'Dinner', 'Pork Tenderloin Adobo', 'Lean pork tenderloin simmered in soy sauce and vinegar with garlic.', 380, 40, 10, 14),
  
  -- WEDNESDAY
  (md5('cj8-wed-bf')::uuid, md5('plan-cut-jun8')::uuid, 'Wednesday', 'Breakfast', 'Tofu Scramble with Bell Peppers', 'Crumbled firm tofu sautéed with colorful bell peppers and onions.', 240, 20, 12, 10),
  (md5('cj8-wed-lu')::uuid, md5('plan-cut-jun8')::uuid, 'Wednesday', 'Lunch', 'Ginisang Upo with Ground Chicken', 'Sautéed bottle gourd with lean ground chicken and minimal oil.', 310, 32, 18, 10),
  (md5('cj8-wed-di')::uuid, md5('plan-cut-jun8')::uuid, 'Wednesday', 'Dinner', 'Grilled Tilapia Fillet', 'Herb-rubbed tilapia fillet grilled to perfection, served with a side of steamed okra.', 290, 36, 8, 12),
  
  -- THURSDAY
  (md5('cj8-thu-bf')::uuid, md5('plan-cut-jun8')::uuid, 'Thursday', 'Breakfast', 'Chicken Tapa Lite', 'Low-sodium skinless chicken tapa strips with cucumber slices.', 270, 28, 8, 12),
  (md5('cj8-thu-lu')::uuid, md5('plan-cut-jun8')::uuid, 'Thursday', 'Lunch', 'Monggo Soup Fit', 'Mung bean soup cooked with spinach and topped with baked tofu cubes.', 340, 24, 40, 8),
  (md5('cj8-thu-di')::uuid, md5('plan-cut-jun8')::uuid, 'Thursday', 'Dinner', 'Beef Nilaga (Lean Cut)', 'Boiled lean beef chunks with cabbage and green beans in clear broth.', 380, 42, 15, 12),
  
  -- FRIDAY
  (md5('cj8-fri-bf')::uuid, md5('plan-cut-jun8')::uuid, 'Friday', 'Breakfast', 'Boiled Eggs with Cucumber', 'Two hard-boiled eggs with a refreshing cucumber and tomato side.', 210, 14, 8, 12),
  (md5('cj8-fri-lu')::uuid, md5('plan-cut-jun8')::uuid, 'Friday', 'Lunch', 'Sinigang na Hipon Lite', 'Shrimp tamarind soup with lots of kangkong, radish, and string beans.', 310, 32, 20, 6),
  (md5('cj8-fri-di')::uuid, md5('plan-cut-jun8')::uuid, 'Friday', 'Dinner', 'Grilled Chicken Breast with Atchara', 'Lean chicken breast grilled with a side of pickled papaya.', 360, 44, 18, 10),
  
  -- SATURDAY
  (md5('cj8-sat-bf')::uuid, md5('plan-cut-jun8')::uuid, 'Saturday', 'Breakfast', 'Sautéed Sardines in Tomato Sauce', 'Canned sardines drained and sautéed with fresh tomatoes and onions.', 290, 24, 12, 14),
  (md5('cj8-sat-lu')::uuid, md5('plan-cut-jun8')::uuid, 'Saturday', 'Lunch', 'Pinakbet with Grilled Fish', 'Assorted local vegetables steamed in a light broth served with grilled fish.', 350, 35, 25, 10),
  (md5('cj8-sat-di')::uuid, md5('plan-cut-jun8')::uuid, 'Saturday', 'Dinner', 'Chicken Curry Lite', 'Chicken breast cubes cooked in light coconut milk with carrots and bell peppers.', 390, 40, 18, 14),
  
  -- SUNDAY
  (md5('cj8-sun-bf')::uuid, md5('plan-cut-jun8')::uuid, 'Sunday', 'Breakfast', 'Skinless Longganisa with Egg Whites', 'Two pieces of lean chicken longganisa with scrambled egg whites.', 280, 26, 10, 12),
  (md5('cj8-sun-lu')::uuid, md5('plan-cut-jun8')::uuid, 'Sunday', 'Lunch', 'Beef Mechado Fit', 'Lean beef stewed in tomato sauce with potatoes and carrots.', 380, 42, 22, 12),
  (md5('cj8-sun-di')::uuid, md5('plan-cut-jun8')::uuid, 'Sunday', 'Dinner', 'Steamed Lapu-Lapu', 'White fish steamed with ginger, scallions, and light soy sauce.', 310, 38, 10, 10)
ON CONFLICT (id) DO NOTHING;

-- 14. Seed meals for BULKING plan — June 8 (plan-bulk-jun8)
INSERT INTO weekly_plan_meals (id, plan_id, day_of_week, meal_type, meal_name, description, calories, protein_g, carbs_g, fats_g)
VALUES
  -- MONDAY
  (md5('bj8-mon-bf')::uuid, md5('plan-bulk-jun8')::uuid, 'Monday', 'Breakfast', 'Ultimate Beef Tapsilog', 'Extra serving of marinated beef tapa, three fried eggs, and garlic sinangag.', 920, 55, 95, 32),
  (md5('bj8-mon-lu')::uuid, md5('plan-bulk-jun8')::uuid, 'Monday', 'Lunch', 'Pork Adobo Supreme', 'Rich pork belly adobo with hard-boiled eggs and a large portion of white rice.', 880, 48, 85, 38),
  (md5('bj8-mon-di')::uuid, md5('plan-bulk-jun8')::uuid, 'Monday', 'Dinner', 'Chicken Inasal with Chicken Oil Rice', 'Two grilled chicken quarters served with rice flavored with annatto chicken oil.', 950, 65, 90, 40),
  
  -- TUESDAY
  (md5('bj8-tue-bf')::uuid, md5('plan-bulk-jun8')::uuid, 'Tuesday', 'Breakfast', 'Longganisa Feast', 'Four sweet pork longganisa links, two fried eggs, and heavy garlic rice.', 940, 42, 105, 42),
  (md5('bj8-tue-lu')::uuid, md5('plan-bulk-jun8')::uuid, 'Tuesday', 'Lunch', 'Beef Caldereta with Cheese', 'Spicy beef stew loaded with potatoes, carrots, cheese, and steamed rice.', 910, 58, 90, 35),
  (md5('bj8-tue-di')::uuid, md5('plan-bulk-jun8')::uuid, 'Tuesday', 'Dinner', 'Crispy Lechon Kawali', 'Deep-fried pork belly slices with lechon sauce and an extra cup of rice.', 980, 50, 85, 52),
  
  -- WEDNESDAY
  (md5('bj8-wed-bf')::uuid, md5('plan-bulk-jun8')::uuid, 'Wednesday', 'Breakfast', 'Tocino & Egg Overload', 'Sweet cured pork tocino stacked with three fried eggs and garlic rice.', 890, 45, 110, 30),
  (md5('bj8-wed-lu')::uuid, md5('plan-bulk-jun8')::uuid, 'Wednesday', 'Lunch', 'Kare-Kare Extravaganza', 'Thick peanut stew with oxtail and tripe, served with bagoong and rice.', 930, 52, 95, 38),
  (md5('bj8-wed-di')::uuid, md5('plan-bulk-jun8')::uuid, 'Wednesday', 'Dinner', 'Chicken Curry with Coconut Cream', 'Rich chicken curry made with pure coconut cream, potatoes, and white rice.', 870, 50, 88, 36),
  
  -- THURSDAY
  (md5('bj8-thu-bf')::uuid, md5('plan-bulk-jun8')::uuid, 'Thursday', 'Breakfast', 'Corned Beef Hash Supreme', 'Premium corned beef sautéed with cubed potatoes, served with eggs and rice.', 850, 40, 95, 35),
  (md5('bj8-thu-lu')::uuid, md5('plan-bulk-jun8')::uuid, 'Thursday', 'Lunch', 'Bistek Tagalog Large Portion', 'Beef slices in soy-calamansi sauce with plenty of onions and steamed rice.', 860, 60, 90, 28),
  (md5('bj8-thu-di')::uuid, md5('plan-bulk-jun8')::uuid, 'Thursday', 'Dinner', 'Pork Menudo Feast', 'Hearty pork and liver stew with potatoes, raisins, and double rice.', 890, 52, 100, 32),
  
  -- FRIDAY
  (md5('bj8-fri-bf')::uuid, md5('plan-bulk-jun8')::uuid, 'Friday', 'Breakfast', 'Spam & Egg Sinangag', 'Three thick slices of Spam, two fried eggs, and garlic fried rice.', 920, 35, 95, 48),
  (md5('bj8-fri-lu')::uuid, md5('plan-bulk-jun8')::uuid, 'Friday', 'Lunch', 'Crispy Pata Plate', 'Crunchy pork leg chunks paired with java rice and a side of atchara.', 990, 55, 85, 55),
  (md5('bj8-fri-di')::uuid, md5('plan-bulk-jun8')::uuid, 'Friday', 'Dinner', 'Bulalo Special', 'Rich beef marrow soup with corn on the cob, cabbage, and steamed rice.', 900, 62, 80, 40),
  
  -- SATURDAY
  (md5('bj8-sat-bf')::uuid, md5('plan-bulk-jun8')::uuid, 'Saturday', 'Breakfast', 'Bangsilog Supreme', 'Large fried milkfish belly with three fried eggs and garlic rice.', 880, 50, 85, 38),
  (md5('bj8-sat-lu')::uuid, md5('plan-bulk-jun8')::uuid, 'Saturday', 'Lunch', 'Pork Sisig with Rice & Egg', 'Sizzling pork sisig mixed with an egg, served with a mountain of rice.', 960, 48, 105, 45),
  (md5('bj8-sat-di')::uuid, md5('plan-bulk-jun8')::uuid, 'Saturday', 'Dinner', 'Beef Nilaga Big Bowl', 'Beef brisket chunks boiled with potatoes and cabbage, with extra rice.', 850, 55, 95, 28),
  
  -- SUNDAY
  (md5('bj8-sun-bf')::uuid, md5('plan-bulk-jun8')::uuid, 'Sunday', 'Breakfast', 'Tortang Giniling Platter', 'Large ground pork and potato omelette served with banana ketchup and rice.', 830, 40, 90, 35),
  (md5('bj8-sun-lu')::uuid, md5('plan-bulk-jun8')::uuid, 'Sunday', 'Lunch', 'Chicken Pastel Special', 'Creamy chicken stew with carrots, potatoes, and sausages, over white rice.', 870, 52, 88, 34),
  (md5('bj8-sun-di')::uuid, md5('plan-bulk-jun8')::uuid, 'Sunday', 'Dinner', 'Dinuguan with Extra Puto', 'Pork blood stew paired with a generous serving of sweet puto and rice.', 890, 46, 110, 32)
ON CONFLICT (id) DO NOTHING;
