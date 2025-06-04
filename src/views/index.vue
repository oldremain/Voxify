<script lang="ts" setup>
import { computed, onMounted, ref } from 'vue'
import { useStorage } from '@vueuse/core'
import { v4 as uuidv4 } from 'uuid'
import { cloneDeep, differenceBy, omit } from 'lodash-es'
import {
    ElCard,
    ElButton,
    ElScrollbar,
    ElSelect,
    ElOption,
    ElTooltip,
    ElDialog,
    ElCheckbox,
    ElDivider,
    type CheckboxValueType
} from 'element-plus'
import {
    ActionTypes,
    useGoogleSheetsService,
    type ActionType
} from '@/services/googleSheetsService'
import { t } from '@/lib/i18n'
import { round } from '@/lib/round'
import { showSuccess, showError, useDateFormatter, useNumberFormatter } from '@/lib'
import CountrySelect from '@/components/CountrySelect.vue'
import CustomInput from '@/components/CustomInput.vue'
import PlusIcon from '@/assets/icons/plus.svg?component'
import MinusIcon from '@/assets/icons/minus.svg?component'
import EditIcon from '@/assets/icons/edit.svg?component'
import SaveIcon from '@/assets/icons/save.svg?component'
import CancelIcon from '@/assets/icons/cancel.svg?component'

const service = useGoogleSheetsService()
const dateFormatter = useDateFormatter()
const numberFormatter = useNumberFormatter({ maximumFractionDigits: 4 })

const time = ref('')
const sum = ref('')
const reason = ref('')
const isAwaiting = ref(false)

const onSave = async (action: ActionType) => {
    try {
        isAwaiting.value = true
        await service.saveData({
            action,
            payload: { time: time.value, sum: sum.value }
        })
        time.value = sum.value = reason.value = ''
        showSuccess('Сохранено')
    } finally {
        isAwaiting.value = false
    }
}
</script>

<template>
    <div class="main-wrp">
        <div class="tabs-wrp">
            <el-button type="primary" size="large" :disabled="isAwaiting">
                Первичный заказ
            </el-button>
            <el-button
                type="primary"
                size="large"
                class="secondary-order-btn"
                :disabled="isAwaiting"
            >
                Вторичный заказ
            </el-button>
            <el-button type="danger" size="large" :disabled="isAwaiting"> Отказы </el-button>
            <el-button type="info" size="large" :disabled="isAwaiting"> Возвраты </el-button>
        </div>
        <div class="inputs-wrp">
            <custom-input v-model="time" label="Время" required />
            <custom-input v-model="sum" type="number" label="Сумма" required />
        </div>
        <el-button
            type="success"
            class="save-btn"
            size="large"
            :disabled="isAwaiting"
            :loading="isAwaiting"
            @click="onSave(ActionTypes.Rejection)"
        >
            Сохранить
        </el-button>
        <!-- <el-dialog v-model="showDeleteModal" class="delete-modal">
            <template #default>
                <div class="modal-title">
                    Вы уверены, что хотите удалить {{ t(rateToDelete?.fromBank ?? '') }}
                    <span class="delete-modal-tobank-value">
                        ({{ t(rateToDelete?.toBank ?? '') }} ) ?
                    </span>
                </div>
            </template>
            <template #footer>
                <div class="delete-modal-buttons">
                    <el-button size="large" :disabled="isLoading" @click="showDeleteModal = false">
                        Отмена
                    </el-button>
                    <el-button
                        type="danger"
                        size="large"
                        :disabled="isLoading"
                        @click="onConfirmDelete"
                    >
                        Подтвердить
                    </el-button>
                </div>
            </template>
        </el-dialog> -->
    </div>
</template>

<style lang="scss">
.main-wrp {
    width: 100%;
    max-width: 900px;
    margin: auto;

    .tabs-wrp {
        display: flex;
        justify-content: center;
        margin-bottom: 20px;
    }

    .inputs-wrp {
        display: flex;
        justify-content: center;
        gap: 8px;
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

    .save-btn {
        margin: auto;
    }

    // .copy-rate-btn {
    //     color: #028102;
    //     transition: all 0.15s ease;
    //     @media (hover) {
    //         &:hover {
    //             color: #026f02;
    //         }
    //     }
    // }

    // .delete-rate-btn {
    //     color: #d92800;
    //     transition: all 0.15s ease;
    //     @media (hover) {
    //         &:hover {
    //             color: #b92302;
    //         }
    //     }
    // }

    // //Modal styles
    // .el-dialog {
    //     max-width: 780px !important;
    // }

    // .delete-modal {
    //     .el-button {
    //         margin: 0;
    //     }
    // }

    // .modal-title {
    //     margin-top: 18px;
    //     margin-bottom: 30px;
    //     text-align: center;
    //     font-size: 24px;
    //     font-weight: 500;
    // }

    // .save-icon {
    //     color: rgb(1, 159, 1);
    // }

    // .cancel-icon {
    //     color: rgb(225, 60, 60);
    // }
}

@media (max-width: 991px) {
    .main-wrp {
    }
}
</style>
