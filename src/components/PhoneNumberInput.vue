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
const emit = defineEmits(['update:modelValue', 'blur', 'keydown'])

const valueProxy = computed({
    get: () => props.modelValue,
    set: (v) => emit('update:modelValue', v)
})

const formatPhoneNumber = (v: string) => {
    if (!v) return ''
    let phone = ''
    for (let i = 0; i < v.length; i++) {
        if (i === 2) phone += ' '
        if (i === 5) phone += ' '
        if (i === 7) phone += ' '
        phone += v[i]
    }
    return phone
}
</script>

<template>
    <custom-input
        v-model="valueProxy"
        type="text"
        :label="label"
        :placeholder="placeholder"
        :size="size"
        :disabled="disabled"
        :required="required"
        :has-error="hasError"
        :max-length="12"
        :formatter="formatPhoneNumber"
        :parser="(v) => v.replace(/\D/g, '')"
        @keydown="(e) => emit('keydown', e)"
        @blur="emit('blur')"
    >
        <template #prepend>+375</template>
        <template #error>
            <slot name="error" />
        </template>
    </custom-input>
</template>

<style lang="scss"></style>
