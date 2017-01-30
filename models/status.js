"use strict"

const mongoose = require("mongoose")

const config = require(`${__base}libs/config`)

const statusSchema = new mongoose.Schema({
    level: {
        type: String,
        enum: Object.keys(config.system.levels),
        required: true
    },
    name: {
        type: String,
        required: true
    },
    removed: {
        type: Boolean,
        required: true,
        default: false
    }
}, {collection: "statuses"})

module.exports = mongoose.model("Status", statusSchema)
