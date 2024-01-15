import {CreateUserModel} from "../types/user/input";
import {OutputUserType, UserAccountType} from "../types/user/output";
import bcrypt from "bcrypt";
import {ObjectId, WithId} from "mongodb";
import {v4 as uuidv4} from 'uuid';
import {usersRepository} from "../repositories/users-db-repository";
import {emailsManager} from "../managers/emails-manager";
import {usersQueryRepository} from "../repositories/users-db-query-repository";
import {add} from "date-fns/add";
import {AttemptType} from "../types/auth/output";
import {authRepository} from "../repositories/auth-db-repository";

export const authService = {
    async createUserByRegistration(createData: CreateUserModel): Promise<OutputUserType | null> {
        const passwordHash = await bcrypt.hash(createData.password, 10)

        const newUser: WithId<UserAccountType> = {
            _id: new ObjectId(),
            accountData: {
                login: createData.login,
                email: createData.email,
                password: passwordHash,
                createdAt: new Date()
            },
            emailConfirmation: {
                confirmationCode: uuidv4(),
                expirationDate: add(new Date(), {
                    minutes: 10
                }),
                isConfirmed: false
            }
        }

        const createdUser = await usersRepository
            .createUser(newUser)

        try {
            await emailsManager
                .sendEmailConfirmationMessage(newUser.accountData.email, newUser.emailConfirmation.confirmationCode!)
        } catch(e) {
            console.error(e)
            return null
        }

        return createdUser
    },
    async updateConfirmationCode(email: string): Promise<string | null> {
        const newCode = uuidv4()
        const newExpirationDate = add(new Date(), {
            minutes: 10
        })

        const isUpdated = await usersRepository
            .updateConfirmationCode(email, newCode, newExpirationDate)

        if (isUpdated) {
            return newCode
        } else {
            return null
        }
    },
    async confirmEmail(code: string): Promise<boolean> {
        const user = await usersQueryRepository
            .getUserByConfirmationCode(code)

        return await usersRepository
                .updateConfirmStatus(user!._id)
    },
    async resendingEmail(email: string, newCode: string) {
        try {
            await emailsManager
                .sendEmailConfirmationMessage(email, newCode)
        } catch (e) {
            console.error(e)
            return false
        }

        return true
    },
    async addAttempt(attempt: AttemptType): Promise<AttemptType> {
        return await authRepository
            .addAttempt(attempt)
    },
    async sendEmailForPasswordRecovery(email: string, recoveryCode: string) {
        try {
            await emailsManager
                .sendEmailWithRecoveryCode(email, recoveryCode)
        } catch(e) {
            console.error(e)
            return false
        }

        return true
    },
    async updatePasswordForRecovery(recoveryCode: string, newPassword: string) {
        const newPasswordHash = await bcrypt.hash(newPassword, 10)

        return await usersRepository
            .updatePasswordForRecovery(recoveryCode, newPasswordHash)
    }
}