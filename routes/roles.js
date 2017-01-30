"use strict"

const async = require("async")

const config = require(`${__base}libs/config`)
const Helper = require(`${__base}libs/helper`)
const Messages = require(`${__base}libs/messages`)

const Role = require(`${__base}models/role`)

const PrivilegeLinks = require(`${__base}services/privilegeLinks`)

class Roles {
    constructor(server) {
        server.get({path: "/roles/"}, this.browse.bind(this))
        server.get({path: "/roles/:_id"}, this.read.bind(this))
        server.put({path: "/roles/:_id"}, this.edit.bind(this))
        server.post({path: "/roles"}, this.add.bind(this))
        server.del({path: "/roles/:_id"}, this.delete.bind(this))
    }

    browse(req, res, next) {
        async.waterfall([
            (callback) => {
                const privileges = [config.system.privileges.administrateRoles]

                PrivilegeLinks.checkPrivileges(req.user._roleId, privileges, (err) => callback(err))
            },

            (callback) => {
                const query = {removed: false}

                Role.find(query)
                    .lean()
                    .exec((err, roles) => {
                        if (err) {
                            return callback(Helper.error(err))
                        } else {
                            return callback(null, roles)
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
                const privileges = [config.system.privileges.administrateRoles]

                PrivilegeLinks.checkPrivileges(req.user._roleId, privileges, (err) => callback(err))
            },

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

                Role.findOne(query)
                    .lean()
                    .exec((err, role) => {
                        if (err) {
                            return callback(Helper.error(err))
                        } else {
                            return callback(null, role)
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
                const privileges = [config.system.privileges.administrateRoles]

                PrivilegeLinks.checkPrivileges(req.user._roleId, privileges, (err) => callback(err))
            },

            (callback) => {
                const query = {
                    _id: req.params._id,
                    removed: false
                }

                Role.findOne(query, (err, role) => {
                    if (err) {
                        return callback(Helper.error(err))
                    } else {
                        if (!role) {
                            return callback(Helper.fail(Messages.noProjectError))
                        } else {
                            return callback(null, role)
                        }
                    }
                })
            },

            (role, callback) => {
                if (req.params.name) {
                    role.name = req.params.name
                }

                role.save((err) => {
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
                if (req.params.name === undefined) {
                    return callback(Helper.fail(Messages.missingParametersError))
                } else {
                    return callback()
                }
            },

            (callback) => {
                const privileges = [config.system.privileges.administrateRoles]

                PrivilegeLinks.checkPrivileges(req.user._roleId, privileges, (err) => callback(err))
            },

            (callback) => {
                const role = new Role({name: req.params.name})

                role.save((err) => {
                    if (err) {
                        return callback(Helper.fail(Messages.invalidParametersError))
                    } else {
                        return callback(null, role._id)
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
                const privileges = [config.system.privileges.administrateRoles]

                PrivilegeLinks.checkPrivileges(req.user._roleId, privileges, (err) => callback(err))
            },

            (callback) => {
                const query = {
                    _id: req.params._id,
                    removed: false
                }

                Role.findOne(query, (err, role) => {
                    if (err) {
                        return callback(Helper.error(err))
                    } else {
                        if (!role) {
                            return callback(Helper.fail(Messages.noRoleError))
                        } else {
                            return callback(null, role)
                        }
                    }
                })
            },

            (role, callback) => {
                role.removed = true

                role.save((err) => {
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

module.exports = Roles
