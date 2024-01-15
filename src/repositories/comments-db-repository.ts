import {CommentType, OutputCommentType} from "../types/comment/output";
import {ObjectId, WithId} from "mongodb";
import {CommentModelClass} from "../db/db";
import {commentMapper} from "../types/comment/mapper";
import {CreateAndUpdateCommentModel} from "../types/comment/input";

export const commentsRepository = {
    async deleteComment(id: string): Promise<boolean>{
        const resultDeleteComment = await CommentModelClass
            .deleteOne({_id: new ObjectId(id)})
        return resultDeleteComment.deletedCount === 1
    },
    async createComment(newComment: WithId<CommentType>): Promise<OutputCommentType> {
        const resultCreateComment = await CommentModelClass
            .create(newComment)
        return commentMapper(newComment)
    },
    async updateComment(id: string, updateData: CreateAndUpdateCommentModel): Promise<boolean>{
        const resultUpdateComment = await CommentModelClass
            .updateOne({_id: new ObjectId(id)}, {
                $set: {
                    content: updateData.content
                }
            })
        return resultUpdateComment.matchedCount === 1
    }
}