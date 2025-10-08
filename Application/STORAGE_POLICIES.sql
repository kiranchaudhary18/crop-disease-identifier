-- ============================================
-- Storage Bucket Policies for Supabase
-- Run this in Supabase SQL Editor
-- ============================================

-- First, make sure the 'scans' bucket exists and is private
-- Go to Supabase Dashboard > Storage and create bucket named 'scans' if it doesn't exist

-- Drop existing policies if they exist (optional, only if recreating)
DROP POLICY IF EXISTS "Users can upload files to own folder" ON storage.objects;
DROP POLICY IF EXISTS "Users can view own files" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own files" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own files" ON storage.objects;

-- Policy for authenticated users to upload files to their own folder
CREATE POLICY "Users can upload files to own folder"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'scans' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Policy for authenticated users to view their own files
CREATE POLICY "Users can view own files"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'scans' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Policy for authenticated users to update their own files
CREATE POLICY "Users can update own files"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'scans' AND
    auth.uid()::text = (storage.foldername(name))[1]
  )
  WITH CHECK (
    bucket_id = 'scans' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- Policy for authenticated users to delete their own files
CREATE POLICY "Users can delete own files"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'scans' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );