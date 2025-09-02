-- Fix Auth OTP expiry security warning by setting OTP expiry to 1 hour (3600 seconds)
-- This addresses the security warning about OTP expiry exceeding recommended threshold
UPDATE auth.config 
SET 
  otp_expiry = 3600,
  updated_at = now()
WHERE 
  instance_id = '00000000-0000-0000-0000-000000000000';