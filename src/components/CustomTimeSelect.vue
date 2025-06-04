<script lang="ts" setup>
import { computed } from 'vue'
import { ElTimeSelect } from 'element-plus'

const props = withDefaults(
    defineProps<{
        modelValue?: string
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

const valueProxy = computed({
    get: () => props.modelValue,
    set: (v) => emit('update:modelValue', v)
})
</script>

<template>
    <div class="custom-time-picker-wrp" :class="{ invalid: hasError }">
        <span v-if="label">
            {{ label }} <span v-if="required" class="required-symbol">*</span>
        </span>
        <el-time-select
            v-model="valueProxy"
            :placeholder="placeholder"
            :disabled="disabled"
            :clearable="clearable"
            :size="size"
            start="08:00"
            step="00:01"
            end="21:00"
            :class="{ invalid: hasError }"
        >
            <template #suffix>
                <slot name="suffix" />
            </template>
        </el-time-select>
    </div>
</template>

<style lang="scss">
.custom-time-picker-wrp {
    .required-symbol {
        color: #f56c6c;
    }
    .invalid {
        .el-select__wrapper {
            box-shadow: 0 0 0 1px #f56c6c inset;
        }
    }
}
</style>
