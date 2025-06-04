<script setup lang="ts">
import { RouterView } from 'vue-router'
import { ElConfigProvider } from 'element-plus'
import ruLocale from 'element-plus/es/locale/lang/ru'
import MainLayout from '@/layout/MainLayout.vue'
</script>

<template>
    <el-config-provider :locale="ruLocale">
        <main-layout>
            <router-view />
        </main-layout>
    </el-config-provider>
</template>

<style></style>
