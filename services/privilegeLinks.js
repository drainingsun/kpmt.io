const async = require("async")

const Helper = require(`${__base}libs/helper`)
const Messages = require(`${__base}libs/messages`)

const PrivilegeLink = require(`${__base}models/privilegeLink`)

class PrivilegeLinks {
    static checkPrivileges(roleId, privileges, callback) {
        async.waterfall([
            (callback) => {
                const query = {
                    _roleId: roleId,
                    removed: false
                }

                PrivilegeLink.find(query, (err, privilegeLinks) => {
                    if (err) {
                        return callback(Helper.error(err))
                    } else {
                        return callback(null, privilegeLinks)
                    }
                })
            },

            (privilegeLinks, callback) => {
                let foundPrivilege = false

                privilegeCheck:
                    for (const privilegeLink of privilegeLinks) {
                        for (const privilege of privileges) {
                            if (privilegeLink.privilege === privilege) {
                                foundPrivilege = privilege

                                break privilegeCheck
                            }
                        }
                    }

                if (!foundPrivilege) {
                    return callback(Helper.fail(Messages.actionNotAllowedError))
                } else {
                    return callback(null, foundPrivilege)
                }
            }
        ], (err, foundPrivilege) => callback(err, foundPrivilege))
    }
}

module.exports = PrivilegeLinks