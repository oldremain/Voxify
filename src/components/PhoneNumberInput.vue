<script lang="ts" setup>
import { computed } from 'vue'
import CustomInput from './CustomInput.vue'

const props = withDefaults(
    defineProps<{
        modelValue?: string
        placeholder?: string
        label?: string
        required?: boolean
        disabled?: boolean
        hasError?: boolean
        size?: 'large' | 'small'
    }>(),
    {
        size: 'large'
    }
)
const emit = defineEmits(['update:modelValue', 'blur'])

const valueProxy = computed({
    get: () => props.modelValue,
    set: (v) => emit('update:modelValue', v)
})
</script>

<template>
    <custom-input
        v-model="valueProxy"
        type="number"
        :label="label"
        :placeholder="placeholder"
        :size="size"
        :disabled="disabled"
        :required="required"
        :has-error="hasError"
        @blur="emit('blur')"
    >
        <template #prepend>+375</template>
        <template #error>
            <slot name="error" />
        </template>
    </custom-input>
</template>

<style lang="scss"></style>
