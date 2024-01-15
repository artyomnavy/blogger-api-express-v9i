import {PaginatorCommentModel} from "../types/comment/input";
import {OutputCommentType, PaginatorCommentsType} from "../types/comment/output";
import {CommentModelClass} from "../db/db";
import {commentMapper} from "../types/comment/mapper";
import {ObjectId} from "mongodb";

export const commentsQueryRepository = {
    async getCommentById(id: string): Promise<OutputCommentType | null> {
        const comment = await CommentModelClass
            .findOne({_id: new ObjectId(id)}).lean()

        if (!comment) {
            return null
        } else {
            return commentMapper(comment)
        }
    },
    async getCommentsByPostId(QueryData: PaginatorCommentModel & {postId: string}): Promise<PaginatorCommentsType> {
        const pageNumber = QueryData.pageNumber ?
            QueryData.pageNumber :
            1
        const pageSize = QueryData.pageSize ?
            QueryData.pageSize :
            10
        const sortBy = QueryData.sortBy ?
            QueryData.sortBy :
            'createdAt'
        const sortDirection = QueryData.sortDirection ?
            QueryData.sortDirection :
            'desc'
        const postId = QueryData.postId

        let filter = {
            postId:  postId
        }

        const comments = await CommentModelClass
            .find(filter)
            .sort({[sortBy]: sortDirection === 'desc' ? -1 : 1})
            .skip((+pageNumber - 1) * +pageSize)
            .limit(+pageSize)
            .lean()

        const totalCount = await CommentModelClass
            .countDocuments(filter)
        const pagesCount = Math.ceil(+totalCount / +pageSize)

        return {
            pagesCount: pagesCount,
            page: +pageNumber,
            pageSize: +pageSize,
            totalCount: +totalCount,
            items: comments.map(commentMapper)
        }
    }
}