import {OutputPostType} from "../post/output";

export type OutputBlogType = {
    id: string,
    name: string,
    description: string,
    websiteUrl: string,
    createdAt: string,
    isMembership: boolean
}

export type BlogType = {
    name: string,
    description: string,
    websiteUrl: string,
    createdAt: Date,
    isMembership: boolean
}

export type PaginatorBlogsType = {
    pagesCount: number,
    page: number,
    pageSize: number,
    totalCount: number,
    items: OutputBlogType[]
}

export type PaginatorPostsWithBlogIdType = {
    pagesCount: number,
    page: number,
    pageSize: number,
    totalCount: number,
    items: OutputPostType[]
}