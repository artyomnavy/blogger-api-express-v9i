import {WithId} from "mongodb";
import {OutputPostType, PostType} from "./output";

export const postMapper = (post: WithId<PostType>): OutputPostType => {
    return {
        id: post._id.toString(),
        title: post.title,
        shortDescription: post.shortDescription,
        content: post.content,
        blogId: post.blogId,
        blogName: post.blogName,
        createdAt: post.createdAt.toISOString()
    }
}