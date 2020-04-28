const Types = require("mongoose").Types;
const Vendor = require("../models/vendor");
const Order = require("../models/order");

exports.vendors_get_all = (req, res, next) => {
  find()
    .select("brand location _id vendorImage currentNumber nextUpNumber")
    .exec()
    .then(docs => {
      const response = {
        count: docs.length,
        vendors: docs.map(doc => {
          return {
            _id: doc._id,
            maxOccupants: doc.maxOccupants,
            currentOccupants: doc.currentOccupants,
            brand: doc.brand,
            location: doc.location,
            vendorImage: doc.vendorImage,
            numberUp: doc.numberUp,
            userQueue: doc.userQueue,
            request: {
              type: "GET",
              url: "http://localhost:3000/vendors/" + doc._id
            }
          };
        })
      };
      res.status(200).json(response);

    })
    .catch(err => {
      console.log(err);
      res.status(500).json({
        error: err
      });
    });
}

exports.vendors_create_vendor = (req, res, next) => {
  const vendor = new Vendor({
    _id: new Types.ObjectId(),
    brand: req.body.brand,
    location: req.body.location,
    maxOccupants: req.body.maxOccupants,
    currentOccupants: req.body.currentOccupants,
    userQueue: 0,
    numberUp: maxOccupants,
    vendorImage: req.body.vendorImage
  });
  vendor
    .save()
    .then(result => {
      console.log(result);
      res.status(201).json({
        message: "Created vendor successfully",
        createdVendor: {
          _id: result._id, 
          brand: result.brand,
          location: result.location,
          maxOccupants: result.maxOccupants,
          currentOccupants: result.currentOccupants,
          numberUp: result.numberUp,
          userQueue: result.userQueue,
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
}

exports.vendors_get_vendor = async (req, res, next) => {
  const id = req.params.vendorId;
  try {
    const currVendor = await Vendor.findById(id);
    if (currVendor == null) {
      return res.status(404).json({ message: "Vendor not found" });
    }
  
    return res.status(200).json({
      "vendor_id": currVendor._id,
      "brand": currVendor.brand,
      "currentOccupants": currVendor.currentOccupants,
      "maxOccupants": currVendor.maxOccupants,
      "vendorImageURL": currVendor.vendorImage,
      "numberUp": currVendor.numberUp,
      "userQueue": currVendor.userQueue
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error });
  }
}


exports.vendors_update_vendor = async (req, res, next) => {
  try {
    const id = req.params.vendorId;
    const updateType = req.body.updateType;

    const currVendor = await findById(id);
    if (currVendor == null) {
      return res.status(404).json({ message: "Vendor not found" });
    }

    if (updateType === "ENTER") {
      currVendor.currentOccupants++;

      // use the debugger if you want to check the value of this variable
      const result = await currVendor.save();
    } else if (updateType === "EXIT") {
      currVendor.currentOccupants--;
      if (currVendor.currentOccupants < currVendor.maxOccupants) {
        currVendor.numberUp++;
      }
      currVendor.save(); 

      const orders = await Order.find({ vendor: id});
      console.log(orders);
      for (const order of orders) {
        if ((order.orderNumber <= currVendor.numberUp) && !order.called) {
          order.called = true;
          order.save();
          console.log("Calling " + order.user);
        }
      }
    }
    
    return res.status(201).json({
      "vendor_id": currVendor._id,
      "currentOccupants": currVendor.currentOccupants,
      "maxOccupants": currVendor.maxOccupants,
      "brand": currVendor.brand,
      "numberUp": currVendor.numberUp,
      "image": currVendor.vendorImage
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error });
  }
}

exports.vendors_delete = (req, res, next) => {
  const id = req.params.vendorId;
  remove({ _id: id })
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
}
