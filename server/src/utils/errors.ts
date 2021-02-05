export const LOGIN_ERROR = {
    errors: [{
        field: 'usernameOrEmail',
        message: 'Could not log in...',
    }]
}

export const USERNAME_LENGTH_ERROR = {
    errors: [{
        field: 'username',
        message: 'Length of username must be at least 3 characters long...',
    }]
}

export const USERNAME_NOT_VALID = {
    errors: [{
        field: 'username',
        message: 'User name can not contain special characters...',
    }]
}

export const EMAIL_LENGTH_ERROR = {
    errors: [{
        field: 'email',
        message: 'Length of email must be at least 3 characters long...',
    }]
}

export const PASSWORD_LENGTH_ERROR = {
    errors: [{
        field: 'password',
        message: 'Length of password must be at least 6 characters long...',
    }]
}

export const USERNAME_TAKEN_ERROR = {
    errors: [{
        field: 'username',
        message: 'Username already taken...',
    }]
}