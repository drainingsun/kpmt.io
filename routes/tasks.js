"use strict"

const async = require("async")

const config = require(`${__base}libs/config`)
const Helper = require(`${__base}libs/helper`)
const Messages = require(`${__base}libs/messages`)

const Card = require(`${__base}models/card`)
const Column = require(`${__base}models/column`)
const Priority = require(`${__base}models/priority`)
const Status = require(`${__base}models/status`)
const Swimlane = require(`${__base}models/swimlane`)
const Task = require(`${__base}models/task`)

const PrivilegeLinks = require(`${__base}services/privilegeLinks`)
const UserLinks = require(`${__base}services/userLinks`)
const ActivityLinks = require(`${__base}services/activityLinks`)

class TaskRoutes {
    constructor(server) {
        server.get({path: "/tasks/"}, this.browse.bind(this))
        server.get({path: "/tasks/:_id"}, this.read.bind(this))
        server.put({path: "/tasks/:_id"}, this.edit.bind(this))
        server.post({path: "/tasks"}, this.add.bind(this))
        server.del({path: "/tasks/:_id"}, this.delete.bind(this))
        server.post({path: "/tasks/:_id/upgrade"}, this.upgrade.bind(this))
    }

    browse(req, res, next) {
        async.waterfall([
            (callback) => {
                const privileges = [
                    config.system.privileges.manageTasks,
                    config.system.privileges.manageLinkedTasks,
                    config.system.privileges.viewTasks,
                    config.system.privileges.viewLinkedTasks
                ]

                PrivilegeLinks.checkPrivileges(req.user._roleId, privileges, (err, foundPrivilege) => {
                    return callback(err, foundPrivilege)
                })
            },

            (foundPrivilege, callback) => {
                const query = {}

                if (req.params._cardId) {
                    query._cardId = req.params._cardId
                }

                query.removed = false

                Task.find(query)
                    .lean()
                    .exec((err, tasks) => {
                        if (err) {
                            return callback(Helper.error(err))
                        } else {
                            return callback(null, foundPrivilege, tasks)
                        }
                    })
            },

            (foundPrivilege, tasks, callback) => {
                const privileges = [
                    config.system.privileges.manageLinkedTasks,
                    config.system.privileges.viewLinkedTasks
                ]

                if (privileges.indexOf(foundPrivilege) !== -1) {
                    async.filter(tasks, (task, callback) => {
                        UserLinks.checkLink(task._id, req.user._id, (err) => {
                            if (err) {
                                return callback(null, false)
                            } else {
                                return callback(null, true)
                            }
                        })
                    }, (err, results) => callback(err, results))
                } else {
                    return callback(null, tasks)
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
                    config.system.privileges.manageTasks,
                    config.system.privileges.manageLinkedTasks,
                    config.system.privileges.viewTasks,
                    config.system.privileges.viewLinkedTasks
                ]

                PrivilegeLinks.checkPrivileges(req.user._roleId, privileges, (err, foundPrivilege) => {
                    return callback(err, foundPrivilege)
                })
            },

            (foundPrivilege, callback) => {
                const privileges = [
                    config.system.privileges.manageLinkedTasks,
                    config.system.privileges.viewLinkedTasks
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

                Task.findOne(query)
                    .lean()
                    .exec((err, task) => {
                        if (err) {
                            return callback(Helper.error(err))
                        } else {
                            return callback(null, task)
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
                    config.system.privileges.manageTasks,
                    config.system.privileges.manageLinkedTasks
                ]

                PrivilegeLinks.checkPrivileges(req.user._roleId, privileges, (err, foundPrivilege) => {
                    return callback(err, foundPrivilege)
                })
            },

            (foundPrivilege, callback) => {
                const privileges = [config.system.privileges.manageLinkedTasks]

                if (privileges.indexOf(foundPrivilege) !== -1) {
                    UserLinks.checkLink(req.params._id, req.user._id, (err) => callback(err))
                } else {
                    return callback()
                }
            },

            (callback) => {
                if (req.params._cardId) {
                    const query = {
                        _id: req.params._cardId,
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
                } else {
                    return callback()
                }
            },

            (callback) => {
                if (req.params._statusId) {
                    const query = {
                        _id: req.params._statusId,
                        removed: false
                    }

                    Status.findOne(query, (err, status) => {
                        if (err) {
                            return callback(Helper.error(err))
                        } else {
                            if (!status) {
                                return callback(Helper.fail(Messages.noStatusError))
                            } else {
                                return callback()
                            }
                        }
                    })
                } else {
                    return callback()
                }
            },

            (callback) => {
                const query = {
                    _id: req.params._id,
                    removed: false
                }

                Task.findOne(query, (err, task) => {
                    if (err) {
                        return callback(Helper.error(err))
                    } else {
                        if (!task) {
                            return callback(Helper.fail(Messages.noTaskError))
                        } else {
                            return callback(null, task)
                        }
                    }
                })
            },

            (task, callback) => {
                if (req.params._cardId) {
                    task._cardId = req.params._cardId
                }

                if (req.params._statusId) {
                    task._statusId = req.params._statusId
                }

                if (req.params.name) {
                    task.name = req.params.name
                }

                if (req.params.description) {
                    task.description = req.params.description
                }

                const isModified = task.isModified()

                task.save((err) => {
                    if (err) {
                        return callback(Helper.fail(Messages.invalidParametersError))
                    } else {
                        return callback(null, isModified)
                    }
                })
            },

            (isModified, callback) => {
                if (isModified === true) {
                    ActivityLinks.add(req.params._id, req.user._id, config.system.activities.updateTask, (err) => {
                        return callback(err)
                    })
                } else {
                    return callback()
                }
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
                if (req.params._cardId === undefined || req.params._statusId === undefined
                    || req.params.name === undefined) {

                    return callback(Helper.fail(Messages.missingParametersError))
                } else {
                    return callback()
                }
            },

            (callback) => {
                const privileges = [config.system.privileges.manageTasks]

                PrivilegeLinks.checkPrivileges(req.user._roleId, privileges, (err) => callback(err))
            },

            (callback) => {
                if (req.params._cardId) {
                    const query = {
                        _id: req.params._cardId,
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
                } else {
                    return callback()
                }
            },

            (callback) => {
                if (req.params._statusId) {
                    const query = {
                        _id: req.params._statusId,
                        removed: false
                    }

                    Status.findOne(query, (err, status) => {
                        if (err) {
                            return callback(Helper.error(err))
                        } else {
                            if (!status) {
                                return callback(Helper.fail(Messages.noStatusError))
                            } else {
                                return callback()
                            }
                        }
                    })
                } else {
                    return callback()
                }
            },

            (callback) => {
                const task = new Task({
                    _cardId: req.params._cardId,
                    _statusId: req.params._statusId,
                    name: req.params.name
                })

                if (req.params.description) {
                    task.description = req.params.description
                }

                task.save((err) => {
                    if (err) {
                        return callback(Helper.fail(Messages.invalidParametersError))
                    } else {
                        return callback(null, task._id)
                    }
                })
            },

            (taskId, callback) => {
                ActivityLinks.add(taskId, req.user._id, config.system.activities.addTask, (err) => {
                    return callback(err, taskId)
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
                const privileges = [config.system.privileges.manageCards]

                PrivilegeLinks.checkPrivileges(req.user._roleId, privileges, (err) => callback(err))
            },

            (callback) => {
                const query = {
                    _id: req.params._id,
                    removed: false
                }

                Task.findOne(query, (err, task) => {
                    if (err) {
                        return callback(Helper.error(err))
                    } else {
                        if (!task) {
                            return callback(Helper.fail(Messages.noTaskError))
                        } else {
                            return callback(null, task)
                        }
                    }
                })
            },

            (task, callback) => {
                task.removed = true

                task.save((err) => {
                    if (err) {
                        return callback(Helper.fail(Messages.invalidParametersError))
                    } else {
                        return callback()
                    }
                })
            },

            (callback) => {
                ActivityLinks.add(req.params._id, req.user._id, config.system.activities.deleteTask, (err) => {
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

    upgrade(req, res, next) {
        async.waterfall([
            (callback) => {
                if (req.params._id === undefined || req.params._newSwimlaneId === undefined
                    || req.params._newColumnId === undefined || req.params._newPriorityId === undefined
                    || req.params._newStatusId === undefined) {

                    return callback(Helper.fail(Messages.missingParametersError))
                } else {
                    return callback()
                }
            },

            (callback) => {
                const privileges = [config.system.privileges.manageTasks]

                PrivilegeLinks.checkPrivileges(req.user._roleId, privileges, (err) => callback(err))
            },

            (callback) => {
                const query = {
                    _id: req.params._newSwimlaneId,
                    removed: false
                }

                Swimlane.findOne(query)
                    .lean()
                    .exec((err, swimlane) => {
                        if (err) {
                            return callback(Helper.error(err))
                        } else {
                            if (!swimlane) {
                                return callback(Helper.fail(Messages.noNewSwimlaneError))
                            } else {
                                return callback()
                            }
                        }
                    })
            },

            (callback) => {
                const query = {
                    _id: req.params._newColumnId,
                    removed: false
                }

                Column.findOne(query)
                    .lean()
                    .exec((err, column) => {
                        if (err) {
                            return callback(Helper.error(err))
                        } else {
                            if (!column) {
                                return callback(Helper.fail(Messages.noNewColumnError))
                            } else {
                                return callback()
                            }
                        }
                    })
            },

            (callback) => {
                const query = {
                    _id: req.params._newPriorityId,
                    level: config.system.levels.card,
                    removed: false
                }

                Priority.findOne(query)
                    .lean()
                    .exec((err, priority) => {
                        if (err) {
                            return callback(Helper.error(err))
                        } else {
                            if (!priority) {
                                return callback(Helper.fail(Messages.noNewColumnError))
                            } else {
                                return callback()
                            }
                        }
                    })
            },

            (callback) => {
                const query = {
                    _id: req.params._newStatusId,
                    level: config.system.levels.card,
                    removed: false
                }

                Status.findOne(query)
                    .lean()
                    .exec((err, status) => {
                        if (err) {
                            return callback(Helper.error(err))
                        } else {
                            if (!status) {
                                return callback(Helper.fail(Messages.noNewStatusError))
                            } else {
                                return callback()
                            }
                        }
                    })
            },

            (callback) => {
                const query = {
                    _id: req.params._id,
                    removed: false
                }

                Task.findOne(query, (err, task) => {
                    if (err) {
                        return callback(Helper.error(err))
                    } else {
                        if (!task) {
                            return callback(Helper.fail(Messages.noTaskError))
                        } else {
                            return callback(null, task)
                        }
                    }
                })
            },

            (task, callback) => {
                const card = new Card({
                    _columnId: req.params._newColumnId,
                    _swimlaneId: req.params._newSwimlaneId,
                    _priorityId: req.params._newPriorityId,
                    _statusId: req.params._newStatusId,
                    name: task.name
                })

                if (task.description) {
                    card.description = task.description
                }

                card.save((err) => {
                    if (err) {
                        return callback(Helper.fail(Messages.invalidParametersError))
                    } else {
                        return callback(null, task, card._id)
                    }
                })
            },

            (task, cardId, callback) => {
                task.removed = true

                task.save((err) => {
                    if (err) {
                        return callback(Helper.fail(Messages.invalidParametersError))
                    } else {
                        return callback(null, cardId)
                    }
                })
            },

            (cardId, callback) => {
                ActivityLinks.add(cardId, req.user._id, config.system.activities.upgradeTask, (err) => {
                    return callback(err, cardId)
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
}

module.exports = TaskRoutes
