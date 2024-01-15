import request from "supertest";
import {app} from "../src/app";
import {HTTP_STATUSES} from "../src/utils";
import {OutputUserType} from "../src/types/user/output";
import {v4 as uuidv4} from "uuid";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

const loginBasicAuth = 'admin'
const passwordBasicAuth = 'qwerty'

const users = [
    {
        login: 'user1',
        password: '123456',
        email: 'user1@test.com'
    },
    {
        login: 'user2',
        password: '654321',
        email: 'user2@test.com'
    }
]

describe('/security', () => {
    const dbName = 'Tests'
    const mongoURI = process.env.MONGO_URL || 'mongodb://0.0.0.0:27017'

    beforeAll(async () => {
        await mongoose.connect(mongoURI, {dbName: dbName})
    })

    afterAll(async () => {
        await mongoose.connection.close()
    })

    // DELETE ALL DATA
    beforeAll(async () => {
        await request(app).delete('/testing/all-data').expect(HTTP_STATUSES.NO_CONTENT_204)
    })

    afterAll(async() => {
        await request(app)
            .delete('/testing/all-data')
            .expect(HTTP_STATUSES.NO_CONTENT_204)
    })

    // CREATE USER1
    let newUser1: OutputUserType | null = null

    it('+ POST create user by admin with correct data', async () => {
        const createUser1 = await request(app)
            .post('/users')
            .auth(loginBasicAuth, passwordBasicAuth)
            .send(users[0])
            .expect(HTTP_STATUSES.CREATED_201)

        newUser1 = createUser1.body

        expect(newUser1).toEqual({
            id: expect.any(String),
            login: users[0].login,
            email: users[0].email,
            createdAt: expect.any(String)
        })

        await request(app)
            .get('/users')
            .auth(loginBasicAuth, passwordBasicAuth)
            .expect(HTTP_STATUSES.OK_200, {
                pagesCount: 1,
                page: 1,
                pageSize: 10,
                totalCount: 1,
                items: [newUser1]
            })
    })

    // LOGIN USER1 TO THE SYSTEM 4 TIMES WITH DIFFERENT USER-AGENT AND IPS
    let accessToken1: string | null = null
    let refreshToken1: string | null = null
    let payload1: any = null
    let deviceId1: string | null = null

    let accessToken2: string | null = null
    let refreshToken2: string | null = null
    let payload2: any = null
    let deviceId2: string | null = null

    let accessToken3: string | null = null
    let refreshToken3: string | null = null
    let payload3: any = null
    let deviceId3: string | null = null

    let accessToken4: string | null = null
    let refreshToken4: string | null = null
    let payload4: any = null
    let deviceId4: string | null = null

    const userAgent = {
        title1: 'device1',
        title2: 'device2',
        title3: 'device3',
        title4: 'device4',
        title5: 'device5',
    }

    const ips = {
        ip1: '1.1.1.1',
        ip2: '2.2.2.2',
        ip3: '3.3.3.3',
        ip4: '4.4.4.4',
        ip5: '5.5.5.5'
    }

    it('+ POST enter to system 4 times with different user-agent and ips', async () => {
        const deviceSession1 = await request(app)
            .post('/auth/login')
            .send({
                loginOrEmail: users[0].email,
                password: users[0].password
            })
            .set('User-Agent', userAgent.title1)
            .set('X-Forwarded-For', ips.ip1)
            .set('Remote-Addr', ips.ip1)
            .expect(HTTP_STATUSES.OK_200)

        refreshToken1 = deviceSession1.headers['set-cookie'][0].split('=')[1].split(';')[0]
        accessToken1 = deviceSession1.body.accessToken

        payload1 = jwt.decode(refreshToken1)

        deviceId1 = payload1.deviceId

        const deviceSession2 = await request(app)
            .post('/auth/login')
            .send({
                loginOrEmail: users[0].email,
                password: users[0].password
            })
            .set('User-Agent', userAgent.title2)
            .set('X-Forwarded-For', ips.ip2)
            .set('Remote-Addr', ips.ip2)
            .expect(HTTP_STATUSES.OK_200)

        refreshToken2 = deviceSession2.headers['set-cookie'][0].split('=')[1].split(';')[0]
        accessToken2 = deviceSession2.body.accessToken

        payload2 = jwt.decode(refreshToken2)

        deviceId2 = payload2.deviceId

        const deviceSession3 = await request(app)
            .post('/auth/login')
            .send({
                loginOrEmail: users[0].email,
                password: users[0].password
            })
            .set('User-Agent', userAgent.title3)
            .set('X-Forwarded-For', ips.ip3)
            .set('Remote-Addr', ips.ip3)
            .expect(HTTP_STATUSES.OK_200)

        refreshToken3 = deviceSession3.headers['set-cookie'][0].split('=')[1].split(';')[0]
        accessToken3 = deviceSession3.body.accessToken

        payload3 = jwt.decode(refreshToken3)

        deviceId3 = payload3.deviceId

        const deviceSession4 = await request(app)
            .post('/auth/login')
            .send({
                loginOrEmail: users[0].email,
                password: users[0].password
            })
            .set('User-Agent', userAgent.title4)
            .set('X-Forwarded-For', ips.ip4)
            .set('Remote-Addr', ips.ip4)
            .expect(HTTP_STATUSES.OK_200)

        refreshToken4 = deviceSession4.headers['set-cookie'][0].split('=')[1].split(';')[0]
        accessToken4 = deviceSession4.body.accessToken

        payload4 = jwt.decode(refreshToken4)

        deviceId4 = payload4.deviceId
    })

    // CHECK RESPONSE ERRORS CODE 401, 403 AND 404
    let refreshTokenForUser2: string | null = null

    it('- DELETE device session by id with incorrect data refreshToken', async () => {
        await request(app)
            .delete(`/security/devices/${deviceId1}`)
            .set('Cookie', [`refreshToken=''`])
            .expect(HTTP_STATUSES.UNAUTHORIZED_401)
    })

    it('- DELETE device session by id with incorrect deviceId)', async () => {
        await request(app)
            .delete(`/security/devices/${uuidv4()}`)
            .set('Cookie', [`refreshToken=${refreshToken1}`])
            .expect(HTTP_STATUSES.NOT_FOUND_404)
    })

    it('- DELETE device session by id with incorrect userId', async () => {
        // create user2 and device session
        await request(app)
            .post('/users')
            .auth(loginBasicAuth, passwordBasicAuth)
            .send(users[1])
            .expect(HTTP_STATUSES.CREATED_201)

        const deviceSessionForUser2 = await request(app)
            .post('/auth/login')
            .send({
                loginOrEmail: users[1].email,
                password: users[1].password
            })
            .set('User-Agent', userAgent.title5)
            .set('X-Forwarded-For', ips.ip5)
            .set('Remote-Addr', ips.ip5)
            .expect(HTTP_STATUSES.OK_200)

        refreshTokenForUser2 = deviceSessionForUser2.headers['set-cookie'][0].split('=')[1].split(';')[0]

        // check response error code 403
        await request(app)
            .delete(`/security/devices/${deviceId1}`)
            .set('Cookie', [`refreshToken=${refreshTokenForUser2}`])
            .expect(HTTP_STATUSES.FORBIDDEN_403)
    })

    // DELETE DEVICE SESSION FOR USER2
    it('+ DELETE device session by id with correct data', async () => {
        const payloadForUser2: any = jwt.decode(refreshTokenForUser2!)

        await request(app)
            .delete(`/security/devices/${payloadForUser2.deviceId}`)
            .set('Cookie', [`refreshToken=${refreshTokenForUser2}`])
            .expect(HTTP_STATUSES.NO_CONTENT_204)
    })

    // UPDATE REFRESH TOKEN DEVICE1 FOR USER1
    it('+ POST generate pair tokens with correct refreshToken', async () => {
        const updateTokens = await request(app)
            .post('/auth/refresh-token')
            .set('Cookie', [`refreshToken=${refreshToken1}`])
            .set('User-Agent', userAgent.title1)
            .set('X-Forwarded-For', ips.ip1)
            .set('Remote-Addr', ips.ip1)
            .expect(HTTP_STATUSES.OK_200)

        refreshToken1 = updateTokens.headers['set-cookie'][0].split('=')[1].split(';')[0]
        accessToken1 = updateTokens.body.accessToken

        payload1 = jwt.decode(refreshToken1)
    })

    // GET ALL DEVICES SESSIONS
    it('- GET all devices sessions with incorrect refresh token)', async () => {
        await request(app)
            .get(`/security/devices`)
            .set('Cookie', [`refreshToken=${refreshTokenForUser2}`])
            .expect(HTTP_STATUSES.UNAUTHORIZED_401)
    })

    it('+ GET all devices sessions with refresh token)', async () => {
        const devicesSessions = [
            {
                ip: ips.ip1,
                title: userAgent.title1,
                lastActiveDate: new Date (payload1.iat * 1000).toISOString(),
                deviceId: payload1.deviceId
            },
            {
                ip: ips.ip2,
                title: userAgent.title2,
                lastActiveDate: new Date (payload2.iat * 1000).toISOString(),
                deviceId: payload2.deviceId
            },
            {
                ip: ips.ip3,
                title: userAgent.title3,
                lastActiveDate: new Date (payload3.iat * 1000).toISOString(),
                deviceId: payload3.deviceId
            },
            {
                ip: ips.ip4,
                title: userAgent.title4,
                lastActiveDate: new Date (payload4.iat * 1000).toISOString(),
                deviceId: payload4.deviceId
            }
        ]

        await request(app)
            .get(`/security/devices`)
            .set('Cookie', [`refreshToken=${refreshToken1}`])
            .expect(HTTP_STATUSES.OK_200, devicesSessions)
    })

    // DELETE DEVICE SESSION 2
    it('+ DELETE deviceSession2 by id with correct data', async () => {
        const devicesSessions = [
            {
                ip: ips.ip1,
                title: userAgent.title1,
                lastActiveDate: new Date (payload1.iat * 1000).toISOString(),
                deviceId: payload1.deviceId
            },
            {
                ip: ips.ip3,
                title: userAgent.title3,
                lastActiveDate: new Date (payload3.iat * 1000).toISOString(),
                deviceId: payload3.deviceId
            },
            {
                ip: ips.ip4,
                title: userAgent.title4,
                lastActiveDate: new Date (payload4.iat * 1000).toISOString(),
                deviceId: payload4.deviceId
            }
        ]

        await request(app)
            .delete(`/security/devices/${deviceId2}`)
            .set('Cookie', [`refreshToken=${refreshToken2}`])
            .expect(HTTP_STATUSES.NO_CONTENT_204)

        await request(app)
            .get(`/security/devices`)
            .set('Cookie', [`refreshToken=${refreshToken1}`])
            .expect(HTTP_STATUSES.OK_200, devicesSessions)
    })

    // LOGOUT DEVICE 3
    it('+ POST logout device3 with correct data', async () => {
        const devicesSessions = [
            {
                ip: ips.ip1,
                title: userAgent.title1,
                lastActiveDate: new Date (payload1.iat * 1000).toISOString(),
                deviceId: payload1.deviceId
            },
            {
                ip: ips.ip4,
                title: userAgent.title4,
                lastActiveDate: new Date (payload4.iat * 1000).toISOString(),
                deviceId: payload4.deviceId
            }
        ]

        await request(app)
            .post('/auth/logout')
            .set('Cookie', [`refreshToken=${refreshToken3}`])
            .expect(HTTP_STATUSES.NO_CONTENT_204)

        await request(app)
            .get(`/security/devices`)
            .set('Cookie', [`refreshToken=${refreshToken1}`])
            .expect(HTTP_STATUSES.OK_200, devicesSessions)
    })

    // TERMINATE ALL OTHERS DEVICES SESSIONS FOR USER
    it('+ DELETE all others devices sessions with correct data', async () => {
        const devicesSessions = [
            {
                ip: ips.ip1,
                title: userAgent.title1,
                lastActiveDate: new Date (payload1.iat * 1000).toISOString(),
                deviceId: payload1.deviceId
            }
        ]

        await request(app)
            .delete(`/security/devices`)
            .set('Cookie', [`refreshToken=${refreshToken1}`])
            .expect(HTTP_STATUSES.NO_CONTENT_204)

        await request(app)
            .get(`/security/devices`)
            .set('Cookie', [`refreshToken=${refreshToken1}`])
            .expect(HTTP_STATUSES.OK_200, devicesSessions)
    })
})