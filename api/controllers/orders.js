const mongoose = require("mongoose");

const Order = require("../models/order");
const Vendor = require("../models/vendor");

exports.orders_get_all = (req, res, next) => {
  Order.find()
    .select("vendor user _id orderNumber")
    .populate("vendor", "brand")
    .exec()
    .then(docs => {
      res.status(200).json({
        count: docs.length,
        orders: docs.map(doc => {
          return {
            _id: doc._id,
            vendor: doc.vendor,
            user: doc.user,
            orderNumber: doc.orderNumber,
            request: {
              type: "GET",
              url: "http://localhost:3000/orders/" + doc._id
            }
          };
        })
      });
    })
    .catch(err => {
      res.status(500).json({
        error: err
      });
    });
};

const makeOrderResponse = (order) => ({
  message: "Order stored",
  createdOrder: {
    _id: order._id,
    vendor: order.vendor,
    user: order.user,
    orderNumber: order.orderNumber,
  },
  request: {
    type: "GET",
    url: `http://localhost:3000/orders/${order._id}`,
  }
});

exports.orders_create_order = async (req, res, next) => {
  try {
    const { vendorId, userId } = req.body;
    const vendor = await Vendor.findById(vendorId);
    if (vendor == null) {
      return res.status(404).json({ message: "Vendor not found" });
    }

    const order = new Order({
      _id: mongoose.Types.ObjectId(),
      user: userId,
      vendor: vendorId,
      orderNumber: vendor.nextUpNumber + 1,
    });
    console.log(vendor.nextUpNumber)
    vendor.nextUpNumber++;
    vendor.save();

    // use the debugger if you want to check the value of this variable
    const result = await order.save();
    return res.status(201).json(makeOrderResponse(result));
  } catch (error) {
    console.error(error);
    res.status(500).json({ error });
  }
};

exports.orders_get_order = (req, res, next) => {
  Order.findById(req.params.orderId)
    .populate("vendor")
    .exec()
    .then(order => {
      if (!order) {
        return res.status(404).json({
          message: "Order not found"
        });
      }
      res.status(200).json({
        order: order,
        request: {
          type: "GET",
          url: "http://localhost:3000/orders"
        }
      });
    })
    .catch(err => {
      res.status(500).json({
        error: err
      });
    });
};

exports.orders_delete_order = (req, res, next) => {
  Order.remove({ _id: req.params.orderId })
    .exec()
    .then(result => {
      res.status(200).json({
        message: "Order deleted",
        request: {
          type: "POST",
          url: "http://localhost:3000/orders",
          body: { vendorId: "vendorId", userId: "UserId"}
        }
      });
    })
    .catch(err => {
      res.status(500).json({
        error: err
      });
    });
};
