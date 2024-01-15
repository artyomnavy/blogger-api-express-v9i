import {OutputUserType, UserAccountType} from "../types/user/output";
import {ObjectId, WithId} from "mongodb";
import {UserModelClass} from "../db/db";
import {userMapper} from "../types/user/mapper";

export const usersRepository = {
    async createUser(newUser: WithId<UserAccountType>): Promise<OutputUserType> {
        const userInstance = new UserModelClass ()

        userInstance._id = newUser._id
        userInstance.accountData.login = newUser.accountData.login
        userInstance.accountData.password = newUser.accountData.password
        userInstance.accountData.email = newUser.accountData.email
        userInstance.accountData.createdAt = newUser.accountData.createdAt
        userInstance.emailConfirmation.confirmationCode = newUser.emailConfirmation.confirmationCode
        userInstance.emailConfirmation.expirationDate = newUser.emailConfirmation.expirationDate
        userInstance.emailConfirmation.isConfirmed = newUser.emailConfirmation.isConfirmed

        await userInstance.save()

        return userMapper(newUser)
    },
    async deleteUser(id: string): Promise<boolean> {
        const userInstance = await UserModelClass
            .findOne({_id: id})

        if (!userInstance) {
            return false
        }

        const resultDeleteUserInstance = await userInstance.deleteOne()

        return resultDeleteUserInstance.acknowledged
    },
    updateConfirmStatus: async function (_id: ObjectId): Promise<boolean> {
        const userInstance = await UserModelClass
            .findOne({_id: _id})

        if (!userInstance) {
            return false
        }

        userInstance.emailConfirmation.isConfirmed = true

        await userInstance.save()

        return true
    },
    async updateConfirmationCode(email: string, newCode: string, newExpirationDate: Date): Promise<boolean> {
        const userInstance = await UserModelClass
            .findOne({'accountData.email': email})

        if (!userInstance) {
            return false
        }

        userInstance.emailConfirmation.confirmationCode = newCode
        userInstance.emailConfirmation.expirationDate = newExpirationDate

        await userInstance.save()

        return true
    },
    async updatePasswordForRecovery(recoveryCode: string, newPassword: string): Promise<boolean> {
        const userInstance = await UserModelClass
            .findOne({'emailConfirmation.confirmationCode': recoveryCode})

        if (!userInstance) {
            return false
        }

        userInstance.accountData.password = newPassword

        await userInstance.save()

        return true
    }
}