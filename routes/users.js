"use strict"

const async = require("async")
const jwt = require("jsonwebtoken")

const config = require(`${__base}libs/config`)
const Helper = require(`${__base}libs/helper`)
const mailer = require(`${__base}libs/mailer`)
const Messages = require(`${__base}libs/messages`)

const Role = require(`${__base}models/role`)
const User = require(`${__base}models/user`)

const PrivilegeLinks = require(`${__base}services/privilegeLinks`)

class UserRoutes {
    constructor(server) {
        server.get({path: "/users/"}, this.browse.bind(this))
        server.get({path: "/users/:_id"}, this.read.bind(this))
        server.put({path: "/users/:_id"}, this.edit.bind(this))
        server.post({path: "/users"}, this.add.bind(this))
        server.del({path: "/users/:_id"}, this.delete.bind(this))

        server.post({path: "/users/create"}, this.create.bind(this))
        server.post({path: "/users/confirm"}, this.confirm.bind(this))
        server.post({path: "/users/resend"}, this.resend.bind(this))
        server.post({path: "/users/login"}, this.login.bind(this))
        server.post({path: "/users/logout"}, this.logout.bind(this))
        server.post({path: "/users/reset"}, this.reset.bind(this))
        server.post({path: "/users/change"}, this.change.bind(this))
        server.post({path: "/users/update"}, this.update.bind(this))
        server.post({path: "/users/refresh"}, this.refresh.bind(this))
    }

    browse(req, res, next) {
        async.waterfall([
            (callback) => {
                const query = {removed: false}

                User.find(query)
                    .select("-password")
                    .lean()
                    .exec((err, users) => {
                        if (err) {
                            return callback(Helper.error(err))
                        } else {
                            return callback(null, users)
                        }
                    })
            }
        ], (err, data) => {
            if (err) {
                return next(err)
            } else {
                res.send(Helper.success(data))

                return next()
            }
        })
    }

    read(req, res, next) {
        async.waterfall([
            (callback) => {
                if (req.params._id === undefined) {
                    return callback(Helper.fail(Messages.missingParametersError))
                } else {
                    return callback()
                }
            },

            (callback) => {
                const query = {
                    _id: req.params._id,
                    removed: false
                }

                User.findOne(query)
                    .lean()
                    .exec((err, user) => {
                        if (err) {
                            return callback(Helper.error(err))
                        } else {
                            return callback(null, user)
                        }
                    })
            }
        ], (err, data) => {
            if (err) {
                return next(err)
            } else {
                res.send(Helper.success(data))

                return next()
            }
        })
    }

    edit(req, res, next) {
        async.waterfall([
            (callback) => {
                if (req.params._id === undefined) {
                    return callback(Helper.fail(Messages.missingParametersError))
                } else {
                    return callback()
                }
            },

            (callback) => {
                const privileges = [config.system.privileges.administrateUsers]

                PrivilegeLinks.checkPrivileges(req.user._roleId, privileges, (err) => callback(err))
            },

            (callback) => {
                if (req.params._roleId) {
                    const query = {
                        _id: req.params._roleId,
                        removed: false
                    }

                    Role.findOne(query, (err, role) => {
                        if (err) {
                            return callback(Helper.error(err))
                        } else {
                            if (!role) {
                                return callback(Helper.fail(Messages.noRoleError))
                            } else {
                                return callback()
                            }
                        }
                    })
                } else {
                    return callback()
                }
            },

            (callback) => {
                const query = {
                    _id: req.params._id,
                    removed: false
                }

                User.findOne(query, (err, user) => {
                    if (err) {
                        return callback(Helper.error(err))
                    } else {
                        if (!user) {
                            return callback(Helper.fail(Messages.noUserError))
                        } else {
                            return callback(null, user)
                        }
                    }
                })
            },

            (user, callback) => {
                if (req.params._roleId) {
                    user._roleId = req.params._roleId
                }

                if (req.params.name) {
                    user.name = req.params.name
                }

                if (req.params.wipLimit) {
                    user.wipLimit = req.params.wipLimit
                }

                user.save((err) => {
                    if (err) {
                        return callback(Helper.fail(Messages.invalidParametersError))
                    } else {
                        return callback()
                    }
                })
            }
        ], (err) => {
            if (err) {
                return next(err)
            } else {
                res.send(Helper.success())

                return next()
            }
        })
    }

