"use strict"

const nodemailer = require("nodemailer")

const config = require(`${__base}libs/config`)

class Mailer {
    constructor() {
        const smtpConfig = {
            host: config.mail.smtpProvider,
            port: 465,
            secure: true,
            auth: {
                user: config.mail.from,
                pass: config.mail.password
            }
        }

        return nodemailer.createTransport(smtpConfig)
    }
}

const mailerInstance = new Mailer()

module.exports = mailerInstance