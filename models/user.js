"use strict"

const mongoose = require("mongoose")
const mongooseBcrypt = require("mongoose-bcrypt")
const mongooseValidator = require("mongoose-validator")

const emailValidator = [
    mongooseValidator({validator: "isEmail"})
]

const passwordValidator = [
    mongooseValidator({
        validator: "isLength",
        arguments: 10
    })
]

const userSchema = new mongoose.Schema({
    _roleId: {
        type: mongoose.Schema.Types.ObjectId,
        required: false
    },
    email: {
        type: String,
        required: true,
        validate: emailValidator
    },
    password: {
        type: String,
        required: true,
        bcrypt: true,
        validate: passwordValidator
    },
    name: {
        type: String,
        required: false
    },
    wipLimit: {
        type: Number,
        required: true,
        validate: {validator: Number.isInteger},
        default: 3
    },
    refreshTime: {
        type: Date,
        required: true,
        default: Date.now
    },
    confirmed: {
        type: Boolean,
        required: true,
        default: false
    },
    removed: {
        type: Boolean,
        required: true,
        default: false
    }
}, {collection: "users"})

userSchema.plugin(mongooseBcrypt)

module.exports = mongoose.model("User", userSchema)
