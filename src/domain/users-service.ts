import {CreateUserModel} from "../types/user/input";
import {OutputUserType} from "../types/user/output";
import {ObjectId} from "mongodb";
import {usersRepository} from "../repositories/users-db-repository";
import bcrypt from 'bcrypt';
import {usersQueryRepository} from "../repositories/users-db-query-repository";
import {AuthLoginModel} from "../types/auth/input";

export const usersService = {
    async createUserByAdmin(createData: CreateUserModel): Promise<OutputUserType> {
        const passwordHash = await bcrypt.hash(createData.password, 10)

        const newUser = {
            _id: new ObjectId(),
            accountData: {
                login: createData.login,
                password: passwordHash,
                email: createData.email,
                createdAt: new Date()
            },
            emailConfirmation: {
                confirmationCode: null,
                expirationDate: null,
                isConfirmed: true
            }
        }

        const createdUser = await usersRepository
            .createUser(newUser)

        return createdUser
    },
    async checkCredentials(inputData: AuthLoginModel) {
        const user = await usersQueryRepository
            .getUserByLoginOrEmail(inputData.loginOrEmail)

        if (!user) {
            return null
        }

        if (!user.emailConfirmation.isConfirmed) {
            return null
        }

        const checkPassword = await bcrypt.compare(inputData.password, user.accountData.password)

        if (!checkPassword) {
            return null
        } else {
            return user
        }
    },
    async deleteUser(id: string): Promise<boolean> {
        return await usersRepository
            .deleteUser(id)
    }
}