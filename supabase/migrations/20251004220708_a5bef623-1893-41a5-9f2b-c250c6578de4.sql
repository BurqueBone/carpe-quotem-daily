-- Populate date_display_reference with sequential dates starting from today
WITH numbered_resources AS (
  SELECT 
    id,
    ROW_NUMBER() OVER (ORDER BY created_at, id) - 1 as row_num
  FROM resources
)
UPDATE resources
SET date_display_reference = CURRENT_DATE + (numbered_resources.row_num || ' days')::INTERVAL
FROM numbered_resources
WHERE resources.id = numbered_resources.id;