-- Create indexes for better performance of security logging and rate limiting
-- This addresses security scan recommendations for monitoring capabilities

-- Create index on security_logs for better performance of rate limiting queries
CREATE INDEX IF NOT EXISTS idx_security_logs_user_action_timestamp 
ON public.security_logs (user_id, action, timestamp DESC);

-- Create index for quote sharing tracking and monitoring
CREATE INDEX IF NOT EXISTS idx_security_logs_share_tracking
ON public.security_logs (action, timestamp DESC) 
WHERE action IN ('SHARE_QUOTE', 'SHARE_QUOTE_BLOCKED', 'SHARE_QUOTE_SUCCESS', 'SHARE_QUOTE_ERROR');