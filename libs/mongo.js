"use strict"

const mongoose = require("mongoose")

const config = require(`${__base}libs/config`)

class Mongo {
    constructor() {
        mongoose.Promise = global.Promise

        this.client = mongoose
    }

    connect(callback) {
        let auth = ""

        if (config.mongo.user && config.mongo.password) {
            auth = `${config.mongo.user}:${config.mongo.password}@`
        }

        const uri = `mongodb://${auth}${config.mongo.host}/${config.mongo.database}`

        const options = {server: {reconnectTries: Number.MAX_VALUE}}

        this.client.connect(uri, options, (err) => {
            if (err) {
                throw err
            } else {
                return callback()
            }
        })
    }

    createObjectId(value) {
        return new this.client.Types.ObjectId(value)
    }
}

const mongoInstance = new Mongo()

module.exports = mongoInstance