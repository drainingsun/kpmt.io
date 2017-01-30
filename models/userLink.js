"use strict"

const mongoose = require("mongoose")

const userLinkSchema = new mongoose.Schema({
    _levelId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    _userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    removed: {
        type: Boolean,
        required: true,
        default: false
    }
}, {collection: "userLinks"})

userLinkSchema.index({removed: 1})

module.exports = mongoose.model("UserLink", userLinkSchema)
