"use strict"

const mongoose = require("mongoose")

const config = require(`${__base}libs/config`)

const labelSchema = new mongoose.Schema({
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
}, {collection: "labels"})

module.exports = mongoose.model("Label", labelSchema)
