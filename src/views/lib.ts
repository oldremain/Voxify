import type { GoogleSheetsRow } from '@/services/googleSheetsService'
import { v4 as uuidv4 } from 'uuid'
import { useNow } from '@vueuse/core'

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
        sum: row.sum
    }
}

export const transformRows = (acc: GoogleSheetsRow[], it: GoogleSheetsRow) => {
    if (it.sum && it.phone) acc.push(transformRow(it))
    return acc
}
