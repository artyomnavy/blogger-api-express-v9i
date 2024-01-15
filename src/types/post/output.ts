
export type OutputPostType = {
    id: string,
    title: string,
    shortDescription: string,
    content: string,
    blogId: string,
    blogName: string,
    createdAt: string
}

export type PostType = {
    title: string,
    shortDescription: string,
    content: string,
    blogId: string,
    blogName: string,
    createdAt: Date
}

export type PaginatorPostsType = {
    pagesCount: number,
    page: number,
    pageSize: number,
    totalCount: number,
    items: OutputPostType[]
}