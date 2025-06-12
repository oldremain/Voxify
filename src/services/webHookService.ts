import { callApi } from '@/lib/io'
import type { WEBHOOK_ROW } from '@/views/lib'

const TOKEN =
    'M55zJaC1zfBTJOaqHiulp79YEe0RyKLd7l11YHacWc5ZWDtRPS1KZWZCgj8BeIXCuHMFCKFmXffcFEXYM0bzelHuZ0s4JJV2DSMPPP3skUoObalO0wsBjtoLdWVm8NmFTQwnHCJfdKbZLq4tyjTjrN9jWHgkAVCT3c3ofK7SzOe4Bh11AXiVQcbo8qzqd8zy3Cw2Ux5jt0jaKJP4qo09d6nJs1qezq9C0Vvl7jPl6ybFZ2ckOCTciwe19JZZLMpk'

class WebHookService {
    async sendWebHook(data: WEBHOOK_ROW) {
        await callApi({
            base: 'https://receive-info-17850c386cfe.bot.voxify.pro',
            url: '/schedule-ai-bot-call',
            method: 'POST',
            headers: {
                Authorization: `Bearer ${TOKEN}`
            },
            data
        })
    }
}

let service: WebHookService | undefined = undefined
export const useWebHookService = () => {
    if (!service) service = new WebHookService()
    return service
}
