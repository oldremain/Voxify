<script lang="ts" setup>
import { computed } from 'vue'
import { ElOption } from 'element-plus'
import { countries } from '@/lib/countries'
import CustomSelect from './CustomSelect.vue'

const props = defineProps<{
    modelValue?: string
    required?: boolean
    disabled?: boolean
}>()
const emit = defineEmits(['update:modelValue'])

const countryProxy = computed({
    get: () => props.modelValue,
    set: (v) => emit('update:modelValue', v)
})
</script>

<template>
    <custom-select
        v-model="countryProxy"
        label="Страна"
        placeholder="Выберите страну"
        class="country-select-wrp"
        :disabled="disabled"
        filterable
        required
    >
        <template #option>
            <el-option
                v-for="item in countries"
                :key="item.value"
                :label="item.label"
                :value="item.value"
            >
                <div class="counry-select-option">
                    <div class="counry-select-image-wrp">
                        <img
                            :src="`/countries/${item.value.toLowerCase()}.svg`"
                            alt=""
                            class="counry-select-image"
                        />
                    </div>
                    <span class="country-label">{{ item.label }}</span>
                </div>
            </el-option>
        </template>
    </custom-select>
</template>

<style lang="scss">
.counry-select-option {
    display: flex;
    align-items: center;

    .counry-select-image-wrp {
        width: 20px;
        height: 20px;
        border-radius: 50%;
        overflow: hidden;
        margin-right: 8px;
    }
    .counry-select-image {
        width: 100%;
        height: 100%;
        object-fit: cover;
    }
    .country-label {
        font-weight: 600;
    }
}
</style>
