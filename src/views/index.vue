<script lang="ts" setup>
import { computed, ref } from 'vue'
import { ElButton, ElTabs, ElTabPane, ElDialog } from 'element-plus'
import {
    ActionTypes,
    BotKind,
    useGoogleSheetsService,
    type GoogleSheetsRow,
    type GoogleSheetsResponse
} from '@/services/googleSheetsService'
import { useWebHookService } from '@/services/webHookService'
import {
    DEFAULT_ROW,
    DEFAULT_TIME,
    prepareGoogleResponseRows,
    prepareRowsForWebHook,
    transformRow,
    transformRows,
    type UpdateCells
} from './lib'
import { showSuccess, showError } from '@/lib'
import CustomInput from '@/components/CustomInput.vue'
import CustomTimeSelect from '@/components/CustomTimeSelect.vue'
import CustomDatePicker from '@/components/CustomDatePicker.vue'
import TabPanel from '@/components/TabPanel.vue'

const service = useGoogleSheetsService()
const webHookService = useWebHookService()

const currentTab = ref(ActionTypes.InitialOrder)
const initialOrderRows = ref<GoogleSheetsRow[]>([{ ...DEFAULT_ROW }])
const secondaryOrderRows = ref<GoogleSheetsRow[]>([{ ...DEFAULT_ROW }])
const rejectionOrderRows = ref<GoogleSheetsRow[]>([{ ...DEFAULT_ROW, reason: '' }])
const refundOrderRows = ref<GoogleSheetsRow[]>([{ ...DEFAULT_ROW }])
const callDate = ref(new Date())
const callTime = ref(DEFAULT_TIME)
const password = ref('')
const showModal = ref(false)
const isAwaiting = ref(false)

const isValidPassword = ref(true)

const initialOrderToSave = computed(() =>
    initialOrderRows.value.reduce(transformRows, [] as GoogleSheetsRow[])
)
const secondaryOrderToSave = computed(() =>
    secondaryOrderRows.value.reduce(transformRows, [] as GoogleSheetsRow[])
)
const rejectOrderToSave = computed(() =>
    rejectionOrderRows.value.reduce((acc, it) => {
        if (it.sum && it.phone && it.reason) acc.push(transformRow(it))
        return acc
    }, [] as GoogleSheetsRow[])
)
const refundOrderToSave = computed(() =>
    refundOrderRows.value.reduce(transformRows, [] as GoogleSheetsRow[])
)

const resetValues = () => {
    initialOrderRows.value = [{ ...DEFAULT_ROW }]
    secondaryOrderRows.value = [{ ...DEFAULT_ROW }]
    rejectionOrderRows.value = [{ ...DEFAULT_ROW, reason: '' }]
    refundOrderRows.value = [{ ...DEFAULT_ROW }]
}

const onShowModal = async () => {
    const isValidInitialOrders = initialOrderRows.value.every((it) => it.isValidPhone)
    const isValidSecondaryOrders = secondaryOrderRows.value.every((it) => it.isValidPhone)
    const isValidRejectionOrders = rejectionOrderRows.value.every((it) => it.isValidPhone)
    const isValidRefundOrders = refundOrderRows.value.every((it) => it.isValidPhone)
    const isValidFields =
        isValidInitialOrders &&
        isValidSecondaryOrders &&
        isValidRejectionOrders &&
        isValidRefundOrders
    if (!isValidFields) {
        showError('Проверьте корректность введенных данных')
        return
    }
    if (
        !initialOrderToSave.value.length &&
        !secondaryOrderToSave.value.length &&
        !rejectOrderToSave.value.length &&
        !refundOrderToSave.value.length
    ) {
        showError('Заполните обязательные поля')
        return
    }
    showModal.value = true
}

const onCloseModal = () => {
    isValidPassword.value = true
    password.value = ''
}

