-- ============================================================
-- Knowledge Base Document Management
-- ============================================================

-- 1. Parent table to track uploaded files
CREATE TABLE IF NOT EXISTS kb_uploaded_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  kb_id TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  storage_path TEXT,
  status TEXT NOT NULL DEFAULT 'processing',
  error_message TEXT,
  chunk_count INTEGER DEFAULT 0,
  total_tokens INTEGER DEFAULT 0,
  summary TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Add tracking columns to existing kb_documents
ALTER TABLE kb_documents
  ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id),
  ADD COLUMN IF NOT EXISTS document_id UUID REFERENCES kb_uploaded_documents(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT now(),
  ADD COLUMN IF NOT EXISTS chunk_index INTEGER DEFAULT 0;

-- 3. RLS for kb_uploaded_documents
ALTER TABLE kb_uploaded_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own documents"
  ON kb_uploaded_documents FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own documents"
  ON kb_uploaded_documents FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own documents"
  ON kb_uploaded_documents FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own documents"
  ON kb_uploaded_documents FOR DELETE
  USING (auth.uid() = user_id);

-- 4. RLS for kb_documents
ALTER TABLE kb_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own kb docs"
  ON kb_documents FOR ALL
  USING (user_id = auth.uid() OR user_id IS NULL);

-- 5. Indexes
CREATE INDEX IF NOT EXISTS idx_kb_uploaded_docs_user ON kb_uploaded_documents(user_id);
CREATE INDEX IF NOT EXISTS idx_kb_uploaded_docs_kb ON kb_uploaded_documents(kb_id);
CREATE INDEX IF NOT EXISTS idx_kb_docs_document_id ON kb_documents(document_id);

-- 6. Storage bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('kb-documents', 'kb-documents', false)
ON CONFLICT (id) DO NOTHING;

-- 7. Storage policies
CREATE POLICY "Users can upload kb docs"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'kb-documents'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can read own kb docs"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'kb-documents'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete own kb docs"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'kb-documents'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );
