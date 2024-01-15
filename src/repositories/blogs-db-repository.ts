import {BlogModelClass} from "../db/db";
import {ObjectId, WithId} from "mongodb";
import {BlogType, OutputBlogType} from "../types/blog/output";
import {blogMapper} from "../types/blog/mapper";
import {CreateAndUpdateBlogModel} from "../types/blog/input";

export const blogsRepository = {
    async createBlog(newBlog: WithId<BlogType>): Promise<OutputBlogType> {
        const resultCreateBlog = await BlogModelClass
            .create(newBlog)
        return blogMapper(newBlog)
    },
    async updateBlog(id: string, updateData: CreateAndUpdateBlogModel): Promise<boolean> {
        const resultUpdateBlog = await BlogModelClass
            .updateOne({_id: new ObjectId(id)}, {
            $set: {
                name: updateData.name,
                description: updateData.description,
                websiteUrl: updateData.websiteUrl
            }
        })
        return  resultUpdateBlog.matchedCount === 1
    },
    async deleteBlog(id: string): Promise<boolean> {
        const resultDeleteBlog = await BlogModelClass
            .deleteOne({_id: new ObjectId(id)})
        return resultDeleteBlog.deletedCount === 1
    }
}