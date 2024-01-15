import {Params, RequestWithParams} from "../types/common";
import {NextFunction, Response} from "express";
import {devicesQueryRepository} from "../repositories/devices-db-query-repository";
import {HTTP_STATUSES} from "../utils";

export const deviceSessionMiddleware = async (req: RequestWithParams<Params>, res: Response, next: NextFunction) => {
    const deviceId = req.params.id
    const userId = req.userId

    const deviceSession = await devicesQueryRepository
        .getDeviceSessionById(deviceId)

    if (!deviceSession) {
        res.sendStatus(HTTP_STATUSES.NOT_FOUND_404)
        return
    }

    if (userId !== deviceSession.userId) {
        res.sendStatus(HTTP_STATUSES.FORBIDDEN_403)
        return
    }

    next()
}