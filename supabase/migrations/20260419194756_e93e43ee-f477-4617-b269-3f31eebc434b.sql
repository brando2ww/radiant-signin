UPDATE pdv_production_centers
SET printer_ip = array_to_string(
  ARRAY(
    SELECT (octet::int)::text
    FROM unnest(string_to_array(printer_ip, '.')) AS octet
  ),
  '.'
)
WHERE printer_ip ~ '\.0[0-9]';