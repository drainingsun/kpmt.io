"use strict"

const async = require("async")

const config = require(`${__base}libs/config`)
const Helper = require(`${__base}libs/helper`)
const Messages = require(`${__base}libs/messages`)

const Label = require(`${__base}models/label`)

const PrivilegeLinks = require(`${__base}services/privilegeLinks`)

class LabelRoutes {
    constructor(server) {
        server.get({path: "/labels/"}, this.browse.bind(this))
        server.get({path: "/labels/:_id"}, this.read.bind(this))
        server.put({path: "/labels/:_id"}, this.edit.bind(this))
        server.post({path: "/labels"}, this.add.bind(this))
        server.del({path: "/labels/:_id"}, this.delete.bind(this))
    }

    browse(req, res, next) {
        async.waterfall([
            (callback) => {
                const query = {}

                if (req.params.level) {
                    query.level = req.params.level
                }

                query.removed = false

                Label.find(query)
                    .lean()
                    .exec((err, labels) => {
                        if (err) {
                            return callback(Helper.error(err))
                        } else {
                            return callback(null, labels)
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

                Label.findOne(query)
                    .lean()
                    .exec((err, label) => {
                        if (err) {
                            return callback(Helper.error(err))
                        } else {
                            return callback(null, label)
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
                const privileges = [config.system.privileges.administrateLabels]

                PrivilegeLinks.checkPrivileges(req.user._roleId, privileges, (err) => callback(err))
            },

            (callback) => {
                const query = {
                    _id: req.params._id,
                    removed: false
                }

                Label.findOne(query, (err, label) => {
                    if (err) {
                        return callback(Helper.error(err))
                    } else {
                        if (!label) {
                            return callback(Helper.fail(Messages.noLabelError))
                        } else {
                            return callback(null, label)
                        }
                    }
                })
            },

            (label, callback) => {
                if (req.params.level && config.system.levels[req.params.level] !== undefined) {
                    label.level = req.params.level
                }

                if (req.params.name) {
                    label.name = req.params.name
                }

                label.save((err) => {
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
                const privileges = [config.system.privileges.administrateLabels]

                PrivilegeLinks.checkPrivileges(req.user._roleId, privileges, (err) => callback(err))
            },

            (callback) => {
                const label = new Label({
                    level: req.params.level,
                    name: req.params.name
                })

                label.save((err) => {
                    if (err) {
                        return callback(Helper.fail(Messages.invalidParametersError))
                    } else {
                        return callback(null, label._id)
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
                const privileges = [config.system.privileges.administrateLabels]

                PrivilegeLinks.checkPrivileges(req.user._roleId, privileges, (err) => callback(err))
            },

            (callback) => {
                const query = {
                    _id: req.params._id,
                    removed: false
                }

                Label.findOne(query, (err, label) => {
                    if (err) {
                        return callback(Helper.error(err))
                    } else {
                        if (!label) {
                            return callback(Helper.fail(Messages.noLabelError))
                        } else {
                            return callback(null, label)
                        }
                    }
                })
            },

            (label, callback) => {
                label.removed = true

                label.save((err) => {
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

module.exports = LabelRoutes
