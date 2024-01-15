import {WithId} from "mongodb";
import {DeviceModelClass} from "../db/db";
import {OutputDeviceSessionType, DeviceSessionType} from "../types/device/output";
import {deviceSessionMapper} from "../types/device/mapper";

export const devicesQueryRepository = {
    async checkDeviceSession(userId: string, deviceId: string): Promise<WithId<DeviceSessionType> | null> {
        const deviceSession: WithId<DeviceSessionType> | null = await DeviceModelClass
            .findOne({userId: userId, deviceId: deviceId}).lean()

        if (deviceSession) {
            return deviceSession
        } else {
            return null
        }
    },
    async getAllDevicesSessionsForUser(userId: string): Promise<OutputDeviceSessionType[]> {
        const devicesSessions = await DeviceModelClass
            .find({userId: userId}).lean()
        return devicesSessions.map(deviceSessionMapper)
    },
    async getDeviceSessionById(deviceId: string): Promise<WithId<DeviceSessionType> | null> {
        const deviceSession: WithId<DeviceSessionType> | null = await DeviceModelClass
            .findOne({deviceId: deviceId}).lean()

        if (deviceSession) {
            return deviceSession
        } else {
            return null
        }
    }
}