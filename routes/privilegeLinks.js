"use strict"

const async = require("async")

const config = require(`${__base}libs/config`)
const Helper = require(`${__base}libs/helper`)
const Messages = require(`${__base}libs/messages`)

const PrivilegeLink = require(`${__base}models/privilegeLink`)
const Role = require(`${__base}models/role`)

const PrivilegeLinks = require(`${__base}services/privilegeLinks`)

class PrivilegeLinkRoutes {
    constructor(server) {
        server.get({path: "/privilege-links/"}, this.browse.bind(this))
        server.get({path: "/privilege-links/:_id"}, this.read.bind(this))
        server.post({path: "/privilege-links"}, this.add.bind(this))
        server.del({path: "/privilege-links/:_id"}, this.delete.bind(this))
    }

    browse(req, res, next) {
        async.waterfall([
            (callback) => {
                const privileges = [config.system.privileges.administratePrivilegeLinks]

                PrivilegeLinks.checkPrivileges(req.user._roleId, privileges, (err) => callback(err))
            },

            (callback) => {
                const query = {}

                if (req.params._roleId) {
                    query._roleId = req.params._roleId
                }

                if (req.params._userId) {
                    query._userId = req.params._userId
                }

                query.removed = false

                PrivilegeLink.find(query)
                    .lean()
                    .exec((err, privilegeLinks) => {
                        if (err) {
                            return callback(Helper.error(err))
                        } else {
                            return callback(null, privilegeLinks)
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
                const privileges = [config.system.privileges.administratePrivilegeLinks]

                PrivilegeLinks.checkPrivileges(req.user._roleId, privileges, (err) => callback(err))
            },

            (callback) => {
                const query = {
                    _id: req.params._id,
                    removed: false
                }

                PrivilegeLink.findOne(query)
                    .lean()
                    .exec((err, privilegeLink) => {
                        if (err) {
                            return callback(Helper.error(err))
                        } else {
                            return callback(null, privilegeLink)
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
                if (req.params._roleId === undefined || req.params.privilege === undefined) {
                    return callback(Helper.fail(Messages.missingParametersError))
                } else {
                    return callback()
                }
            },

            (callback) => {
                const privileges = [config.system.privileges.administratePrivilegeLinks]

                PrivilegeLinks.checkPrivileges(req.user._roleId, privileges, (err) => callback(err))
            },

            (callback) => {
                const query = {
                    _id: req.params._roleId,
                    removed: false
                }

                Role.findOne(query, (err, label) => {
                    if (err) {
                        return callback(Helper.error(err))
                    } else {
                        if (!label) {
                            return callback(Helper.fail(Messages.noRoleError))
                        } else {
                            return callback(null)
                        }
                    }
                })
            },

            (callback) => {
                const query = {
                    _roleId: req.params._roleId,
                    privilege: req.params.privilege,
                    removed: false
                }

                PrivilegeLink.findOne(query, (err, privilegeLink) => {
                    if (err) {
                        return callback(Helper.error(err))
                    } else {
                        if (privilegeLink) {
                            return callback(Helper.fail(Messages.privilegeLinkExists))
                        } else {
                            return callback(null)
                        }
                    }
                })
            },

            (callback) => {
                const privilegeLink = new PrivilegeLink({
                    _roleId: req.params._roleId,
                    privilege: req.params.privilege
                })

                privilegeLink.save((err) => {
                    if (err) {
                        return callback(Helper.fail(Messages.invalidParametersError))
                    } else {
                        return callback(null, privilegeLink._id)
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
                const privileges = [config.system.privileges.administratePrivilegeLinks]

                PrivilegeLinks.checkPrivileges(req.user._roleId, privileges, (err) => callback(err))
            },

            (callback) => {
                const query = {
                    _id: req.params._id,
                    removed: false
                }

                PrivilegeLink.findOne(query, (err, privilegeLink) => {
                    if (err) {
                        return callback(Helper.error(err))
                    } else {
                        if (!privilegeLink) {
                            return callback(Helper.fail(Messages.noPrivilegeLinkError))
                        } else {
                            return callback(null, privilegeLink)
                        }
                    }
                })
            },

            (privilegeLink, callback) => {
                privilegeLink.removed = true

                privilegeLink.save((err) => {
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

module.exports = PrivilegeLinkRoutes
