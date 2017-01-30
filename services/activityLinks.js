const Helper = require(`${__base}libs/helper`)
const Messages = require(`${__base}libs/messages`)

const ActivityLink = require(`${__base}models/activityLink`)

class ActivityLinks {
    static add(levelId, userId, activity, callback) {
        const activityLink = new ActivityLink({
            _levelId: levelId,
            _userId: userId,
            name: activity
        })

        activityLink.save((err) => {
            if (err) {
                return callback(Helper.fail(Messages.invalidParametersError))
            } else {
                return callback()
            }
        })
    }
}

module.exports = ActivityLinks