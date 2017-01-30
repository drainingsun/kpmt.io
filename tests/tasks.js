"use strict"

global.__base = __dirname + "/../"

const async = require("async")
const jwt = require("jsonwebtoken")
const request = require("supertest")
const should = require("should") // eslint-disable-line no-unused-vars

const app = require(`${__base}app`)

const config = require(`${__base}libs/config`)
const mongo = require(`${__base}libs/mongo`)

const ActivityLink = require(`${__base}models/activityLink`)
const Board = require(`${__base}models/board`)
const Card = require(`${__base}models/card`)
const Column = require(`${__base}models/column`)
const Priority = require(`${__base}models/priority`)
const PrivilegeLink = require(`${__base}models/privilegeLink`)
const Project = require(`${__base}models/project`)
const Role = require(`${__base}models/role`)
const Status = require(`${__base}models/status`)
const Swimlane = require(`${__base}models/swimlane`)
const Task = require(`${__base}models/task`)
const User = require(`${__base}models/user`)
const UserLink = require(`${__base}models/userLink`)

const taskRoutes = () => {
    const beforeEachDescribe = (done) => {
        mongo.client.connection.db.dropDatabase((err) => done(err))
    }

    beforeEach(beforeEachDescribe)

    const describeBrowse = () => {
        const role = new Role({name: "Role #1"})

        const privilegeLink = new PrivilegeLink({
            _roleId: role._id,
            privilege: config.system.privileges.viewLinkedTasks
        })

        const user = new User({
            _roleId: role._id,
            email: "user@kpmt.io",
            password: "user@kpmt.io"
        })

        const message = {
            _id: user._id.toString(),
            _roleId: role._id.toString()
        }
        const secret = config.tokens.user.secret
        const options = {expiresIn: config.tokens.user.expire}
        const token = jwt.sign(message, secret, options)

        const project = new Project({name: "Project #1"})

        const board = new Board({
            _projectId: project._id,
            name: "Board #1"
        })

        const column = new Column({
            _boardId: board._id,
            name: "Column #1"
        })

        const swimlane = new Swimlane({
            _boardId: board._id,
            name: "Swimlane #1"
        })

        const priority = new Priority({
            level: config.system.levels.card,
            name: "Priority #1"
        })

        const status = new Status({
            level: config.system.levels.card,
            name: "Status #1"
        })

        const card = new Card({
            _columnId: column._id,
            _swimlaneId: swimlane._id,
            _priorityId: priority._id,
            _statusId: status._id,
            name: "Card Name #1"
        })

        const status2 = new Status({
            level: config.system.levels.task,
            name: "Status #2"
        })

        const task = new Task({
            _cardId: card._id,
            _statusId: status2._id,
            name: "Task Name #1",
            description: "Task Description #1"
        })

        const userLink = new UserLink({
            _levelId: task._id,
            _userId: user._id
        })

        const beforeEachTest = (done) => {
            async.parallel([
                (callback) => {
                    board.save((err) => callback(err))
                },

                (callback) => {
                    card.save((err) => callback(err))
                },

                (callback) => {
                    column.save((err) => callback(err))
                },

                (callback) => {
                    priority.save((err) => callback(err))
                },

                (callback) => {
                    privilegeLink.save((err) => callback(err))
                },

                (callback) => {
                    project.save((err) => callback(err))
                },

                (callback) => {
                    status.save((err) => callback(err))
                },

                (callback) => {
                    status2.save((err) => callback(err))
                },

                (callback) => {
                    swimlane.save((err) => callback(err))
                },

                (callback) => {
                    task.save((err) => callback(err))
                },

                (callback) => {
                    user.save((err) => callback(err))
                },

                (callback) => {
                    userLink.save((err) => callback(err))
                }
            ], (err) => done(err))
        }

        beforeEach(beforeEachTest)

        const testBrowse = (done) => {
            const params = {_cardId: card._id}

            request(app)
                .get("/tasks")
                .set("Authorization", token)
                .send(params)
                .expect(200)
                .end(function (err, res) {
                    if (err) {
                        return done(err)
                    } else {
                        res.body.should.have.property("status")
                        res.body.status.should.be.equal("success")

                        res.body.should.have.property("data")
                        res.body.data.should.have.length(1)

                        res.body.data[0]._id.should.be.equal(task._id.toString())
                        res.body.data[0]._cardId.should.be.equal(task._cardId.toString())
                        res.body.data[0]._statusId.should.be.equal(task._statusId.toString())
                        res.body.data[0].name.should.be.equal(task.name)
                        res.body.data[0].description.should.be.equal(task.description)
                        res.body.data[0].removed.should.be.false()

                        return done()
                    }
                })
        }

        it("Should browse tasks", testBrowse)
    }

    describe("Browse", describeBrowse)

    const describeRead = () => {
        const role = new Role({name: "Role #1"})

        const privilegeLink = new PrivilegeLink({
            _roleId: role._id,
            privilege: config.system.privileges.viewTasks
        })

        const user = new User({
            _roleId: role._id,
            email: "user@kpmt.io",
            password: "user@kpmt.io"
        })

        const message = {
            _id: user._id.toString(),
            _roleId: role._id.toString()
        }
        const secret = config.tokens.user.secret
        const options = {expiresIn: config.tokens.user.expire}
        const token = jwt.sign(message, secret, options)

        const project = new Project({name: "Project #1"})

        const board = new Board({
            _projectId: project._id,
            name: "Board #1"
        })

        const column = new Column({
            _boardId: board._id,
            name: "Column #1"
        })

        const swimlane = new Swimlane({
            _boardId: board._id,
            name: "Swimlane #1"
        })

        const priority = new Priority({
            level: config.system.levels.card,
            name: "Priority #1"
        })

        const status = new Status({
            level: config.system.levels.card,
            name: "Status #1"
        })

        const card = new Card({
            _columnId: column._id,
            _swimlaneId: swimlane._id,
            _priorityId: priority._id,
            _statusId: status._id,
            name: "Card Name #1"
        })

        const status2 = new Status({
            level: config.system.levels.task,
            name: "Status #2"
        })

        const task = new Task({
            _cardId: card._id,
            _statusId: status2._id,
            name: "Task Name #1",
            description: "Task Description #1"
        })

        const beforeEachTest = (done) => {
            async.parallel([
                (callback) => {
                    board.save((err) => callback(err))
                },

                (callback) => {
                    card.save((err) => callback(err))
                },

                (callback) => {
                    column.save((err) => callback(err))
                },

                (callback) => {
                    priority.save((err) => callback(err))
                },

                (callback) => {
                    privilegeLink.save((err) => callback(err))
                },

                (callback) => {
                    project.save((err) => callback(err))
                },

                (callback) => {
                    role.save((err) => callback(err))
                },

                (callback) => {
                    status.save((err) => callback(err))
                },

                (callback) => {
                    status2.save((err) => callback(err))
                },

                (callback) => {
                    swimlane.save((err) => callback(err))
                },

                (callback) => {
                    task.save((err) => callback(err))
                },

                (callback) => {
                    user.save((err) => callback(err))
                }
            ], (err) => done(err))
        }

        beforeEach(beforeEachTest)

        const testRead = (done) => {
            request(app)
                .get(`/tasks/${task._id}`)
                .set("Authorization", token)
                .send()
                .expect(200)
                .end(function (err, res) {
                    if (err) {
                        return done(err)
                    } else {
                        res.body.should.have.property("status")
                        res.body.status.should.be.equal("success")

                        res.body.should.have.property("data")

                        res.body.data._id.should.be.equal(task._id.toString())
                        res.body.data._cardId.should.be.equal(task._cardId.toString())
                        res.body.data._statusId.should.be.equal(task._statusId.toString())
                        res.body.data.name.should.be.equal(task.name)
                        res.body.data.description.should.be.equal(task.description)
                        res.body.data.removed.should.be.false()

                        return done()
                    }
                })
        }

        it("Should read a task", testRead)
    }

    describe("Read", describeRead)

    const describeEdit = () => {
        const role = new Role({name: "Role #1"})

        const privilegeLink = new PrivilegeLink({
            _roleId: role._id,
            privilege: config.system.privileges.manageLinkedTasks
        })

        const user = new User({
            _roleId: role._id,
            email: "user@kpmt.io",
            password: "user@kpmt.io"
        })

        const message = {
            _id: user._id.toString(),
            _roleId: role._id.toString()
        }
        const secret = config.tokens.user.secret
        const options = {expiresIn: config.tokens.user.expire}
        const token = jwt.sign(message, secret, options)

        const project = new Project({name: "Project #1"})

        const board = new Board({
            _projectId: project._id,
            name: "Board #1"
        })

        const column = new Column({
            _boardId: board._id,
            name: "Column #1"
        })

        const swimlane = new Swimlane({
            _boardId: board._id,
            name: "Swimlane #1"
        })

        const priority = new Priority({
            level: config.system.levels.card,
            name: "Priority #1"
        })

        const status = new Status({
            level: config.system.levels.card,
            name: "Status #1"
        })

        const card = new Card({
            _columnId: column._id,
            _swimlaneId: swimlane._id,
            _priorityId: priority._id,
            _statusId: status._id,
            name: "Card Name #1"
        })

        const status2 = new Status({
            level: config.system.levels.task,
            name: "Status #2"
        })

        const task = new Task({
            _cardId: card._id,
            _statusId: status2._id,
            name: "Task Name #1",
            description: "Task Description #1"
        })

        const userLink = new UserLink({
            _levelId: task._id,
            _userId: user._id
        })

        const beforeEachTest = (done) => {
            async.parallel([
                (callback) => {
                    board.save((err) => callback(err))
                },

                (callback) => {
                    card.save((err) => callback(err))
                },

                (callback) => {
                    column.save((err) => callback(err))
                },

                (callback) => {
                    priority.save((err) => callback(err))
                },

                (callback) => {
                    privilegeLink.save((err) => callback(err))
                },

                (callback) => {
                    project.save((err) => callback(err))
                },

                (callback) => {
                    status.save((err) => callback(err))
                },

                (callback) => {
                    status2.save((err) => callback(err))
                },

                (callback) => {
                    swimlane.save((err) => callback(err))
                },

                (callback) => {
                    task.save((err) => callback(err))
                },

                (callback) => {
                    user.save((err) => callback(err))
                },

                (callback) => {
                    userLink.save((err) => callback(err))
                }
            ], (err) => done(err))
        }

        beforeEach(beforeEachTest)

        const testEdit = (done) => {
            const params = {
                _cardId: card._id,
                _statusId: status2._id,
                name: "Task Name #2",
                description: "Task Description #2"
            }

            request(app)
                .put(`/tasks/${task._id}`)
                .set("Authorization", token)
                .send(params)
                .expect(200)
                .end(function (err, res) {
                    if (err) {
                        return done(err)
                    } else {
                        res.body.should.have.property("status")
                        res.body.status.should.be.equal("success")

                        res.body.should.have.property("data")
                        ;(res.body.data === null).should.be.true()

                        async.parallel([
                            (callback) => {
                                Task.find((err, tasks) => {
                                    if (err) {
                                        return callback(err)
                                    } else {
                                        tasks.should.have.length(1)

                                        tasks[0]._id.toString().should.be.equal(task._id.toString())
                                        tasks[0]._cardId.toString().should.be.equal(params._cardId.toString())
                                        tasks[0]._statusId.toString().should.be.equal(params._statusId.toString())
                                        tasks[0].name.should.be.equal(params.name)
                                        tasks[0].description.should.be.equal(params.description)
                                        tasks[0].removed.should.be.false()

                                        return callback()
                                    }
                                })
                            },

                            (callback) => {
                                ActivityLink.find((err, activityLinks) => {
                                    if (err) {
                                        return callback(err)
                                    } else {
                                        activityLinks.should.have.length(1)

                                        activityLinks[0]._levelId.toString().should.be.equal(task._id.toString())
                                        activityLinks[0]._userId.toString().should.be.equal(user._id.toString())
                                        activityLinks[0].name.should.be.equal(config.system.activities.updateTask)

                                        return callback()
                                    }
                                })
                            }
                        ], (err) => done(err))
                    }
                })
        }

        it("Should edit a task", testEdit)
    }

    describe("Edit", describeEdit)

    const describeAdd = () => {
        const role = new Role({name: "Role #1"})

        const privilegeLink = new PrivilegeLink({
            _roleId: role._id,
            privilege: config.system.privileges.manageTasks
        })

        const user = new User({
            _roleId: role._id,
            email: "user@kpmt.io",
            password: "user@kpmt.io"
        })

        const message = {
            _id: user._id.toString(),
            _roleId: role._id.toString()
        }
        const secret = config.tokens.user.secret
        const options = {expiresIn: config.tokens.user.expire}
        const token = jwt.sign(message, secret, options)

        const project = new Project({name: "Project #1"})

        const board = new Board({
            _projectId: project._id,
            name: "Board #1"
        })

        const column = new Column({
            _boardId: board._id,
            name: "Column #1"
        })

        const swimlane = new Swimlane({
            _boardId: board._id,
            name: "Swimlane #1"
        })

        const priority = new Priority({
            level: config.system.levels.card,
            name: "Priority #1"
        })

        const status = new Status({
            level: config.system.levels.card,
            name: "Status #1"
        })

        const card = new Card({
            _columnId: column._id,
            _swimlaneId: swimlane._id,
            _priorityId: priority._id,
            _statusId: status._id,
            name: "Card Name #1"
        })

        const status2 = new Status({
            level: config.system.levels.task,
            name: "Status #2"
        })

        const beforeEachTest = (done) => {
            async.parallel([
                (callback) => {
                    board.save((err) => callback(err))
                },

                (callback) => {
                    card.save((err) => callback(err))
                },

                (callback) => {
                    column.save((err) => callback(err))
                },

                (callback) => {
                    priority.save((err) => callback(err))
                },

                (callback) => {
                    privilegeLink.save((err) => callback(err))
                },

                (callback) => {
                    project.save((err) => callback(err))
                },

                (callback) => {
                    role.save((err) => callback(err))
                },

                (callback) => {
                    status.save((err) => callback(err))
                },

                (callback) => {
                    status2.save((err) => callback(err))
                },

                (callback) => {
                    swimlane.save((err) => callback(err))
                },

                (callback) => {
                    user.save((err) => callback(err))
                }
            ], (err) => done(err))
        }

        beforeEach(beforeEachTest)

        const testAdd = (done) => {
            const params = {
                _cardId: card._id,
                _statusId: status2._id,
                name: "Task Name #1",
                description: "Task Description #1"
            }

            request(app)
                .post("/tasks")
                .set("Authorization", token)
                .send(params)
                .expect(200)
                .end(function (err, res) {
                    if (err) {
                        return done(err)
                    } else {
                        res.body.should.have.property("status")
                        res.body.status.should.be.equal("success")

                        res.body.should.have.property("data")

                        async.parallel([
                            (callback) => {
                                Task.find((err, tasks) => {
                                    if (err) {
                                        return callback(err)
                                    } else {
                                        tasks.should.have.length(1)

                                        tasks[0]._id.toString().should.be.equal(res.body.data)
                                        tasks[0]._cardId.toString().should.be.equal(params._cardId.toString())
                                        tasks[0]._statusId.toString().should.be.equal(params._statusId.toString())
                                        tasks[0].name.should.be.equal(params.name)
                                        tasks[0].description.should.be.equal(params.description)
                                        tasks[0].removed.should.be.false()

                                        return callback()
                                    }
                                })
                            },

                            (callback) => {
                                ActivityLink.find((err, activityLinks) => {
                                    if (err) {
                                        return callback(err)
                                    } else {
                                        activityLinks.should.have.length(1)

                                        activityLinks[0]._levelId.toString().should.be.equal(res.body.data)
                                        activityLinks[0]._userId.toString().should.be.equal(user._id.toString())
                                        activityLinks[0].name.should.be.equal(config.system.activities.addTask)

                                        return callback()
                                    }
                                })
                            }
                        ], (err) => done(err))
                    }
                })
        }

        it("Should add a task", testAdd)
    }

    describe("Add", describeAdd)

    const describeDelete = () => {
        const role = new Role({name: "Role #1"})

        const privilegeLink = new PrivilegeLink({
            _roleId: role._id,
            privilege: config.system.privileges.manageCards
        })

        const user = new User({
            _roleId: role._id,
            email: "user@kpmt.io",
            password: "user@kpmt.io"
        })

        const message = {
            _id: user._id.toString(),
            _roleId: role._id.toString()
        }
        const secret = config.tokens.user.secret
        const options = {expiresIn: config.tokens.user.expire}
        const token = jwt.sign(message, secret, options)

        const project = new Project({name: "Project #1"})

        const board = new Board({
            _projectId: project._id,
            name: "Board #1"
        })

        const column = new Column({
            _boardId: board._id,
            name: "Column #1"
        })

        const swimlane = new Swimlane({
            _boardId: board._id,
            name: "Swimlane #1"
        })

        const priority = new Priority({
            level: config.system.levels.card,
            name: "Priority #1"
        })

        const status = new Status({
            level: config.system.levels.card,
            name: "Status #1"
        })

        const card = new Card({
            _columnId: column._id,
            _swimlaneId: swimlane._id,
            _priorityId: priority._id,
            _statusId: status._id,
            name: "Card Name #1"
        })

        const status2 = new Status({
            level: config.system.levels.task,
            name: "Status #2"
        })

        const task = new Task({
            _cardId: card._id,
            _statusId: status2._id,
            name: "Task Name #1",
            description: "Task Description #1"
        })

        const beforeEachTest = (done) => {
            async.parallel([
                (callback) => {
                    board.save((err) => callback(err))
                },

                (callback) => {
                    card.save((err) => callback(err))
                },

                (callback) => {
                    column.save((err) => callback(err))
                },

                (callback) => {
                    priority.save((err) => callback(err))
                },

                (callback) => {
                    privilegeLink.save((err) => callback(err))
                },

                (callback) => {
                    project.save((err) => callback(err))
                },

                (callback) => {
                    role.save((err) => callback(err))
                },

                (callback) => {
                    status.save((err) => callback(err))
                },

                (callback) => {
                    status2.save((err) => callback(err))
                },

                (callback) => {
                    swimlane.save((err) => callback(err))
                },

                (callback) => {
                    task.save((err) => callback(err))
                },

                (callback) => {
                    user.save((err) => callback(err))
                }
            ], (err) => done(err))
        }

        beforeEach(beforeEachTest)

        const testDelete = (done) => {
            request(app)
                .del(`/tasks/${task._id}`)
                .set("Authorization", token)
                .send()
                .expect(200)
                .end(function (err, res) {
                    if (err) {
                        return done(err)
                    } else {
                        res.body.should.have.property("status")
                        res.body.status.should.be.equal("success")

                        res.body.should.have.property("data")
                        ;(res.body.data === null).should.be.true()

                        async.parallel([
                            (callback) => {
                                Task.find((err, tasks) => {
                                    if (err) {
                                        return callback(err)
                                    } else {
                                        tasks.should.have.length(1)

                                        tasks[0]._id.toString().should.be.equal(task._id.toString())
                                        tasks[0]._cardId.toString().should.be.equal(task._cardId.toString())
                                        tasks[0]._statusId.toString().should.be.equal(task._statusId.toString())
                                        tasks[0].name.should.be.equal(task.name)
                                        tasks[0].description.should.be.equal(task.description)
                                        tasks[0].removed.should.be.true()

                                        return callback()
                                    }
                                })
                            },

                            (callback) => {
                                ActivityLink.find((err, activityLinks) => {
                                    if (err) {
                                        return callback(err)
                                    } else {
                                        activityLinks.should.have.length(1)

                                        activityLinks[0]._levelId.toString().should.be.equal(task._id.toString())
                                        activityLinks[0]._userId.toString().should.be.equal(user._id.toString())
                                        activityLinks[0].name.should.be.equal(config.system.activities.deleteTask)

                                        return callback()
                                    }
                                })
                            }
                        ], (err) => done(err))
                    }
                })
        }

        it("Should delete a task", testDelete)
    }

    describe("Delete", describeDelete)

    const describeUpgrade = () => {
        const role = new Role({name: "Role #1"})

        const privilegeLink = new PrivilegeLink({
            _roleId: role._id,
            privilege: config.system.privileges.manageTasks
        })

        const user = new User({
            _roleId: role._id,
            email: "user@kpmt.io",
            password: "user@kpmt.io"
        })

        const message = {
            _id: user._id.toString(),
            _roleId: role._id.toString()
        }
        const secret = config.tokens.user.secret
        const options = {expiresIn: config.tokens.user.expire}
        const token = jwt.sign(message, secret, options)

        const project = new Project({name: "Project #1"})

        const board = new Board({
            _projectId: project._id,
            name: "Board #1"
        })

        const column = new Column({
            _boardId: board._id,
            name: "Column #1"
        })

        const swimlane = new Swimlane({
            _boardId: board._id,
            name: "Swimlane #1"
        })

        const priority = new Priority({
            level: config.system.levels.card,
            name: "Priority #1"
        })

        const status = new Status({
            level: config.system.levels.card,
            name: "Status #1"
        })

        const newStatus = new Status({
            level: config.system.levels.card,
            name: "Status #2"
        })

        const card = new Card({
            _columnId: column._id,
            _swimlaneId: swimlane._id,
            _priorityId: priority._id,
            _statusId: status._id,
            name: "Card Name #1"
        })

        const status2 = new Status({
            level: config.system.levels.task,
            name: "Status #3"
        })

        const task = new Task({
            _cardId: card._id,
            _statusId: status2._id,
            name: "Task Name #1",
            description: "Task Description #1"
        })

        const beforeEachTest = (done) => {
            async.parallel([
                (callback) => {
                    board.save((err) => callback(err))
                },

                (callback) => {
                    card.save((err) => callback(err))
                },

                (callback) => {
                    column.save((err) => callback(err))
                },

                (callback) => {
                    newStatus.save((err) => callback(err))
                },

                (callback) => {
                    priority.save((err) => callback(err))
                },

                (callback) => {
                    privilegeLink.save((err) => callback(err))
                },

                (callback) => {
                    project.save((err) => callback(err))
                },

                (callback) => {
                    task.save((err) => callback(err))
                },

                (callback) => {
                    status.save((err) => callback(err))
                },

                (callback) => {
                    swimlane.save((err) => callback(err))
                },

                (callback) => {
                    user.save((err) => callback(err))
                }
            ], (err) => done(err))
        }

        beforeEach(beforeEachTest)

        const testUpgrade = (done) => {
            const params = {
                _newColumnId: column._id,
                _newSwimlaneId: swimlane._id,
                _newPriorityId: priority._id,
                _newStatusId: newStatus._id
            }

            request(app)
                .post(`/tasks/${task._id}/upgrade`)
                .set("Authorization", token)
                .send(params)
                .expect(200)
                .end(function (err, res) {
                    if (err) {
                        return done(err)
                    } else {
                        res.body.should.have.property("status")
                        res.body.status.should.be.equal("success")

                        res.body.should.have.property("data")

                        async.parallel([
                            (callback) => {
                                Task.find(task._id, (err, tasks) => {
                                    if (err) {
                                        return callback(err)
                                    } else {
                                        tasks[0]._id.toString().should.be.equal(task._id.toString())
                                        tasks[0]._cardId.toString().should.be.equal(task._cardId.toString())
                                        tasks[0]._statusId.toString().should.be.equal(task._statusId.toString())
                                        tasks[0].name.should.be.equal(task.name)
                                        tasks[0].description.should.be.equal(task.description)
                                        tasks[0].removed.should.be.true()

                                        return callback()
                                    }
                                })
                            },

                            (callback) => {
                                const query = {_id: {$ne: card._id}}

                                Card.find(query, (err, cards) => {
                                    if (err) {
                                        return callback(err)
                                    } else {
                                        cards.should.have.length(1)

                                        cards[0]._id.toString().should.be.equal(res.body.data)

                                        cards[0]._columnId.toString()
                                            .should.be.equal(params._newColumnId.toString())

                                        cards[0]._swimlaneId.toString()
                                            .should.be.equal(params._newSwimlaneId.toString())

                                        cards[0]._priorityId.toString()
                                            .should.be.equal(params._newPriorityId.toString())

                                        cards[0]._statusId.toString().should.be.equal(params._newStatusId.toString())
                                        cards[0].name.should.be.equal(task.name)
                                        cards[0].description.should.be.equal(task.description)
                                        cards[0].removed.should.be.false()

                                        return callback()
                                    }
                                })
                            },

                            (callback) => {
                                ActivityLink.find((err, activityLinks) => {
                                    if (err) {
                                        return callback(err)
                                    } else {
                                        activityLinks.should.have.length(1)

                                        activityLinks[0]._levelId.toString().should.be.equal(res.body.data)
                                        activityLinks[0]._userId.toString().should.be.equal(user._id.toString())
                                        activityLinks[0].name.should.be.equal(config.system.activities.upgradeTask)

                                        return callback()
                                    }
                                })
                            }
                        ], (err) => done(err))
                    }
                })
        }

        it("Should upgrade a task", testUpgrade)
    }

    describe("Upgrade", describeUpgrade)
}

describe("TASK ROUTES", taskRoutes)