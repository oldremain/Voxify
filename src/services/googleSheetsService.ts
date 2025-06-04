import { callApi } from '@/lib/io'

export const ActionTypes = {
    InitialOrder: 1,
    SecondaryOrder: 2,
    Rejection: 3,
    Refund: 4
} as const

export type ActionType = (typeof ActionTypes)[keyof typeof ActionTypes]

class GoogleSheetsService {
    async saveData(data: {
        action: ActionType
        payload: { time: string; sum: string; reason?: string }
    }) {
        await callApi({
            base: 'https://script.google.com',
            url: '/macros/s/AKfycbwCluZ9VfnsrMs0sswC0HyNxPnhzlEirOAiJyEYKD174gXV0PTjGK06rKiHq10RlcWjfQ/exec',
            method: 'POST',
            mode: 'no-cors',
            data
        })
    }
}

let service: GoogleSheetsService | undefined = undefined
export const useGoogleSheetsService = () => {
    if (!service) service = new GoogleSheetsService()
    return service
}
