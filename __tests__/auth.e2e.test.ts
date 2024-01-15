import {OutputUserType} from "../src/types/user/output";
import request from "supertest";
import {app} from "../src/app";
import {HTTP_STATUSES} from "../src/utils";
import {userMapper} from "../src/types/user/mapper";
import {emailAdapter} from "../src/adapters/emails-adapter";
import {UserModelClass} from "../src/db/db";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

const loginBasicAuth = 'admin'
const passwordBasicAuth = 'qwerty'

describe('/auth', () => {
    const dbName = 'Tests'
    const mongoURI = process.env.MONGO_URL || 'mongodb://0.0.0.0:27017'

    beforeAll(async () => {
        await mongoose.connect(mongoURI, {dbName: dbName})
    })

    afterAll(async () => {
        await mongoose.connection.close()
    })

    let newUserByAdmin: OutputUserType | null = null
    let newUserByRegistration: OutputUserType | null = null
    let accessToken: any = null
    let refreshToken: any = null
    let code: string | null = null
    let recoveryCode: string | null = null

    // DELETE ALL DATA

    beforeAll(async () => {
        await request(app).delete('/testing/all-data').expect(HTTP_STATUSES.NO_CONTENT_204)
    })

    // CHECK LOGIN USER BY ADMIN, CREATE NEW USER BY ADMIN, RESEND CODE FOR CONFIRMED EMAIL

    it('- POST does not enter to system and does not create token with incorrect data', async () => {
        await request(app)
            .post('/auth/login')
            .send({loginOrEmail: 'ab', password: '12345'})
            .expect(HTTP_STATUSES.BAD_REQUEST_400, {
                errorsMessages: [
                    {message: 'Invalid login or email', field: 'loginOrEmail'},
                    {message: 'Invalid password', field: 'password'},
                ]
            })
    })

    it('- POST does not enter to system and does not create token with login or password is wrong', async () => {
        await request(app)
            .post('/auth/login')
            .send({
                loginOrEmail: 'login',
                password: 'password'
            })
            .expect(HTTP_STATUSES.UNAUTHORIZED_401)
    })

    it('+ POST create user by admin with correct data', async () => {
        const createUserByAdmin = await request(app)
            .post('/users')
            .auth(loginBasicAuth, passwordBasicAuth)
            .send({
                login: 'login',
                password: '123456',
                email: 'test@test.com'
            })
            .expect(HTTP_STATUSES.CREATED_201)

        newUserByAdmin = createUserByAdmin.body

        expect(newUserByAdmin).toEqual({
            id: expect.any(String),
            login: 'login',
            email: 'test@test.com',
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
                items: [newUserByAdmin]
            })
    })

    it('+ POST enter to system with correct data and create access and refresh tokens', async () => {
        const createTokens = await request(app)
            .post('/auth/login')
            .send({
                loginOrEmail: 'test@test.com',
                password: '123456'
            })
            .expect(HTTP_STATUSES.OK_200)

        refreshToken = createTokens.headers['set-cookie'][0].split('=')[1].split(';')[0]
        accessToken = createTokens.body.accessToken
    })

    it('- GET information about user with invalid access token', async () => {
        const res = await request(app)
            .get('/auth/me')
            .set('Authorization', `Bearer wr0ngt0k3n`)
            .expect(HTTP_STATUSES.UNAUTHORIZED_401)
    })

    it('+ GET information about user by admin with valid access token', async () => {
        const res = await request(app)
            .get('/auth/me')
            .set('Authorization', `Bearer ${accessToken}`)
            .expect(HTTP_STATUSES.OK_200)

        expect(res.body).toEqual({
            login: 'login',
            email: 'test@test.com',
            userId: newUserByAdmin!.id
        })
    })

    // CHECK REFRESH TOKEN FOR USER BY ADMIN

    it('- POST dont\'t generate pair tokens with inside cookie is missing', async () => {
        await request(app)
            .post('/auth/refresh-token')
            .set('Cookie', [`refreshToken=''`])
            .expect(HTTP_STATUSES.UNAUTHORIZED_401)
    })

    it('- POST dont\'t generate pair tokens with incrorrect refreshToken', async () => {
        await request(app)
            .post('/auth/refresh-token')
            .set('Cookie', [`refreshToken=wr0ngt0k3n`])
            .expect(HTTP_STATUSES.UNAUTHORIZED_401)
    })

    it('+ POST generate pair tokens with correct refreshToken', async () => {

        const updateTokens = await request(app)
            .post('/auth/refresh-token')
            .set('Cookie', [`refreshToken=${refreshToken}`])
            .expect(HTTP_STATUSES.OK_200)

        refreshToken = updateTokens.headers['set-cookie'][0].split('=')[1].split(';')[0]
        accessToken = updateTokens.body.accessToken
    })

    // LOGOUT USER BY ADMIN

    it('+ POST logout user by admin with correct refreshToken', async () => {
        await request(app)
            .post('/auth/logout')
            .set('Cookie', [`refreshToken=${refreshToken}`])
            .expect(HTTP_STATUSES.NO_CONTENT_204)
    })

    it('- POST logout user by admin with inside cookie is missing', async () => {
        await request(app)
            .post('/auth/logout')
            .set('Cookie', [`refreshToken=''`])
            .expect(HTTP_STATUSES.UNAUTHORIZED_401)
    })

    it('- POST logout user by admin with incorrect refreshToken', async () => {
        await request(app)
            .post('/auth/logout')
            .set('Cookie', [`refreshToken='wr0ngt0k3n'`])
            .expect(HTTP_STATUSES.UNAUTHORIZED_401)
    })

    // CHECK EXPIRED REFRESH TOKEN FOR USER BY ADMIN
    it('- POST logout user by admin with expired refreshToken', async () => {
        // Update refreshToken with expiresIn = 1 ms
        const jwtSecret = process.env.JWT_SECRET || '123'
        const userId = newUserByAdmin!.id
        refreshToken = jwt.sign({userId}, jwtSecret, {expiresIn: '1'})

        await request(app)
            .post('/auth/logout')
            .set('Cookie', [`refreshToken=${refreshToken}`])
            .expect(HTTP_STATUSES.UNAUTHORIZED_401)
    })

    // CREATE NEW USER BY REGISTRATION (CREATE CODE), RESEND CODE FOR CONFIRMATION EMAIL (UPDATED CODE), CONFIRM REGISTRATION

    it('- POST resending code for user created by admin', async () => {
        await request(app)
            .post('/auth/registration-email-resending')
            .send({
                email: newUserByAdmin!.email
            })
            .expect(HTTP_STATUSES.BAD_REQUEST_400, {
                errorsMessages: [
                    {message: 'Email is already confirmed', field: 'email'}
                ]
            })
    })

    it('+ POST registration and create user with confirmation code for send to passed email', async () => {
        emailAdapter.sendEmailWithCode = jest.fn()

        // const spiedSendEmail = jest.spyOn(emailAdapter, 'sendEmail')
        // spiedSendEmail.mockImplementation(jest.fn())

        await request(app)
            .post('/auth/registration')
            .send({
                login: 'artyom',
                password: 'testpass',
                email: 'artyom@test.ru' // fake email because used mock
            })
            .expect(HTTP_STATUSES.NO_CONTENT_204)

        expect(emailAdapter.sendEmailWithCode).toHaveBeenCalled()

        // expect(spiedSendEmail).toHaveBeenCalled()
        // console.log(spiedSendEmail.mock.calls) // возвращает массив того, что приходит в функцию

        const getUserByLogin = await UserModelClass
            .findOne({'accountData.login': 'artyom'}).lean()

        code = getUserByLogin!.emailConfirmation.confirmationCode

        newUserByRegistration = userMapper(getUserByLogin!)
    })

    it('- POST does not enter to system and does not create token with unconfirmed email', async () => {
        await request(app)
            .post('/auth/login')
            .send({
                loginOrEmail: 'artyom',
                password: 'testpass'
            })
            .expect(HTTP_STATUSES.UNAUTHORIZED_401)
    })

    it('- POST confirm registration user with incorrect confirmation code', async () => {
        await request(app)
            .post('/auth/registration-confirmation')
            .send({
                code: 'wrong code'
            })
            .expect(HTTP_STATUSES.BAD_REQUEST_400, {
                errorsMessages: [
                    {message: 'Invalid code', field: 'code'}
                ]
            })
    })

    it('+ POST resending code for complete registration user with email is not confirmed', async () => {
        emailAdapter.sendEmailWithCode = jest.fn()

        await request(app)
            .post('/auth/registration-email-resending')
            .send({
                email: newUserByRegistration!.email
            })
        .expect(HTTP_STATUSES.NO_CONTENT_204)

        expect(emailAdapter.sendEmailWithCode).toHaveBeenCalled()

        // Updated code:
        const getUserByLogin = await UserModelClass
            .findOne({'accountData.login': 'artyom'}).lean()

        code = getUserByLogin!.emailConfirmation.confirmationCode
    })

    it('+ POST confirm registration user with correct confirmation code', async () => {
        const res = await request(app)
            .post('/auth/registration-confirmation')
            .send({
                code: code
            })
            .expect(HTTP_STATUSES.NO_CONTENT_204)
    })

    it('- POST confirm registration user with confirmation code already been applied', async () => {
        await request(app)
            .post('/auth/registration-confirmation')
            .send({
                code: code
            })
            .expect(HTTP_STATUSES.BAD_REQUEST_400, {
                errorsMessages: [
                    {message: 'Code already been applied', field: 'code'}
                ]
            })
    })

    it('- POST confirm registration user with confirmation code expired', async () => {
        // Prepare data for test expirationDate
        await UserModelClass
            .updateOne({'accountData.login': 'artyom'},
                {$set: {
                'emailConfirmation.expirationDate': new Date(),
                'emailConfirmation.isConfirmed': false
                }
            })

        await request(app)
            .post('/auth/registration-confirmation')
            .send({
                code: code
            })
            .expect(HTTP_STATUSES.BAD_REQUEST_400, {
                errorsMessages: [
                    {message: 'Code expired', field: 'code'}
                ]
            })
    })

    // CHECK ATTEMPTS FROM ONE IP
    it('- POST login user with more than 5 attempts from one IP-address during 10 seconds', async () => {
        await request(app)
            .post('/users')
            .auth(loginBasicAuth, passwordBasicAuth)
            .send({
                login: 'user',
                password: 'user123',
                email: 'user@test.com'
            })
            .expect(HTTP_STATUSES.CREATED_201)

        await request(app)
            .post('/auth/login')
            .send({
                loginOrEmail: 'user',
                password: 'user123'
            })
            .set('X-Forwarded-For', '1.1.1.1')
            .set('Remote-Addr', '1.1.1.1')
            .expect(HTTP_STATUSES.OK_200)

        await request(app)
            .post('/auth/login')
            .send({
                loginOrEmail: 'user',
                password: 'user123'
            })
            .set('X-Forwarded-For', '1.1.1.1')
            .set('Remote-Addr', '1.1.1.1')
            .expect(HTTP_STATUSES.OK_200)

        await request(app)
            .post('/auth/login')
            .send({
                loginOrEmail: 'user',
                password: 'user123'
            })
            .set('X-Forwarded-For', '1.1.1.1')
            .set('Remote-Addr', '1.1.1.1')
            .expect(HTTP_STATUSES.OK_200)

        await request(app)
            .post('/auth/login')
            .send({
                loginOrEmail: 'user',
                password: 'user123'
            })
            .set('X-Forwarded-For', '1.1.1.1')
            .set('Remote-Addr', '1.1.1.1')
            .expect(HTTP_STATUSES.OK_200)

        await request(app)
            .post('/auth/login')
            .send({
                loginOrEmail: 'user',
                password: 'user123'
            })
            .set('X-Forwarded-For', '1.1.1.1')
            .set('Remote-Addr', '1.1.1.1')
            .expect(HTTP_STATUSES.OK_200)

        await request(app)
            .post('/auth/login')
            .send({
                loginOrEmail: 'user',
                password: 'user123'
            })
            .set('X-Forwarded-For', '1.1.1.1')
            .set('Remote-Addr', '1.1.1.1')
            .expect(HTTP_STATUSES.TOO_MANY_REQUESTS_429)
    })

    // CHECK RECOVERY PASSWORD

    it('+ POST password recovery with non-exist user', async () => {
        await request(app)
            .post('/auth/password-recovery')
            .send({
                email: 'wrong@test.com'
            })
            .expect(HTTP_STATUSES.NO_CONTENT_204)
    })

    it('+ POST password recovery with exist user', async () => {
        emailAdapter.sendEmailWithRecoveryCode = jest.fn()

        await request(app)
            .post('/auth/password-recovery')
            .send({
                email: 'test@test.com'
            })
            .expect(HTTP_STATUSES.NO_CONTENT_204)

        expect(emailAdapter.sendEmailWithRecoveryCode).toHaveBeenCalled()

        const getUserByLogin = await UserModelClass
            .findOne({'accountData.login': 'login'}).lean()

        recoveryCode = getUserByLogin!.emailConfirmation.confirmationCode
    })

    it('- POST recovery password with incorrect data', async () => {
        await request(app)
            .post('/auth/new-password')
            .send({
                recoveryCode: recoveryCode,
                password: ''
            })
            .expect(HTTP_STATUSES.BAD_REQUEST_400)
    })

    it('- POST recovery password with old password', async () => {
        await request(app)
            .post('/auth/new-password')
            .send({
                recoveryCode: recoveryCode,
                newPassword: '123456'
            })
            .expect(HTTP_STATUSES.UNAUTHORIZED_401)
    })

    it('+ POST new password with exist user', async () => {
        await request(app)
            .post('/auth/new-password')
            .send({
                recoveryCode: recoveryCode,
                newPassword: 'qwerty123',
            })
            .expect(HTTP_STATUSES.NO_CONTENT_204)
    })

    // DELETE ALL DATA
    afterAll(async() => {
        await request(app)
            .delete('/testing/all-data')
            .expect(HTTP_STATUSES.NO_CONTENT_204)
    })

})