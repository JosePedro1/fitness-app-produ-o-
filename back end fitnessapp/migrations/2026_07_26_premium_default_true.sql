-- ============================================================================
-- Migration: Premium por padrão para todos os usuários
-- Afeta APENAS a tabela `users` (colunas is_premium e premium_expires_at,
-- que já existiam e já eram usadas em nutritionController/academyController).
-- Nenhuma outra tabela é alterada.
-- ============================================================================

-- 1) Garante que a coluna exista (idempotente — não faz nada se já existir)
--    e passa a ter DEFAULT true, então todo INSERT novo já nasce premium.
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS is_premium boolean NOT NULL DEFAULT true;

ALTER TABLE public.users
  ALTER COLUMN is_premium SET DEFAULT true;

-- 2) Ativa premium para TODOS os usuários que já existem hoje na base,
--    e limpa qualquer data de expiração antiga (premium_expires_at),
--    já que um usuário com is_premium=true mas expires_at no passado
--    continuaria sendo tratado como "não premium" pela lógica atual.
UPDATE public.users
SET is_premium = true,
    premium_expires_at = NULL
WHERE is_premium IS DISTINCT FROM true
   OR premium_expires_at IS NOT NULL;
