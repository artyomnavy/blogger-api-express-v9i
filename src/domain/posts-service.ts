import {OutputPostType} from "../types/post/output";
import {CreateAndUpdatePostModel} from "../types/post/input";
import {ObjectId} from "mongodb";
import {postsRepository} from "../repositories/posts-db-repository";
import {blogsQueryRepository} from "../repositories/blogs-db-query-repository";

export const postsService = {
    async createPost(createData: CreateAndUpdatePostModel): Promise<OutputPostType> {
        const blog = await blogsQueryRepository
            .getBlogById(createData.blogId)

        const newPost = {
            _id: new ObjectId(),
            title: createData.title,
            shortDescription: createData.shortDescription,
            content: createData.content,
            blogId: createData.blogId,
            blogName: blog!.name,
            createdAt: new Date()
        }
        const createdPost = await postsRepository
            .createPost(newPost)
        return createdPost
    },
    async updatePost(id: string, updateData: CreateAndUpdatePostModel): Promise<boolean> {
        return await postsRepository
            .updatePost(id, updateData)
    },
    async deletePost(id: string): Promise<boolean> {
        return postsRepository
            .deletePost(id)
    }
}