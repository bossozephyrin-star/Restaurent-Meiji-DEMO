-- À appliquer dans le projet Supabase dédié à cette démo.
create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  display_name text not null check (char_length(trim(display_name)) between 2 and 60),
  rating smallint not null check (rating between 1 and 5),
  comment text not null check (char_length(trim(comment)) between 10 and 1200),
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  created_at timestamptz not null default now()
);
alter table public.reviews enable row level security;
revoke all on public.reviews from anon, authenticated;
grant select (display_name, rating, comment, created_at, status) on public.reviews to anon;
-- Collecte fermée : aucun droit INSERT public avant validation avec le chef.
drop policy if exists "Lire les avis publies" on public.reviews;
create policy "Lire les avis publies" on public.reviews for select to anon using (status = 'approved');
drop policy if exists "Envoyer un avis a valider" on public.reviews;
-- La future ouverture nécessitera une migration avec protection du débit côté serveur.
create index if not exists reviews_published_date on public.reviews (created_at desc) where status = 'approved';
