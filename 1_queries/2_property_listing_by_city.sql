SELECT DISTINCT properties.*, avg(property_reviews.rating) as average_rating
FROM properties 
JOIN property_reviews 
ON properties.id = property_reviews.property_id
WHERE city LIKE '%Vancouver%'
GROUP BY properties.id
HAVING avg(rating) >= 4
ORDER by cost_per_night ASC;
