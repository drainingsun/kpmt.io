const Helper = require(`${__base}libs/helper`)
const Messages = require(`${__base}libs/messages`)

const UserLink = require(`${__base}models/userLink`)

class UserLinks {
    static checkLink(levelId, userId, callback) {
        const query = {
            _levelId: levelId,
            _userId: userId,
            removed: false
        }

        UserLink.findOne(query, (err, userLink) => {
            if (err) {
                return callback(Helper.error(err))
            } else {
                if (!userLink) {
                    return callback(Helper.fail(Messages.noUserLinkError))
                } else {
                    return callback()
                }
            }
        })
    }
}

module.exports = UserLinks