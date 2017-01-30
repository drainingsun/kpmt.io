"use strict"

const mongoose = require("mongoose")

const boardSchema = new mongoose.Schema({
    _projectId: {
        type: mongoose.Schema.Types.ObjectId,
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
}, {collection: "boards"})

module.exports = mongoose.model("Board", boardSchema)
