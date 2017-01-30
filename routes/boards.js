"use strict"

const async = require("async")

const config = require(`${__base}libs/config`)
const Helper = require(`${__base}libs/helper`)
const Messages = require(`${__base}libs/messages`)

const Board = require(`${__base}models/board`)

const PrivilegeLinks = require(`${__base}services/privilegeLinks`)
const UserLinks = require(`${__base}services/userLinks`)

class BoardRoutes {
    constructor(server) {
        server.get({path: "/boards/"}, this.browse.bind(this))
        server.get({path: "/boards/:_id"}, this.read.bind(this))
        server.put({path: "/boards/:_id"}, this.edit.bind(this))
        server.post({path: "/boards"}, this.add.bind(this))
        server.del({path: "/boards/:_id"}, this.delete.bind(this))
    }

    browse(req, res, next) {
        async.waterfall([
            (callback) => {
                const privileges = [
                    config.system.privileges.manageBoards,
                    config.system.privileges.manageLinkedBoards,
                    config.system.privileges.viewBoards,
                    config.system.privileges.viewLinkedBoards
                ]

                PrivilegeLinks.checkPrivileges(req.user._roleId, privileges, (err, foundPrivilege) => {
                    return callback(err, foundPrivilege)
                })
            },

            (foundPrivilege, callback) => {
                const query = {}

                if (req.params._projectId) {
                    query._projectId = req.params._projectId
                }

                query.removed = false

                Board.find(query)
                    .lean()
                    .exec((err, boards) => {
                        if (err) {
                            return callback(Helper.error(err))
                        } else {
                            return callback(null, foundPrivilege, boards)
                        }
                    })
            },

            (foundPrivilege, boards, callback) => {
                const privileges = [
                    config.system.privileges.manageLinkedBoards,
                    config.system.privileges.viewLinkedBoards
                ]

                if (privileges.indexOf(foundPrivilege) !== -1) {
                    async.filter(boards, (board, callback) => {
                        UserLinks.checkLink(board._id, req.user._id, (err) => {
                            if (err) {
                                return callback(null, false)
                            } else {
                                return callback(null, true)
                            }
                        })
                    }, (err, results) => callback(err, results))
                } else {
                    return callback(null, boards)
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
                    config.system.privileges.manageBoards,
                    config.system.privileges.manageLinkedBoards,
                    config.system.privileges.viewBoards,
                    config.system.privileges.viewLinkedBoards
                ]

                PrivilegeLinks.checkPrivileges(req.user._roleId, privileges, (err, foundPrivilege) => {
                    return callback(err, foundPrivilege)
                })
            },

            (foundPrivilege, callback) => {
                const privileges = [
                    config.system.privileges.manageLinkedBoards,
                    config.system.privileges.viewLinkedBoards
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

                Board.findOne(query)
                    .lean()
                    .exec((err, board) => {
                        if (err) {
                            return callback(Helper.error(err))
                        } else {
                            return callback(null, board)
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
                    config.system.privileges.manageBoards,
                    config.system.privileges.manageLinkedBoards
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

                Board.findOne(query, (err, board) => {
                    if (err) {
                        return callback(Helper.error(err))
                    } else {
                        if (!board) {
                            return callback(Helper.fail(Messages.noBoardError))
                        } else {
                            return callback(null, board)
                        }
                    }
                })
            },

            (board, callback) => {
                if (req.params._projectId) {
                    board._projectId = req.params._projectId
                }

                if (req.params.name) {
                    board.name = req.params.name
                }

                board.save((err) => {
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
                if (req.params._projectId === undefined || req.params.name === undefined) {
                    return callback(Helper.fail(Messages.missingParametersError))
                } else {
                    return callback()
                }
            },

            (callback) => {
                const privileges = [config.system.privileges.manageBoards]

                PrivilegeLinks.checkPrivileges(req.user._roleId, privileges, (err) => callback(err))
            },

            (callback) => {
                const board = new Board({
                    _projectId: req.params._projectId,
                    name: req.params.name
                })

                board.save((err) => {
                    if (err) {
                        return callback(Helper.fail(Messages.invalidParametersError))
                    } else {
                        return callback(null, board._id)
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
                const privileges = [config.system.privileges.manageBoards]

                PrivilegeLinks.checkPrivileges(req.user._roleId, privileges, (err) => callback(err))
            },

            (callback) => {
                const query = {
                    _id: req.params._id,
                    removed: false
                }

                Board.findOne(query, (err, board) => {
                    if (err) {
                        return callback(Helper.error(err))
                    } else {
                        if (!board) {
                            return callback(Helper.fail(Messages.noBoardError))
                        } else {
                            return callback(null, board)
                        }
                    }
                })
            },

            (board, callback) => {
                board.removed = true

                board.save((err) => {
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

module.exports = BoardRoutes
