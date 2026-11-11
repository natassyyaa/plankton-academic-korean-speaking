-- Private storage: students can only read/delete their own files. Uploads go through the server after validation.
create policy "Owners read own presentation files" on storage.objects for select to authenticated
  using (bucket_id = 'presentation-files' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "Owners delete own presentation files" on storage.objects for delete to authenticated
  using (bucket_id = 'presentation-files' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "Owners read own recordings" on storage.objects for select to authenticated
  using (bucket_id = 'recordings' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "Owners delete own recordings" on storage.objects for delete to authenticated
  using (bucket_id = 'recordings' and (storage.foldername(name))[1] = auth.uid()::text);
