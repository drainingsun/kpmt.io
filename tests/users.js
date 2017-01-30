"use strict"

global.__base = __dirname + "/../"

const async = require("async")
const jwt = require("jsonwebtoken")
const request = require("supertest")
const should = require("should") // eslint-disable-line no-unused-vars

const config = require(`${__base}libs/config`)
const mongo = require(`${__base}libs/mongo`)

const app = require(`${__base}app`)

const PrivilegeLink = require(`${__base}models/privilegeLink`)
const Role = require(`${__base}models/role`)
const User = require(`${__base}models/user`)

const userRoutes = () => {
    const beforeEachDescribe = (done) => {
        mongo.client.connection.db.dropDatabase((err) => done(err))
    }

    beforeEach(beforeEachDescribe)

    const describeBrowse = () => {
        const role = new Role({name: "Role #1"})

        const privilegeLink = new PrivilegeLink({
            _roleId: role._id,
            privilege: config.system.privileges.administrateUsers
        })

        const user = new User({
            _roleId: role._id,
            email: "user@kpmt.io",
            password: "user@kpmt.io",
            name: "user@kpmt.io",
            wipLimit: 5
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

        const testBrowse = (done) => {
            request(app)
                .get("/users")
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
                        res.body.data.should.have.length(1)

                        res.body.data[0]._id.should.be.equal(user._id.toString())
                        res.body.data[0]._roleId.should.be.equal(user._roleId.toString())
                        res.body.data[0].email.should.be.equal(user.email)
                        res.body.data[0].name.should.be.equal(user.name)
                        res.body.data[0].wipLimit.should.be.equal(user.wipLimit)
                        res.body.data[0].confirmed.should.be.false()
                        res.body.data[0].removed.should.be.false()

                        return done()
                    }
                })
        }

        it("Should browse users", testBrowse)
    }

    describe("Browse", describeBrowse)

    const describeRead = () => {
        const role = new Role({name: "Role #1"})

        const privilegeLink = new PrivilegeLink({
            _roleId: role._id,
            privilege: config.system.privileges.administrateUsers
        })

        const user = new User({
            _roleId: role._id,
            email: "user@kpmt.io",
            password: "user@kpmt.io",
            name: "user@kpmt.io",
            wipLimit: 5
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

        const testRead = (done) => {
            request(app)
                .get(`/users/${user._id}`)
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

                        res.body.data._id.should.be.equal(user._id.toString())
                        res.body.data._roleId.should.be.equal(user._roleId.toString())
                        res.body.data.email.should.be.equal(user.email)
                        res.body.data.name.should.be.equal(user.name)
                        res.body.data.wipLimit.should.be.equal(user.wipLimit)
                        res.body.data.confirmed.should.be.false()
                        res.body.data.removed.should.be.false()

                        return done()
                    }
                })
        }

        it("Should read a user", testRead)
    }

    describe("Read", describeRead)

    const describeEdit = () => {
        const role = new Role({name: "Role #1"})

        const privilegeLink = new PrivilegeLink({
            _roleId: role._id,
            privilege: config.system.privileges.administrateUsers
        })

        const user = new User({
            _roleId: role._id,
            email: "user@kpmt.io",
            password: "user@kpmt.io",
            name: "user@kpmt.io",
            wipLimit: 5
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

        const testEdit = (done) => {
            const params = {
                _roleId: role._id,
                name: "User #2",
                wipLimit: 3
            }

            request(app)
                .put(`/users/${user._id}`)
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

                        User.find((err, users) => {
                            if (err) {
                                return done(err)
                            } else {
                                users.should.have.length(1)

                                users[0]._id.toString().should.be.equal(user._id.toString())
                                users[0]._roleId.toString().should.be.equal(user._roleId.toString())
                                users[0].email.should.be.equal(user.email)
                                users[0].name.should.be.equal(params.name)
                                users[0].wipLimit.should.be.equal(params.wipLimit)
                                users[0].confirmed.should.be.false()
                                users[0].removed.should.be.false()

                                return done()
                            }
                        })
                    }
                })
        }

        it("Should edit a user", testEdit)
    }

    describe("Edit", describeEdit)

    const describeAdd = () => {
        const role = new Role({name: "Role #1"})

        const privilegeLink = new PrivilegeLink({
            _roleId: role._id,
            privilege: config.system.privileges.administrateUsers
        })

        const user = new User({
            _roleId: role._id,
            email: "user@kpmt.io",
            password: "user@kpmt.io",
            name: "user@kpmt.io",
            wipLimit: 5
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
                _roleId: role._id,
                email: "user2@kpmt.io",
                password: "user2@kpmt.io",
                name: "user2@kpmt.io",
                wipLimit: 4
            }

            request(app)
                .post("/users")
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

                        const query = {_id: {$ne: user._id}}

                        User.find(query, (err, users) => {
                            if (err) {
                                return done(err)
                            } else {
                                users.should.have.length(1)

                                users[0]._id.toString().should.be.equal(res.body.data)
                                users[0]._roleId.toString().should.be.equal(params._roleId.toString())
                                users[0].email.should.be.equal(params.email)
                                users[0].name.should.be.equal(params.name)
                                users[0].wipLimit.should.be.equal(params.wipLimit)
                                users[0].confirmed.should.be.false()
                                users[0].removed.should.be.false()

                                return done()
                            }
                        })
                    }
                })
        }

        it("Should add a user", testAdd)
    }

    describe("Add", describeAdd)

    const describeDelete = () => {
        const role = new Role({name: "Role #1"})

        const privilegeLink = new PrivilegeLink({
            _roleId: role._id,
            privilege: config.system.privileges.administrateUsers
        })

        const user = new User({
            _roleId: role._id,
            email: "user@kpmt.io",
            password: "user@kpmt.io",
            name: "user@kpmt.io",
            wipLimit: 5
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

        const testDelete = (done) => {
            request(app)
                .del(`/users/${user._id}`)
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

                        User.find((err, users) => {
                            if (err) {
                                return done(err)
                            } else {
                                users.should.have.length(1)

                                users[0]._id.toString().should.be.equal(user._id.toString())
                                users[0]._roleId.toString().should.be.equal(user._roleId.toString())
                                users[0].email.should.be.equal(user.email)
                                users[0].password.should.be.equal(user.password)
                                users[0].name.should.be.equal(user.name)
                                users[0].wipLimit.should.be.equal(user.wipLimit)
                                users[0].confirmed.should.be.false()
                                users[0].removed.should.be.true()

                                return done()
                            }
                        })
                    }
                })
        }

        it("Should delete a user", testDelete)
    }

    describe("Delete", describeDelete)

    const describeCreate = () => {
        const testCreate = (done) => {
            const params = {
                email: "user@kpmt.io",
                password: "user@kpmt.io"
            }

            request(app)
                .post("/users/create")
                .send(params)
                .expect(200)
                .end((err, res) => {
                    if (err) {
                        return done(err)
                    } else {
                        res.body.should.have.property("status")
                        res.body.status.should.be.equal("success")

                        res.body.should.have.property("data")
                        ;(res.body.data === null).should.be.true()

                        User.find((err, users) => {
                            if (err) {
                                return done(err)
                            } else {
                                users.should.have.length(1)

                                users[0].email.should.be.equal(params.email)
                                users[0].confirmed.should.be.false()
                                users[0].removed.should.be.false()

                                return done()
                            }
                        })
                    }
                })
        }

        it("Should create a user", testCreate)
    }

    describe("Create", describeCreate)

    const describeConfirm = () => {
        const user = new User({
            email: "user@kpmt.io",
            password: "user@kpmt.io"
        })

        const beforeEachTest = (done) => {
            user.save((err) => done(err))
        }

        beforeEach(beforeEachTest)

        const testConfirm = (done) => {
            const message = {_userId: user._id.toString()}
            const secret = config.tokens.confirm.secret
            const options = {expiresIn: config.tokens.confirm.expire}

            const token = jwt.sign(message, secret, options)

            const params = {token: token}

            request(app)
                .post("/users/confirm")
                .send(params)
                .expect(200)
                .end((err, res) => {
                    if (err) {
                        return done(err)
                    } else {
                        res.body.should.have.property("status")
                        res.body.status.should.be.equal("success")

                        res.body.should.have.property("data")
                        ;(res.body.data === null).should.be.true()

                        User.find((err, users) => {
                            if (err) {
                                return done(err)
                            } else {
                                users.should.have.length(1)

                                users[0].email.should.be.equal(user.email)
                                users[0].confirmed.should.be.true()
                                users[0].removed.should.be.false()

                                return done()
                            }
                        })
                    }
                })
        }

        it("Should confirm a user", testConfirm)
    }

    describe("Confirm", describeConfirm)

    const describeConfirmResend= () => {
        const user = new User({
            email: "user@kpmt.io",
            password: "user@kpmt.io"
        })

        const beforeEachTest = (done) => {
            user.save((err) => done(err))
        }

        beforeEach(beforeEachTest)

        const testConfirmResend = (done) => {
            const params = {email: user.email}

            request(app)
                .post("/users/resend")
                .send(params)
                .expect(200)
                .end((err, res) => {
                    if (err) {
                        return done(err)
                    } else {
                        res.body.should.have.property("status")
                        res.body.status.should.be.equal("success")

                        res.body.should.have.property("data")
                        ;(res.body.data === null).should.be.true()

                        return done()
                    }
                })
        }

        it("Should resend user confirm email", testConfirmResend)
    }

    describe("Confirm Resend", describeConfirmResend)

    const describeLogin = () => {
        const password = "user@kpmt.io"

        const user = new User({
            email: "user@kpmt.io",
            password: password,
            confirmed: true
        })

        const beforeEachTest = (done) => {
            user.save((err) => done(err))
        }

        beforeEach(beforeEachTest)

        const testLogin = (done) => {
            const params = {
                email: user.email,
                password: password
            }

            request(app)
                .post("/users/login")
                .send(params)
                .expect(200)
                .end((err, res) => {
                    if (err) {
                        return done(err)
                    } else {
                        res.body.should.have.property("status")
                        res.body.status.should.be.equal("success")

                        res.body.should.have.property("data")
                        res.body.data.should.have.property("token")

                        return done()
                    }
                })
        }

        it("Should login a user", testLogin)
    }

    describe("Login", describeLogin)

    const describeLogout = () => {
        const user = new User({
            email: "user@kpmt.io",
            password: "user@kpmt.io"
        })

        const beforeEachTest = (done) => {
            user.save((err) => done(err))
        }

        beforeEach(beforeEachTest)

        const testLogout = (done) => {
            const message = {
                _id: user._id,
                remember: "no"
            }
            const secret = config.tokens.user.secret
            const options = {expiresIn: config.tokens.user.expire}

            const token = jwt.sign(message, secret, options)

            request(app)
                .post("/users/logout")
                .set("Authorization", token)
                .send()
                .expect(200)
                .end((err, res) => {
                    if (err) {
                        return done(err)
                    } else {
                        res.body.should.have.property("status")
                        res.body.status.should.be.equal("success")

                        res.body.should.have.property("data")
                        ;(res.body.data === null).should.be.true()

                        return done()
                    }
                })
        }

        it("Should logout a user", testLogout)
    }

    describe("Logout", describeLogout)

    const describeReset = () => {
        const user = new User({
            email: "user@kpmt.io",
            password: "user@kpmt.io",
            confirmed: true
        })

        const beforeEachTest = (done) => {
            user.save((err) => done(err))
        }

        beforeEach(beforeEachTest)

        const testReset = (done) => {
            const message = {_userId: user._id.toString()}
            const secret = config.tokens.reset.secret
            const options = {expiresIn: config.tokens.reset.expire}

            const token = jwt.sign(message, secret, options)

            const params = {
                token: token,
                password: "myNewPassword"
            }

            request(app)
                .post("/users/change")
                .send(params)
                .expect(200)
                .end((err, res) => {
                    if (err) {
                        return done(err)
                    } else {
                        res.body.should.have.property("status")
                        res.body.status.should.be.equal("success")

                        res.body.should.have.property("data")
                        ;(res.body.data === null).should.be.true()

                        return done()
                    }
                })
        }

        it("Should reset user password", testReset)
    }

    describe("Reset", describeReset)

    const describeResetSend = () => {
        const user = new User({
            email: "user@kpmt.io",
            password: "user@kpmt.io",
            confirmed: true
        })

        const beforeEachTest = (done) => {
            user.save((err) => done(err))
        }

        beforeEach(beforeEachTest)

        const testResetSend = (done) => {
            const params = {email: user.email}

            request(app)
                .post("/users/reset")
                .send(params)
                .expect(200)
                .end((err, res) => {
                    if (err) {
                        return done(err)
                    } else {
                        res.body.should.have.property("status")
                        res.body.status.should.be.equal("success")

                        res.body.should.have.property("data")
                        ;(res.body.data === null).should.be.true()

                        return done()
                    }
                })
        }

        it("Should send user password reset email", testResetSend)
    }

    describe("Reset Send", describeResetSend)

    const describeUpdate = () => {
        const password = "user@kpmt.io"

        const user = new User({
            email: "user@kpmt.io",
            password: password,
            confirmed: true
        })

        const beforeEachTest = (done) => {
            user.save((err) => done(err))
        }

        beforeEach(beforeEachTest)

        const testUpdate = (done) => {
            const message = {
                _id: user._id,
                remember: "no"
            }
            const secret = config.tokens.user.secret
            const options = {expiresIn: config.tokens.user.expire}

            const token = jwt.sign(message, secret, options)

            const params = {
                email: user.email,
                oldPassword: password,
                password: "myNewPassword"
            }

            request(app)
                .post("/users/update")
                .set("Authorization", token)
                .send(params)
                .expect(200)
                .end((err, res) => {
                    if (err) {
                        return done(err)
                    } else {
                        res.body.should.have.property("status")
                        res.body.status.should.be.equal("success")

                        res.body.should.have.property("data")
                        ;(res.body.data === null).should.be.true()

                        return done()
                    }
                })
        }

        it("Should update a user", testUpdate)
    }

    describe("Update", describeUpdate)

    const describeRefresh = () => {
        const user = new User({
            email: "user@kpmt.io",
            password: "user@kpmt.io",
            refreshTime: new Date(Date.now() - 2 * 60 * 60 * 1000)
        })

        const beforeEachTest = (done) => {
            user.save((err) => done(err))
        }

        beforeEach(beforeEachTest)

        const testRefresh = (done) => {
            const message = {
                _id: user._id,
                remember: "yes",
                iat: Math.floor(Date.now() / 1000) - 2 * 60 * 60
            }
            const secret = config.tokens.user.secret
            const options = {expiresIn: config.tokens.user.expire}

            const token = jwt.sign(message, secret, options)

            request(app)
                .post("/users/refresh")
                .set("Authorization", token)
                .expect(200)
                .end((err, res) => {
                    if (err) {
                        return done(err)
                    } else {
                        res.body.should.have.property("status")
                        res.body.status.should.be.equal("success")

                        res.body.should.have.property("data")
                        res.body.data.should.have.property("token")

                        return done()
                    }
                })
        }

        it("Should refresh a user token", testRefresh)
    }

    describe("Refresh", describeRefresh)
}

describe("USER ROUTES", userRoutes)