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
const Column = require(`${__base}models/column`)
const PrivilegeLink = require(`${__base}models/privilegeLink`)
const Project = require(`${__base}models/project`)
const Role = require(`${__base}models/role`)
const User = require(`${__base}models/user`)
const UserLink = require(`${__base}models/userLink`)

const columnRoutes = () => {
    const beforeEachDescribe = (done) => {
        mongo.client.connection.db.dropDatabase((err) => done(err))
    }

    beforeEach(beforeEachDescribe)

    const describeBrowse = () => {
        const role = new Role({name: "Role #1"})

        const privilegeLink = new PrivilegeLink({
            _roleId: role._id,
            privilege: config.system.privileges.viewLinkedColumns
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
            name: "Column #1",
            wipLimit: 5
        })

        const userLink = new UserLink({
            _levelId: column._id,
            _userId: user._id
        })

        const beforeEachTest = (done) => {
            async.parallel([
                (callback) => {
                    board.save((err) => callback(err))
                },

                (callback) => {
                    column.save((err) => callback(err))
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
                .get("/columns")
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

                        res.body.data[0]._id.should.be.equal(column._id.toString())
                        res.body.data[0]._boardId.should.be.equal(column._boardId.toString())
                        res.body.data[0].name.should.be.equal(column.name)
                        res.body.data[0].wipLimit.should.be.equal(column.wipLimit)
                        res.body.data[0].removed.should.be.false()

                        return done()
                    }
                })
        }

        it("Should browse columns", testBrowse)
    }

    describe("Browse", describeBrowse)

    const describeRead = () => {
        const role = new Role({name: "Role #1"})

        const privilegeLink = new PrivilegeLink({
            _roleId: role._id,
            privilege: config.system.privileges.viewColumns
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
            name: "Column #1",
            wipLimit: 5
        })

        const beforeEachTest = (done) => {
            async.parallel([
                (callback) => {
                    board.save((err) => callback(err))
                },

                (callback) => {
                    column.save((err) => callback(err))
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

        const testRead = (done) => {
            request(app)
                .get(`/columns/${column._id}`)
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

                        res.body.data._id.should.be.equal(column._id.toString())
                        res.body.data._boardId.should.be.equal(column._boardId.toString())
                        res.body.data.name.should.be.equal(column.name)
                        res.body.data.wipLimit.should.be.equal(column.wipLimit)
                        res.body.data.removed.should.be.false()

                        return done()
                    }
                })
        }

        it("Should read a column", testRead)
    }

    describe("Read", describeRead)

    const describeEdit = () => {
        const role = new Role({name: "Role #1"})

        const privilegeLink = new PrivilegeLink({
            _roleId: role._id,
            privilege: config.system.privileges.manageLinkedColumns
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
            name: "Column #1",
            wipLimit: 5
        })

        const userLink = new UserLink({
            _levelId: column._id,
            _userId: user._id
        })

        const beforeEachTest = (done) => {
            async.parallel([
                (callback) => {
                    board.save((err) => callback(err))
                },

                (callback) => {
                    column.save((err) => callback(err))
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
                name: "Column #2",
                wipLimit: 5
            }

            request(app)
                .put(`/columns/${column._id}`)
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

                        Column.find((err, columns) => {
                            if (err) {
                                return done(err)
                            } else {
                                columns.should.have.length(1)

                                columns[0]._id.toString().should.be.equal(column._id.toString())
                                columns[0]._boardId.toString().should.be.equal(params._boardId.toString())
                                columns[0].name.should.be.equal(params.name)
                                columns[0].wipLimit.should.be.equal(params.wipLimit)
                                columns[0].removed.should.be.false()

                                return done()
                            }
                        })
                    }
                })
        }

        it("Should edit a column", testEdit)
    }

    describe("Edit", describeEdit)

    const describeAdd = () => {
        const role = new Role({name: "Role #1"})

        const privilegeLink = new PrivilegeLink({
            _roleId: role._id,
            privilege: config.system.privileges.manageColumns
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
                name: "Column #1",
                wipLimit: 6
            }

            request(app)
                .post("/columns")
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

                        Column.find((err, columns) => {
                            if (err) {
                                return done(err)
                            } else {
                                columns.should.have.length(1)

                                columns[0]._id.toString().should.be.equal(res.body.data)
                                columns[0]._boardId.toString().should.be.equal(params._boardId.toString())
                                columns[0].name.should.be.equal(params.name)
                                columns[0].wipLimit.should.be.equal(params.wipLimit)
                                columns[0].removed.should.be.false()

                                return done()
                            }
                        })
                    }
                })
        }

        it("Should add a column", testAdd)
    }

    describe("Add", describeAdd)

    const describeDelete = () => {
        const role = new Role({name: "Role #1"})

        const privilegeLink = new PrivilegeLink({
            _roleId: role._id,
            privilege: config.system.privileges.manageColumns
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
            name: "Column #1",
            wipLimit: 5
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
                    column.save((err) => callback(err))
                },

                (callback) => {
                    user.save((err) => callback(err))
                }
            ], (err) => done(err))
        }

        beforeEach(beforeEachTest)

        const testDelete = (done) => {
            request(app)
                .del(`/columns/${column._id}`)
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

                        Column.find((err, columns) => {
                            if (err) {
                                return done(err)
                            } else {
                                columns.should.have.length(1)

                                columns[0]._id.toString().should.be.equal(column._id.toString())
                                columns[0]._boardId.toString().should.be.equal(column._boardId.toString())
                                columns[0].name.should.be.equal(column.name)
                                columns[0].wipLimit.should.be.equal(column.wipLimit)
                                columns[0].removed.should.be.true()

                                return done()
                            }
                        })
                    }
                })
        }

        it("Should delete a column", testDelete)
    }

    describe("Delete", describeDelete)
}

describe("COLUMN ROUTES", columnRoutes)