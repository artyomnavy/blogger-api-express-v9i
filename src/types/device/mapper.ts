import {WithId} from "mongodb";
import {DeviceSessionType, OutputDeviceSessionType} from "./output";

export const deviceSessionMapper = (deviceSession: WithId<DeviceSessionType>): OutputDeviceSessionType => {
    return {
        ip: deviceSession.ip,
        title: deviceSession.deviceName,
        lastActiveDate: deviceSession.iat.toISOString(),
        deviceId: deviceSession.deviceId
    }
}