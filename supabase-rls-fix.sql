-- AIRCONFORTHABITAT — Fix RLS Storage pour le bucket products
-- Exécute dans l'éditeur SQL Supabase

-- Crée le bucket s'il n'existe pas
INSERT INTO storage.buckets (id, name, public)
VALUES ('products', 'products', true)
ON CONFLICT (id) DO NOTHING;

-- Supprime les anciennes policies si existantes
DROP POLICY IF EXISTS "service_role_all_products" ON storage.objects;
DROP POLICY IF EXISTS "public_read_products" ON storage.objects;

-- Permet au service_role de tout faire (upload, delete, etc.)
CREATE POLICY "service_role_all_products"
ON storage.objects
FOR ALL
TO service_role
USING (bucket_id = 'products')
WITH CHECK (bucket_id = 'products');

-- Permet la lecture publique des images
CREATE POLICY "public_read_products"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'products');
