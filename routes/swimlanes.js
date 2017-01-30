"use strict"

const async = require("async")

const config = require(`${__base}libs/config`)
const Helper = require(`${__base}libs/helper`)
const Messages = require(`${__base}libs/messages`)

const Swimlane = require(`${__base}models/swimlane`)

const PrivilegeLinks = require(`${__base}services/privilegeLinks`)
const UserLinks = require(`${__base}services/userLinks`)

class SwimlaneRoutes {
    constructor(server) {
        server.get({path: "/swimlanes/"}, this.browse.bind(this))
        server.get({path: "/swimlanes/:_id"}, this.read.bind(this))
        server.put({path: "/swimlanes/:_id"}, this.edit.bind(this))
        server.post({path: "/swimlanes"}, this.add.bind(this))
        server.del({path: "/swimlanes/:_id"}, this.delete.bind(this))
    }

    browse(req, res, next) {
        async.waterfall([
            (callback) => {
                const privileges = [
                    config.system.privileges.manageSwimlanes,
                    config.system.privileges.manageLinkedSwimlanes,
                    config.system.privileges.viewSwimlanes,
                    config.system.privileges.viewLinkedSwimlanes
                ]

                PrivilegeLinks.checkPrivileges(req.user._roleId, privileges, (err, foundPrivilege) => {
                    return callback(err, foundPrivilege)
                })
            },

            (foundPrivilege, callback) => {
                const query = {}

                if (req.params._boardId) {
                    query._boardId = req.params._boardId
                }

                query.removed = false

                Swimlane.find(query)
                    .lean()
                    .exec((err, swimlanes) => {
                        if (err) {
                            return callback(Helper.error(err))
                        } else {
                            return callback(null, foundPrivilege, swimlanes)
                        }
                    })
            },

            (foundPrivilege, swimlanes, callback) => {
                const privileges = [
                    config.system.privileges.manageLinkedSwimlanes,
                    config.system.privileges.viewLinkedSwimlanes
                ]

                if (privileges.indexOf(foundPrivilege) !== -1) {
                    async.filter(swimlanes, (swimlane, callback) => {
                        UserLinks.checkLink(swimlane._id, req.user._id, (err) => {
                            if (err) {
                                return callback(null, false)
                            } else {
                                return callback(null, true)
                            }
                        })
                    }, (err, results) => callback(err, results))
                } else {
                    return callback(null, swimlanes)
                }
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
                const privileges = [
                    config.system.privileges.manageSwimlanes,
                    config.system.privileges.manageLinkedSwimlanes,
                    config.system.privileges.viewSwimlanes,
                    config.system.privileges.viewLinkedSwimlanes
                ]

                PrivilegeLinks.checkPrivileges(req.user._roleId, privileges, (err, foundPrivilege) => {
                    return callback(err, foundPrivilege)
                })
            },

            (foundPrivilege, callback) => {
                const privileges = [
                    config.system.privileges.manageLinkedSwimlanes,
                    config.system.privileges.viewLinkedSwimlanes
                ]

                if (privileges.indexOf(foundPrivilege) !== -1) {
                    UserLinks.checkLink(req.params._id, req.user._id, (err) => callback(err))
                } else {
                    return callback()
                }
            },

            (callback) => {
                const query = {
                    _id: req.params._id,
                    removed: false
                }

                Swimlane.findOne(query)
                    .lean()
                    .exec((err, swimlane) => {
                        if (err) {
                            return callback(Helper.error(err))
                        } else {
                            return callback(null, swimlane)
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
                const privileges = [
                    config.system.privileges.manageSwimlanes,
                    config.system.privileges.manageLinkedSwimlanes
                ]

                PrivilegeLinks.checkPrivileges(req.user._roleId, privileges, (err, foundPrivilege) => {
                    return callback(err, foundPrivilege)
                })
            },

            (foundPrivilege, callback) => {
                const privileges = [config.system.privileges.manageLinkedBoards]

                if (privileges.indexOf(foundPrivilege) !== -1) {
                    UserLinks.checkLink(req.params._id, req.user._id, (err) => callback(err))
                } else {
                    return callback()
                }
            },

            (callback) => {
                const query = {
                    _id: req.params._id,
                    removed: false
                }

                Swimlane.findOne(query, (err, swimlane) => {
                    if (err) {
                        return callback(Helper.error(err))
                    } else {
                        if (!swimlane) {
                            return callback(Helper.fail(Messages.noSwimlaneError))
                        } else {
                            return callback(null, swimlane)
                        }
                    }
                })
            },

            (swimlane, callback) => {
                if (req.params._boardId) {
                    swimlane._boardId = req.params._boardId
                }

                if (req.params.name) {
                    swimlane.name = req.params.name
                }

                swimlane.save((err) => {
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
                if (req.params._boardId === undefined || req.params.name === undefined) {
                    return callback(Helper.fail(Messages.missingParametersError))
                } else {
                    return callback()
                }
            },

            (callback) => {
                const privileges = [config.system.privileges.manageSwimlanes]

                PrivilegeLinks.checkPrivileges(req.user._roleId, privileges, (err) => callback(err))
            },

            (callback) => {
                const swimlane = new Swimlane({
                    _boardId: req.params._boardId,
                    name: req.params.name
                })

                swimlane.save((err) => {
                    if (err) {
                        return callback(Helper.fail(Messages.invalidParametersError))
                    } else {
                        return callback(null, swimlane._id)
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
                const privileges = [config.system.privileges.manageSwimlanes]

                PrivilegeLinks.checkPrivileges(req.user._roleId, privileges, (err) => callback(err))
            },

            (callback) => {
                const query = {
                    _id: req.params._id,
                    removed: false
                }

                Swimlane.findOne(query, (err, swimlane) => {
                    if (err) {
                        return callback(Helper.error(err))
                    } else {
                        if (!swimlane) {
                            return callback(Helper.fail(Messages.noSwimlaneError))
                        } else {
                            return callback(null, swimlane)
                        }
                    }
                })
            },

            (swimlane, callback) => {
                swimlane.removed = true

                swimlane.save((err) => {
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

module.exports = SwimlaneRoutes
