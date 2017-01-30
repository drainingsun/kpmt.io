"use strict"

class Helper {
    static success(data = null) {
        return {
            status: "success",
            data: data
        }
    }

    static fail(err) {
        let result = null

        if (err) {
            result = {
                status: "fail",
                data: err
            }
        }

        return result
    }

    static error(err) {
        let result = null

        if (err) {
            result = {
                status: "error",
                data: err
            }
        }

        return result
    }
}

module.exports = Helper