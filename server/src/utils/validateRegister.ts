import * as ERRORS from "./errors"
import {UsernamePasswordInput} from './UsernamePasswordInput'

export const validateRegister = (options: UsernamePasswordInput) => {
    if (options.username.length <= 2) {
        return ERRORS.USERNAME_LENGTH_ERROR;
    }
    if (options.username.includes("@")) {
        return ERRORS.USERNAME_NOT_VALID;
    }
    if (options.password.length <= 4) {
        return ERRORS.PASSWORD_LENGTH_ERROR;
    }
    if (options.email.length <= 3) {
        return ERRORS.EMAIL_LENGTH_ERROR;
    }
    return null;
}