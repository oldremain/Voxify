<script lang="ts" setup>
import { computed } from 'vue'
import { ElSelect } from 'element-plus'

const props = withDefaults(
    defineProps<{
        modelValue?: string
        placeholder?: string
        label?: string
        required?: boolean
        disabled?: boolean
        filterable?: boolean
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
        >
            <slot name="option" />
        </el-select>
    </div>
</template>

<style lang="scss">
.custom-select-wrp {
    .required-symbol {
        color: #f56c6c;
    }
}
</style>
