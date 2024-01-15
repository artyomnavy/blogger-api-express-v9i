import jwt from 'jsonwebtoken'

const jwtSecret = process.env.JWT_SECRET || '123'
export const jwtService = {
    async createAccessJWT(userId: string) {
        const accessToken = jwt.sign({userId}, jwtSecret, {expiresIn: 10})
        return accessToken
    },
    async createRefreshJWT(deviceId: string, userId: string) {
        const refreshToken = jwt.sign({deviceId, userId}, jwtSecret, {expiresIn: 20})
        return refreshToken
    },
    async checkToken(token: string) {
        try {
            const decodedToken: any = jwt.verify(token, jwtSecret)
            return decodedToken
        } catch (error) {
            return null
        }
    },
    async getPayloadByToken(token: string){
        try {
            const decodedToken: any = jwt.decode(token)
            return decodedToken
        } catch (error) {
            return null
        }
    }
}