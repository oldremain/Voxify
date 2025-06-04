<script lang="ts" setup>
import { ref } from 'vue'
import { useEventListener } from '@vueuse/core'
import { v4 as uuidv4 } from 'uuid'
import { add, cloneDeep } from 'lodash-es'
import { ElButton, ElTabs, ElTabPane, ElDialog } from 'element-plus'
import {
    ActionTypes,
    useGoogleSheetsService,
    type GoogleSheetsRow
} from '@/services/googleSheetsService'
import { DEFAULT_ROW } from './lib'
import { showSuccess, showError, useDateFormatter, useNumberFormatter } from '@/lib'
import CustomInput from '@/components/CustomInput.vue'
import CustomTimeSelect from '@/components/CustomTimeSelect.vue'
import PlusCircleIcon from '@/assets/icons/plus-circle.svg?component'
import MinusCircleIcon from '@/assets/icons/minus-circle.svg?component'
import ReasonSelect from '@/components/ReasonSelect.vue'
import PhoneNumberInput from '@/components/PhoneNumberInput.vue'

const service = useGoogleSheetsService()
const dateFormatter = useDateFormatter()
const numberFormatter = useNumberFormatter({ maximumFractionDigits: 4 })

const currentTab = ref(ActionTypes.InitialOrder)
const rows = ref<GoogleSheetsRow[]>([cloneDeep(DEFAULT_ROW)])
const password = ref('')
const showModal = ref(false)
const isAwaiting = ref(false)

const isValidPassword = ref(true)

const addRow = () => {
    rows.value = [
        ...rows.value,
        {
            ...DEFAULT_ROW,
            id: uuidv4()
        }
    ]
}

const deleteRow = (id: string) => {
    rows.value = rows.value.filter((it) => it.id !== id)
}

const resetValues = () => {
    rows.value = [cloneDeep(DEFAULT_ROW)]
}

const checkPhoneCode = (v: string) => /^(25|29|33|44)/.test(v)

const onUpdatePhoneNumber = (id: string, v: string) => {
    if (v.length < 2) return
    const row = rows.value.find((it) => it.id === id)
    if (row) {
        row.isValid = checkPhoneCode(v)
    }
}

const onPhoneNumberBlur = (id: string) => {
    const row = rows.value.find((it) => it.id === id)
    if (row) {
        row.isValid = row.phone?.length === 9
    }
}

const onShowModal = async () => {
    if (rows.value.some((it) => !it.isValid)) return
    showModal.value = true
}

const onCloseModal = () => {
    isValidPassword.value = true
    password.value = ''
}

const onSave = async () => {
    if (password.value !== '1234') {
        isValidPassword.value = false
        return
    }
    try {
        isAwaiting.value = true
        const payload = rows.value.map((it) => {
            if (it.phone) it.phone = `+375${it.phone}`
            return it
        })
        await service.saveData({
            action: currentTab.value,
            payload
        })
        resetValues()
        showModal.value = false
        showSuccess('Сохранено')
    } catch (e: any) {
        showError(e.message)
    } finally {
        isAwaiting.value = false
    }
}

const onKeyDown = (e: KeyboardEvent, sum: string) => {
    if (e.key === 'Enter' && Boolean(sum)) addRow()
}
</script>

