<script lang="ts" setup>
import { computed } from 'vue'
import { ElInput } from 'element-plus'

const props = withDefaults(
    defineProps<{
        modelValue?: string | number
        placeholder?: string
        label?: string
        required?: boolean
        disabled?: boolean
        hasError?: boolean
        size?: 'large' | 'small'
        type?: 'text' | 'number' | 'textarea' | 'password'
        clearable?: boolean
        step?: number
        resize?: 'none' | 'both' | 'horizontal' | 'vertical'
        maxLength?: string | number
        formatter?: (value: string) => string
        parser?: (value: string) => string
    }>(),
    {
        size: 'large',
        type: 'text'
    }
)
const emit = defineEmits(['update:modelValue', 'blur', 'keydown'])

const valueProxy = computed({
    get: () => props.modelValue,
    set: (v) =>
        emit('update:modelValue', props.type === 'text' && typeof v === 'string' ? v?.trim() : v)
})
</script>

<template>
    <div class="custom-input-wrp" :class="{ invalid: hasError }">
        <span v-if="label">
            {{ label }} <span v-if="required" class="required-symbol">*</span>
        </span>
        <div class="input-wrp">
            <el-input
                v-model="valueProxy"
                :type="type"
                :placeholder="placeholder"
                :size="size"
                :disabled="disabled"
                :clearable="clearable"
                :step="step"
                :resize="resize"
                :parser="parser"
                :formatter="formatter"
                :maxlength="maxLength"
                @blur="emit('blur')"
                @keydown="(e) => emit('keydown', e)"
            >
                <template v-if="$slots['prepend']" #prepend>
                    <slot name="prepend" />
                </template>
                <template #prefix>
                    <slot name="prefix" />
                </template>
                <template #suffix>
                    <slot name="suffix" />
                </template>
            </el-input>
            <div v-if="hasError" class="error-msg">
                <slot name="error" />
            </div>
        </div>
    </div>
</template>

<style lang="scss">
.custom-input-wrp {
    .required-symbol {
        color: #f56c6c;
    }
    &.invalid {
        .el-input__wrapper {
            box-shadow: 0 0 0 1px #f56c6c inset;
        }
    }
    .input-wrp {
        display: flex;
        flex-direction: column;
        column-gap: 8px;
    }
    .error-msg {
        color: #f56c6c;
        font-size: 12px;
    }
}
</style>
