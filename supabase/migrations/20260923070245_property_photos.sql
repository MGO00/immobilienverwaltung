-- Foto-Upload für Immobilien: ein Foto pro Objekt, gespeichert in einem
-- privaten Storage-Bucket, Zugriff nur für Mitglieder des jeweiligen Kontos.

alter table public.property add column foto_pfad text;
comment on column public.property.foto_pfad is
  'Pfad im Storage-Bucket property-photos, Format "<account_id>/<property_id>" ohne Dateiendung
   (Content-Type kommt als Objekt-Metadatum mit). null = kein Foto hinterlegt.';

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'property-photos',
  'property-photos',
  false,
  8388608, -- 8 MB
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do nothing;

-- Wie is_account_member(), aber nimmt die erste Pfadkomponente eines
-- Storage-Objektnamens (text) entgegen. Ein ::uuid-Cast auf ungültigen Text
-- würde sonst einen Datenbankfehler auslösen statt "kein Zugriff" -- gerade
-- bei Zugriffsregeln, wo die Auswertungsreihenfolge von "and" nicht
-- garantiert ist, fangen wir das hier defensiv ab.
create or replace function public.is_account_member_text(pruef_account_id text)
returns boolean
language plpgsql
security definer
set search_path = public
stable
as $$
begin
  return public.is_account_member(pruef_account_id::uuid);
exception
  when invalid_text_representation then
    return false;
end;
$$;

comment on function public.is_account_member_text is
  'Wie is_account_member(), aber für die aus einem Storage-Pfad extrahierte Konto-ID (text). Gibt
   bei ungültigem Format false statt eines Fehlers zurück.';

-- Gleiches Prinzip wie property_all in 20260921211039_row_level_security.sql:
-- Zugriff nur für Mitglieder des Kontos, dessen id die erste Pfadkomponente
-- des Objektnamens ist ("<account_id>/<property_id>").
create policy property_photos_select on storage.objects
  for select to authenticated
  using (
    bucket_id = 'property-photos'
    and public.is_account_member_text((storage.foldername(name))[1])
  );

create policy property_photos_insert on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'property-photos'
    and public.is_account_member_text((storage.foldername(name))[1])
  );

create policy property_photos_update on storage.objects
  for update to authenticated
  using (
    bucket_id = 'property-photos'
    and public.is_account_member_text((storage.foldername(name))[1])
  )
  with check (
    bucket_id = 'property-photos'
    and public.is_account_member_text((storage.foldername(name))[1])
  );

create policy property_photos_delete on storage.objects
  for delete to authenticated
  using (
    bucket_id = 'property-photos'
    and public.is_account_member_text((storage.foldername(name))[1])
  );
