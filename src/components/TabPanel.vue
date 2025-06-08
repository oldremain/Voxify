<script lang="ts" setup>
import { computed, nextTick, watch } from 'vue'
import { v4 as uuidv4 } from 'uuid'
import { DEFAULT_ROW } from '@/views/lib'
import { ActionTypes, type ActionType, type GoogleSheetsRow } from '@/services/googleSheetsService'
import CustomInput from '@/components/CustomInput.vue'
import PlusCircleIcon from '@/assets/icons/plus-circle.svg?component'
import MinusCircleIcon from '@/assets/icons/minus-circle.svg?component'
import ReasonSelect from '@/components/ReasonSelect.vue'
import PhoneNumberInput from '@/components/PhoneNumberInput.vue'

const props = defineProps<{
    disabled?: boolean
    callTime?: string
    actionType: ActionType
}>()

const rows = defineModel<GoogleSheetsRow[]>('rows')

const inputWrpClass = computed(() => {
    if (props.actionType === ActionTypes.InitialOrder) return 'initial-order-rows'
    if (props.actionType === ActionTypes.SecondaryOrder) return 'secondary-order-rows'
    if (props.actionType === ActionTypes.Rejection) return 'rejection-order-rows'
    if (props.actionType === ActionTypes.Refund) return 'refund-order-rows'
    return ''
})

const checkPhoneCode = (v: string) => /^(25|29|33|44)/.test(v)

const onUpdatePhoneNumber = (row: GoogleSheetsRow, v: string) => {
    row.isValidPhone = true
    row.internationalPhone = `+375${v}`
    if (v.length < 2) return
    row.isValidPhone = checkPhoneCode(v)
}

const onPhoneNumberBlur = (row: GoogleSheetsRow) => {
    if (!row.phone) return
    row.isValidPhone = checkPhoneCode(row.phone)
}

const addRow = () => {
    if (props.disabled || !rows.value?.every((it) => it.phone && it.sum)) return
    const newRow = {
        ...DEFAULT_ROW,
        id: uuidv4(),
        callTime: rows.value?.[0]?.callTime as string
    }
    if (props.actionType === ActionTypes.Rejection) {
        newRow.reason = ''
    }
    rows.value = [...(rows.value || []), newRow]
    focusOnLastRow()
}

const deleteRow = (id: string) => {
    if (props.disabled) return
    rows.value = rows.value?.filter((it) => it.id !== id) || []
}

const focusOnLastRow = () => {
    nextTick(() => {
        const phoneNumberNodes = document.querySelectorAll(
            `.${inputWrpClass.value} .phone-number-input input`
        )
        const lastPhoneNumberNode = phoneNumberNodes.item(
            phoneNumberNodes.length - 1
        ) as HTMLInputElement
        if (lastPhoneNumberNode) lastPhoneNumberNode?.focus()
    })
}

const onPhoneKeyDown = (e: KeyboardEvent, row: GoogleSheetsRow, idx: number) => {
    if (e.key === 'Enter' && (row.phone?.length || 0) === 9 && row.isValidPhone) {
        const sumInput = document.querySelector(
            `.${inputWrpClass.value} .sum-input[data-order="${idx}"] input`
        ) as HTMLInputElement
        if (sumInput) sumInput?.focus()
    }
}

const onSumKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Enter' && rows.value?.every((it) => it.phone && it.sum)) {
        addRow()
        focusOnLastRow()
    }
}

watch(
    () => props.callTime,
    () => {
        rows.value?.forEach((it) => {
            it.callTime = props.callTime || ''
        })
    },
    { immediate: true }
)
</script>

<template>
    <div class="inputs-wrp" :class="inputWrpClass">
        <div v-for="(row, idx) in rows" :key="row.id" class="input-row">
            <phone-number-input
                v-model="row.phone"
                label="Номер телефона"
                placeholder="291234567"
                :has-error="!row.isValidPhone"
                :disabled="disabled"
                class="phone-number-input"
                required
                @update:model-value="(v) => onUpdatePhoneNumber(row, v)"
                @keydown="(e) => onPhoneKeyDown(e, row, idx)"
                @blur="onPhoneNumberBlur(row)"
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
                :disabled="disabled"
                class="sum-input"
                :data-order="idx"
                required
                @keydown="onSumKeyDown"
            >
                <template #suffix> BYN </template>
            </custom-input>
            <reason-select
                v-if="'reason' in row"
                v-model="row.reason"
                label="Причина"
                placeholder="Причина"
                class="reason-select"
                :disabled="disabled"
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
</template>

<style lang="scss">
.inputs-wrp {
    margin-bottom: 20px;
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
}
</style>
