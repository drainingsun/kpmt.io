"use strict"

global.__base = __dirname + "/"

const mongo = require(`${__base}libs/mongo`)
const restify = require(`${__base}libs/restify`)

mongo.connect(() => {
    restify.start()
})

require(`${__base}routes`)(restify.server)

module.exports = restify.server

