-- Update database extensions to recommended versions for better security
-- This addresses the security scan findings about outdated extensions

-- Update pgcrypto extension to latest version
ALTER EXTENSION pgcrypto UPDATE;

-- Update uuid-ossp extension to latest version  
ALTER EXTENSION "uuid-ossp" UPDATE;

-- Update http extension to latest version (if exists)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'http') THEN
        ALTER EXTENSION http UPDATE;
    END IF;
END$$;

-- Update pgjwt extension to latest version (if exists)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'pgjwt') THEN
        ALTER EXTENSION pgjwt UPDATE;
    END IF;
END$$;

-- Create index on security_logs for better performance of rate limiting queries
CREATE INDEX IF NOT EXISTS idx_security_logs_user_action_timestamp 
ON public.security_logs (user_id, action, timestamp DESC);

-- Create index for quote sharing tracking
CREATE INDEX IF NOT EXISTS idx_security_logs_share_tracking
ON public.security_logs (action, timestamp DESC) 
WHERE action IN ('SHARE_QUOTE', 'SHARE_QUOTE_BLOCKED', 'SHARE_QUOTE_SUCCESS', 'SHARE_QUOTE_ERROR');