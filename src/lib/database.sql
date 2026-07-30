-- ============================================
-- UneedT — Script SQL completo
-- Ejecutar en Supabase SQL Editor
-- ============================================

-- 0. Tabla de programas académicos
CREATE TABLE programs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  institution TEXT,
  color_hex TEXT NOT NULL DEFAULT '#C27A55',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 1. Tabla de materias/asignaturas
CREATE TABLE subjects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  color_hex TEXT NOT NULL DEFAULT '#C27A55',
  program_id UUID REFERENCES programs(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Tabla de tareas
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  subject_id UUID REFERENCES subjects(id) ON DELETE SET NULL,
  due_date DATE NOT NULL,
  duration_hours DECIMAL(4,1) NOT NULL,
  user_priority TEXT CHECK (user_priority IN ('Baja', 'Media', 'Alta')),
  ai_priority TEXT CHECK (ai_priority IN ('Crítica', 'Alta', 'Media', 'Baja')),
  ai_category TEXT,
  ai_recommendation TEXT,
  ai_suggested_hours DECIMAL(4,1),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed')),
  progress INTEGER DEFAULT 0,
  tags TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- 3. Tabla de metas de estudio
CREATE TABLE goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  type TEXT CHECK (type IN ('complete_tasks', 'dedicate_hours')),
  target_value DECIMAL(6,1) NOT NULL,
  current_value DECIMAL(6,1) DEFAULT 0,
  subject_id UUID REFERENCES subjects(id) ON DELETE SET NULL,
  week_start DATE,
  is_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Tabla de configuración de la app
CREATE TABLE app_config (
  key TEXT PRIMARY KEY,
  value TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- Desactivar RLS (no hay autenticación)
-- ============================================
ALTER TABLE programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all on programs" ON programs FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on subjects" ON subjects FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on tasks" ON tasks FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on goals" ON goals FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on app_config" ON app_config FOR ALL USING (true) WITH CHECK (true);

-- ============================================
-- Activar Realtime en tasks y goals
-- ============================================
ALTER PUBLICATION supabase_realtime ADD TABLE tasks;
ALTER PUBLICATION supabase_realtime ADD TABLE goals;
