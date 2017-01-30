"use strict"

const jwt = require("jsonwebtoken")
const restify = require("restify")

const config = require(`${__base}libs/config`)
const Helper = require(`${__base}libs/helper`)
const Messages = require(`${__base}libs/messages`)
const logger = require(`${__base}libs/logger`)

class Restify {
    constructor() {
        const options = {
            name: config.app.name,
            version: config.app.version,
            log: logger
        }

        const publicRoutes = new Set(["/app"])

        const loggedOutRoutes = new Set([
            "/users/create",
            "/users/confirm",
            "/users/resend",
            "/users/login",
            "/users/reset",
            "/users/change",
            "/users/refresh"
        ])

        this.server = restify.createServer(options)

        this.server.pre(restify.pre.sanitizePath())

        this.server.use(restify.queryParser())
        this.server.use(restify.bodyParser({maxBodySize: 1048576}))

        this.server.use((req, res, next) => {
            if (config.app.offline === true) {
                res.send(503, Messages.offlineStatus)
            } else if (publicRoutes.has(req.route.path)) {
                return next()
            } else {
                if (req.headers.authorization === undefined) {
                    if (loggedOutRoutes.has(req.route.path) === false) {
                        if (config.app.debug === true) {
                            req.log.error("requestFailError", {err: Messages.actionNotAllowedError})
                        }

                        res.send(Helper.fail(Messages.actionNotAllowedError))
                    } else {
                        return next()
                    }
                } else {
                    jwt.verify(req.headers.authorization, config.tokens.user.secret, (err, decoded) => {
                        if (err) {
                            if (err.name !== "TokenExpiredError") {
                                req.log.error("internalServerError", {err: err})

                                res.send(Helper.error(Messages.internalServerError))
                            } else {
                                if (loggedOutRoutes.has(req.route.path) === false) {
                                    if (config.app.debug === true) {
                                        req.log.error("requestFailError", {err: Messages.userTokenExpiredError})
                                    }

                                    res.send(Helper.fail(Messages.userTokenExpiredError))
                                } else {
                                    return next()
                                }
                            }
                        } else {
                            if (loggedOutRoutes.has(req.route.path)) {
                                if (config.app.debug === true) {
                                    req.log.error("requestFailError", {err: Messages.userLoggedInError})
                                }

                                res.send(Helper.fail(Messages.userLoggedInError))
                            } else {
                                req.user = decoded

                                return next()
                            }
                        }
                    })
                }
            }
        })

        this.server.on("after", (req, res, route, err) => {
            if (err) {
                if (err.status === "error") {
                    req.log.error("internalServerError", {err: err.data})

                    res.send(500, Messages.internalServerError)
                } else if (err.status === "fail") {
                    if (config.app.debug === true) {
                        req.log.error("requestFailError", {err: err.data})
                    }

                    res.send(err)
                } else {
                    req.log.error("requestFailError", {err: err})
                }
            }
        })

        this.server.on("uncaughtException", function (req, res, route, err) {
            req.log.error("uncaughtException", {err: err})

            res.send(500, Messages.internalServerError)

            process.exit(1)
        })
    }

    start() {
        this.server.listen(config.server.port, (err) => {
            if (err) {
                throw err
            }
        })
    }
}

const restifyInstance = new Restify()

module.exports = restifyInstance