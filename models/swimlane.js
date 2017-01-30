"use strict"

const mongoose = require("mongoose")

const swimlaneSchema = new mongoose.Schema({
    _boardId: {
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
}, {collection: "swimlanes"})

module.exports = mongoose.model("Swimlane", swimlaneSchema)
