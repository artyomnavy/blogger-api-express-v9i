import {Response, Request, Router} from "express";
import {devicesQueryRepository} from "../repositories/devices-db-query-repository";
import {authRefreshTokenMiddleware} from "../middlewares/auth/auth-middleware";
import {devicesService} from "../domain/devices-service";
import {HTTP_STATUSES} from "../utils";
import {Params, RequestWithParams} from "../types/common";
import {deviceSessionMiddleware} from "../middlewares/device-middleware";

export const securityRouter = Router({})

securityRouter.get('/devices',
    authRefreshTokenMiddleware,
    async (req: Request, res: Response) => {
        const userId = req.userId!

        const devicesSessions = await devicesQueryRepository
            .getAllDevicesSessionsForUser(userId)

        res.send(devicesSessions)
    })

securityRouter.delete('/devices',
    authRefreshTokenMiddleware,
    async (req: Request, res: Response) => {
        const userId = req.userId!
        const deviceId = req.deviceId!

        const isTerminateDevicesSessions = await devicesService
            .terminateAllOthersDevicesSessions(userId, deviceId)

        if (isTerminateDevicesSessions) {
            res.sendStatus(HTTP_STATUSES.NO_CONTENT_204)
        }
    })

securityRouter.delete('/devices/:id',
    authRefreshTokenMiddleware,
    deviceSessionMiddleware,
    async (req: RequestWithParams<Params>, res: Response) => {
        const deviceId = req.params.id

        const isTerminateDeviceSessionById = await devicesService
            .terminateDeviceSessionById(deviceId)

        if (isTerminateDeviceSessionById) {
            res.sendStatus(HTTP_STATUSES.NO_CONTENT_204)
        }
    })