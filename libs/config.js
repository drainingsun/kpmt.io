"use strict"

class Config {
    constructor() {
        const environments = new Set(["production", "staging", "testing", "development"])

        if (environments.has(process.env.NODE_ENV) === false) {
            throw new Error("No valid environment variable declared.")
        }

        const config = require(`${__base}config/${process.env.NODE_ENV}`)

        if (config.system !== undefined) {
            throw new Error("config.system is reserved and will be overwritten.")
        }

        config.system = require(`${__base}system.json`)

        return config
    }
}

const configInstance = new Config()

module.exports = configInstance