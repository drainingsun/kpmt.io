"use strict"

const mongoose = require("mongoose")

const config = require(`${__base}libs/config`)

const prioritySchema = new mongoose.Schema({
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
}, {collection: "priorities"})

module.exports = mongoose.model("Priority", prioritySchema)
