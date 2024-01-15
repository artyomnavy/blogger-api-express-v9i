import {PostModelClass} from "../db/db";
import {OutputPostType, PostType} from "../types/post/output";
import {postMapper} from "../types/post/mapper";
import {CreateAndUpdatePostModel} from "../types/post/input";
import {ObjectId, WithId} from "mongodb";

export const postsRepository = {
    async createPost(newPost: WithId<PostType>): Promise<OutputPostType> {
        const resultCreatePost = await PostModelClass
            .create(newPost)
        return postMapper(newPost)
    },
    async updatePost(id: string, updateData: CreateAndUpdatePostModel): Promise<boolean> {
        const resultUpdatePost = await PostModelClass
            .updateOne({_id: new ObjectId(id)}, {
            $set: {
                title: updateData.title,
                shortDescription: updateData.shortDescription,
                content: updateData.content,
                blogId: updateData.blogId
            }
        })
        return resultUpdatePost.matchedCount === 1
    },
    async deletePost(id: string): Promise<boolean> {
        const resultDeletePost = await PostModelClass
            .deleteOne({_id: new ObjectId(id)})
        return resultDeletePost.deletedCount === 1
    }
}