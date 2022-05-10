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
        required: true
    },
    userId: {
        type: mongoose.Types.ObjectId,
        ref: 'User'
    },
    ISBN: {
        type: String,
        required: true,
        unique: true
    },
    category: {
        type: String,
        required: true
    },
    subcategory: [{
        type: String,
        required: true
    }],
    reviews: {
        type: Number,
        default: 0,
        

    },
    deletedAt: {
        type: Date,   //when the document is deleted
        default: null
    },
    isDeleted: {
        type: Boolean,
        default: false
    },
    releasedAt: {
        type: Date,//format("YYYY-MM-DD")
        required: true
    },

}, { timestamps: true });

module.exports = mongoose.model("Book", bookSchema);