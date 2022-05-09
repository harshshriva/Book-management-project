const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({

    title: {
        type: String,
        required: true,
        enum: ["Mr", "Mrs", "Miss"],
        trim: true
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    phone: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true

    },
    password: {
        type: String,
        minlength: 8,
        maxlength: 15,
        required: true,
    },
    address: {
        street: { type: String },
        city: { type: String },
        pincode: { type: String }
    },



}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);