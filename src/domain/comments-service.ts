import {CreateAndUpdateCommentModel} from "../types/comment/input";
import {OutputCommentType} from "../types/comment/output";
import {ObjectId} from "mongodb";
import {commentsRepository} from "../repositories/comments-db-repository";

export const commentsService = {
    async updateComment(id: string, updateData: CreateAndUpdateCommentModel): Promise<boolean> {
        return await commentsRepository
            .updateComment(id, updateData)
    },
    async deleteComment(id: string): Promise<boolean> {
        return commentsRepository
            .deleteComment(id)
    },
    async createComment(postId: string, userId: string, userLogin: string, createData: CreateAndUpdateCommentModel): Promise<OutputCommentType>{
        const newComment = {
            _id: new ObjectId(),
            content: createData.content,
            commentatorInfo: {
                userId: userId,
                userLogin: userLogin
            },
            createdAt: new Date(),
            postId: postId
        }

        const createdComment = await commentsRepository
            .createComment(newComment)
        return createdComment
    }
}