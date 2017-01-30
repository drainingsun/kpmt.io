"use strict"

const async = require("async")

const config = require(`${__base}libs/config`)
const Helper = require(`${__base}libs/helper`)
const Messages = require(`${__base}libs/messages`)

const Status = require(`${__base}models/status`)

const PrivilegeLinks = require(`${__base}services/privilegeLinks`)

class StatusRoutes {
    constructor(server) {
        server.get({path: "/statuses/"}, this.browse.bind(this))
        server.get({path: "/statuses/:_id"}, this.read.bind(this))
        server.put({path: "/statuses/:_id"}, this.edit.bind(this))
        server.post({path: "/statuses"}, this.add.bind(this))
        server.del({path: "/statuses/:_id"}, this.delete.bind(this))
    }

    browse(req, res, next) {
        async.waterfall([
            (callback) => {
                const query = {}

                if (req.params.level) {
                    query.level = req.params.level
                }

                query.removed = false

                Status.find(query)
                    .lean()
                    .exec((err, statuses) => {
                        if (err) {
                            return callback(Helper.error(err))
                        } else {
                            return callback(null, statuses)
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

                Status.findOne(query)
                    .lean()
                    .exec((err, status) => {
                        if (err) {
                            return callback(Helper.error(err))
                        } else {
                            return callback(null, status)
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
                const privileges = [config.system.privileges.administrateStatuses]

                PrivilegeLinks.checkPrivileges(req.user._roleId, privileges, (err) => callback(err))
            },

            (callback) => {
                const query = {
                    _id: req.params._id,
                    removed: false
                }

                Status.findOne(query, (err, status) => {
                    if (err) {
                        return callback(Helper.error(err))
                    } else {
                        if (!status) {
                            return callback(Helper.fail(Messages.noStatusError))
                        } else {
                            return callback(null, status)
                        }
                    }
                })
            },

            (status, callback) => {
                if (req.params.level && config.system.levels[req.params.level] !== undefined) {
                    status.level = req.params.level
                }

                if (req.params.name) {
                    status.name = req.params.name
                }

                status.save((err) => {
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
                const privileges = [config.system.privileges.administrateStatuses]

                PrivilegeLinks.checkPrivileges(req.user._roleId, privileges, (err) => callback(err))
            },

            (callback) => {
                const status = new Status({
                    level: req.params.level,
                    name: req.params.name
                })

                status.save((err) => {
                    if (err) {
                        return callback(Helper.fail(Messages.invalidParametersError))
                    } else {
                        return callback(null, status._id)
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
                const privileges = [config.system.privileges.administrateStatuses]

                PrivilegeLinks.checkPrivileges(req.user._roleId, privileges, (err) => callback(err))
            },

            (callback) => {
                const query = {
                    _id: req.params._id,
                    removed: false
                }

                Status.findOne(query, (err, status) => {
                    if (err) {
                        return callback(Helper.error(err))
                    } else {
                        if (!status) {
                            return callback(Helper.fail(Messages.noStatusError))
                        } else {
                            return callback(null, status)
                        }
                    }
                })
            },

            (status, callback) => {
                status.removed = true

                status.save((err) => {
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

module.exports = StatusRoutes
