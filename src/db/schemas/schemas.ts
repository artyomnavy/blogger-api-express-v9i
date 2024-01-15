import * as mongoose from "mongoose";
import {BlogType} from "../../types/blog/output";
import {PostType} from "../../types/post/output";
import {UserAccountType} from "../../types/user/output";
import {CommentType} from "../../types/comment/output";
import {DeviceSessionType} from "../../types/device/output";
import {AttemptType} from "../../types/auth/output";

export const blogSchema = new mongoose.Schema<BlogType>({
    name: {type: String, required: true},
    description: {type: String, required: true},
    websiteUrl: {type: String, required: true},
    createdAt: {type: Date, required: true},
    isMembership: {type: Boolean, required: true}
})

export const postSchema = new mongoose.Schema<PostType>({
    title: {type: String, required: true},
    shortDescription: {type: String, required: true},
    content: {type: String, required: true},
    blogId: {type: String, required: true},
    blogName: {type: String, required: true},
    createdAt: {type: Date, required: true}
})

export const userSchema = new mongoose.Schema<UserAccountType>({
    accountData: {
        login: {type: String, required: true},
        password: {type: String, required: true},
        email: {type: String, required: true},
        createdAt: {type: Date, required: true}
    },
    emailConfirmation: {
        confirmationCode: String,
        expirationDate: Date,
        isConfirmed: {type: Boolean, required: true}
    }
})

export const commentSchema = new mongoose.Schema<CommentType>({
    content: {type: String, required: true},
    commentatorInfo: {
        userId: {type: String, required: true},
        userLogin: {type: String, required: true}
    },
    createdAt: {type: Date, required: true},
    postId: {type: String, required: true}
})

export const deviceSessionSchema = new mongoose.Schema<DeviceSessionType>({
    iat: {type: Date, required: true},
    exp: {type: Date, required: true},
    ip: {type: String, required: true},
    deviceId: {type: String, required: true},
    deviceName: {type: String, required: true},
    userId: {type: String, required: true}
})

export const attemptSchema = new mongoose.Schema<AttemptType>({
    ip: {type: String, required: true},
    url: {type: String, required: true},
    date: {type: Date, required: true}
})