-- Fix has_affiliate flag for Give and Take book resource
UPDATE resources 
SET has_affiliate = true 
WHERE id = 'e680d09d-2b56-4285-88a9-71a28a025ca0' 
  AND affiliate_url IS NOT NULL 
  AND has_affiliate = false;