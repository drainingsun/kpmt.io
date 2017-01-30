"use strict"

global.__base = __dirname + "/../"

const async = require("async")
const jwt = require("jsonwebtoken")
const request = require("supertest")
const should = require("should") // eslint-disable-line no-unused-vars

const app = require(`${__base}app`)

const config = require(`${__base}libs/config`)
const mongo = require(`${__base}libs/mongo`)

const PrivilegeLink = require(`${__base}models/privilegeLink`)
const Role = require(`${__base}models/role`)
const Status = require(`${__base}models/status`)
const User = require(`${__base}models/user`)

const statusRoutes = () => {
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

        const status = new Status({
            level: config.system.levels.project,
            name: "Status #1"
        })

        const beforeEachTest = (done) => {
            async.parallel([
                (callback) => {
                    status.save((err) => callback(err))
                },

                (callback) => {
                    user.save((err) => callback(err))
                }
            ], (err) => done(err))
        }

        beforeEach(beforeEachTest)

        const testBrowse = (done) => {
            const params = {level: config.system.levels.project}

            request(app)
                .get("/statuses")
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

                        res.body.data[0]._id.should.be.equal(status._id.toString())
                        res.body.data[0].name.should.be.equal(status.name)
                        res.body.data[0].removed.should.be.false()

                        return done()
                    }
                })
        }

        it("Should browse statuses", testBrowse)
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

        const status = new Status({
            level: config.system.levels.project,
            name: "Status #1"
        })

        const beforeEachTest = (done) => {
            async.parallel([
                (callback) => {
                    status.save((err) => callback(err))
                },

                (callback) => {
                    user.save((err) => callback(err))
                }
            ], (err) => done(err))
        }

        beforeEach(beforeEachTest)

        const testRead = (done) => {
            request(app)
                .get(`/statuses/${status._id}`)
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

                        res.body.data._id.should.be.equal(status._id.toString())
                        res.body.data.name.should.be.equal(status.name)
                        res.body.data.removed.should.be.false()

                        return done()
                    }
                })
        }

        it("Should read a status", testRead)
    }

    describe("Read", describeRead)

    const describeEdit = () => {
        const role = new Role({name: "Role #1"})

        const privilegeLink = new PrivilegeLink({
            _roleId: role._id,
            privilege: config.system.privileges.administrateStatuses
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

        const status = new Status({
            level: config.system.levels.project,
            name: "Status #1"
        })

        const beforeEachTest = (done) => {
            async.parallel([
                (callback) => {
                    privilegeLink.save((err) => callback(err))
                },

                (callback) => {
                    role.save((err) => callback(err))
                },

                (callback) => {
                    status.save((err) => callback(err))
                },

                (callback) => {
                    user.save((err) => callback(err))
                }
            ], (err) => done(err))
        }

        beforeEach(beforeEachTest)

        const testEdit = (done) => {
            const params = {name: "Status #2"}

            request(app)
                .put(`/statuses/${status._id}`)
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

                        Status.find((err, statuses) => {
                            if (err) {
                                return done(err)
                            } else {
                                statuses.should.have.length(1)

                                statuses[0]._id.toString().should.be.equal(status._id.toString())
                                statuses[0].name.should.be.equal(params.name)
                                statuses[0].removed.should.be.false()

                                return done()
                            }
                        })
                    }
                })
        }

        it("Should edit a status", testEdit)
    }

    describe("Edit", describeEdit)

    const describeAdd = () => {
        const role = new Role({name: "Role #1"})

        const privilegeLink = new PrivilegeLink({
            _roleId: role._id,
            privilege: config.system.privileges.administrateStatuses
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

        const beforeEachTest = (done) => {
            async.parallel([
                (callback) => {
                    privilegeLink.save((err) => callback(err))
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
                level: config.system.levels.project,
                name: "Status #1"
            }

            request(app)
                .post("/statuses")
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

                        Status.find((err, statuses) => {
                            if (err) {
                                return done(err)
                            } else {
                                statuses.should.have.length(1)

                                statuses[0]._id.toString().should.be.equal(res.body.data)
                                statuses[0].name.should.be.equal(params.name)
                                statuses[0].removed.should.be.false()

                                return done()
                            }
                        })
                    }
                })
        }

        it("Should add a status", testAdd)
    }

    describe("Add", describeAdd)

    const describeDelete = () => {
        const role = new Role({name: "Role #1"})

        const privilegeLink = new PrivilegeLink({
            _roleId: role._id,
            privilege: config.system.privileges.administrateStatuses
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

        const status = new Status({
            level: config.system.levels.project,
            name: "Status #1"
        })

        const beforeEachTest = (done) => {
            async.parallel([
                (callback) => {
                    privilegeLink.save((err) => callback(err))
                },

                (callback) => {
                    role.save((err) => callback(err))
                },

                (callback) => {
                    status.save((err) => callback(err))
                },

                (callback) => {
                    user.save((err) => callback(err))
                }
            ], (err) => done(err))
        }

        beforeEach(beforeEachTest)

        const testDelete = (done) => {
            request(app)
                .del(`/statuses/${status._id}`)
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

                        Status.find((err, statuses) => {
                            if (err) {
                                return done(err)
                            } else {
                                statuses.should.have.length(1)

                                statuses[0]._id.toString().should.be.equal(status._id.toString())
                                statuses[0].name.should.be.equal(status.name)
                                statuses[0].removed.should.be.true()

                                return done()
                            }
                        })
                    }
                })
        }

        it("Should delete a status", testDelete)
    }

    describe("Delete", describeDelete)
}

describe("STATUS ROUTES", statusRoutes)