    add(req, res, next) {
        async.waterfall([
            (callback) => {
                if (req.params.email === undefined || req.params.password === undefined) {
                    return callback(Helper.fail(Messages.missingParametersError))
                } else {
                    return callback()
                }
            },

            (callback) => {
                const privileges = [config.system.privileges.administrateUsers]

                PrivilegeLinks.checkPrivileges(req.user._roleId, privileges, (err) => callback(err))
            },

            (callback) => {
                if (req.params._roleId) {
                    const query = {
                        _id: req.params._roleId,
                        removed: false
                    }

                    Role.findOne(query, (err, role) => {
                        if (err) {
                            return callback(Helper.error(err))
                        } else {
                            if (!role) {
                                return callback(Helper.fail(Messages.noRoleError))
                            } else {
                                return callback()
                            }
                        }
                    })
                } else {
                    return callback()
                }
            },

            (callback) => {
                const query = {
                    removed: false,
                    email: req.params.email
                }

                User.findOne(query, (err, user) => {
                    if (err) {
                        return callback(Helper.error(err))
                    } else {
                        if (user) {
                            return callback(Helper.fail(Messages.userExists))
                        } else {
                            return callback()
                        }
                    }
                })
            },

            (callback) => {
                const user = new User({
                    email: req.params.email,
                    password: req.params.password
                })

                if (req.params._roleId) {
                    user._roleId = req.params._roleId
                }

                if (req.params.name) {
                    user.name = req.params.name
                }

                if (req.params.wipLimit) {
                    user.wipLimit = req.params.wipLimit
                }

                user.save((err) => {
                    if (err) {
                        return callback(Helper.fail(Messages.invalidParametersError))
                    } else {
                        return callback(null, user._id)
                    }
                })
            }
        ], (err, data) => {
            if (err) {
                return next(err)
            } else {
                res.send(Helper.success(data))

                return next()
            }
        })
    }

    delete(req, res, next) {
        async.waterfall([
            (callback) => {
                if (req.params._id === undefined) {
                    return callback(Helper.fail(Messages.missingParametersError))
                } else {
                    return callback()
                }
            },

            (callback) => {
                const privileges = [config.system.privileges.administrateUsers]

                PrivilegeLinks.checkPrivileges(req.user._roleId, privileges, (err) => callback(err))
            },

            (callback) => {
                const query = {
                    _id: req.params._id,
                    removed: false
                }

                User.findOne(query, (err, user) => {
                    if (err) {
                        return callback(Helper.error(err))
                    } else {
                        if (!user) {
                            return callback(Helper.fail(Messages.noUserError))
                        } else {
                            return callback(null, user)
                        }
                    }
                })
            },

            (user, callback) => {
                user.removed = true
                user.refreshTime = new Date()

                user.save((err) => {
                    if (err) {
                        return callback(Helper.fail(Messages.invalidParametersError))
                    } else {
                        return callback()
                    }
                })
            }
        ], (err) => {
            if (err) {
                return next(err)
            } else {
                res.send(Helper.success())

                return next()
            }
        })
    }

    create(req, res, next) {
        async.waterfall([
            (callback) => {
                if (req.params.email === undefined || req.params.password === undefined) {
                    return callback(Helper.fail(Messages.missingParametersError))
                } else {
                    return callback()
                }
            },

            (callback) => {
                const query = {
                    removed: false,
                    email: req.params.email
                }

                User.findOne(query, (err, user) => {
                    if (err) {
                        return callback(Helper.error(err))
                    } else {
                        if (user) {
                            return callback(Helper.fail(Messages.userExists))
                        } else {
                            user = new User({
                                email: req.params.email,
                                password: req.params.password
                            })

                            return callback(null, user)
                        }
                    }
                })
            },

            (user, callback) => {
                const message = {_userId: user._id.toString()}
                const secret = config.tokens.confirm.secret
                const options = {expiresIn: config.tokens.confirm.expire}

                jwt.sign(message, secret, options, (err, token) => {
                    if (err) {
                        return callback(Helper.error(err))
                    } else {
                        return callback(null, user, token)
                    }
                })
            },

            (user, token, callback) => {
                if (config.mail.sendEmail === true) {
                    const message = `Hello,<br/>
                    <p>Welcome to kpmt.io!</p> 
                    <p>
                        <p>To complete registration, click or copy the link below:</p> 
                        <a href="${config.urls.confirmMail}?token=${token}">
                            ${config.urls.confirmMail}?token=${token}
                        </a>
                    </p>
                    <p>
                        Best,<br/>
                        Webtr.io Team
                    </p>`

                    const mailOptions = {
                        from: config.mail.sender,
                        to: user.email,
                        subject: "Registration at kpmt.io",
                        html: message
                    }

                    mailer.sendMail(mailOptions, (err) => {
                        if (err) {
                            return callback(Helper.error(err))
                        } else {
                            return callback(null, user)
                        }
                    })
                } else {
                    return callback(null, user)
                }
            },

            (user, callback) => {
                user.save((err) => {
                    if (err) {
                        return callback(Helper.fail(Messages.invalidParametersError))
                    } else {
                        return callback(null, user)
                    }
                })
            }
        ], (err) => {
            if (err) {
                return next(err)
            } else {
                res.send(Helper.success())

                return next()
            }
        })
    }