<template>
    <div class="main-wrp">
        <el-tabs
            v-model="currentTab"
            id="custom-tabs"
            type="border-card"
            class="order-tabs"
            @tab-change="resetValues"
        >
            <el-tab-pane label="Первичный заказ" :name="ActionTypes.InitialOrder">
                <div class="inputs-wrp">
                    <div v-for="(row, idx) in rows" :key="row.id" class="input-row">
                        <phone-number-input
                            v-model="row.phone"
                            label="Номер телефона"
                            placeholder="291234567"
                            :has-error="!row.isValid"
                            required
                            @update:model-value="(v) => onUpdatePhoneNumber(row.id as string, v)"
                            @blur="onPhoneNumberBlur(row.id as string)"
                        >
                            <template #error>
                                {{
                                    !checkPhoneCode(row.phone as string)
                                        ? 'Некорректный код'
                                        : 'Некорректная длина'
                                }}
                            </template>
                        </phone-number-input>
                        <custom-time-select
                            v-model="row.time"
                            label="Начать обзвон"
                            placeholder="00:00"
                            required
                        />
                        <custom-input
                            v-model="row.sum"
                            type="number"
                            label="Сумма заказа"
                            placeholder="0"
                            required
                            @keydown="(e) => onKeyDown(e, row.sum)"
                        >
                            <template #suffix> BYN </template>
                        </custom-input>
                        <plus-circle-icon class="add-icon" @click="addRow" />
                        <minus-circle-icon
                            v-if="idx !== 0"
                            class="delete-icon"
                            @click="deleteRow(row.id as string)"
                        />
                    </div>
                </div>
            </el-tab-pane>
            <el-tab-pane label="Вторичный заказ" :name="ActionTypes.SecondaryOrder">
                <div class="inputs-wrp">
                    <div v-for="(row, idx) in rows" :key="row.id" class="input-row">
                        <phone-number-input
                            v-model="row.phone"
                            label="Номер телефона"
                            placeholder="291234567"
                            :has-error="!row.isValid"
                            required
                            @update:model-value="(v) => onUpdatePhoneNumber(row.id as string, v)"
                            @blur="onPhoneNumberBlur(row.id as string)"
                        >
                            <template #error>
                                {{
                                    !checkPhoneCode(row.phone as string)
                                        ? 'Некорректный код'
                                        : 'Некорректная длина'
                                }}
                            </template>
                        </phone-number-input>
                        <custom-time-select
                            v-model="row.time"
                            label="Начать обзвон"
                            placeholder="00:00"
                            required
                        />
                        <custom-input
                            v-model="row.sum"
                            type="number"
                            label="Сумма заказа"
                            placeholder="0"
                            required
                            @keydown="(e) => onKeyDown(e, row.sum)"
                        >
                            <template #suffix> BYN </template>
                        </custom-input>
                        <plus-circle-icon class="add-icon" @click="addRow" />
                        <minus-circle-icon
                            v-if="idx !== 0"
                            class="delete-icon"
                            @click="deleteRow(row.id as string)"
                        />
                    </div>
                </div>
            </el-tab-pane>
            <el-tab-pane label="Отказы" :name="ActionTypes.Rejection">
                <div class="inputs-wrp">
                    <div v-for="(row, idx) in rows" :key="row.id" class="input-row">
                        <phone-number-input
                            v-model="row.phone"
                            label="Номер телефона"
                            placeholder="291234567"
                            :has-error="!row.isValid"
                            required
                            @update:model-value="(v) => onUpdatePhoneNumber(row.id as string, v)"
                            @blur="onPhoneNumberBlur(row.id as string)"
                        >
                            <template #error>
                                {{
                                    !checkPhoneCode(row.phone as string)
                                        ? 'Некорректный код'
                                        : 'Некорректная длина'
                                }}
                            </template>
                        </phone-number-input>
                        <custom-input
                            v-model="row.sum"
                            type="number"
                            label="Сумма заказа"
                            placeholder="0"
                            required
                            @keydown="(e) => onKeyDown(e, row.sum)"
                        >
                            <template #suffix> BYN </template>
                        </custom-input>
                        <reason-select
                            v-model="row.reason"
                            label="Причина"
                            placeholder="Причина"
                            class="reason-select"
                            required
                        />
                        <plus-circle-icon class="add-icon" @click="addRow" />
                        <minus-circle-icon
                            v-if="idx !== 0"
                            class="delete-icon"
                            @click="deleteRow(row.id as string)"
                        />
                    </div>
                </div>
            </el-tab-pane>
            <el-tab-pane label="Возвраты" :name="ActionTypes.Refund">
                <div class="inputs-wrp">
                    <div v-for="(row, idx) in rows" :key="row.id" class="input-row">
                        <custom-input
                            v-model="row.sum"
                            type="number"
                            label="Сумма заказа"
                            placeholder="0"
                            required
                            @keydown="(e) => onKeyDown(e, row.sum)"
                        >
                            <template #suffix> BYN </template>
                        </custom-input>
                        <plus-circle-icon class="add-icon" @click="addRow" />
                        <minus-circle-icon
                            v-if="idx !== 0"
                            class="delete-icon"
                            @click="deleteRow(row.id as string)"
                        />
                    </div>
                </div>
            </el-tab-pane>
        </el-tabs>
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
        margin-bottom: 20px;
    }

    .inputs-wrp {
        margin-bottom: 20px;
    }

    .input-row {
        display: flex;
        display: flex;
        align-items: flex-start;
        gap: 8px;
        margin-bottom: 16px;
        > * {
            max-width: 230px;
        }
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

    .secondary-order-btn {
        background-color: rgb(85, 20, 20);
        border: red;
        &:hover {
            background-color: rgb(156, 70, 70);
        }
        &:active {
            background-color: rgb(85, 20, 20);
        }
    }

    .show-modal-btn,
    .save-btn {
        margin: auto;
    }

    .reason-select {
        min-width: 230px;
    }

    .add-icon {
        color: rgb(1, 159, 1);
        &:hover {
            color: rgb(1, 120, 1);
        }
    }

    .delete-icon {
        color: rgb(225, 60, 60);
        &:hover {
            color: rgb(180, 54, 54);
        }
    }

    .add-icon,
    .delete-icon {
        margin-top: 33px;
        cursor: pointer;
        transition: all 0.15s ease;
    }

    .password-modal {
        max-width: 600px;
    }
}
</style>
