import {PaginatorUserModel} from "../types/user/input";
import {OutputUserType, PaginatorUsersType, UserAccountType} from "../types/user/output";
import {UserModelClass} from "../db/db";
import {userMapper} from "../types/user/mapper";
import {ObjectId, WithId} from "mongodb";
import {OutputAuthMeType} from "../types/auth/output";
import bcrypt from "bcrypt";

export const usersQueryRepository = {
    async getAllUsers(QueryData: PaginatorUserModel): Promise<PaginatorUsersType> {
        const sortBy = QueryData.sortBy ?
                QueryData.sortBy :
                'createdAt'
        const sortDirection = QueryData.sortDirection ?
            QueryData.sortDirection :
            'desc'
        const pageNumber = QueryData.pageNumber ?
            QueryData.pageNumber :
            1
        const pageSize = QueryData.pageSize ?
            QueryData.pageSize :
            10
        const searchLoginTerm = QueryData.searchLoginTerm ?
            QueryData.searchLoginTerm :
            null
        const searchEmailTerm = QueryData.searchEmailTerm ?
            QueryData.searchEmailTerm :
            null

        let filterLogin = {}
        let filterEmail = {}

        if (searchLoginTerm) {
            filterLogin = {
                login: {
                    $regex: searchLoginTerm,
                    $options: 'i'
                }
            }
        }

        if (searchEmailTerm) {
            filterEmail = {
                email: {
                    $regex: searchEmailTerm,
                    $options: 'i'
                }
            }
        }

        const filter = {
            $or: [
                filterLogin,
                filterEmail
            ]
        }

        const users = await UserModelClass
            .find(filter)
            .sort({[sortBy]: sortDirection === 'desc' ? -1 : 1})
            .skip((+pageNumber - 1) * +pageSize)
            .limit(+pageSize)
            .lean()

        const totalCount = await UserModelClass
            .countDocuments(filter)

        const pagesCount = Math.ceil(+totalCount / +pageSize)

        return {
            pagesCount: pagesCount,
            page: +pageNumber,
            pageSize: +pageSize,
            totalCount: +totalCount,
            items: users.map(userMapper)
        }
    },
    async getUserByLoginOrEmail(loginOrEmail: string): Promise<WithId<UserAccountType> | null> {
        const filter = {
            $or: [
                {'accountData.login': loginOrEmail},
                {'accountData.email': loginOrEmail}
            ]
        }

        const user = await UserModelClass
            .findOne(filter).lean()

        if (!user) {
            return null
        } else {
            return user
        }
    },
    async getUserById(id: string): Promise<OutputUserType | null> {
        const user = await UserModelClass
            .findOne({_id: new ObjectId(id)}).lean()

        if (!user) {
            return null
        } else {
            return userMapper(user)
        }
    },
    async getUserByIdForAuthMe(id: string): Promise<OutputAuthMeType | null> {
        const user = await UserModelClass
            .findOne({_id: new ObjectId(id)}).lean()

        if (!user) {
            return null
        } else {
            return {
                email: user.accountData.email,
                login: user.accountData.login,
                userId: user._id.toString()
            }
        }
    },
    async getUserByLogin(login: string): Promise<WithId<UserAccountType> | null> {
        const user = await UserModelClass
            .findOne({'accountData.login': login}).lean()

        if (!user) {
            return null
        } else {
            return user
        }
    },
    async getUserByEmail(email: string): Promise<WithId<UserAccountType> | null> {
        const user = await UserModelClass
            .findOne({'accountData.email': email}).lean()

        if (!user) {
            return null
        } else {
            return user
        }
    },
    async getUserByConfirmationCode(code: string): Promise<WithId<UserAccountType> | null> {
        const user = await UserModelClass
            .findOne({'emailConfirmation.confirmationCode': code}).lean()

        if (!user) {
            return null
        } else {
            return user
        }
    },
    async checkUserPasswordForRecovery(recoveryCode: string, newPassword: string): Promise<boolean> {
        const user = await UserModelClass
            .findOne({'emailConfirmation.confirmationCode': recoveryCode}).lean()

        if (!user) {
            return false
        } else {
            return await bcrypt.compare(newPassword, user.accountData.password)
        }
    }
}