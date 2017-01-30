"use strict"

const mongoose = require("mongoose")

const labelLinkSchema = new mongoose.Schema({
    _levelId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    _labelId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    removed: {
        type: Boolean,
        required: true,
        default: false
    }
}, {collection: "labelLinks"})

module.exports = mongoose.model("LabelLink", labelLinkSchema)
