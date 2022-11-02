const path = require("path");

// Use the existing dishes data
const dishes = require(path.resolve("src/data/dishes-data"));

// Use this function to assign ID's when necessary
const nextId = require("../utils/nextId");

// TODO: Implement the /dishes handlers needed to make the tests pass
function create(req, res) {
  const { data: { name, description, price, image_url } = {} } = req.body;
  const newId = new nextId();
  const newDish = {
    id: newId,
    name: name,
    description: description,
    price: price,
    image_url: image_url,
  };
  dishes.push(newDish);
  res.status(201).json({ data: newDish });
}

//next 7 functions ensure new Dish has name, description, price, and image
function hasName(req, res, next) {
  const { data: { name } = {} } = req.body;
  if (name) {
    return next();
  }
  next({ status: 400, message: "Dish must include a name" });
}

function nameHasText(req, res, next) {
  const { data: { name } = {} } = req.body;
  if (name === "") {
    next({ status: 400, message: "Dish must include a name" });
  }
  next();
}

function hasDescription(req, res, next) {
  const { data: { description } = {} } = req.body;
  if (description) {
    if (description === "") {
      next({ status: 400, message: "Dish must include a description" });
    }
    return next();
  }
  next({ status: 400, message: "Dish must include a description" });
}

function hasPrice(req, res, next) {
  const { data: { price } = {} } = req.body;
  if (price) {
    res.locals.price = price;
    return next();
  }

  next({ status: 400, message: "Dish must include a price" });
}

function priceOverZero(req, res, next) {
  const price = res.locals.price;
  if (price > 0) {
    res.locals.price = price;
    return next();
  } else {
    next({
      status: 400,
      message: "Dish must have a price that is an integer greater than 0",
    });
  }
}

function priceIsNumber(req, res, next) {
  const { data: { price } = {} } = req.body;
  if (typeof price !== 'number') {
    return next({
      status: 400,
      message: "Dish must have a price that is an integer",
    });
  } 
  next();
}

function hasImage(req, res, next) {
  const { data: { image_url } = {} } = req.body;
  if (image_url) {
    return next();
  }
  next({ status: 400, message: "Dish must include an image_url" });
}

function hasImageText(req, res, next) {
  const { data: { image_url } = {} } = req.body;
  if (image_url === "") {
    next({ status: 400, message: "Dish must include an image_url" });
  }
  next();
}
//End of validation middleware

function list(request, response) {
  response.json({ data: dishes });
}

function dishExists(req, res, next) {
  const { dishId } = req.params;
  const foundDish = dishes.find((dish) => dish.id === dishId);
  if (foundDish) {
    res.locals.dish = foundDish;
    return next();
  }
  next({
    status: 404,
    message: `Dish id not found: ${dishId}`,
  });
}

function matchingId(req, res, next) {
  const { dishId } = req.params;
  const { data: { id } = {} } = req.body;

  if (dishId === id || !id) {
    return next();
  }
  next({
    status: 400,
    message: `Dish id does not match route id. Dish: ${id}, Route: ${dishId}`,
  });
}

function read(req, res, next) {
  res.json({ data: res.locals.dish });
}

function update(req, res) {
  const { dishId } = req.params;
  const foundDish = dishes.find((dish) => dish.id === dishId);
  const { data: { name, description, price, image_url } = {} } = req.body;

  foundDish.name = name;
  foundDish.description = description;
  foundDish.price = price;
  foundDish.image_url = image_url;

  res.json({ data: foundDish });
}

module.exports = {
  create: [
    hasName,
    nameHasText,
    hasDescription,
    hasImage,
    hasImageText,
    hasPrice,
    priceOverZero,
    priceIsNumber,
    create,
  ],
  list,
  read: [dishExists, read],
  update: [
    dishExists,
    matchingId,
    hasName,
    nameHasText,
    hasDescription,
    hasImage,
    hasImageText,
    hasPrice,
    priceOverZero,
    priceIsNumber,
    update,
  ]
};
