"use strict"

const async = require("async")

const config = require(`${__base}libs/config`)
const Helper = require(`${__base}libs/helper`)
const Messages = require(`${__base}libs/messages`)

const Column = require(`${__base}models/column`)

const PrivilegeLinks = require(`${__base}services/privilegeLinks`)
const UserLinks = require(`${__base}services/userLinks`)

class ColumnRoutes {
    constructor(server) {
        server.get({path: "/columns/"}, this.browse.bind(this))
        server.get({path: "/columns/:_id"}, this.read.bind(this))
        server.put({path: "/columns/:_id"}, this.edit.bind(this))
        server.post({path: "/columns"}, this.add.bind(this))
        server.del({path: "/columns/:_id"}, this.delete.bind(this))
    }

    browse(req, res, next) {
        async.waterfall([
            (callback) => {
                const privileges = [
                    config.system.privileges.manageColumns,
                    config.system.privileges.manageLinkedColumns,
                    config.system.privileges.viewColumns,
                    config.system.privileges.viewLinkedColumns
                ]

                PrivilegeLinks.checkPrivileges(req.user._roleId, privileges, (err, foundPrivilege) => {
                    return callback(err, foundPrivilege)
                })
            },

            (foundPrivilege, callback) => {
                const query = {}

                if (req.params._boardId) {
                    query._boardId = req.params._projectId
                }

                query.removed = false

                Column.find(query)
                    .lean()
                    .exec((err, columns) => {
                        if (err) {
                            return callback(Helper.error(err))
                        } else {
                            return callback(null, foundPrivilege, columns)
                        }
                    })
            },

            (foundPrivilege, columns, callback) => {
                const privileges = [
                    config.system.privileges.manageLinkedColumns,
                    config.system.privileges.viewLinkedColumns
                ]

                if (privileges.indexOf(foundPrivilege) !== -1) {
                    async.filter(columns, (column, callback) => {
                        UserLinks.checkLink(column._id, req.user._id, (err) => {
                            if (err) {
                                return callback(null, false)
                            } else {
                                return callback(null, true)
                            }
                        })
                    }, (err, results) => callback(err, results))
                } else {
                    return callback(null, columns)
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
                    config.system.privileges.manageColumns,
                    config.system.privileges.manageLinkedColumns,
                    config.system.privileges.viewColumns,
                    config.system.privileges.viewLinkedColumns
                ]

                PrivilegeLinks.checkPrivileges(req.user._roleId, privileges, (err, foundPrivilege) => {
                    return callback(err, foundPrivilege)
                })
            },

            (foundPrivilege, callback) => {
                const privileges = [
                    config.system.privileges.manageLinkedColumns,
                    config.system.privileges.viewLinkedColumns
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

                Column.findOne(query)
                    .lean()
                    .exec((err, column) => {
                        if (err) {
                            return callback(Helper.error(err))
                        } else {
                            return callback(null, column)
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
                    config.system.privileges.manageColumns,
                    config.system.privileges.manageLinkedColumns
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

                Column.findOne(query, (err, column) => {
                    if (err) {
                        return callback(Helper.error(err))
                    } else {
                        if (!column) {
                            return callback(Helper.fail(Messages.noColumnError))
                        } else {
                            return callback(null, column)
                        }
                    }
                })
            },

            (column, callback) => {
                if (req.params._boardId) {
                    column._boardId = req.params._boardId
                }

                if (req.params.name) {
                    column.name = req.params.name
                }

                if (req.params.wipLimit) {
                    column.wipLimit = req.params.wipLimit
                }

                column.save((err) => {
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
                const privileges = [config.system.privileges.manageColumns]

                PrivilegeLinks.checkPrivileges(req.user._roleId, privileges, (err) => callback(err))
            },

            (callback) => {
                const column = new Column({
                    _boardId: req.params._boardId,
                    name: req.params.name
                })

                if (req.params.wipLimit) {
                    column.wipLimit = req.params.wipLimit
                }

                column.save((err) => {
                    if (err) {
                        return callback(Helper.fail(Messages.invalidParametersError))
                    } else {
                        return callback(null, column._id)
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
                const privileges = [config.system.privileges.manageColumns]

                PrivilegeLinks.checkPrivileges(req.user._roleId, privileges, (err) => callback(err))
            },

            (callback) => {
                const query = {
                    _id: req.params._id,
                    removed: false
                }

                Column.findOne(query, (err, column) => {
                    if (err) {
                        return callback(Helper.error(err))
                    } else {
                        if (!column) {
                            return callback(Helper.fail(Messages.noColumnError))
                        } else {
                            return callback(null, column)
                        }
                    }
                })
            },

            (column, callback) => {
                column.removed = true

                column.save((err) => {
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

module.exports = ColumnRoutes
