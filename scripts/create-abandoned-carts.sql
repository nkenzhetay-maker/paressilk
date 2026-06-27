CREATE TABLE IF NOT EXISTS abandoned_carts (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  email text NOT NULL UNIQUE,
  items jsonb NOT NULL DEFAULT '[]',
  reminder_sent boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX idx_abandoned_carts_email ON abandoned_carts(email);
CREATE INDEX idx_abandoned_carts_updated ON abandoned_carts(updated_at);

ALTER TABLE abandoned_carts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role full access" ON abandoned_carts FOR ALL USING (true) WITH CHECK (true);
