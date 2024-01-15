export type DeviceSessionType = {
    iat: Date,
    exp: Date,
    ip: string,
    deviceId: string,
    deviceName: string,
    userId: string
}

export type OutputDeviceSessionType = {
    ip: string,
    title: string,
    lastActiveDate: string,
    deviceId: string
}