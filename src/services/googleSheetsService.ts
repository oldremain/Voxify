import { callApi } from '@/lib/io'

export const ActionTypes = {
    InitialOrder: 1,
    SecondaryOrder: 2,
    Rejection: 3,
    Refund: 4
} as const

export const BotKind: Record<ActionType, string> = {
    1: 'Первичный обзвон',
    2: 'Вторичный обзвон',
    3: 'Обзвон отказов',
    4: 'Обзвон возвратов'
} as const

export const GoogleSheetName = {
    1: 'Первичные заказы',
    2: 'Вторичные заказы',
    3: 'Отказы',
    4: 'Возвраты'
} as const

export type ActionType = (typeof ActionTypes)[keyof typeof ActionTypes]

export type BotKindType = (typeof BotKind)[ActionType]

export type GoogleSheetNameType = (typeof GoogleSheetName)[ActionType]

export type GoogleSheetsRow = {
    id?: string
    date?: string
    timeCreated?: string
    phone?: string
    internationalPhone?: string
    callTime: string
    sum: string
    reason?: string
    isValidPhone?: boolean
    botKind?: BotKindType //For webhook
}

export type GoogleSheetsResponse = {
    success: boolean
    rows: { id: number; phone: string }[]
}

//: Promise<GoogleSheetsResponse>
class GoogleSheetsService {
    async saveData(data: { action: ActionType; payload: GoogleSheetsRow[] }) {
        const resp = await callApi({
            // base: `${window.location.origin}`,
            // url: '/google-script',
            // method: 'POST',
            // data
            base: 'https://script.google.com',
            url: '/macros/s/AKfycbwCluZ9VfnsrMs0sswC0HyNxPnhzlEirOAiJyEYKD174gXV0PTjGK06rKiHq10RlcWjfQ/exec',
            method: 'POST',
            //mode: 'no-cors',
            data
        })
        //return await resp.json()
    }
}

let service: GoogleSheetsService | undefined = undefined
export const useGoogleSheetsService = () => {
    if (!service) service = new GoogleSheetsService()
    return service
}
