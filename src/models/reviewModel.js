 const mongoose = require("mongoose");

const ObjectId = mongoose.Schema.Types.ObjectId

const reviewSchema = new mongoose.Schema({

  bookId: {
    type: ObjectId,
    required: true,
    ref: 'Book'
  },
  reviewedBy: {
    type: String,
    required: true,
    default: 'Guest',
    trim: true
    // value: reviewer's name
  },
  reviewedAt: {
    type: Date,
    required: true
  },
  rating: {
    type: Number,
    minlength: 1,
    maxlength: 5,  //min 1, max 5, 
    required: true
  },
  review: {
    type: String, //optional
  },
  isDeleted: {
    type: Boolean,
    default: false
  }

},
  { timestamps: true }
);

module.exports = mongoose.model("Review", reviewSchema);