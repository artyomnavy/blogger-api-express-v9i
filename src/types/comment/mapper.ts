import {WithId} from "mongodb";
import {CommentType, OutputCommentType} from "./output";

export const commentMapper = (comment: WithId<CommentType>): OutputCommentType => {
    return {
        id: comment._id.toString(),
        content: comment.content,
        commentatorInfo: {
            userId: comment.commentatorInfo.userId,
            userLogin: comment.commentatorInfo.userLogin
        },
        createdAt: comment.createdAt.toISOString()
    }
}