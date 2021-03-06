const properties = require('./json/properties.json');
const users = require('./json/users.json');
const {Pool} = require('pg');

const pool = new Pool({
  user: 'vagrant',
  password: '123',
  host: 'localhost',
  database: 'lightbnb'
});

/// Users

/**
 * Get a single user from the database given their email.
 * @param {String} email The email of the user.
 * @return {Promise<{}>} A promise to the user.
 */
const getUserWithEmail = function(email) {

  const select = 'SELECT * FROM users WHERE email = $1';
  return pool
  .query(select , [email.toLocaleLowerCase()])
  .then(result => result.rows[0])
  .catch(error => console.error(error.message));

  // return Promise.resolve(user);
}
exports.getUserWithEmail = getUserWithEmail;

/**
 * Get a single user from the database given their id.
 * @param {string} id The id of the user.
 * @return {Promise<{}>} A promise to the user.
 */
const getUserWithId = function(id) {
  // return Promise.resolve(users[id]);
  const select = 'SELECT * FROM users WHERE id = $1'
  return pool
  .query(select, [id])
  .then(result => result.rows[0])
  .catch(error => console.error(error.message))

}
exports.getUserWithId = getUserWithId;


/**
 * Add a new user to the database.
 * @param {{name: string, password: string, email: string}} user
 * @return {Promise<{}>} A promise to the user.
 */
const addUser =  function(user) {

  const select = 'INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING *';
  const values = [user.name, user.email, user.password]
  return pool
  .query(select, values)
  .then((result) => result.rows)
  .then((error) => console.error(error.message));
}
exports.addUser = addUser;

/// Reservations

/**
 * Get all reservations for a single user.
 * @param {string} guest_id The id of the user.
 * @return {Promise<[{}]>} A promise to the reservations.
 */
const getAllReservations = function(guest_id, limit = 10) {

  const select = `SELECT properties.*, reservations.*, avg(rating) as average_rating
                  FROM reservations
                  JOIN properties ON reservations.property_id = properties.id
                  JOIN property_reviews ON properties.id = property_reviews.property_id
                  WHERE reservations.guest_id = $1
                  AND reservations.end_date < now()::date
                  GROUP BY properties.id, reservations.id
                  ORDER BY reservations.start_date
                  LIMIT $2;
                  `
  return pool.
  query(select, [guest_id, limit])
  .then(result => result.rows)
  .catch(error => console.error(error.message))

}
exports.getAllReservations = getAllReservations;

/// Properties

/**
 * Get all properties.
 * @param {{}} options An object containing query options.
 * @param {*} limit The number of results to return.
 * @return {Promise<[{}]>}  A promise to the properties.
 */
const getAllProperties = (options, limit = 10) => {

  let queryString = `SELECT properties.*, avg(property_reviews.rating) as average_rating FROM properties JOIN property_reviews ON properties.id = property_reviews.property_id`;
  let queryParams = [limit];
  const keys = Object.keys(options)
  if (keys.length) {
    queryString +=  ` WHERE`

    for (let key of keys){
      console.log(key)
      if (isNaN(options[key])){
        queryParams.push((options[key]));
      } else if (key === 'minimum_price_per_night' || key === 'maximum_price_per_night') {
        queryParams.push(Number(options[key]) * 100);
      } else {
        queryParams.push(Number(options[key]));
      }

      if (key === 'minimum_price_per_night') {
        queryString += ` cost_per_night >= $${queryParams.length}`
      } else if (key === 'maximum_price_per_night') {
        queryString += ` cost_per_night <= $${queryParams.length}`
      } else if (key === 'minimum_rating'){
        queryString += ` rating >= $${queryParams.length}`
      } else {
        queryString += ` ${key} = $${queryParams.length}`
      }

      if (queryParams.length <= keys.length) {
        queryString += ` AND`;
      }

    }
  }

  queryString += ` GROUP BY properties.id LIMIT $1`
  return pool
      .query(queryString, queryParams)
      .then((result) => result.rows)
      .catch((error) => console.error(error.message));
};

exports.getAllProperties = getAllProperties;


/**
 * Add a property to the database
 * @param {{}} property An object containing all of the property details.
 * @return {Promise<{}>} A promise to the property.
 */
const addProperty = function(property) {
//   const propertyId = Object.keys(properties).length + 1;
//   property.id = propertyId;
//   properties[propertyId] = property;
//   return Promise.resolve(property);

  const { owner_id, title, description,thumbnail_photo_url, cover_photo_url, cost_per_night, street, city, province, post_code, country, parking_spaces, number_of_bathrooms, number_of_bedrooms
  } = property;

  const queryString = `INSERT INTO properties(owner_id, title, description,thumbnail_photo_url, cover_photo_url, cost_per_night, street, city, province, post_code, country, parking_spaces, number_of_bathrooms, number_of_bedrooms)
                       VALUES(${owner_id}, '${title}', '${description}','${thumbnail_photo_url}', '${cover_photo_url}', '${cost_per_night}', '${street}', '${city}', '${province}', '${post_code}', '${country}', ${parking_spaces}, ${number_of_bathrooms}, ${number_of_bedrooms}) RETURNING *`
  return pool
  .query(queryString)
  .then(result => result.rows)
  .catch(error => console.error(error.message));

}
exports.addProperty = addProperty;
