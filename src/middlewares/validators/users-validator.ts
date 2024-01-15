import {body} from "express-validator";
import {inputModelValidation} from "../inputModel/input-model-validation";
import {usersQueryRepository} from "../../repositories/users-db-query-repository";
import {NextFunction, Request, Response} from "express";
import {sub} from "date-fns";
import {authQueryRepository} from "../../repositories/auth-db-query-repository";
import {HTTP_STATUSES} from "../../utils";
import {AttemptType} from "../../types/auth/output";
import {authService} from "../../domain/auth-service";

const loginValidation = body('login')
    .isString()
    .trim()
    .isLength({min: 3, max: 10})
    .withMessage('Invalid login')
    .matches(/^[a-zA-Z0-9_-]*$/)
    .withMessage('Invalid login pattern')
    .custom(async(value) => {
        const user = await usersQueryRepository
            .getUserByLogin(value)

        if (!user) {
            return true
        } else {
            throw new Error('Login already exists')
        }
    })

const passwordValidation = body('password')
    .isString()
    .trim()
    .isLength({min: 6, max: 20})
    .withMessage('Invalid password')

const newPasswordValidation = body('newPassword')
    .isString()
    .trim()
    .isLength({min: 6, max: 20})
    .withMessage('Invalid password')

const emailUniqueValidation = body('email')
    .custom(async(value) => {
        const user = await usersQueryRepository
            .getUserByEmail(value)

        if (user) throw new Error('Email already exists')

        return true
    })

const emailValidation = body('email')
    .isString()
    .trim()
    .withMessage('Invalid email')
    .matches(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/)
    .withMessage('Invalid email pattern')

const loginOrEmailValidation = body('loginOrEmail')
    .isString()
    .trim()
    .notEmpty()
    .custom(async (value) => {
        if (/^[a-zA-Z0-9_-]{3,10}$/.test(value)) {
            return true
        } else if (/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(value)) {
            return true
        } else {
            throw new Error('Invalid login or email')
        }
    })
    .withMessage('Invalid login or email')

const confirmEmailValidation = body('email')
    .isString()
    .trim()
    .withMessage('Invalid email')
    .matches(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/)
    .withMessage('Invalid email pattern')
    .custom(async(value) => {
        const user = await usersQueryRepository
            .getUserByEmail(value)

        if (!user) throw new Error('Email is not exist')
        if (user!.emailConfirmation.isConfirmed) throw new Error('Email is already confirmed')

        return true
    })

const codeValidation = body('code')
    .isString()
    .trim()
    .notEmpty()
    .withMessage('Invalid code')
    .custom(async(value) => {
        const user = await usersQueryRepository
            .getUserByConfirmationCode(value)

        if (!user) throw new Error('Invalid code')
        if (user.emailConfirmation.isConfirmed) throw new Error('Code already been applied')
        if (user.emailConfirmation.expirationDate !== null && user.emailConfirmation.expirationDate < new Date()) throw new Error('Code expired')

        return true
    })

const recoveryCodeValidation = body('recoveryCode')
    .isString()
    .trim()
    .notEmpty()
    .withMessage('Invalid code')
    .custom(async(value) => {
        const user = await usersQueryRepository
            .getUserByConfirmationCode(value)

        if (!user) throw new Error('Invalid code')
        if (user.emailConfirmation.expirationDate !== null && user.emailConfirmation.expirationDate < new Date()) throw new Error('Code expired')

        return true
    })

export const userValidation = () => [loginValidation, passwordValidation, emailValidation, emailUniqueValidation, inputModelValidation]
export const userAuthValidation = () => [loginOrEmailValidation, passwordValidation, inputModelValidation]
export const userRegistrationCodeValidation = () => [codeValidation, inputModelValidation]
export const userConfirmEmailValidation = () => [confirmEmailValidation, inputModelValidation]
export const userEmailValidation = () => [emailValidation, inputModelValidation]
export const userNewPasswordValidation = () => [newPasswordValidation, inputModelValidation]
export const userRecoveryCodeValidation = () => [recoveryCodeValidation, inputModelValidation]

