"use strict"

const mongoose = require("mongoose")

const columnSchema = new mongoose.Schema({
    _boardId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    wipLimit: {
        type: Number,
        required: true,
        validate: {validator: Number.isInteger},
        default: 3
    },
    removed: {
        type: Boolean,
        required: true,
        default: false
    }
}, {collection: "columns"})

module.exports = mongoose.model("Column", columnSchema)
