<script lang="ts" setup>
import { computed } from 'vue'
import { ElDatePicker } from 'element-plus'

const props = withDefaults(
    defineProps<{
        modelValue?: Date
        placeholder?: string
        label?: string
        required?: boolean
        disabled?: boolean
        hasError?: boolean
        clearable?: boolean
        size?: 'large' | 'small'
    }>(),
    {
        size: 'large'
    }
)
const emit = defineEmits(['update:modelValue'])

const dateProxy = computed({
    get: () => props.modelValue,
    set: (v) => emit('update:modelValue', v)
})
</script>

<template>
    <div class="custom-date-picker-wrp">
        <span v-if="label">
            {{ label }} <span v-if="required" class="required-symbol">*</span>
        </span>
        <el-date-picker
            v-model="dateProxy"
            type="date"
            :placeholder="placeholder"
            :size="size"
            :disabled="disabled"
            :clearable="clearable"
            :class="{ invalid: hasError }"
        />
    </div>
</template>

<style lang="scss">
.custom-date-picker-wrp {
    display: flex;
    flex-direction: column;
    .required-symbol {
        color: #f56c6c;
    }
    .invalid {
        .el-input__wrapper {
            box-shadow: 0 0 0 1px #f56c6c inset;
        }
    }
}
</style>
