"use strict"

global.__base = __dirname + "/../"

const async = require("async")
const jwt = require("jsonwebtoken")
const request = require("supertest")
const should = require("should") // eslint-disable-line no-unused-vars

const app = require(`${__base}app`)

const config = require(`${__base}libs/config`)
const mongo = require(`${__base}libs/mongo`)

const Board = require(`${__base}models/board`)
const PrivilegeLink = require(`${__base}models/privilegeLink`)
const Project = require(`${__base}models/project`)
const Role = require(`${__base}models/role`)
const Swimlane = require(`${__base}models/swimlane`)
const User = require(`${__base}models/user`)
const UserLink = require(`${__base}models/userLink`)

const swimlaneRoutes = () => {
    const beforeEachDescribe = (done) => {
        mongo.client.connection.db.dropDatabase((err) => done(err))
    }

    beforeEach(beforeEachDescribe)

    const describeBrowse = () => {
        const role = new Role({name: "Role #1"})

        const privilegeLink = new PrivilegeLink({
            _roleId: role._id,
            privilege: config.system.privileges.viewLinkedSwimlanes
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

        const swimlane = new Swimlane({
            _boardId: board._id,
            name: "Swimlane #1"
        })

        const userLink = new UserLink({
            _levelId: swimlane._id,
            _userId: user._id
        })

        const beforeEachTest = (done) => {
            async.parallel([
                (callback) => {
                    board.save((err) => callback(err))
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
                    swimlane.save((err) => callback(err))
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
            const params = {_boardId: board._id}

            request(app)
                .get("/swimlanes")
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

                        res.body.data[0]._id.should.be.equal(swimlane._id.toString())
                        res.body.data[0]._boardId.should.be.equal(swimlane._boardId.toString())
                        res.body.data[0].name.should.be.equal(swimlane.name)
                        res.body.data[0].removed.should.be.false()

                        return done()
                    }
                })
        }

        it("Should browse swimlanes", testBrowse)
    }

    describe("Browse", describeBrowse)

    const describeRead = () => {
        const role = new Role({name: "Role #1"})

        const privilegeLink = new PrivilegeLink({
            _roleId: role._id,
            privilege: config.system.privileges.viewSwimlanes
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

        const swimlane = new Swimlane({
            _boardId: board._id,
            name: "Swimlane #1"
        })

        const beforeEachTest = (done) => {
            async.parallel([
                (callback) => {
                    board.save((err) => callback(err))
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
                .get(`/swimlanes/${swimlane._id}`)
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

                        res.body.data._id.should.be.equal(swimlane._id.toString())
                        res.body.data._boardId.should.be.equal(swimlane._boardId.toString())
                        res.body.data.name.should.be.equal(swimlane.name)
                        res.body.data.removed.should.be.false()

                        return done()
                    }
                })
        }

        it("Should read a swimlane", testRead)
    }

    describe("Read", describeRead)

    const describeEdit = () => {
        const role = new Role({name: "Role #1"})

        const privilegeLink = new PrivilegeLink({
            _roleId: role._id,
            privilege: config.system.privileges.manageLinkedSwimlanes
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

        const swimlane = new Swimlane({
            _boardId: board._id,
            name: "Swimlane #1"
        })

        const userLink = new UserLink({
            _levelId: swimlane._id,
            _userId: user._id
        })

        const beforeEachTest = (done) => {
            async.parallel([
                (callback) => {
                    board.save((err) => callback(err))
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
                    swimlane.save((err) => callback(err))
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
                _boardId: board._id,
                name: "Swimlane #2"
            }

            request(app)
                .put(`/swimlanes/${swimlane._id}`)
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

                        Swimlane.find((err, swimlanes) => {
                            if (err) {
                                return done(err)
                            } else {
                                swimlanes.should.have.length(1)

                                swimlanes[0]._id.toString().should.be.equal(swimlane._id.toString())
                                swimlanes[0]._boardId.toString().should.be.equal(params._boardId.toString())
                                swimlanes[0].name.should.be.equal(params.name)
                                swimlanes[0].removed.should.be.false()

                                return done()
                            }
                        })
                    }
                })
        }

        it("Should edit a swimlane", testEdit)
    }

    describe("Edit", describeEdit)

    const describeAdd = () => {
        const role = new Role({name: "Role #1"})

        const privilegeLink = new PrivilegeLink({
            _roleId: role._id,
            privilege: config.system.privileges.manageSwimlanes
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

        const beforeEachTest = (done) => {
            async.parallel([
                (callback) => {
                    board.save((err) => callback(err))
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
                    user.save((err) => callback(err))
                }
            ], (err) => done(err))
        }

        beforeEach(beforeEachTest)

        const testAdd = (done) => {
            const params = {
                _boardId: board._id,
                name: "Swimlane #1"
            }

            request(app)
                .post("/swimlanes")
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

                        Swimlane.find((err, swimlanes) => {
                            if (err) {
                                return done(err)
                            } else {
                                swimlanes.should.have.length(1)

                                swimlanes[0]._id.toString().should.be.equal(res.body.data)
                                swimlanes[0]._boardId.toString().should.be.equal(params._boardId.toString())
                                swimlanes[0].name.should.be.equal(params.name)
                                swimlanes[0].removed.should.be.false()

                                return done()
                            }
                        })
                    }
                })
        }

        it("Should add a swimlane", testAdd)
    }

    describe("Add", describeAdd)

    const describeDelete = () => {
        const role = new Role({name: "Role #1"})

        const privilegeLink = new PrivilegeLink({
            _roleId: role._id,
            privilege: config.system.privileges.manageSwimlanes
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

        const swimlane = new Swimlane({
            _boardId: board._id,
            name: "Swimlane #1"
        })

        const beforeEachTest = (done) => {
            async.parallel([
                (callback) => {
                    board.save((err) => callback(err))
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
                .del(`/swimlanes/${swimlane._id}`)
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

                        Swimlane.find((err, swimlanes) => {
                            if (err) {
                                return done(err)
                            } else {
                                swimlanes.should.have.length(1)

                                swimlanes[0]._id.toString().should.be.equal(swimlane._id.toString())
                                swimlanes[0]._boardId.toString().should.be.equal(swimlane._boardId.toString())
                                swimlanes[0].name.should.be.equal(swimlane.name)
                                swimlanes[0].removed.should.be.true()

                                return done()
                            }
                        })
                    }
                })
        }

        it("Should delete a swimlane", testDelete)
    }

    describe("Delete", describeDelete)
}

describe("SWIMLANE ROUTES", swimlaneRoutes)