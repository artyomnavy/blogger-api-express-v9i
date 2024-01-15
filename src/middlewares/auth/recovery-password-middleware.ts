import {NextFunction, Request, Response} from "express";
import {usersQueryRepository} from "../../repositories/users-db-query-repository";
import {HTTP_STATUSES} from "../../utils";

export const recoveryPasswordMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    const recoveryCode = req.body.recoveryCode
    const newPassword = req.body.newPassword

    const isOldPassword = await usersQueryRepository
        .checkUserPasswordForRecovery(recoveryCode, newPassword)

    if (isOldPassword) {
        res.sendStatus(HTTP_STATUSES.UNAUTHORIZED_401)
        return
    }

    next()
}