    confirm(req, res, next) {
        async.waterfall([
            (callback) => {
                if (req.params.token === undefined) {
                    return callback(Helper.fail(Messages.missingParametersError))
                } else {
                    return callback()
                }
            },

            (callback) => {
                jwt.verify(req.params.token, config.tokens.confirm.secret, (err, decoded) => {
                    if (err) {
                        if (err.name !== "TokenExpiredError") {
                            return callback(Helper.error(err))
                        } else {
                            return callback(Helper.fail(Messages.confirmTokenExpiredError))
                        }
                    } else {
                        return callback(null, decoded)
                    }
                })
            },

            (decoded, callback) => {
                const query = {
                    _id: decoded._userId,
                    removed: false
                }

                User.findOne(query, (err, user) => {
                    if (err) {
                        return callback(Helper.error(err))
                    } else {
                        if (!user) {
                            return callback(Helper.fail(Messages.noUserError))
                        } else if (user.confirmed === true) {
                            return callback(Helper.fail(Messages.userConfirmedError))
                        } else {
                            user.confirmed = true
                            user.refreshTime = new Date()

                            user.save((err) => {
                                if (err) {
                                    return callback(Helper.fail(Messages.invalidParametersError))
                                } else {
                                    return callback()
                                }
                            })
                        }
                    }
                })
            }
        ], (err) => {
            if (err) {
                return next(err)
            } else {
                res.send(Helper.success())

                return next()
            }
        })
    }

    resend(req, res, next) {
        async.waterfall([
            (callback) => {
                if (req.params.email === undefined) {
                    return callback(Helper.fail(Messages.missingParametersError))
                } else {
                    return callback()
                }
            },

            (callback) => {
                const query = {
                    removed: false,
                    email: req.params.email
                }

                User.findOne(query, (err, user) => {
                    if (err) {
                        return callback(Helper.error(err))
                    } else {
                        if (!user) {
                            return callback(Helper.fail(Messages.noUserError))
                        } else if (user.confirmed === true) {
                            return callback(Helper.fail(Messages.userConfirmedError))
                        } else {
                            return callback(null, user)
                        }
                    }
                })
            },

            (user, callback) => {
                const message = {_userId: user._id.toString()}
                const secret = config.tokens.confirm.secret
                const options = {expiresIn: config.tokens.confirm.expire}

                jwt.sign(message, secret, options, (err, token) => {
                    if (err) {
                        return callback(token)
                    } else {
                        return callback(null, token)
                    }
                })
            },

            (token, callback) => {
                const message = `Hello,<br/>
                    <p>Welcome to kpmt.io!</p>
                    <p>
                        To complete registration, please copy/paste or click on
                        <a href="${config.urls.confirmMail}?token=${token}">
                            ${config.urls.confirmMail}?token=${token}
                        </a>
                    </p>
                    <p>
                        Best,<br/>
                        kpmt.io Team
                    </p>`

                const mailOptions = {
                    from: config.mail.sender,
                    to: req.params.email,
                    subject: "Registration at kmpt.io",
                    html: message
                }

                if (config.mail.send === true) {
                    mailer.sendMail(mailOptions, (err) => {
                        if (err) {
                            return callback(Helper.error(err))
                        } else {
                            return callback()
                        }
                    })
                } else {
                    return callback()
                }
            }
        ], (err) => {
            if (err) {
                return next(err)
            } else {
                res.send(Helper.success())

                return next()
            }
        })
    }

