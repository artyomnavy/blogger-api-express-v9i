import {Request, Response, Router} from "express"
import {
    BlogModelClass,
    CommentModelClass,
    DeviceModelClass,
    PostModelClass,
    UserModelClass
} from "../db/db";
import {HTTP_STATUSES} from "../utils";

export const testingRouter = Router({})

testingRouter.delete('/all-data',
    async (req: Request, res: Response) => {
    await BlogModelClass.deleteMany({})
    await PostModelClass.deleteMany({})
    await UserModelClass.deleteMany({})
    await CommentModelClass.deleteMany({})
    await DeviceModelClass.deleteMany({})
    res.sendStatus(HTTP_STATUSES.NO_CONTENT_204)
})