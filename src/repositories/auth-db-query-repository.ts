import {AttemptModelClass} from "../db/db";
import {AttemptType} from "../types/auth/output";

export const authQueryRepository = {
    async getAmountOfAttempts(attempt: AttemptType): Promise<number> {
        const amount = await AttemptModelClass
            .countDocuments({ip: attempt.ip, url: attempt.url, date: {$gte: attempt.date}})
        return amount
    }
}