import { computed } from 'vue'
import { ElNotification } from 'element-plus'
import { round } from './round'

export const useNumberFormatter = (opts?: Intl.NumberFormatOptions) =>
    computed(() => {
        opts ||= {}
        opts.signDisplay = 'exceptZero'
        const nf = new Intl.NumberFormat('ru', opts)
        return {
            format: (v: number | string) =>
                round(Number(v), opts?.maximumFractionDigits ?? 2) > 0
                    ? nf.format(<number>v).substring(1)
                    : nf.format(<number>v)
        }
    })

export const useDateFormatter = (opts?: any) =>
    computed(() => {
        opts ||= {
            year: 'numeric'
        }
        opts.month = 'numeric'
        opts.day = 'numeric'
        return {
            format: (d: Date | number) => new Intl.DateTimeFormat('ru', opts).format(d)
        }
    })

export const showSuccess = (msg: string = 'Сохранено') => {
    ElNotification({
        title: msg,
        type: 'success',
        duration: 3000
    })
}

export const showError = (msg: string = 'Ошибка') => {
    ElNotification({
        title: msg,
        type: 'error',
        duration: 3000
    })
}

export const showWarning = (msg: string = 'Внимание') => {
    ElNotification({
        title: msg,
        type: 'warning',
        duration: 3000
    })
}
