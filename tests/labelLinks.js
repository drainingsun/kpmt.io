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
const Label = require(`${__base}models/label`)
const LabelLink = require(`${__base}models/labelLink`)
const Priority = require(`${__base}models/priority`)
const PrivilegeLink = require(`${__base}models/privilegeLink`)
const Project = require(`${__base}models/project`)
const Role = require(`${__base}models/role`)
const Status = require(`${__base}models/status`)
const Swimlane = require(`${__base}models/swimlane`)
const User = require(`${__base}models/user`)

const labelLinkRoutes = () => {
    const beforeEachDescribe = (done) => {
        mongo.client.connection.db.dropDatabase((err) => done(err))
    }

    beforeEach(beforeEachDescribe)

    const describeBrowse = () => {
        const user = new User({
            email: "user@kpmt.io",
            password: "user@kpmt.io"
        })

        const message = {_id: user._id.toString()}
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

        const label = new Label({
            level: config.system.levels.card,
            name: "Label #1"
        })

        const labelLink = new LabelLink({
            _levelId: card._id,
            _labelId: label._id
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
                    label.save((err) => callback(err))
                },

                (callback) => {
                    labelLink.save((err) => callback(err))
                },

                (callback) => {
                    priority.save((err) => callback(err))
                },

                (callback) => {
                    project.save((err) => callback(err))
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

        const testBrowse = (done) => {
            const params = {
                _levelId: card._id,
                _labelId: label._id
            }

            request(app)
                .get("/label-links")
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

                        res.body.data[0]._id.should.be.equal(labelLink._id.toString())
                        res.body.data[0]._levelId.should.be.equal(card._id.toString())
                        res.body.data[0]._labelId.should.be.equal(label._id.toString())
                        res.body.data[0].removed.should.be.false()

                        return done()
                    }
                })
        }

        it("Should browse labelLinks", testBrowse)
    }

    describe("Browse", describeBrowse)

    const describeRead = () => {
        const user = new User({
            email: "user@kpmt.io",
            password: "user@kpmt.io"
        })

        const message = {_id: user._id.toString()}
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

        const label = new Label({
            level: config.system.levels.card,
            name: "Label #1"
        })

        const labelLink = new LabelLink({
            _levelId: card._id,
            _labelId: label._id
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
                    label.save((err) => callback(err))
                },

                (callback) => {
                    labelLink.save((err) => callback(err))
                },

                (callback) => {
                    priority.save((err) => callback(err))
                },

                (callback) => {
                    project.save((err) => callback(err))
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

        const testRead = (done) => {
            request(app)
                .get(`/label-links/${labelLink._id}`)
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

                        res.body.data._id.should.be.equal(labelLink._id.toString())
                        res.body.data._levelId.should.be.equal(card._id.toString())
                        res.body.data._labelId.should.be.equal(label._id.toString())
                        res.body.data.removed.should.be.false()

                        return done()
                    }
                })
        }

        it("Should read a labelLink", testRead)
    }

    describe("Read", describeRead)

    const describeAdd = () => {
        const role = new Role({name: "Role #1"})

        const privilegeLink = new PrivilegeLink({
            _roleId: role._id,
            privilege: config.system.privileges.manageLabelLinks
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

        const label = new Label({
            level: config.system.levels.card,
            name: "Label #1"
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
                    label.save((err) => callback(err))
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
                _levelId: card._id,
                _labelId: label._id,
                level: config.system.levels.card
            }

            request(app)
                .post("/label-links")
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
                                LabelLink.find((err, labelLinks) => {
                                    if (err) {
                                        return callback(err)
                                    } else {
                                        labelLinks.should.have.length(1)

                                        labelLinks[0]._id.toString().should.be.equal(res.body.data)
                                        labelLinks[0]._levelId.toString().should.be.equal(params._levelId.toString())
                                        labelLinks[0]._labelId.toString().should.be.equal(params._labelId.toString())
                                        labelLinks[0].removed.should.be.false()

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
                                        activityLinks[0].name.should.be.equal(config.system.activities.addLabelLink)

                                        return callback()
                                    }
                                })
                            }
                        ], (err) => done(err))

                    }
                })
        }

        it("Should add a labelLink", testAdd)
    }

    describe("Add", describeAdd)

    const describeDelete = () => {
        const role = new Role({name: "Role #1"})

        const privilegeLink = new PrivilegeLink({
            _roleId: role._id,
            privilege: config.system.privileges.manageLabelLinks
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

        const label = new Label({
            level: config.system.levels.card,
            name: "Label #1"
        })

        const labelLink = new LabelLink({
            _levelId: card._id,
            _labelId: label._id
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
                    label.save((err) => callback(err))
                },

                (callback) => {
                    labelLink.save((err) => callback(err))
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
                    swimlane.save((err) => callback(err))
                },

                (callback) => {
                    user.save((err) => callback(err))
                }
            ], (err) => done(err))
        }

        beforeEach(beforeEachTest)

        const testDelete = (done) => {
            request(app)
                .del(`/label-links/${labelLink._id}`)
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
                                LabelLink.find((err, labelLinks) => {
                                    if (err) {
                                        return callback(err)
                                    } else {
                                        labelLinks.should.have.length(1)

                                        labelLinks[0]._id.toString().should.be.equal(labelLink._id.toString())
                                        labelLinks[0]._levelId.toString().should.be.equal(card._id.toString())
                                        labelLinks[0]._labelId.toString().should.be.equal(label._id.toString())
                                        labelLinks[0].removed.should.be.true()

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

                                        activityLinks[0]._levelId.toString().should.be.equal(labelLink._id.toString())
                                        activityLinks[0]._userId.toString().should.be.equal(user._id.toString())
                                        activityLinks[0].name.should.be.equal(config.system.activities.deleteLabelLink)

                                        return callback()
                                    }
                                })
                            }
                        ], (err) => done(err))
                    }
                })
        }

        it("Should delete a labelLink", testDelete)
    }

    describe("Delete", describeDelete)
}

describe("LABELLINK ROUTES", labelLinkRoutes)