const saveToGoogleSheets = async () => {
    const promises = []
    if (initialOrderToSave.value.length) {
        promises.push(
            await service.saveData({
                action: ActionTypes.InitialOrder,
                payload: initialOrderToSave.value
            })
        )
    } else {
        promises.push(Promise.resolve(1))
    }

    if (secondaryOrderToSave.value.length) {
        promises.push(
            await service.saveData({
                action: ActionTypes.SecondaryOrder,
                payload: secondaryOrderToSave.value
            })
        )
    } else {
        promises.push(Promise.resolve(1))
    }

    if (rejectOrderToSave.value.length) {
        promises.push(
            await service.saveData({
                action: ActionTypes.Rejection,
                payload: rejectOrderToSave.value
            })
        )
    } else {
        promises.push(Promise.resolve(1))
    }

    if (refundOrderToSave.value.length) {
        promises.push(
            await service.saveData({
                action: ActionTypes.Refund,
                payload: refundOrderToSave.value
            })
        )
    } else {
        promises.push(Promise.resolve(1))
    }

    const promiseResult = await Promise.allSettled(promises)
    //console.log(promiseResult)

    const data = [] as UpdateCells[]
    // if (
    //     promiseResult[0]?.status === 'fulfilled' &&
    //     (<GoogleSheetsResponse>promiseResult[0].value)?.success
    // )
    //     data.push(
    //         prepareGoogleResponseRows(
    //             (<GoogleSheetsResponse>promiseResult[0].value).rows,
    //             'Первичные заказы'
    //         )
    //     )
    // if (
    //     promiseResult[1]?.status === 'fulfilled' &&
    //     (<GoogleSheetsResponse>promiseResult[1].value)?.success
    // )
    //     data.push(
    //         prepareGoogleResponseRows(
    //             (<GoogleSheetsResponse>promiseResult[1].value).rows,
    //             'Вторичные заказы'
    //         )
    //     )
    // if (
    //     promiseResult[2]?.status === 'fulfilled' &&
    //     (<GoogleSheetsResponse>promiseResult[2].value)?.success
    // )
    //     data.push(
    //         prepareGoogleResponseRows((<GoogleSheetsResponse>promiseResult[2].value).rows, 'Отказы')
    //     )
    // if (
    //     promiseResult[3]?.status === 'fulfilled' &&
    //     (<GoogleSheetsResponse>promiseResult[3].value)?.success
    // )
    //     data.push(
    //         prepareGoogleResponseRows(
    //             (<GoogleSheetsResponse>promiseResult[3].value).rows,
    //             'Возвраты'
    //         )
    //     )

    // const allFullfilled = promiseResult.every(
    //     (result) => result?.status === 'fulfilled' && result?.value
    // )
    // if (allFullfilled) showSuccess('Сохранено')
    // else showError('Ошибка сохранения данных')
    showSuccess('Сохранено')

    return data
}

const sendWebHook = async (data: UpdateCells[]) => {
    const promises = [] as Promise<any>[]
    const initialOrders = prepareRowsForWebHook({
        rows: initialOrderToSave.value,
        callDate: callDate.value,
        callTime: callTime.value,
        botKind: BotKind[ActionTypes.InitialOrder],
        updateCells: data.find((it) => it.sheetName === 'Первичные заказы') || {}
    })
    const secondaryOrders = prepareRowsForWebHook({
        rows: secondaryOrderToSave.value,
        callDate: callDate.value,
        callTime: callTime.value,
        botKind: BotKind[ActionTypes.SecondaryOrder],
        updateCells: data.find((it) => it.sheetName === 'Вторичные заказы') || {}
    })
    const rejectOrders = prepareRowsForWebHook({
        rows: rejectOrderToSave.value,
        callDate: callDate.value,
        callTime: callTime.value,
        botKind: BotKind[ActionTypes.Rejection],
        updateCells: data.find((it) => it.sheetName === 'Отказы') || {}
    })
    const refundOrders = prepareRowsForWebHook({
        rows: refundOrderToSave.value,
        callDate: callDate.value,
        callTime: callTime.value,
        botKind: BotKind[ActionTypes.Refund],
        updateCells: data.find((it) => it.sheetName === 'Возвраты') || {}
    })
    if (initialOrders?.length) {
        initialOrders.forEach((it) => promises.push(webHookService.sendWebHook(it)))
    }
    if (secondaryOrders?.length) {
        secondaryOrders.forEach((it) => promises.push(webHookService.sendWebHook(it)))
    }
    if (rejectOrders?.length) {
        rejectOrders.forEach((it) => promises.push(webHookService.sendWebHook(it)))
    }
    if (refundOrders?.length) {
        refundOrders.forEach((it) => promises.push(webHookService.sendWebHook(it)))
    }

    const promiseResult = await Promise.allSettled(promises)
    const allFullfilled = promiseResult.every((result) => result.status === 'fulfilled')
    if (allFullfilled) showSuccess('Отправлен вебхук')
    else showError('Ошибка при отправке вебхука')
}

