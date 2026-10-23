-- Esquema del clon de ElevenLabs (uso propio). Postgres en Supabase.
-- Todas las tablas tienen user_id y row level security: cada fila es del usuario con sesión.

create table voices (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  engine text not null check (engine in ('elevenlabs','free')),
  source text not null check (source in ('account','library','cloned','builtin')),
  engine_voice_id text,             -- el voice_id de ElevenLabs; null en voces del motor gratuito
  reference_path text,              -- motor gratuito: audio de referencia en el bucket samples
  name text not null,
  language text,
  accent text,
  gender text,
  age text,
  category text,
  description text,
  preview_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint voice_has_source check (engine_voice_id is not null or reference_path is not null)
);
create index on voices (user_id, engine);
create unique index on voices (user_id, engine, engine_voice_id) where engine_voice_id is not null;

create table voice_samples (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  voice_id uuid not null references voices(id) on delete cascade,
  file_path text not null,
  duration_s numeric(7,2),
  consent_confirmed_at timestamptz not null,   -- la casilla de consentimiento es obligatoria
  created_at timestamptz not null default now()
);
create index on voice_samples (voice_id);
create index on voice_samples (user_id);

create table generations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  voice_id uuid references voices(id) on delete set null,   -- el audio sobrevive aunque se borre la voz
  voice_name text not null,                                 -- copia, para el historial
  engine text not null check (engine in ('elevenlabs','free')),
  model_id text not null,
  text text not null check (length(text) > 0),
  char_count int not null,
  settings jsonb not null default '{}',   -- stability, similarity, style, speed, speaker_boost, exaggeration, cfg_weight
  output_format text not null default 'mp3_44100_128',
  status text not null default 'pending'
    check (status in ('pending','rendering','joining','done','failed')),
  error text,
  audio_path text,                        -- MP3 final en el bucket audio
  duration_s numeric(8,2),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index on generations (user_id, created_at desc);
create index on generations (voice_id);
create index generations_text_search on generations using gin (to_tsvector('spanish', text));

create table generation_chunks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  generation_id uuid not null references generations(id) on delete cascade,
  position int not null check (position >= 0),
  text text not null,
  status text not null default 'pending'
    check (status in ('pending','rendering','done','failed')),
  engine_request_id text,   -- request id de ElevenLabs o call_id de Modal
  audio_path text,
  error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (generation_id, position)
);
create index on generation_chunks (user_id);

create table settings (
  user_id uuid primary key references auth.users(id) on delete cascade,
  default_engine text not null default 'elevenlabs' check (default_engine in ('elevenlabs','free')),
  default_model_id text,
  default_voice_id uuid references voices(id) on delete set null,
  default_output_format text not null default 'mp3_44100_128',
  updated_at timestamptz not null default now()
);

-- Row level security: solo el dueño ve y cambia sus filas.
alter table voices enable row level security;
alter table voice_samples enable row level security;
alter table generations enable row level security;
alter table generation_chunks enable row level security;
alter table settings enable row level security;

create policy own_voices on voices for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy own_samples on voice_samples for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy own_generations on generations for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy own_chunks on generation_chunks for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy own_settings on settings for all using (user_id = auth.uid()) with check (user_id = auth.uid());

-- Almacenamiento: buckets privados. Cada archivo va en una carpeta con el id del usuario.
insert into storage.buckets (id, name, public) values ('audio','audio',false), ('samples','samples',false);
create policy own_files on storage.objects for all
  using (bucket_id in ('audio','samples') and (storage.foldername(name))[1] = auth.uid()::text)
  with check (bucket_id in ('audio','samples') and (storage.foldername(name))[1] = auth.uid()::text);