    login(req, res, next) {
        async.waterfall([
            (callback) => {
                if (req.params.email === undefined || req.params.password === undefined) {
                    return callback(Helper.fail(Messages.missingParametersError))
                } else {
                    if (req.params.remember === undefined) {
                        req.params.remember = "no"
                    }

                    return callback()
                }
            },

            (callback) => {
                const query = {
                    email: req.params.email,
                    removed: false
                }

                User.findOne(query, (err, user) => {
                    if (err) {
                        return callback(Helper.error(err))
                    } else {
                        if (!user) {
                            return callback(Helper.fail(Messages.badCredentialsError))
                        } else if (user.confirmed === false) {
                            return callback(Helper.fail(Messages.userNotConfirmedError))
                        } else {
                            return callback(null, user)
                        }
                    }
                })
            },

            (user, callback) => {
                user.verifyPassword(req.params.password, (err, valid) => {
                    if (err) {
                        return callback(Helper.error(err))
                    } else if (valid === false) {
                        return callback(Helper.fail(Messages.badCredentialsError))
                    } else {
                        return callback(null, user)
                    }
                })
            },

            (user, callback) => {
                const message = {
                    _id: user._id.toString(),
                    remember: req.params.remember
                }

                if (user._roleId) {
                    message._roleId = user._roleId.toString()
                }

                const secret = config.tokens.user.secret
                const options = {expiresIn: config.tokens.user.expire}

                jwt.sign(message, secret, options, (err, token) => {
                    if (err) {
                        return callback(Helper.error(err))
                    } else {
                        return callback(null, user, token)
                    }
                })
            },

            (user, token, callback) => {
                user.save((err) => {
                    if (err) {
                        return callback(Helper.fail(Messages.invalidParametersError))
                    } else {
                        const data = {token: token}

                        return callback(null, data)
                    }
                })
            }
        ], (err, data) => {
            if (err) {
                return next(err)
            } else {
                res.send(Helper.success(data))

                return next()
            }
        })
    }

    logout(req, res, next) {
        async.waterfall([
            (callback) => {
                User.findById(req.user._id, (err, user) => {
                    if (err) {
                        return callback(Helper.error(err))
                    } else {
                        if (!user) {
                            return callback(Helper.error(Messages.noUserError))
                        } else {
                            return callback(null, user)
                        }
                    }
                })
            },

            (user, callback) => {
                user.refreshTime = new Date()

                user.save((err) => {
                    if (err) {
                        return callback(Helper.fail(Messages.invalidParametersError))
                    } else {
                        return callback()
                    }
                })
            }
        ], (err) => {
            if (err) {
                return next(err)
            } else {
                res.send(Helper.success())

                return next()
            }
        })
    }

    reset(req, res, next) {
        async.waterfall([
            (callback) => {
                if (req.params.email === undefined) {
                    return callback(Helper.fail(Messages.missingParametersError))
                } else {
                    return callback()
                }
            },

            (callback) => {
                const query = {
                    removed: false,
                    email: req.params.email
                }

                User.findOne(query, (err, user) => {
                    if (err) {
                        return callback(Helper.error(err))
                    } else {
                        if (!user) {
                            return callback(Helper.fail(Messages.noUserError))
                        } else if (user.confirmed === false) {
                            return callback(Helper.fail(Messages.userNotConfirmedError))
                        } else {
                            return callback(null, user)
                        }
                    }
                })
            },

            (user, callback) => {
                const message = {_userId: user._id.toString()}
                const secret = config.tokens.reset.secret
                const options = {expiresIn: config.tokens.reset.expire}

                jwt.sign(message, secret, options, (err, token) => {
                    if (err) {
                        return callback(Helper.error(err))
                    } else {
                        return callback(null, token)
                    }
                })
            },

            (token, callback) => {
                const message = `Hello,<br/>
                    <p>Someone, hopefully you, requested a password reset.</p>
                    <p>
                        <p>To complete password reset, click or copy link below:</p>
                        <a href="${config.urls.resetMail}?token=${token}">
                            ${config.urls.resetMail}?token=${token}
                        </a>
                    </p>
                    <p>
                        Best,<br/>
                        kpmt.io Team
                    </p>`

                const mailOptions = {
                    from: config.mail.sender,
                    to: req.params.email,
                    subject: "Your password reset request",
                    html: message
                }

                if (config.mail.send === true) {
                    mailer.sendMail(mailOptions, (err) => {
                        if (err) {
                            return callback(Helper.error(err))
                        } else {
                            return callback()
                        }
                    })
                } else {
                    return callback()
                }
            }
        ], (err) => {
            if (err) {
                return next(err)
            } else {
                res.send(Helper.success())

                return next()
            }
        })
    }

