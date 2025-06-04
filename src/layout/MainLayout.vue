<script lang="ts" setup>
import { ElContainer } from 'element-plus'
</script>

<template>
    <main class="main-layout">
        <el-container>
            <slot />
        </el-container>
    </main>
</template>

<style lang="scss">
.main-layout {
    min-height: 100vh;
    padding: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
}
</style>
