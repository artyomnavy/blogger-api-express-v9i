import {NextFunction, Request, Response} from "express";
import {sub} from "date-fns";
import {authQueryRepository} from "../../repositories/auth-db-query-repository";
import {HTTP_STATUSES} from "../../utils";
import {authService} from "../../domain/auth-service";
import {AttemptType} from "../../types/auth/output";

export const attemptsMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    const limitDate = sub(new Date(), {
        seconds: 10
    })
    const ip = req.ip! || 'unknown'
    const url = req.originalUrl

    const amount = await authQueryRepository
        .getAmountOfAttempts({ip, url, date: limitDate})

    if (amount >= 5) {
        res.sendStatus(HTTP_STATUSES.TOO_MANY_REQUESTS_429)
        return
    }

    const attempt: AttemptType = {
        ip: ip,
        url: url,
        date: new Date()
    }

    await authService
        .addAttempt(attempt)

    next()
}