import {PostModelClass} from "../db/db";
import {OutputPostType, PaginatorPostsType} from "../types/post/output";
import {postMapper} from "../types/post/mapper";
import {ObjectId} from "mongodb";
import {PaginatorPostModel} from "../types/post/input";
import {PaginatorPostWithBlogIdModel} from "../types/blog/input";
import {PaginatorPostsWithBlogIdType} from "../types/blog/output";

export const postsQueryRepository = {
    async getAllPosts(QueryData: PaginatorPostModel): Promise<PaginatorPostsType> {
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

        const posts = await PostModelClass
            .find({})
            .sort({[sortBy]: sortDirection === 'desc' ? -1 : 1})
            .skip((+pageNumber - 1) * +pageSize)
            .limit(+pageSize)
            .lean()

        const totalCount = await PostModelClass.countDocuments({})
        const pagesCount = Math.ceil(+totalCount / +pageSize)

        return {
            pagesCount: pagesCount,
            page: +pageNumber,
            pageSize: +pageSize,
            totalCount: +totalCount,
            items: posts.map(postMapper)
        }
    },
    async getPostById(id: string): Promise<OutputPostType | null> {
        const post = await PostModelClass
            .findOne({_id: new ObjectId(id)}).lean()

        if (!post) {
            return null
        } else {
            return postMapper(post)
        }
    },
    async getPostsByBlogId(QueryData: PaginatorPostWithBlogIdModel & { blogId: string } ): Promise<PaginatorPostsWithBlogIdType> {
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
        const blogId = QueryData.blogId

         let filter = {
            blogId: {
                $regex: blogId
            }
         }

        const posts = await PostModelClass
            .find(filter)
            .sort({[sortBy]: sortDirection === 'desc' ? -1 : 1})
            .skip((+pageNumber - 1) * +pageSize)
            .limit(+pageSize)
            .lean()

        const totalCount = await PostModelClass.countDocuments(filter)
        const pagesCount = Math.ceil(+totalCount / +pageSize)

        return {
            pagesCount: pagesCount,
            page: +pageNumber,
            pageSize: +pageSize,
            totalCount: +totalCount,
            items: posts.map(postMapper)
        }
    }
}