"use strict"

const async = require("async")

const config = require(`${__base}libs/config`)
const Helper = require(`${__base}libs/helper`)
const Messages = require(`${__base}libs/messages`)

const Card = require(`${__base}models/card`)
const Label = require(`${__base}models/label`)
const LabelLink = require(`${__base}models/labelLink`)

const PrivilegeLinks = require(`${__base}services/privilegeLinks`)
const ActivityLinks = require(`${__base}services/activityLinks`)

class LabelLinks {
    constructor(server) {
        server.get({path: "/label-links/"}, this.browse.bind(this))
        server.get({path: "/label-links/:_id"}, this.read.bind(this))
        server.post({path: "/label-links"}, this.add.bind(this))
        server.del({path: "/label-links/:_id"}, this.delete.bind(this))
    }

    browse(req, res, next) {
        async.waterfall([
            (callback) => {
                const query = {}

                if (req.params._levelId) {
                    query._levelId = req.params._levelId
                }

                if (req.params._labelId) {
                    query._labelId = req.params._labelId
                }

                query.removed = false

                LabelLink.find(query)
                    .lean()
                    .exec((err, labelLinks) => {
                        if (err) {
                            return callback(Helper.error(err))
                        } else {
                            return callback(null, labelLinks)
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

                LabelLink.findOne(query)
                    .lean()
                    .exec((err, labelLink) => {
                        if (err) {
                            return callback(Helper.error(err))
                        } else {
                            return callback(null, labelLink)
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

    add(req, res, next) {
        async.waterfall([
            (callback) => {
                if (req.params._levelId === undefined || req.params._labelId === undefined
                    || config.system.levels[req.params.level] === undefined) {

                    return callback(Helper.fail(Messages.missingParametersError))
                } else {
                    return callback()
                }
            },

            (callback) => {
                const privileges = [config.system.privileges.manageLabelLinks]

                PrivilegeLinks.checkPrivileges(req.user._roleId, privileges, (err) => callback(err))
            },

            (callback) => {
                switch (req.params.level) {
                    case config.system.levels.card: {
                        const query = {
                            _id: req.params._levelId,
                            removed: false
                        }

                        Card.findOne(query, (err, card) => {
                            if (err) {
                                return callback(Helper.error(err))
                            } else {
                                if (!card) {
                                    return callback(Helper.fail(Messages.noCardError))
                                } else {
                                    return callback()
                                }
                            }
                        })
                        break
                    }

                    default: {
                        return callback(Helper.fail(Messages.invalidParametersError))
                    }
                }
            },

            (callback) => {
                const query = {
                    _id: req.params._labelId,
                    removed: false
                }

                Label.findOne(query, (err, label) => {
                    if (err) {
                        return callback(Helper.error(err))
                    } else {
                        if (!label) {
                            return callback(Helper.fail(Messages.noLabelError))
                        } else {
                            return callback(null)
                        }
                    }
                })
            },

            (callback) => {
                const query = {
                    _levelId: req.params._levelId,
                    _labelId: req.params._labelId,
                    removed: false
                }

                LabelLink.findOne(query, (err, labelLink) => {
                    if (err) {
                        return callback(Helper.error(err))
                    } else {
                        if (labelLink) {
                            return callback(Helper.fail(Messages.labelLinkExists))
                        } else {
                            return callback(null)
                        }
                    }
                })
            },

            (callback) => {
                const labelLink = new LabelLink({
                    _levelId: req.params._levelId,
                    _labelId: req.params._labelId
                })

                labelLink.save((err) => {
                    if (err) {
                        return callback(Helper.fail(Messages.invalidParametersError))
                    } else {
                        return callback(null, labelLink._id)
                    }
                })
            },

            (labelLinkId, callback) => {
                ActivityLinks.add(labelLinkId, req.user._id, config.system.activities.addLabelLink, (err) => {
                    return callback(err, labelLinkId)
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
                const privileges = [config.system.privileges.manageLabelLinks]

                PrivilegeLinks.checkPrivileges(req.user._roleId, privileges, (err) => callback(err))
            },

            (callback) => {
                const query = {
                    _id: req.params._id,
                    removed: false
                }

                LabelLink.findOne(query, (err, labelLink) => {
                    if (err) {
                        return callback(Helper.error(err))
                    } else {
                        if (!labelLink) {
                            return callback(Helper.fail(Messages.noLabelLinkError))
                        } else {
                            return callback(null, labelLink)
                        }
                    }
                })
            },

            (labelLink, callback) => {
                labelLink.removed = true

                labelLink.save((err) => {
                    if (err) {
                        return callback(Helper.fail(Messages.invalidParametersError))
                    } else {
                        return callback()
                    }
                })
            },

            (callback) => {
                ActivityLinks.add(req.params._id, req.user._id, config.system.activities.deleteLabelLink, (err) => {
                    return callback(err)
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

module.exports = LabelLinks
