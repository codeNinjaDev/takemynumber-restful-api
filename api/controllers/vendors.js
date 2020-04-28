const mongoose = require("mongoose");
const Vendor = require("../models/vendor");
const Order = require("../models/order");

exports.vendors_get_all = (req, res, next) => {
  Vendor.find()
    .select("brand location _id vendorImage currentNumber nextUpNumber")
    .exec()
    .then(docs => {
      const response = {
        count: docs.length,
        vendors: docs.map(doc => {
          return {
            brand: doc.brand,
                                  location: doc.location,
            vendorImage: doc.vendorImage,
            _id: doc._id,
            currentNumber: doc.currentNumber,
            nextUpNumber: doc.nextUpNumber,
            request: {
              type: "GET",
              url: "http://localhost:3000/vendors/" + doc._id
            }
          };
        })
      };
      //   if (docs.length >= 0) {
      res.status(200).json(response);
      //   } else {
      //       res.status(404).json({
      //           message: 'No entries found'
      //       });
      //   }
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({
        error: err
      });
    });
};

exports.vendors_create_vendor = (req, res, next) => {
  const vendor = new Vendor({
    _id: new mongoose.Types.ObjectId(),
    brand: req.body.brand,
    location: req.body.location,
    currentNumber: 1,
    nextUpNumber: 0
  });
  vendor
    .save()
    .then(result => {
      console.log(result);
      res.status(201).json({
        message: "Created vendor successfully",
        createdVendor: {
          brand: result.brand,
          location: result.location,
          _id: result._id,
          currentNumber: result.currentNumber,
          nextUpNumber: result.nextUpNumber,
          request: {
            type: "GET",
            url: "http://localhost:3000/vendors/" + result._id
          }
        }
      });
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({
        error: err
      });
    });
};

exports.vendors_get_vendor = (req, res, next) => {
  const id = req.params.vendorId;
  Vendor.findById(id)
    .select("brand location _id vendorImage")
    .exec()
    .then(doc => {
      console.log("From database", doc);
      if (doc) {
        res.status(200).json({
          vendor: doc,
          request: {
            type: "GET",
            url: "http://localhost:3000/vendors"
          }
        });
      } else {
        res
          .status(404)
          .json({ message: "No valid entry found for provided ID" });
      }
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({ error: err });
    });
};


exports.vendors_update_vendor = async (req, res, next) => {
  try {
    const id = req.params.vendorId;
    const currVendor = await Vendor.findById(id);
    if (currVendor == null) {
      return res.status(404).json({ message: "Vendor not found" });
    }
    currVendor.currentNumber++;
    currVendor.save();
    const orders = await Order.find({ vendor: id});
    console.log(orders);
    for (const order of orders) {
      if ((order.orderNumber <= currVendor.currentNumber) && !order.called) {
        order.called = true;
        order.save();
        console.log("number...")
      }
    }
    // use the debugger if you want to check the value of this variable
    const result = await currVendor.save();
    return res.status(201).json({
      "vendor_id": currVendor._id,
      "currentNumber": currVendor.currentNumber,
      "brand": currVendor.brand
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error });
  }
};

exports.vendors_delete = (req, res, next) => {
  const id = req.params.vendorId;
  Vendor.remove({ _id: id })
    .exec()
    .then(result => {
      res.status(200).json({
        message: "Vendor deleted",
        request: {
          type: "POST",
          url: "http://localhost:3000/vendors",
          body: { brand: "String", location: "[Number]" }
        }
      });
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({
        error: err
      });
    });
};
