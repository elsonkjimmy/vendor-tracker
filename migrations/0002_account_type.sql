-- Ajouter le type de compte (vendor = vendeur/boutique, driver = livreur)
ALTER TABLE users ADD COLUMN account_type TEXT NOT NULL DEFAULT 'vendor';
