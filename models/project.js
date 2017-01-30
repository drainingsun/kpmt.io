"use strict"

const mongoose = require("mongoose")

const projectSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    removed: {
        type: Boolean,
        required: true,
        default: false
    }
}, {collection: "projects"})

module.exports = mongoose.model("Project", projectSchema)
