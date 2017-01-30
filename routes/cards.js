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

class CardRoutes {
    constructor(server) {
        server.get({path: "/cards/"}, this.browse.bind(this))
        server.get({path: "/cards/:_id"}, this.read.bind(this))
        server.put({path: "/cards/:_id"}, this.edit.bind(this))
        server.post({path: "/cards"}, this.add.bind(this))
        server.del({path: "/cards/:_id"}, this.delete.bind(this))

        server.post({path: "/cards/:_id/downgrade"}, this.downgrade.bind(this))
    }

    browse(req, res, next) {
        async.waterfall([
            (callback) => {
                const privileges = [
                    config.system.privileges.manageCards,
                    config.system.privileges.manageLinkedCards,
                    config.system.privileges.viewCards,
                    config.system.privileges.viewLinkedCards
                ]

                PrivilegeLinks.checkPrivileges(req.user._roleId, privileges, (err, foundPrivilege) => {
                    return callback(err, foundPrivilege)
                })
            },

            (foundPrivilege, callback) => {
                const query = {}

                if (req.params._columnId) {
                    query._columnId = req.params._columnId
                }

                if (req.params._swimlaneId) {
                    query._swimlaneId = req.params._swimlaneId
                }

                query.removed = false

                Card.find(query)
                    .lean()
                    .exec((err, cards) => {
                        if (err) {
                            return callback(Helper.error(err))
                        } else {
                            return callback(null, foundPrivilege, cards)
                        }
                    })
            },

            (foundPrivilege, cards, callback) => {
                const privileges = [
                    config.system.privileges.manageLinkedCards,
                    config.system.privileges.viewLinkedCards
                ]

                if (privileges.indexOf(foundPrivilege) !== -1) {
                    async.filter(cards, (card, callback) => {
                        UserLinks.checkLink(card._id, req.user._id, (err) => {
                            if (err) {
                                return callback(null, false)
                            } else {
                                return callback(null, true)
                            }
                        })
                    }, (err, results) => callback(err, results))
                } else {
                    return callback(null, cards)
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
                    config.system.privileges.manageCards,
                    config.system.privileges.manageLinkedCards,
                    config.system.privileges.viewCards,
                    config.system.privileges.viewLinkedCards
                ]

                PrivilegeLinks.checkPrivileges(req.user._roleId, privileges, (err, foundPrivilege) => {
                    return callback(err, foundPrivilege)
                })
            },

            (foundPrivilege, callback) => {
                const privileges = [
                    config.system.privileges.manageLinkedCards,
                    config.system.privileges.viewLinkedCards
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

                Card.findOne(query)
                    .lean()
                    .exec((err, card) => {
                        if (err) {
                            return callback(Helper.error(err))
                        } else {
                            return callback(null, card)
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
                    config.system.privileges.manageCards,
                    config.system.privileges.manageLinkedCards
                ]

                PrivilegeLinks.checkPrivileges(req.user._roleId, privileges, (err, foundPrivilege) => {
                    return callback(err, foundPrivilege)
                })
            },

            (foundPrivilege, callback) => {
                const privileges = [config.system.privileges.manageLinkedCards]

                if (privileges.indexOf(foundPrivilege) !== -1) {
                    UserLinks.checkLink(req.params._id, req.user._id, (err) => callback(err))
                } else {
                    return callback()
                }
            },

            (callback) => {
                if (req.params._swimlaneId) {
                    const query = {
                        _id: req.params._swimlaneId,
                        removed: false
                    }

                    Swimlane.findOne(query, (err, swimlane) => {
                        if (err) {
                            return callback(Helper.error(err))
                        } else {
                            if (!swimlane) {
                                return callback(Helper.fail(Messages.noSwimlaneError))
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
                if (req.params._columnId) {
                    const query = {
                        _id: req.params._columnId,
                        removed: false
                    }

                    Column.findOne(query, (err, column) => {
                        if (err) {
                            return callback(Helper.error(err))
                        } else {
                            if (!column) {
                                return callback(Helper.fail(Messages.noColumnError))
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
                if (req.params._priorityId) {
                    const query = {
                        _id: req.params._priorityId,
                        removed: false
                    }

                    Priority.findOne(query, (err, priority) => {
                        if (err) {
                            return callback(Helper.error(err))
                        } else {
                            if (!priority) {
                                return callback(Helper.fail(Messages.noPriorityError))
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

                Card.findOne(query, (err, card) => {
                    if (err) {
                        return callback(Helper.error(err))
                    } else {
                        if (!card) {
                            return callback(Helper.fail(Messages.noCardError))
                        } else {
                            return callback(null, card)
                        }
                    }
                })
            },

            (card, callback) => {
                if (req.params._columnId) {
                    card._columnId = req.params._columnId
                }

                if (req.params._swimlaneId) {
                    card._swimlaneId = req.params._swimlaneId
                }

                if (req.params._priorityId) {
                    card._priorityId = req.params._priorityId
                }

                if (req.params._statusId) {
                    card._statusId = req.params._statusId
                }

                if (req.params.name) {
                    card.name = req.params.name
                }

                if (req.params.description) {
                    card.description = req.params.description
                }

                const isModified = card.isModified()

                card.save((err) => {
                    if (err) {
                        return callback(Helper.fail(Messages.invalidParametersError))
                    } else {
                        return callback(null, isModified)
                    }
                })
            },

            (isModified, callback) => {
                if (isModified === true) {
                    ActivityLinks.add(req.params._id, req.user._id, config.system.activities.updateCard, (err) => {
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
                if (req.params._columnId === undefined || req.params._swimlaneId === undefined
                    || req.params._priorityId === undefined || req.params._statusId === undefined
                    || req.params.name === undefined) {

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
                if (req.params._swimlaneId) {
                    const query = {
                        _id: req.params._swimlaneId,
                        removed: false
                    }

                    Swimlane.findOne(query, (err, swimlane) => {
                        if (err) {
                            return callback(Helper.error(err))
                        } else {
                            if (!swimlane) {
                                return callback(Helper.fail(Messages.noSwimlaneError))
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
                if (req.params._columnId) {
                    const query = {
                        _id: req.params._columnId,
                        removed: false
                    }

                    Column.findOne(query, (err, column) => {
                        if (err) {
                            return callback(Helper.error(err))
                        } else {
                            if (!column) {
                                return callback(Helper.fail(Messages.noColumnError))
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
                if (req.params._priorityId) {
                    const query = {
                        _id: req.params._priorityId,
                        removed: false
                    }

                    Priority.findOne(query, (err, priority) => {
                        if (err) {
                            return callback(Helper.error(err))
                        } else {
                            if (!priority) {
                                return callback(Helper.fail(Messages.noPriorityError))
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
                const card = new Card({
                    _columnId: req.params._columnId,
                    _swimlaneId: req.params._swimlaneId,
                    _priorityId: req.params._priorityId,
                    _statusId: req.params._statusId,
                    name: req.params.name
                })

                if (req.params.description) {
                    card.description = req.params.description
                }

                card.save((err) => {
                    if (err) {
                        return callback(Helper.fail(Messages.invalidParametersError))
                    } else {
                        return callback(null, card._id)
                    }
                })
            },

            (cardId, callback) => {
                ActivityLinks.add(cardId, req.user._id, config.system.activities.addCard, (err) => {
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

                Card.findOne(query, (err, card) => {
                    if (err) {
                        return callback(Helper.error(err))
                    } else {
                        if (!card) {
                            return callback(Helper.fail(Messages.noCardError))
                        } else {
                            return callback(null, card)
                        }
                    }
                })
            },

            (card, callback) => {
                card.removed = true

                card.save((err) => {
                    if (err) {
                        return callback(Helper.fail(Messages.invalidParametersError))
                    } else {
                        return callback()
                    }
                })
            },

            (callback) => {
                ActivityLinks.add(req.params._id, req.user._id, config.system.activities.deleteCard, (err) => {
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

    downgrade(req, res, next) {
        async.waterfall([
            (callback) => {
                if (req.params._id === undefined || req.params._newCardId === undefined
                    || req.params._newStatusId === undefined) {

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
                    _id: req.params._newCardId,
                    removed: false
                }

                Card.findOne(query)
                    .lean()
                    .exec((err, newCard) => {
                        if (err) {
                            return callback(Helper.error(err))
                        } else {
                            if (!newCard) {
                                return callback(Helper.fail(Messages.noNewCardError))
                            } else {
                                return callback()
                            }
                        }
                    })
            },

            (callback) => {
                const query = {
                    _id: req.params._newStatusId,
                    level: config.system.levels.task,
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

                Card.findOne(query, (err, card) => {
                    if (err) {
                        return callback(Helper.error(err))
                    } else {
                        if (!card) {
                            return callback(Helper.fail(Messages.noCardError))
                        } else {
                            return callback(null, card)
                        }
                    }
                })
            },

            (card, callback) => {
                const task = new Task({
                    _cardId: req.params._newCardId,
                    _statusId: req.params._newStatusId,
                    name: card.name
                })

                if (card.description) {
                    task.description = card.description
                }

                task.save((err) => {
                    if (err) {
                        return callback(Helper.fail(Messages.invalidParametersError))
                    } else {
                        return callback(null, card, task._id)
                    }
                })
            },

            (card, taskId, callback) => {
                card.removed = true

                card.save((err) => {
                    if (err) {
                        return callback(Helper.fail(Messages.invalidParametersError))
                    } else {
                        return callback(null, taskId)
                    }
                })
            },

            (taskId, callback) => {
                ActivityLinks.add(taskId, req.user._id, config.system.activities.downgradeCard, (err) => {
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
}

module.exports = CardRoutes
