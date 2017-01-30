"use strict"

const mongoose = require("mongoose")

const config = require(`${__base}libs/config`)

const privilegeLinkSchema = new mongoose.Schema({
    _roleId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    privilege: {
        type: String,
        enum: Object.keys(config.system.privileges),
        required: true
    },
    removed: {
        type: Boolean,
        required: true,
        default: false
    }
}, {collection: "privilegeLinks"})

module.exports = mongoose.model("PrivilegeLink", privilegeLinkSchema)
