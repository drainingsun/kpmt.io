"use strict"

const mongoose = require("mongoose")

const roleSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    removed: {
        type: Boolean,
        required: true,
        default: false
    }
}, {collection: "roles"})

module.exports = mongoose.model("Role", roleSchema)
