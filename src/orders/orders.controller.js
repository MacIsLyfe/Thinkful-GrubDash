const path = require("path");
const { isArray } = require("util");

// Use the existing order data
const orders = require(path.resolve("src/data/orders-data"));

// Use this function to assigh ID's when necessary
const nextId = require("../utils/nextId");

// TODO: Implement the /orders handlers needed to make the tests pass
function create(req, res) {
  const { data: { deliverTo, mobileNumber, dishes } = {} } = req.body;
  const newId = new nextId();
  const newOrder = {
    id: newId,
    deliverTo: deliverTo,
    mobileNumber: mobileNumber,
    dishes: { dishes },
  };
  orders.push(newOrder);
  res.status(201).json({ data: newOrder });
}

//validation middleware: deliverTo, mobileNumber, dishes, and quantity
function hasDeliverTo(req, res, next) {
  const { data: { deliverTo } = {} } = req.body;
  if (deliverTo) {
    return next();
  }
  next({ status: 400, message: "Order must include a deliverTo" });
}

function hasMobileNum(req, res, next) {
  const { data: { mobileNumber } = {} } = req.body;
  if (mobileNumber) {
    return next();
  }
  next({ status: 400, message: "Order must include a mobileNumber" });
}

function hasDishes(req, res, next) {
  const { data: { dishes } = {} } = req.body;
  if (dishes) {
    return next();
  }
  next({ status: 400, message: "Order must include a dishes" });
}

function hasStatus(req, res, next) {
  const { data: { status } = {} } = req.body;
  if (status) {
    return next();
  }
  next({
    status: 400,
    message:
      "Order must have a status of pending, preparing, out-for-delivery, delivered",
  });
}

function validStatus(req, res, next) {
  const { data: { status } = {} } = req.body;
  if (status === "invalid" || !status) {
    next({
        status: 400,
        message:
          "Order must have a status of pending, preparing, out-for-delivery, delivered",
      });
  }
  next();
  
}

function dishesEmpty(req, res, next) {
  const { data: { dishes } = {} } = req.body;
  if (dishes.length === 0) {
    return next({ status: 400, message: "Order must include a dishes" });
  }
  next();
}

function dishesArray(req, res, next) {
  const { data: { dishes } = {} } = req.body;
  if (Array.isArray(dishes)) {
    return next();
  }
  next({ status: 400, message: "Order must include a dishes" });
}

function hasQuantity(req, res, next) {
  const { data: { dishes } = {} } = req.body;
  dishes.map((dish, index) => {
    if (!dish.quantity) {
      next({
        status: 400,
        message: `Dish ${index} must have a quantity that is an integer greater than 0`,
      });
    }
    if (typeof dish.quantity !== "number")
      next({
        status: 400,
        message: `Dish ${index} must have a quantity that is an integer greater than 0`,
      });
  });
  next();
}

function statusPropertyPending(req, res, next) {
    const order = res.locals.order;
    const {status} = order;
    if (status === "pending") {
      return next();
    }
    next({
      status: 400,
      message: `An order cannot be deleted unless it is pending.`,
    });
  }

//end middleware

function orderExists(req, res, next) {
  const { orderId } = req.params;
  const foundOrder = orders.find((order) => order.id === orderId);
  if (foundOrder) {
    res.locals.order = foundOrder;
    return next();
  }
  next({
    status: 404,
    message: `Order id not found: ${orderId}`,
  });
}

function read(req, res) {
  res.json({ data: res.locals.order });
}

function matchingId(req, res, next) {
  const { orderId } = req.params;
  const { data: { id } = {} } = req.body;

  if (orderId === id || !id) {
    return next();
  }
  next({
    status: 400,
    message: `Order id does not match route id. Order: ${id}, Route: ${orderId}`,
  });
}

function list(request, response) {
  response.json({ data: orders });
}

function update(req, res) {
  const { orderId } = req.params;
  const foundOrder = orders.find((order) => order.id === orderId);
  const { data: { deliverTo, mobileNumber, status, dishes } = {} } = req.body;

  foundOrder.deliverTo = deliverTo;
  foundOrder.mobileNumber = mobileNumber;
  foundOrder.status = status;

  res.json({ data: foundOrder });
}

function destroy(req, res) {
    const { orderId } = req.params;

    const index = orders.findIndex((order) => order.id === orderId);
    orders.splice(index, 1);
    
    res.sendStatus(204);
  }

module.exports = {
  list,
  create: [
    hasDeliverTo,
    hasMobileNum,
    hasDishes,
    dishesEmpty,
    dishesArray,
    hasQuantity,
    create,
  ],
  read: [orderExists, read],
  update: [
    orderExists,
    matchingId,
    hasStatus,
    validStatus,
    hasDeliverTo,
    hasMobileNum,
    hasDishes,
    dishesEmpty,
    dishesArray,
    hasQuantity,
    update,
  ],
  delete: [
      orderExists, 
      statusPropertyPending, 
      destroy
    ]
};
