import {Request, Response, NextFunction} from "express";
import {Buffer} from 'node:buffer'
import {HTTP_STATUSES} from "../../utils";
import {jwtService} from "../../application/jwt-service";
import {devicesQueryRepository} from "../../repositories/devices-db-query-repository";
import {usersQueryRepository} from "../../repositories/users-db-query-repository";

// Basic auth with use 'express-basic-auth'
// 1) In terminal add command: yarn add express-basic-auth
// 2) import basicAuth from "express-basic-auth"
// 3) const auth = {
//     users: {
//         login: 'password'
//     }
// }
// 4) export const authMiddleware = basicAuth(auth)

const login = process.env.BASIC_AUTH_LOGIN || 'admin'
const password = process.env.BASIC_AUTH_PASSWORD || 'qwerty'

export const authBasicMiddleware = (req: Request, res: Response, next: NextFunction) => {
    //Simple way
    /*if (req.headers['authorization'] !== 'Basic login:password') {
        res.sendStatus(401)
        return
    }
    return next()
    */

    const auth = req.headers['authorization']

    if (!auth) {
        res.sendStatus(HTTP_STATUSES.UNAUTHORIZED_401)
        return
    }

    const [basic, token] = auth.split(' ')

    if (basic !== 'Basic') {
        res.sendStatus(HTTP_STATUSES.UNAUTHORIZED_401)
        return
    }

    const decodedData = Buffer.from(token, 'base64').toString()
    //admin:password

    const [decodedLogin, decodedPassword] = decodedData.split(':')

    if (decodedLogin !== login || decodedPassword !== password) {
        res.sendStatus(HTTP_STATUSES.UNAUTHORIZED_401)
        return
    }

    return next()
}

export const authBearerMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    const auth = req.headers.authorization

    if (!auth) {
        res.sendStatus(HTTP_STATUSES.UNAUTHORIZED_401)
        return
    }

    const accessToken = auth.split(' ')[1] // 'Bearer token'

    const payloadToken = await jwtService
        .checkToken(accessToken)

    if (payloadToken) {
        req.userId = payloadToken.userId
        return next()
    }

    res.sendStatus(HTTP_STATUSES.UNAUTHORIZED_401)
    return
}

export const authRefreshTokenMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    const refreshToken = req.cookies.refreshToken

    if (!refreshToken) {
        res.sendStatus(HTTP_STATUSES.UNAUTHORIZED_401)
        return
    }

    const payloadToken = await jwtService
        .checkToken(refreshToken)

    if (!payloadToken) {
        res.sendStatus(HTTP_STATUSES.UNAUTHORIZED_401)
        return
    }

    req.userId = payloadToken.userId
    req.deviceId = payloadToken.deviceId

    const user = await usersQueryRepository
        .getUserById(payloadToken.userId)

    if (!user) {
        res.sendStatus(HTTP_STATUSES.UNAUTHORIZED_401)
        return
    }

    const deviceSession = await devicesQueryRepository
        .checkDeviceSession(payloadToken.userId, payloadToken.deviceId)

    if (!deviceSession) {
        res.sendStatus(HTTP_STATUSES.UNAUTHORIZED_401)
        return
    }

    const iatRefreshToken = new Date(payloadToken.iat * 1000)

    if (iatRefreshToken < deviceSession.iat) {
        res.sendStatus(HTTP_STATUSES.UNAUTHORIZED_401)
        return
    }

    next()
}