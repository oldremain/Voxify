<script lang="ts" setup>
import { computed } from 'vue'
import { ElSelect, ElOption } from 'element-plus'

const props = withDefaults(
    defineProps<{
        modelValue?: string
        options?: { value: any; label: string }[]
        placeholder?: string
        label?: string
        required?: boolean
        disabled?: boolean
        filterable?: boolean
        hasError?: boolean
        size?: 'large' | 'small'
    }>(),
    {
        size: 'large'
    }
)
const emit = defineEmits(['update:modelValue'])

const countryProxy = computed({
    get: () => props.modelValue,
    set: (v) => emit('update:modelValue', v)
})
</script>

<template>
    <div class="custom-select-wrp">
        <span v-if="label">{{ label }} <span v-if="required" class="required-symbol">*</span></span>
        <el-select
            v-model="countryProxy"
            :placeholder="placeholder"
            :size="size"
            :filterable="filterable"
            :disabled="disabled"
            :class="{ invalid: hasError }"
        >
            <slot name="option">
                <el-option
                    v-for="v in props.options"
                    :key="v.value"
                    :label="v.label"
                    :value="v.value"
                />
            </slot>
        </el-select>
    </div>
</template>

<style lang="scss">
.custom-select-wrp {
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
