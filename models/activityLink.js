"use strict"

const mongoose = require("mongoose")

const config = require(`${__base}libs/config`)

const activityLinkSchema = new mongoose.Schema({
    _levelId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    _userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    name: {
        type: String,
        enum: Object.keys(config.system.activities),
        required: true
    }
}, {collection: "activityLinks"})

module.exports = mongoose.model("ActivityLink", activityLinkSchema)
