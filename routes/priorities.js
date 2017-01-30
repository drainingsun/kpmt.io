"use strict"

const async = require("async")

const config = require(`${__base}libs/config`)
const Helper = require(`${__base}libs/helper`)
const Messages = require(`${__base}libs/messages`)

const Priority = require(`${__base}models/priority`)

const PrivilegeLinks = require(`${__base}services/privilegeLinks`)

class PriorityRoutes {
    constructor(server) {
        server.get({path: "/priorities/"}, this.browse.bind(this))
        server.get({path: "/priorities/:_id"}, this.read.bind(this))
        server.put({path: "/priorities/:_id"}, this.edit.bind(this))
        server.post({path: "/priorities"}, this.add.bind(this))
        server.del({path: "/priorities/:_id"}, this.delete.bind(this))
    }

    browse(req, res, next) {
        async.waterfall([
            (callback) => {
                const query = {}

                if (req.params.level) {
                    query.level = req.params.level
                }

                query.removed = false

                Priority.find(query)
                    .lean()
                    .exec((err, priorities) => {
                        if (err) {
                            return callback(Helper.error(err))
                        } else {
                            return callback(null, priorities)
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
                const query = {
                    _id: req.params._id,
                    removed: false
                }

                Priority.findOne(query)
                    .lean()
                    .exec((err, priority) => {
                        if (err) {
                            return callback(Helper.error(err))
                        } else {
                            return callback(null, priority)
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

    edit(req, res, next) {
        async.waterfall([
            (callback) => {
                if (req.params._id === undefined) {
                    return callback(Helper.fail(Messages.missingParametersError))
                } else {
                    return callback()
                }
            },

            (callback) => {
                const privileges = [config.system.privileges.administratePriorities]

                PrivilegeLinks.checkPrivileges(req.user._roleId, privileges, (err) => callback(err))
            },

            (callback) => {
                const query = {
                    _id: req.params._id,
                    removed: false
                }

                Priority.findOne(query, (err, priority) => {
                    if (err) {
                        return callback(Helper.error(err))
                    } else {
                        if (!priority) {
                            return callback(Helper.fail(Messages.noPriorityError))
                        } else {
                            return callback(null, priority)
                        }
                    }
                })
            },

            (priority, callback) => {
                if (req.params.level && config.system.levels[req.params.level] !== undefined) {
                    priority.level = req.params.level
                }

                if (req.params.name) {
                    priority.name = req.params.name
                }

                priority.save((err) => {
                    if (err) {
                        return callback(Helper.fail(Messages.invalidParametersError))
                    } else {
                        return callback()
                    }
                })
            }
        ], (err) => {
            if (err) {
                return next(err)
            } else {
                res.send(Helper.success())

                return next()
            }
        })
    }

    add(req, res, next) {
        async.waterfall([
            (callback) => {
                if (config.system.levels[req.params.level] === undefined || req.params.name === undefined) {
                    return callback(Helper.fail(Messages.missingParametersError))
                } else {
                    return callback()
                }
            },

            (callback) => {
                const privileges = [config.system.privileges.administratePriorities]

                PrivilegeLinks.checkPrivileges(req.user._roleId, privileges, (err) => callback(err))
            },

            (callback) => {
                const priority = new Priority({
                    level: req.params.level,
                    name: req.params.name
                })

                priority.save((err) => {
                    if (err) {
                        return callback(Helper.fail(Messages.invalidParametersError))
                    } else {
                        return callback(null, priority._id)
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

    delete(req, res, next) {
        async.waterfall([
            (callback) => {
                if (req.params._id === undefined) {
                    return callback(Helper.fail(Messages.missingParametersError))
                } else {
                    return callback()
                }
            },

            (callback) => {
                const privileges = [config.system.privileges.administratePriorities]

                PrivilegeLinks.checkPrivileges(req.user._roleId, privileges, (err) => callback(err))
            },

            (callback) => {
                const query = {
                    _id: req.params._id,
                    removed: false
                }

                Priority.findOne(query, (err, priority) => {
                    if (err) {
                        return callback(Helper.error(err))
                    } else {
                        if (!priority) {
                            return callback(Helper.fail(Messages.noPriorityError))
                        } else {
                            return callback(null, priority)
                        }
                    }
                })
            },

            (priority, callback) => {
                priority.removed = true

                priority.save((err) => {
                    if (err) {
                        return callback(Helper.fail(Messages.invalidParametersError))
                    } else {
                        return callback()
                    }
                })
            }
        ], (err) => {
            if (err) {
                return next(err)
            } else {
                res.send(Helper.success())

                return next()
            }
        })
    }
}

module.exports = PriorityRoutes
