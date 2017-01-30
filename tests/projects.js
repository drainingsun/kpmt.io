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
const Project = require(`${__base}models/project`)
const Role = require(`${__base}models/role`)
const User = require(`${__base}models/user`)
const UserLink = require(`${__base}models/userLink`)

const projectTests = () => {
    const beforeEachDescribe = (done) => {
        mongo.client.connection.db.dropDatabase((err) => done(err))
    }

    beforeEach(beforeEachDescribe)

    const describeBrowse = () => {
        const role = new Role({name: "Role #1"})

        const privilegeLink = new PrivilegeLink({
            _roleId: role._id,
            privilege: config.system.privileges.viewLinkedProjects
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

        const testBrowse = (done) => {
            request(app)
                .get("/projects")
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

                        res.body.data[0]._id.should.be.equal(project._id.toString())
                        res.body.data[0].name.should.be.equal(project.name)
                        res.body.data[0].removed.should.be.false()

                        return done()
                    }
                })
        }

        it("Should browse projects", testBrowse)
    }

    describe("Browse", describeBrowse)

    const describeRead = () => {
        const role = new Role({name: "Role #1"})

        const privilegeLink = new PrivilegeLink({
            _roleId: role._id,
            privilege: config.system.privileges.viewProjects
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

        const testRead = (done) => {
            request(app)
                .get(`/projects/${project._id}`)
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

                        res.body.data._id.should.be.equal(project._id.toString())
                        res.body.data.name.should.be.equal(project.name)
                        res.body.data.removed.should.be.false()

                        return done()
                    }
                })
        }

        it("Should read a project", testRead)
    }

    describe("Read", describeRead)

    const describeEdit = () => {
        const role = new Role({name: "Role #1"})

        const privilegeLink = new PrivilegeLink({
            _roleId: role._id,
            privilege: config.system.privileges.manageLinkedProjects
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

        const testEdit = (done) => {
            const params = {name: "Project #2"}

            request(app)
                .put(`/projects/${project._id}`)
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

                        Project.find((err, projects) => {
                            if (err) {
                                return done(err)
                            } else {
                                projects.should.have.length(1)

                                projects[0]._id.toString().should.be.equal(project._id.toString())
                                projects[0].name.should.be.equal(params.name)
                                projects[0].removed.should.be.false()

                                return done()
                            }
                        })
                    }
                })
        }

        it("Should edit a project", testEdit)
    }

    describe("Edit", describeEdit)

    const describeAdd = () => {
        const role = new Role({name: "Role #1"})

        const privilegeLink = new PrivilegeLink({
            _roleId: role._id,
            privilege: config.system.privileges.manageProjects
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
                    role.save((err) => callback(err))
                },

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
            const params = {name: "Project #1"}

            request(app)
                .post("/projects")
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

                        Project.find((err, projects) => {
                            if (err) {
                                return done(err)
                            } else {
                                projects.should.have.length(1)

                                projects[0]._id.toString().should.be.equal(res.body.data)
                                projects[0].name.should.be.equal(params.name)
                                projects[0].removed.should.be.false()

                                return done()
                            }
                        })
                    }
                })
        }

        it("Should add a project", testAdd)
    }

    describe("Add", describeAdd)

    const describeDelete = () => {
        const role = new Role({name: "Role #1"})

        const privilegeLink = new PrivilegeLink({
            _roleId: role._id,
            privilege: config.system.privileges.manageProjects
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

        const testDelete = (done) => {
            request(app)
                .del(`/projects/${project._id}`)
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

                        Project.find((err, projects) => {
                            if (err) {
                                return done(err)
                            } else {
                                projects.should.have.length(1)

                                projects[0]._id.toString().should.be.equal(project._id.toString())
                                projects[0].name.should.be.equal(project.name)
                                projects[0].removed.should.be.true()

                                return done()
                            }
                        })
                    }
                })
        }

        it("Should delete a project", testDelete)
    }

    describe("Delete", describeDelete)
}

describe("PROJECT ROUTES", projectTests)