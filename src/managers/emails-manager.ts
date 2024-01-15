import {emailAdapter} from "../adapters/emails-adapter";

export const emailsManager = {
    async sendEmailConfirmationMessage(email: string, code: string) {
        return await emailAdapter
            .sendEmailWithCode(email, code)
    },
    async sendEmailWithRecoveryCode(email: string, recoveryCode: string) {
        return await emailAdapter
            .sendEmailWithRecoveryCode(email, recoveryCode)
    }
}