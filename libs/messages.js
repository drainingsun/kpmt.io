"use strict"

class Messages {
    static get offlineStatus() {
        return {
            code: "api-1",
            message: "OFFLINE"
        }
    }

    static get internalServerError() {
        return {
            code: "api-2",
            message: "Server encountered unexpected problem."
        }
    }

    static get missingParametersError() {
        return {
            code: "api-3",
            message: "Missing parameters."
        }
    }

    static get actionNotAllowedError() {
        return {
            code: "api-5",
            message: "Action not allowed."
        }
    }

    static get invalidParametersError() {
        return {
            code: "api-6",
            message: "Invalid parameters."
        }
    }


    static get confirmTokenExpiredError() {
        return {
            code: "api-7",
            message: "Confirm token has expired."
        }
    }

    static get noUserError() {
        return {
            code: "api-8",
            message: "User not found."
        }
    }

    static get userConfirmedError() {
        return {
            code: "api-9",
            message: "User already confirmed."
        }
    }

    static get badCredentialsError() {
        return {
            code: "api-10",
            message: "Bad credentials."
        }
    }

    static get userNotConfirmedError() {
        return {
            code: "api-11",
            message: "User has not been confirmed yet."
        }
    }

    static get resetTokenExpiredError() {
        return {
            code: "api-12",
            message: "Reset token has expired."
        }
    }

    static get reloginRequiredError() {
        return {
            code: "api-13",
            message: "Re-login required."
        }
    }

    static get userTokenValidError() {
        return {
            code: "api-14",
            message: "User token is still valid."
        }
    }

    static get userTokenExpiredError() {
        return {
            code: "api-15",
            message: "User token has expired."
        }
    }

    static get userLoggedInError() {
        return {
            code: "api-16",
            message: "User is logged in."
        }
    }

    static get userExists() {
        return {
            code: "api-17",
            message: "User already exists."
        }
    }

    static get noProjectError() {
        return {
            code: "api-18",
            message: "Board not found."
        }
    }

    static get noBoardError() {
        return {
            code: "api-18",
            message: "Board not found."
        }
    }

    static get noSwimlaneError() {
        return {
            code: "api-19",
            message: "Swimlane not found."
        }
    }

    static get noColumnError() {
        return {
            code: "api-20",
            message: "Column not found."
        }
    }

    static get noCardError() {
        return {
            code: "api-21",
            message: "Card not found."
        }
    }

    static get noTaskError() {
        return {
            code: "api-22",
            message: "Task not found."
        }
    }

    static get noLabelError() {
        return {
            code: "api-23",
            message: "Label not found."
        }
    }

    static get noPriorityError() {
        return {
            code: "api-24",
            message: "Priority not found."
        }
    }

    static get noStatusError() {
        return {
            code: "api-25",
            message: "Status not found."
        }
    }

    static get noRoleError() {
        return {
            code: "api-26",
            message: "Role not found."
        }
    }

    static get noUserLinkError() {
        return {
            code: "api-27",
            message: "UserLink not found."
        }
    }

    static get userLinkExists() {
        return {
            code: "api-28",
            message: "UserLink already exists."
        }
    }

    static get noLabelLinkError() {
        return {
            code: "api-29",
            message: "LabelLink not found."
        }
    }

    static get labelLinkExists() {
        return {
            code: "api-30",
            message: "LabelLink already exists."
        }
    }

    static get noNewCardError() {
        return {
            code: "api-31",
            message: "New card not found."
        }
    }

    static get noNewSwimlaneError() {
        return {
            code: "api-32",
            message: "New swimlane not found."
        }
    }

    static get noNewColumnError() {
        return {
            code: "api-33",
            message: "New column not found."
        }
    }

    static get noNewStatusError() {
        return {
            code: "api-34",
            message: "New status not found."
        }
    }

    static get noPrivilegeLinkError() {
        return {
            code: "api-35",
            message: "PrivilegeLink not found."
        }
    }

    static get privilegeLinkExists() {
        return {
            code: "api-30",
            message: "PrivilegeLink already exists."
        }
    }
}

module.exports = Messages