const onSave = async () => {
    if (password.value !== '1234') {
        isValidPassword.value = false
        return
    }
    try {
        isAwaiting.value = true
        showModal.value = false
        const data = await saveToGoogleSheets()
        //await sendWebHook(data)
        resetValues()
    } catch (e: any) {
        showError(e.message)
    } finally {
        isAwaiting.value = false
    }
}
</script>

<template>
    <div class="main-wrp">
        <!-- {{ initialOrderToSave }}
        <br />
        <br />
        {{ secondaryOrderToSave }}
        <br />
        <br />
        {{ rejectOrderToSave }}
        <br />
        <br />
        {{ refundOrderToSave }} -->
        <el-tabs v-model="currentTab" id="custom-tabs" type="border-card" class="order-tabs">
            <el-tab-pane label="Первичный заказ" :name="ActionTypes.InitialOrder">
                <tab-panel
                    v-model:rows="initialOrderRows"
                    :action-type="ActionTypes.InitialOrder"
                    :call-time="callTime"
                    :disabled="isAwaiting"
                />
            </el-tab-pane>
            <el-tab-pane label="Вторичный заказ" :name="ActionTypes.SecondaryOrder">
                <tab-panel
                    v-model:rows="secondaryOrderRows"
                    :action-type="ActionTypes.SecondaryOrder"
                    :call-time="callTime"
                    :disabled="isAwaiting"
                />
            </el-tab-pane>
            <el-tab-pane label="Отказы" :name="ActionTypes.Rejection">
                <tab-panel
                    v-model:rows="rejectionOrderRows"
                    :action-type="ActionTypes.Rejection"
                    :call-time="callTime"
                    :disabled="isAwaiting"
                />
            </el-tab-pane>
            <el-tab-pane label="Возвраты" :name="ActionTypes.Refund">
                <tab-panel
                    v-model:rows="refundOrderRows"
                    :action-type="ActionTypes.Refund"
                    :call-time="callTime"
                    :disabled="isAwaiting"
                />
            </el-tab-pane>
        </el-tabs>

        <div class="footer-row">
            <!-- <custom-date-picker v-model="callDate" label="Дата" size="large" class="date-select" /> -->
            <custom-time-select
                v-model="callTime"
                label="Начать обзвон"
                class="time-select"
                placeholder="00:00"
                required
                :disabled="isAwaiting"
            />
            <el-button
                type="success"
                class="show-modal-btn"
                size="large"
                :disabled="isAwaiting"
                :loading="isAwaiting"
                @click="onShowModal"
            >
                Сохранить
            </el-button>
        </div>

        <el-dialog v-model="showModal" class="password-modal" align-center @close="onCloseModal">
            <template #default>
                <custom-input
                    v-model="password"
                    label="Пароль"
                    placeholder="Пароль"
                    :has-error="!isValidPassword"
                    required
                    @update:model-value="isValidPassword = true"
                >
                    <template #error> Неверный пароль </template>
                </custom-input>
            </template>
            <template #footer>
                <el-button
                    type="success"
                    size="large"
                    class="save-btn"
                    :disabled="isAwaiting"
                    :loading="isAwaiting"
                    @click="onSave"
                >
                    Далее
                </el-button>
            </template>
        </el-dialog>
    </div>
</template>

<style lang="scss">
.main-wrp {
    width: 100%;
    max-width: 1000px;
    margin: auto;

    .order-tabs {
        margin-bottom: 12px;
        .el-tabs__item {
            color: black !important;
            &.is-active {
                color: black;
                background-color: rgb(162, 53, 225) !important;
                text-decoration: underline;
                text-underline-offset: 4px;
                font-weight: bolder;
                font-size: 20px;
            }
            &:nth-child(1) {
                background-color: #409eff;
            }
            &:nth-child(2) {
                background-color: #ab3528;
            }
            &:nth-child(3) {
                background-color: #f95540;
            }
            &:nth-child(4) {
                background-color: #8b8b8b;
            }
        }
    }

    .date-select {
        .el-input {
            max-width: 170px;
        }
    }

    .time-select {
        max-width: 170px;
        margin: 0;
    }

    .footer-row {
        display: flex;
        align-items: flex-end;
        gap: 12px;
        margin-bottom: 20px;
    }

    .el-button {
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 18px;
        font-weight: 500;
        min-width: 200px;
        width: auto;
    }

    .save-btn {
        margin: auto;
    }

    .password-modal {
        max-width: 600px;
    }
}
</style>
