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
const PrivilegeLink = require(`${__base}models/privilegeLink`)
const Project = require(`${__base}models/project`)
const Role = require(`${__base}models/role`)
const User = require(`${__base}models/user`)
const UserLink = require(`${__base}models/userLink`)

const userLinkRoutes = () => {
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

        const userLink = new UserLink({
            _levelId: project._id,
            _userId: user._id
        })

        const beforeEachTest = (done) => {
            async.parallel([
                (callback) => {
                    project.save((err) => callback(err))
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
            const params = {
                _levelId: project._id,
                _userId: user._id
            }

            request(app)
                .get("/user-links")
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

                        res.body.data[0]._id.should.be.equal(userLink._id.toString())
                        res.body.data[0]._levelId.should.be.equal(userLink._levelId.toString())
                        res.body.data[0]._userId.should.be.equal(userLink._userId.toString())
                        res.body.data[0].removed.should.be.false()

                        return done()
                    }
                })
        }

        it("Should browse userLinks", testBrowse)
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

        const userLink = new UserLink({
            _levelId: project._id,
            _userId: user._id
        })

        const beforeEachTest = (done) => {
            async.parallel([
                (callback) => {
                    project.save((err) => callback(err))
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

        const testRead = (done) => {
            request(app)
                .get(`/user-links/${userLink._id}`)
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

                        res.body.data._id.should.be.equal(userLink._id.toString())
                        res.body.data._levelId.should.be.equal(userLink._levelId.toString())
                        res.body.data._userId.should.be.equal(userLink._userId.toString())
                        res.body.data.removed.should.be.false()

                        return done()
                    }
                })
        }

        it("Should read a userLink", testRead)
    }

    describe("Read", describeRead)

    const describeAdd = () => {
        const role = new Role({name: "Role #1"})

        const privilegeLink = new PrivilegeLink({
            _roleId: role._id,
            privilege: config.system.privileges.manageUserLinks
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

        const beforeEachTest = (done) => {
            async.parallel([
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
                _levelId: project._id,
                _userId: user._id,
                level: config.system.levels.project
            }

            request(app)
                .post("/user-links")
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
                                UserLink.find((err, userLinks) => {
                                    if (err) {
                                        return callback(err)
                                    } else {
                                        userLinks.should.have.length(1)

                                        userLinks[0]._id.toString().should.be.equal(res.body.data)
                                        userLinks[0]._levelId.toString().should.be.equal(params._levelId.toString())
                                        userLinks[0]._userId.toString().should.be.equal(params._userId.toString())
                                        userLinks[0].removed.should.be.false()

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
                                        activityLinks[0].name.should.be.equal(config.system.activities.addUserLink)

                                        return callback()
                                    }
                                })
                            }
                        ], (err) => done(err))
                    }
                })
        }

        it("Should add a userLink", testAdd)
    }

    describe("Add", describeAdd)

    const describeDelete = () => {
        const role = new Role({name: "Role #1"})

        const privilegeLink = new PrivilegeLink({
            _roleId: role._id,
            privilege: config.system.privileges.manageUserLinks
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

        const userLink = new UserLink({
            _levelId: project._id,
            _userId: user._id
        })

        const beforeEachTest = (done) => {
            async.parallel([
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

        const testDelete = (done) => {
            request(app)
                .del(`/user-links/${userLink._id}`)
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
                                UserLink.find((err, userLinks) => {
                                    if (err) {
                                        return callback(err)
                                    } else {
                                        userLinks.should.have.length(1)

                                        userLinks[0]._id.toString().should.be.equal(userLink._id.toString())
                                        userLinks[0]._levelId.toString().should.be.equal(project._id.toString())
                                        userLinks[0]._userId.toString().should.be.equal(user._id.toString())
                                        userLinks[0].removed.should.be.true()

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

                                        activityLinks[0]._levelId.toString().should.be.equal(userLink._id.toString())
                                        activityLinks[0]._userId.toString().should.be.equal(user._id.toString())
                                        activityLinks[0].name.should.be.equal(config.system.activities.deleteUserLink)

                                        return callback()
                                    }
                                })
                            }
                        ], (err) => done(err))
                    }
                })
        }

        it("Should delete a userLink", testDelete)
    }

    describe("Delete", describeDelete)
}

describe("USERLINK ROUTES", userLinkRoutes)