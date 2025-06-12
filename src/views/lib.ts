import { v4 as uuidv4 } from 'uuid'
import { omit } from 'lodash-es'
import { useNow } from '@vueuse/core'
import {
    type BotKindType,
    type GoogleSheetNameType,
    type GoogleSheetsRow
} from '@/services/googleSheetsService'

export const SPREAD_SHEET_ID = '12FlSEt-Unuq5yKsAHP4_xX4wqUAL3xItDkwBE9PZ94U'

export const DEFAULT_TIME = `${Math.min(Math.max(new Date().getHours() + 1, 8), 21)
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

export type BotCellKindType =
    | 'Какой бот звонил'
    | 'Дата звонка'
    | 'Время звонка'
    | 'Длительность, сек'
    | 'Ссылка на запись звонка'

export type UpdateCellsType = { valueKind: BotCellKindType; spreadsheetId: string; range: string }

export type WEBHOOK_ROW = {
    clientPhoneNumber: string
    botKind?: BotKindType
    additionalPrompt?: string
    sum?: number
    orders?: number
    scheduleTo?: string
    updateCells?: UpdateCellsType[]
}

export const timeFormatter = new Intl.DateTimeFormat('ru-RU', {
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23'
})

export type UpdateCells = Record<string, number> | { sheetName: GoogleSheetNameType }

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
    botKind: string
    updateCells?: UpdateCells
}) => {
    if (!v.rows?.length) return
    const result = Object.values(
        v.rows.reduce(
            (acc, { phone, sum }) => {
                if (phone && !acc[phone]) {
                    acc[phone] = {
                        clientPhoneNumber: phone as string,
                        sum: 0,
                        orders: 0,
                        scheduleTo: formatDate(v.callDate, v.callTime),
                        botKind: v.botKind
                    }
                    if (v.updateCells) {
                        acc[phone].updateCells = getUpdateCells(v.updateCells, phone)
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

export const prepareGoogleResponseRows = (
    data: {
        id: number
        phone: string
    }[],
    sheetName: GoogleSheetNameType
) => {
    const phoneId = data.reduce(
        (acc, it) => {
            acc[it.phone] = acc[it.phone] ? Math.min(acc[it.phone], it.id) : it.id
            return acc
        },
        {} as Record<string, number>
    )
    return {
        sheetName,
        ...phoneId
    }
}

export const getUpdateCells = (updateCells: UpdateCells, phone: string) => {
    const result = [] as UpdateCellsType[]
    ;[
        'Какой бот звонил',
        'Дата звонка',
        'Время звонка',
        'Длительность, сек',
        'Ссылка на запись звонка'
    ].forEach((it, idx) => {
        result.push({
            valueKind: it as BotCellKindType,
            spreadsheetId: SPREAD_SHEET_ID,
            range: getRangeString(updateCells, phone, idx)
        })
    })
    return result
}

const getUpdateCellColumnIdx = (sheetName: GoogleSheetNameType) => {
    //GoogleSheet Cells order(https://docs.google.com/spreadsheets/d/12FlSEt-Unuq5yKsAHP4_xX4wqUAL3xItDkwBE9PZ94U/edit?gid=0#gid=0)
    if (sheetName === 'Первичные заказы' || sheetName === 'Вторичные заказы') return 6
    else if (sheetName === 'Отказы') return 7
    else if (sheetName === 'Возвраты') return 4
    return 10 //Random default value
}

const getCell = (sheetName: GoogleSheetNameType, idx: number) => {
    //GoogleSheet Cells
    const CELLS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P']
    return CELLS[getUpdateCellColumnIdx(sheetName) + idx]
}

const getRangeString = (updateCells: UpdateCells, phone: string, idx: number) => {
    //String for populate GoogleSheet Cells (e.g = 'Первичные заказы'!A1:A1)
    const result =
        `'${updateCells.sheetName}'` +
        '!' +
        `${getCell(updateCells.sheetName as GoogleSheetNameType, idx)}` +
        `${+updateCells[phone as keyof typeof updateCells] + 1}` + //Row number(row id in GoogleSheetsTable +1 -> correction because we do not take into account the first row (table header))
        ':' +
        `${getCell(updateCells.sheetName as GoogleSheetNameType, idx)}` +
        `${getUpdateCellColumnIdx(updateCells.sheetName as GoogleSheetNameType) + idx + 1}` //Cell number
    return result
}
