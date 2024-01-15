import {DeviceModelClass} from "../db/db";
import {DeviceSessionType} from "../types/device/output";

export const devicesRepository = {
    async createDeviceSession(newDeviceSession: DeviceSessionType): Promise<DeviceSessionType> {
        await DeviceModelClass
            .create(newDeviceSession)
        return newDeviceSession
    },
    async updateDeviceSession(updateData: DeviceSessionType): Promise<boolean> {
        const resultUpdateDeviceSession = await DeviceModelClass
            .updateOne({
                deviceId: updateData.deviceId,
                userId: updateData.userId},
                {
                    $set: {
                    iat: updateData.iat,
                    exp: updateData.exp,
                    ip: updateData.ip,
                    deviceName: updateData.deviceName
                    }
                })

        return resultUpdateDeviceSession.matchedCount === 1
    },
    async terminateDeviceSessionByLogout(deviceId: string, userId: string): Promise<boolean> {
        const resultTerminateDeviceSession = await DeviceModelClass
            .deleteOne({deviceId: deviceId, userId: userId})
        return resultTerminateDeviceSession.deletedCount === 1
    },
    async terminateAllOthersDevicesSessions(userId: string, deviceId: string): Promise<boolean> {
        const resultTerminateAllOthersDevicesSessions = await DeviceModelClass
            .deleteMany({
                userId: userId,
                deviceId: {
                    $ne: deviceId
                }
            })
        return resultTerminateAllOthersDevicesSessions.deletedCount === 1
    },
    async terminateDeviceSessionById(deviceId: string): Promise<boolean> {
        const resultTerminateDeviceSession = await DeviceModelClass
            .deleteOne({deviceId: deviceId})
        return resultTerminateDeviceSession.deletedCount === 1
    }
}