    change(req, res, next) {
        async.waterfall([
            (callback) => {
                if (req.params.token === undefined || req.params.password === undefined) {
                    return callback(Helper.fail(Messages.missingParametersError))
                } else {
                    return callback()
                }
            },

            (callback) => {
                jwt.verify(req.params.token, config.tokens.reset.secret, (err, decoded) => {
                    if (err) {
                        if (err.name !== "TokenExpiredError") {
                            return callback(Helper.error(err))
                        } else {
                            return callback(Helper.fail(Messages.resetTokenExpiredError))
                        }
                    } else {
                        return callback(null, decoded)
                    }
                })
            },

            (decoded, callback) => {
                User.findById(decoded._userId, (err, user) => {
                    if (err) {
                        return callback(Helper.error(err))
                    } else if (!user) {
                        return callback(Helper.fail(Messages.noUserError))
                    } else if (user.confirmed === false) {
                        return callback(Helper.fail(Messages.userNotConfirmedError))
                    } else {
                        return callback(null, user)
                    }
                })
            },

            (user, callback) => {
                user.password = req.params.password

                user.save((err) => {
                    if (err) {
                        return callback(Helper.fail(Messages.invalidParametersError))
                    } else {
                        return callback()
                    }
                })
            }
        ], (err) => {
            if (err) {
                return next(err)
            } else {
                res.send(Helper.success())

                return next()
            }
        })
    }

    update(req, res, next) {
        async.waterfall([
            (callback) => {
                if (req.params.email === undefined || req.params.oldPassword === undefined
                    || req.params.password === undefined) {

                    return callback(Helper.fail(Messages.missingParametersError))
                } else {
                    return callback()
                }
            },

            (callback) => {
                const query = {
                    removed: false,
                    email: req.params.email
                }

                User.findOne(query, (err, user) => {
                    if (err) {
                        return callback(Helper.error(err))
                    } else {
                        if (!user) {
                            return callback(Helper.fail(Messages.badCredentialsError))
                        } else if (user.confirmed === false) {
                            return callback(Helper.fail(Messages.userNotConfirmedError))
                        } else {
                            return callback(null, user)
                        }
                    }
                })
            },

            (user, callback) => {
                user.verifyPassword(req.params.oldPassword, (err, valid) => {
                    if (err) {
                        return callback(Helper.error(err))
                    } else if (valid === false) {
                        return callback(Helper.fail(Messages.badCredentialsError))
                    } else {
                        return callback(null, user)
                    }
                })
            },

            (user, callback) => {
                user.password = req.params.password

                user.save((err) => {
                    if (err) {
                        return callback(Helper.fail(Messages.invalidParametersError))
                    } else {
                        return callback()
                    }
                })
            }
        ], (err) => {
            if (err) {
                return next(err)
            } else {
                res.send(Helper.success())

                return next()
            }
        })
    }

    refresh(req, res, next) {
        async.waterfall([
            (callback) => {
                if (req.headers.authorization === undefined) {
                    return callback(Helper.fail(Messages.missingParametersError))
                } else {
                    return callback()
                }
            },

            (callback) => {
                jwt.verify(req.headers.authorization, config.tokens.user.secret, (err) => {
                    if (err) {
                        if (err.name !== "TokenExpiredError") {
                            return callback(Helper.error(err))
                        } else {
                            return callback(null, err.expiredAt)

                        }
                    } else {
                        return callback(Helper.fail(Messages.userTokenValidError))
                    }
                })
            },

            (expiretAt, callback) => {
                const decoded = jwt.decode(req.headers.authorization)

                if (decoded.remember === "no") {
                    return callback(Helper.fail(Messages.reloginRequiredError))
                } else {
                    return callback(null, expiretAt, decoded)
                }
            },

            (expiredAt, decoded, callback) => {
                const query = {
                    _id: decoded._id,
                    refreshTime: {$lt: expiredAt}
                }

                User.findOne(query, (err, user) => {
                    if (err) {
                        return callback(Helper.error(err))
                    } else {
                        if (!user) {
                            return callback(Helper.fail(Messages.reloginRequiredError))
                        } else {
                            return callback(null, decoded, user)
                        }
                    }
                })
            },

            (decoded, user, callback) => {
                const message = {
                    _id: decoded._id,
                    remember: decoded.remember
                }
                const secret = config.tokens.user.secret
                const options = {expiresIn: config.tokens.user.expire}

                jwt.sign(message, secret, options, (err, token) => {
                    if (err) {
                        return callback(Helper.error(err))
                    } else {
                        const data = {token: token}

                        return callback(Helper.error(err), data)
                    }
                })
            }
        ], (err, data) => {
            if (err) {
                return next(err)
            } else {
                res.send(Helper.success(data))

                return next()
            }
        })
    }
}

module.exports = UserRoutes
