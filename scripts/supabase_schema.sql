-- 1. Таблица пользователей (users)
CREATE TABLE IF NOT EXISTS public.users (
  uid UUID PRIMARY KEY REFERENCES auth.users(id),
  email TEXT NOT NULL,
  display_name TEXT,
  avatar_url TEXT, -- ссылка на аватар
  family_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Таблица семей (families)
CREATE TABLE IF NOT EXISTS public.families (
  family_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  admin_uid UUID NOT NULL REFERENCES public.users(uid),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Таблица участников семьи (family_members)
CREATE TABLE IF NOT EXISTS public.family_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  family_id UUID NOT NULL REFERENCES public.families(family_id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(uid) ON DELETE CASCADE,
  role TEXT DEFAULT 'member', -- member, admin, owner
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Таблица спортзалов (gyms)
CREATE TABLE IF NOT EXISTS public.gyms (
  gym_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  address TEXT,
  services TEXT[] DEFAULT '{}',
  photos TEXT[] DEFAULT '{}', -- массив ссылок на фото
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Таблица бронирований (bookings)
CREATE TABLE IF NOT EXISTS public.bookings (
  booking_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(uid),
  gym_id UUID NOT NULL REFERENCES public.gyms(gym_id),
  date TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. Внешний ключ family_id в users
ALTER TABLE public.users
  ADD CONSTRAINT fk_family
  FOREIGN KEY (family_id)
  REFERENCES public.families(family_id)
  ON DELETE SET NULL;

-- 7. Включаем RLS для всех таблиц
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.families ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.family_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gyms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- 8. Политики доступа

-- users: только владелец может видеть/обновлять себя
CREATE POLICY "Users can view their own profile"
  ON public.users FOR SELECT
  USING (uid = auth.uid());

CREATE POLICY "Users can update their own profile"
  ON public.users FOR UPDATE
  USING (uid = auth.uid());

-- users: INSERT только для самого себя (через функцию регистрации)
CREATE POLICY "Users can insert their own profile"
  ON public.users FOR INSERT
  WITH CHECK (uid = auth.uid());

-- users: DELETE только для самого себя
CREATE POLICY "Users can delete their own profile"
  ON public.users FOR DELETE
  USING (uid = auth.uid());

-- families: видеть может админ или участник семьи
CREATE POLICY "Family member or admin can view family"
  ON public.families FOR SELECT
  USING (
    admin_uid = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.family_members fm
      WHERE fm.family_id = family_id AND fm.user_id = auth.uid()
    )
  );

-- family_members: видеть может только сам участник или участник семьи
CREATE POLICY "Family member can view their membership"
  ON public.family_members FOR SELECT
  USING (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.family_members fm2
      WHERE fm2.family_id = family_members.family_id AND fm2.user_id = auth.uid()
    )
  );

-- families: INSERT — любой пользователь может создать семью
CREATE POLICY "User can create family"
  ON public.families FOR INSERT
  WITH CHECK (admin_uid = auth.uid());

-- families: UPDATE/DELETE — только админ семьи
CREATE POLICY "Family admin can update family"
  ON public.families FOR UPDATE
  USING (admin_uid = auth.uid());

CREATE POLICY "Family admin can delete family"
  ON public.families FOR DELETE
  USING (admin_uid = auth.uid());

-- family_members: INSERT — только участник может добавить себя (или админ семьи, если потребуется)
CREATE POLICY "User can add themselves to family"
  ON public.family_members FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- family_members: UPDATE/DELETE — только сам участник или админ семьи
CREATE POLICY "Family member or admin can update membership"
  ON public.family_members FOR UPDATE
  USING (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.families f WHERE f.family_id = family_members.family_id AND f.admin_uid = auth.uid()
    )
  );

CREATE POLICY "Family member or admin can delete membership"
  ON public.family_members FOR DELETE
  USING (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.families f WHERE f.family_id = family_members.family_id AND f.admin_uid = auth.uid()
    )
  );

-- bookings: только владелец может видеть свои бронирования
CREATE POLICY "User can view their bookings"
  ON public.bookings FOR SELECT
  USING (user_id = auth.uid());

-- gyms: публичный просмотр
CREATE POLICY "Allow public read access for gyms"
  ON public.gyms FOR SELECT
  USING (true);

-- gyms: INSERT/UPDATE/DELETE — только администратор (пример: по email или отдельному полю is_admin)
-- Здесь пример для пользователя с определённым email (замени на свой email или добавь поле is_admin в users)
CREATE POLICY "Admin can insert gym"
  ON public.gyms FOR INSERT
  WITH CHECK (auth.email() = 'admin@example.com');

CREATE POLICY "Admin can update gym"
  ON public.gyms FOR UPDATE
  USING (auth.email() = 'admin@example.com');

CREATE POLICY "Admin can delete gym"
  ON public.gyms FOR DELETE
  USING (auth.email() = 'admin@example.com');

-- bookings: INSERT/UPDATE/DELETE — только сам пользователь
CREATE POLICY "User can create booking"
  ON public.bookings FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "User can update their booking"
  ON public.bookings FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "User can delete their booking"
  ON public.bookings FOR DELETE
  USING (user_id = auth.uid());

-- 9. Тестовые данные для gyms
INSERT INTO public.gyms (name, address, services, photos)
VALUES 
  ('Фитнес Центр', 'ул. Примерная, 123', ARRAY['Тренажерный зал', 'Бассейн', 'Сауна'], ARRAY['https://example.com/gym1-1.jpg', 'https://example.com/gym1-2.jpg']),
  ('Спортивный Клуб', 'пр. Спортивный, 45', ARRAY['Тренажерный зал', 'Групповые занятия'], ARRAY['https://example.com/gym2-1.jpg'])
ON CONFLICT (gym_id) DO NOTHING;

-- 10. Индексы для ускорения поиска (опционально)
CREATE INDEX IF NOT EXISTS idx_family_members_family_id ON public.family_members(family_id);
CREATE INDEX IF NOT EXISTS idx_family_members_user_id ON public.family_members(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_user_id ON public.bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_gym_id ON public.bookings(gym_id);

-- 11. (Опционально) Политики на INSERT/UPDATE/DELETE можно добавить по необходимости 