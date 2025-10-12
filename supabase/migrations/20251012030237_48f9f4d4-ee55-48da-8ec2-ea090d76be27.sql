-- Sync has_affiliate flag with affiliate_url presence
-- Set has_affiliate to true where affiliate_url exists
UPDATE resources 
SET has_affiliate = true 
WHERE affiliate_url IS NOT NULL 
  AND affiliate_url != ''
  AND has_affiliate = false;

-- Set has_affiliate to false where affiliate_url is missing (for data consistency)
UPDATE resources 
SET has_affiliate = false 
WHERE (affiliate_url IS NULL OR affiliate_url = '')
  AND has_affiliate = true;