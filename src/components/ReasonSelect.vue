<script lang="ts" setup>
import { computed } from 'vue'
import CustomSelect from './CustomSelect.vue'

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
const emit = defineEmits(['update:modelValue'])

const valueProxy = computed({
    get: () => props.modelValue,
    set: (v) => emit('update:modelValue', v)
})

const reasonOptions = [
    { value: 'Необходимость отпала', label: 'Необходимость отпала' },
    { value: 'Нашел дешевле', label: 'Нашел дешевле' },
    { value: 'Привезли не ту деталь', label: 'Привезли не ту деталь' },
    { value: 'Вы плохие', label: 'Вы плохие' }
]
</script>

<template>
    <custom-select
        v-model="valueProxy"
        :options="reasonOptions"
        :label="label"
        :placeholder="placeholder"
        :size="size"
        :disabled="disabled"
        :required="required"
        :has-error="hasError"
    />
</template>

<style lang="scss"></style>
