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
const Project = require(`${__base}models/project`)
const User = require(`${__base}models/user`)
const UserLink = require(`${__base}models/userLink`)

const activityLinkRoutes = () => {
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

        const activityLink = new ActivityLink({
            _levelId: userLink._id,
            _userId: user._id,
            name: config.system.activities.addUserLink
        })

        const beforeEachTest = (done) => {
            async.parallel([
                (callback) => {
                    activityLink.save((err) => callback(err))
                },

                (callback) => {
                    project.save((err) => callback(err))
                },

                (callback) => {
                    user.save((err) => callback(err))
                }
            ], (err) => done(err))
        }

        beforeEach(beforeEachTest)

        const testBrowse = (done) => {
            const params = {
                _levelId: project._id,
                _userId: user._id,
                name: config.system.activities.addUserLink
            }

            request(app)
                .get("/activity-links")
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

                        res.body.data[0]._id.should.be.equal(activityLink._id.toString())
                        res.body.data[0]._levelId.should.be.equal(activityLink._levelId.toString())
                        res.body.data[0]._userId.should.be.equal(activityLink._userId.toString())
                        res.body.data[0].name.should.be.equal(config.system.activities.addUserLink)

                        return done()
                    }
                })
        }

        it("Should browse activityLinks", testBrowse)
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

        const activityLink = new ActivityLink({
            _levelId: userLink._id,
            _userId: user._id,
            name: config.system.activities.addUserLink
        })

        const beforeEachTest = (done) => {
            async.parallel([
                (callback) => {
                    activityLink.save((err) => callback(err))
                },

                (callback) => {
                    project.save((err) => callback(err))
                },

                (callback) => {
                    user.save((err) => callback(err))
                }
            ], (err) => done(err))
        }

        beforeEach(beforeEachTest)

        const testRead = (done) => {
            request(app)
                .get(`/activity-links/${activityLink._id}`)
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

                        res.body.data._id.should.be.equal(activityLink._id.toString())
                        res.body.data._levelId.should.be.equal(activityLink._levelId.toString())
                        res.body.data._userId.should.be.equal(activityLink._userId.toString())
                        res.body.data.name.should.be.equal(config.system.activities.addUserLink)

                        return done()
                    }
                })
        }

        it("Should read a activityLink", testRead)
    }

    describe("Read", describeRead)
}

describe("LABELLINK ROUTES", activityLinkRoutes)