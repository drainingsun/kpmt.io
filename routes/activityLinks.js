"use strict"

const async = require("async")

const Helper = require(`${__base}libs/helper`)
const Messages = require(`${__base}libs/messages`)

const ActivityLink = require(`${__base}models/activityLink`)

class ActivityLinkRoutes {
    constructor(server) {
        server.get({path: "/activity-links/"}, this.browse.bind(this))
        server.get({path: "/activity-links/:_id"}, this.read.bind(this))
    }

    browse(req, res, next) {
        async.waterfall([
            (callback) => {
                const query = {}

                if (req.params._levelId) {
                    query._levelId = req.params._levelId
                }

                if (req.params._userId) {
                    query._userId = req.params._userId
                }

                if (req.params.name) {
                    query.name = req.params.name
                }

                ActivityLink.find(query)
                    .lean()
                    .exec((err, activityLinks) => {
                        if (err) {
                            return callback(Helper.error(err))
                        } else {
                            return callback(null, activityLinks)
                        }
                    })
            }
        ], (err, data) => {
            if (err) {
                return next(err)
            } else {
                res.send(Helper.success(data))

                return next()
            }
        })
    }

    read(req, res, next) {
        async.waterfall([
            (callback) => {
                if (req.params._id === undefined) {
                    return callback(Helper.fail(Messages.missingParametersError))
                } else {
                    return callback()
                }
            },

            (callback) => {
                const query = {_id: req.params._id}

                ActivityLink.findOne(query)
                    .lean()
                    .exec((err, activityLink) => {
                        if (err) {
                            return callback(Helper.error(err))
                        } else {
                            return callback(null, activityLink)
                        }
                    })
            }
        ], (err, data) => {
            if (err) {
                return next(err)
            } else {
                res.send(Helper.success(data))

                return next()
            }
        })
    }
}

module.exports = ActivityLinkRoutes
