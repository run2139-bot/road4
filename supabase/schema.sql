-- Supabase 대시보드 > SQL Editor 에서 한 번 실행하세요.
create table if not exists public.courses (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  start_point text not null default '',
  description text not null default '',
  distance numeric not null check (distance > 0),
  elevation_gain numeric not null default 0 check (elevation_gain >= 0),
  estimated_time text not null default '-',
  difficulty text not null check (difficulty in ('초급', '중급', '상급')),
  category text not null check (category in ('해안', '업힐', '평지', '장거리')),
  highlights text[] not null default '{}',
  elevation_data jsonb not null default '[]',
  image_url text,
  user_id uuid references auth.users (id) on delete set null default auth.uid(),
  created_at timestamptz not null default now()
);

create index if not exists courses_user_id_idx on public.courses (user_id);

alter table public.courses enable row level security;

-- 조회는 누구나, 작성/수정/삭제는 로그인한 본인 코스만 가능합니다.
create policy "courses_select" on public.courses for select to anon, authenticated using (true);
create policy "courses_insert" on public.courses for insert to authenticated with check (user_id = (select auth.uid()));
create policy "courses_update" on public.courses for update to authenticated using (user_id = (select auth.uid())) with check (user_id = (select auth.uid()));
create policy "courses_delete" on public.courses for delete to authenticated using (user_id = (select auth.uid()));

-- 초기 데이터 (기존 mockData 5개)
insert into public.courses
  (title, start_point, description, distance, elevation_gain, estimated_time, difficulty, category, highlights, elevation_data, image_url)
values
  ('해운대-간절곶', '해운대구 ~ 울주군', '동해안 해안도로를 따라 달리는 부산 대표 장거리 코스. 기장 죽성·일광 해안 풍경이 일품이며 돌아올 때는 맞바람에 유의하세요.', 62, 640, '3시간 30분', '상급', '해안', array['동해안 오션뷰', '죽성성당', '간절곶 일출'], '[[0,5],[6,20],[12,55],[18,30],[24,70],[30,40],[36,90],[42,45],[48,110],[55,35],[62,15]]'::jsonb, '/images/coast.svg'),
  ('윤산 업힐', '남구 · 금정구', '짧지만 평균 경사도가 높은 업힐 훈련 코스. 반복 인터벌 훈련에 최적이며 정상에서 도심 전망을 즐길 수 있습니다.', 14, 420, '1시간 10분', '중급', '업힐', array['평균 경사 6%', '도심 전망', '인터벌 훈련'], '[[0,20],[2,60],[4,130],[6,240],[7,330],[9,240],[11,120],[13,50],[14,20]]'::jsonb, '/images/hill.svg'),
  ('온천천-수영강', '동래구 ~ 해운대구', '신호 없이 이어지는 하천 자전거도로. 초보자와 회복 라이딩에 좋은 평탄한 코스입니다.', 28, 60, '1시간 30분', '초급', '평지', array['벚꽃길', '자전거 전용도로', '센텀시티 야경'], '[[0,18],[4,14],[8,11],[12,8],[16,6],[20,5],[24,4],[28,3]]'::jsonb, '/images/flat.svg'),
  ('에덴벨리', '사하구 · 강서구', '낙동강변을 지나 에덴벨리 방면으로 오르는 완만한 업힐 코스. 한적한 도로와 낙동강 풍경이 매력입니다.', 36, 380, '2시간 10분', '중급', '업힐', array['낙동강 전망', '한적한 도로', '완만한 업힐'], '[[0,8],[5,12],[10,40],[15,110],[20,210],[24,280],[28,150],[32,50],[36,10]]'::jsonb, '/images/hill.svg'),
  ('가덕도', '강서구 가덕도', '신항과 바다를 끼고 달리는 섬 일주 코스. 바람이 강한 날이 많아 풍속 확인이 필수이며, 노을 명소로 유명합니다.', 45, 520, '2시간 40분', '상급', '해안', array['바다 노을', '섬 일주', '대항 어촌마을'], '[[0,6],[6,45],[12,120],[18,60],[24,150],[30,80],[36,130],[41,40],[45,8]]'::jsonb, '/images/coast.svg');
