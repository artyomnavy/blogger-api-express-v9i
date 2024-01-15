import {BlogModelClass} from "../db/db";
import {ObjectId} from "mongodb";
import {OutputBlogType, PaginatorBlogsType} from "../types/blog/output";
import {blogMapper} from "../types/blog/mapper";
import {PaginatorBlogModel} from "../types/blog/input";

export const blogsQueryRepository = {
    async getAllBlogs(QueryData: PaginatorBlogModel): Promise<PaginatorBlogsType> {
        const searchNameTerm = QueryData.searchNameTerm ?
            QueryData.searchNameTerm :
            null
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

        let filter = {}

        if (searchNameTerm) {
            filter = {
                name: {
                    $regex: searchNameTerm,
                    $options: 'i'
                }
            }
        }

        const blogs = await BlogModelClass
            .find(filter)
            .sort({[sortBy]: sortDirection === 'desc' ? -1 : 1})
            .skip((+pageNumber - 1) * +pageSize)
            .limit(+pageSize)
            .lean()

        const totalCount = await BlogModelClass
            .countDocuments(filter)

        const pagesCount = Math.ceil(+totalCount / +pageSize)

        return {
            pagesCount: pagesCount,
            page: +pageNumber,
            pageSize: +pageSize,
            totalCount: +totalCount,
            items: blogs.map(blogMapper)
        }
    },
    async getBlogById(id: string): Promise<OutputBlogType | null> {
        const blog = await BlogModelClass
            .findOne({_id: new ObjectId(id)}).lean()
        if (!blog) {
            return null
        } else {
            return blogMapper(blog)
        }
    }
}