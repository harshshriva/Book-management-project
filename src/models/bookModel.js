const mongoose = require('mongoose')

const bookSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        unique: true,
        trim:true
    },
    excerpt: {
        type: String,
        required: true,
        trim:true
    },
    userId: {
        type: mongoose.Types.ObjectId,
        ref: 'User'
    },
    ISBN: {
        type: String,
        required: true,
        unique: true,
        trim:true
    },
    category: {
        type: String,
        required: true,
        trim:true
    },
    subcategory: {
        type: [String],
        required: true,
        trim:true
    },
    reviews: {
        type: Number,
        default: 0,
    },
    isDeleted: {
        type: Boolean,
        default: false
    },
    deletedAt:Date,
    
    releasedAt: {
        type: Date,//format("YYYY-MM-DD")
        required: true
    },

}, { timestamps: true });

module.exports = mongoose.model("Book", bookSchema);