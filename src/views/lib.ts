import { v4 as uuidv4 } from 'uuid'

export const DEFAULT_TIME = `${Math.min(new Date().getHours() + 1, 21)
    .toString()
    .padStart(2, '0')}:00`

export const DEFAULT_ROW = {
    id: uuidv4(),
    phone: '',
    time: DEFAULT_TIME,
    sum: '',
    reason: '',
    isValid: true
}
