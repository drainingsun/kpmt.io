"use strict"

const async = require("async")

const config = require(`${__base}libs/config`)
const Helper = require(`${__base}libs/helper`)
const Messages = require(`${__base}libs/messages`)

const Project = require(`${__base}models/project`)
const User = require(`${__base}models/user`)
const UserLink = require(`${__base}models/userLink`)

const PrivilegeLinks = require(`${__base}services/privilegeLinks`)
const ActivityLinks = require(`${__base}services/activityLinks`)

class UserLinks {
    constructor(server) {
        server.get({path: "/user-links/"}, this.browse.bind(this))
        server.get({path: "/user-links/:_id"}, this.read.bind(this))
        server.post({path: "/user-links"}, this.add.bind(this))
        server.del({path: "/user-links/:_id"}, this.delete.bind(this))
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

                query.removed = false

                UserLink.find(query)
                    .lean()
                    .exec((err, userLinks) => {
                        if (err) {
                            return callback(Helper.error(err))
                        } else {
                            return callback(null, userLinks)
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

                UserLink.findOne(query)
                    .lean()
                    .exec((err, userLink) => {
                        if (err) {
                            return callback(Helper.error(err))
                        } else {
                            return callback(null, userLink)
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
                if (req.params._levelId === undefined || req.params._userId === undefined
                    || config.system.levels[req.params.level] === undefined) {

                    return callback(Helper.fail(Messages.missingParametersError))
                } else {
                    return callback()
                }
            },

            (callback) => {
                const privileges = [config.system.privileges.manageUserLinks]

                PrivilegeLinks.checkPrivileges(req.user._roleId, privileges, (err) => callback(err))
            },

            (callback) => {
                switch (req.params.level) {
                    case config.system.levels.project: {
                        const query = {
                            _id: req.params._levelId,
                            removed: false
                        }

                        Project.findOne(query, (err, project) => {
                            if (err) {
                                return callback(Helper.error(err))
                            } else {
                                if (!project) {
                                    return callback(Helper.fail(Messages.noProjectError))
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
                    _id: req.params._userId,
                    removed: false
                }

                User.findOne(query, (err, user) => {
                    if (err) {
                        return callback(Helper.error(err))
                    } else {
                        if (!user) {
                            return callback(Helper.fail(Messages.noUserError))
                        } else {
                            return callback(null)
                        }
                    }
                })
            },

            (callback) => {
                const query = {
                    _levelId: req.params._levelId,
                    _userId: req.params._userId,
                    removed: false
                }

                UserLink.findOne(query, (err, userLink) => {
                    if (err) {
                        return callback(Helper.error(err))
                    } else {
                        if (userLink) {
                            return callback(Helper.fail(Messages.userLinkExists))
                        } else {
                            return callback(null)
                        }
                    }
                })
            },

            (callback) => {
                const userLink = new UserLink({
                    _levelId: req.params._levelId,
                    _userId: req.params._userId
                })

                userLink.save((err) => {
                    if (err) {
                        return callback(Helper.fail(Messages.invalidParametersError))
                    } else {
                        return callback(null, userLink._id)
                    }
                })
            },

            (userLinkId, callback) => {
                ActivityLinks.add(userLinkId, req.user._id, config.system.activities.addUserLink, (err) => {
                    return callback(err, userLinkId)
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
                const privileges = [config.system.privileges.manageUserLinks]

                PrivilegeLinks.checkPrivileges(req.user._roleId, privileges, (err) => callback(err))
            },

            (callback) => {
                const query = {
                    _id: req.params._id,
                    removed: false
                }

                UserLink.findOne(query, (err, userLink) => {
                    if (err) {
                        return callback(Helper.error(err))
                    } else {
                        if (!userLink) {
                            return callback(Helper.fail(Messages.noUserLinkError))
                        } else {
                            return callback(null, userLink)
                        }
                    }
                })
            },

            (userLink, callback) => {
                userLink.removed = true

                userLink.save((err) => {
                    if (err) {
                        return callback(Helper.fail(Messages.invalidParametersError))
                    } else {
                        return callback()
                    }
                })
            },

            (callback) => {
                ActivityLinks.add(req.params._id, req.user._id, config.system.activities.deleteUserLink, (err) => {
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

module.exports = UserLinks
