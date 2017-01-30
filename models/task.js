"use strict"

const mongoose = require("mongoose")

const taskSchema = new mongoose.Schema({
    _cardId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    _statusId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: false
    },
    removed: {
        type: Boolean,
        required: true,
        default: false
    }
}, {collection: "tasks"})

module.exports = mongoose.model("Task", taskSchema)
