import {AttemptType} from "../types/auth/output";
import {AttemptModelClass} from "../db/db";

export const authRepository = {
    async addAttempt(attempt: AttemptType): Promise<AttemptType> {
        await AttemptModelClass
            .create(attempt)

        return attempt
    }
}