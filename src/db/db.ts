import dotenv from 'dotenv'
import mongoose from "mongoose";
import {
    attemptSchema,
    blogSchema,
    commentSchema,
    deviceSessionSchema,
    postSchema,
    userSchema
} from "./schemas/schemas";
dotenv.config()

const dbName = 'BloggerPlatform'
const mongoURI = process.env.MONGO_URL || 'mongodb://0.0.0.0:27017'

if (!mongoURI) {
    throw new Error('Url dosen\'t found')
}

export const BlogModelClass = mongoose.model('blogs', blogSchema)
export const PostModelClass = mongoose.model('posts', postSchema)
export const UserModelClass = mongoose.model('users', userSchema)
export const CommentModelClass = mongoose.model('comments', commentSchema)
export const DeviceModelClass = mongoose.model('devices', deviceSessionSchema)
export const AttemptModelClass = mongoose.model('attempts', attemptSchema)

export const runDb = async() => {
    try {
        await mongoose.connect(mongoURI, {dbName: dbName})
        console.log('Client connected to db')
    } catch (e) {
        console.log(`${e}`)
        await mongoose.disconnect()
    }
}