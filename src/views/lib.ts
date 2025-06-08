import { v4 as uuidv4 } from 'uuid'
import { omit } from 'lodash-es'
import { useNow } from '@vueuse/core'
import type { ActionType, BotKind, GoogleSheetsRow } from '@/services/googleSheetsService'

export const DEFAULT_TIME = `${Math.min(new Date().getHours() + 1, 21)
    .toString()
    .padStart(2, '0')}:00`

export const DEFAULT_ROW: GoogleSheetsRow = {
    id: uuidv4(),
    phone: '',
    internationalPhone: '',
    callTime: DEFAULT_TIME,
    sum: '',
    isValidPhone: true
}

export type WEBHOOK_ROW = {
    clientPhoneNumber: string
    botKind?: (typeof BotKind)[ActionType]
    additionalPrompt?: string
    sum?: number
    orders?: number
    scheduleTo?: string
}

export const timeFormatter = new Intl.DateTimeFormat('ru-RU', {
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23'
})

export const transformRow = (row: GoogleSheetsRow) => {
    const date = useNow()
    return {
        phone: row.internationalPhone,
        date: date.value.toLocaleDateString('ru-RU'),
        timeCreated: timeFormatter.format(date.value),
        callTime: row.callTime,
        reason: row.reason,
        sum: row.sum,
        botKind: row.botKind
    }
}

export const transformRows = (acc: GoogleSheetsRow[], it: GoogleSheetsRow) => {
    if (it.sum && it.phone) acc.push(transformRow(it))
    return acc
}

export const formatDate = (date: Date, time: string) => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')

    const offsetMinutes = date.getTimezoneOffset()
    const offsetHours = Math.abs(Math.floor(offsetMinutes / 60))
        .toString()
        .padStart(2, '0')
    const offsetSign = offsetMinutes > 0 ? '-' : '+'

    return `${year}-${month}-${day}T${time}:00${offsetSign}${offsetHours}:00`
}

export const prepareRowsForWebHook = (v: {
    rows: GoogleSheetsRow[]
    callDate: Date
    callTime: string
}) => {
    if (!v.rows?.length) return
    const result = Object.values(
        v.rows.reduce(
            (acc, { phone, sum, botKind }) => {
                if (phone && !acc[phone]) {
                    acc[phone] = {
                        clientPhoneNumber: phone as string,
                        sum: 0,
                        orders: 0,
                        scheduleTo: formatDate(v.callDate, v.callTime),
                        botKind
                    }
                }
                const item = acc[phone as string]
                item.sum = (item.sum || 0) + +sum
                item.orders = (item.orders || 0) + 1
                item.additionalPrompt = `Сумма заказа: ${item.sum} BYN. \nКоличество заказов: ${item.orders}`
                return acc
            },
            {} as Record<string, WEBHOOK_ROW>
        )
    )
    return result.map((it) => omit(it, ['sum', 'orders']))
}
