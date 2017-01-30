"use strict"

const mongoose = require("mongoose")

const cardSchema = new mongoose.Schema({
    _columnId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    _swimlaneId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    _priorityId: {
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
}, {collection: "cards"})

module.exports = mongoose.model("Card", cardSchema)
