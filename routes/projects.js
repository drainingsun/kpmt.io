"use strict"

const async = require("async")

const config = require(`${__base}libs/config`)
const Helper = require(`${__base}libs/helper`)
const Messages = require(`${__base}libs/messages`)

const Project = require(`${__base}models/project`)

const PrivilegeLinks = require(`${__base}services/privilegeLinks`)
const UserLinks = require(`${__base}services/userLinks`)

class ProjectRoutes {
    constructor(server) {
        server.get({path: "/projects/"}, this.browse.bind(this))
        server.get({path: "/projects/:_id"}, this.read.bind(this))
        server.put({path: "/projects/:_id"}, this.edit.bind(this))
        server.post({path: "/projects"}, this.add.bind(this))
        server.del({path: "/projects/:_id"}, this.delete.bind(this))
    }

    browse(req, res, next) {
        async.waterfall([
            (callback) => {
                const privileges = [
                    config.system.privileges.manageProjects,
                    config.system.privileges.manageLinkedProjects,
                    config.system.privileges.viewProjects,
                    config.system.privileges.viewLinkedProjects
                ]

                PrivilegeLinks.checkPrivileges(req.user._roleId, privileges, (err, foundPrivilege) => {
                    return callback(err, foundPrivilege)
                })
            },

            (foundPrivilege, callback) => {
                const query = {removed: false}

                Project.find(query)
                    .lean()
                    .exec((err, projects) => {
                        if (err) {
                            return callback(Helper.error(err))
                        } else {
                            return callback(null, foundPrivilege, projects)
                        }
                    })
            },

            (foundPrivilege, projects, callback) => {
                const privileges = [
                    config.system.privileges.manageLinkedProjects,
                    config.system.privileges.viewLinkedProjects
                ]

                if (privileges.indexOf(foundPrivilege) !== -1) {
                    async.filter(projects, (project, callback) => {
                        UserLinks.checkLink(project._id, req.user._id, (err) => {
                            if (err) {
                                return callback(null, false)
                            } else {
                                return callback(null, true)
                            }
                        })
                    }, (err, results) => callback(err, results))
                } else {
                    return callback(null, projects)
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
                    config.system.privileges.manageProjects,
                    config.system.privileges.manageLinkedProjects,
                    config.system.privileges.viewProjects,
                    config.system.privileges.viewLinkedProjects
                ]

                PrivilegeLinks.checkPrivileges(req.user._roleId, privileges, (err, foundPrivilege) => {
                    return callback(err, foundPrivilege)
                })
            },

            (foundPrivilege, callback) => {
                const privileges = [
                    config.system.privileges.manageLinkedProjects,
                    config.system.privileges.viewLinkedProjects
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

                Project.findOne(query)
                    .lean()
                    .exec((err, project) => {
                        if (err) {
                            return callback(Helper.error(err))
                        } else {
                            return callback(null, project)
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
                    config.system.privileges.manageProjects,
                    config.system.privileges.manageLinkedProjects
                ]

                PrivilegeLinks.checkPrivileges(req.user._roleId, privileges, (err, foundPrivilege) => {
                    return callback(err, foundPrivilege)
                })
            },

            (foundPrivilege, callback) => {
                const privileges = [config.system.privileges.manageLinkedProjects]

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

                Project.findOne(query, (err, project) => {
                    if (err) {
                        return callback(Helper.error(err))
                    } else {
                        if (!project) {
                            return callback(Helper.fail(Messages.noProjectError))
                        } else {
                            return callback(null, project)
                        }
                    }
                })
            },

            (project, callback) => {
                if (req.params.name) {
                    project.name = req.params.name
                }

                project.save((err) => {
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
                const privileges = [config.system.privileges.manageProjects]

                PrivilegeLinks.checkPrivileges(req.user._roleId, privileges, (err) => callback(err))
            },

            (callback) => {
                const project = new Project({name: req.params.name})

                project.save((err) => {
                    if (err) {
                        return callback(Helper.fail(Messages.invalidParametersError))
                    } else {
                        return callback(null, project._id)
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
                const privileges = [config.system.privileges.manageProjects]

                PrivilegeLinks.checkPrivileges(req.user._roleId, privileges, (err) => callback(err))
            },

            (callback) => {
                const query = {
                    _id: req.params._id,
                    removed: false
                }

                Project.findOne(query, (err, project) => {
                    if (err) {
                        return callback(Helper.error(err))
                    } else {
                        if (!project) {
                            return callback(Helper.fail(Messages.noProjectError))
                        } else {
                            return callback(null, project)
                        }
                    }
                })
            },

            (project, callback) => {
                project.removed = true

                project.save((err) => {
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

module.exports = ProjectRoutes
