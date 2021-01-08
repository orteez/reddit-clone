export const LOGIN_ERROR = {
    errors: [{
        field: 'login',
        message: 'Could not log in...',
    }]
}

export const USERNAME_LENGTH_ERROR = {
    errors: [{
        field: 'username',
        message: 'Length of username must be at least 3 characters long...',
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