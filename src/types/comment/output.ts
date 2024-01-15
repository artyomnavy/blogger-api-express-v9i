export type OutputCommentType = {
    id: string,
    content: string,
    commentatorInfo: {
        userId: string,
        userLogin: string
    },
    createdAt: string
}

export type CommentType = {
    content: string,
    commentatorInfo: {
        userId: string,
        userLogin: string
    },
    createdAt: Date,
    postId: string
}

export type PaginatorCommentsType = {
    pagesCount: number,
    page: number,
    pageSize: number,
    totalCount: number,
    items: OutputCommentType[]
}