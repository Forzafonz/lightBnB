SELECT reservations.*, properties.*, average_rating
FROM reservations JOIN properties
ON reservations.property_id = properties.id
JOIN property_reviews
ON properties.id = property_reviews.property_id
JOIN (SELECT property_id, avg(rating) as average_rating
FROM property_reviews
GROUP BY property_id) arate
ON properties.id = arate.property_id
WHERE reservations.guest_id = 1 AND end_date < now() :: date
ORDER BY start_date
LIMIT 10;


