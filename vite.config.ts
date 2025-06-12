import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import ElementPlus from 'unplugin-element-plus/vite'
import svgLoader from 'vite-svg-loader'

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [
        vue(),
        ElementPlus({}),
        svgLoader({
            /* https://github.com/svg/svgo/issues/1128 */
            svgoConfig: {
                plugins: [
                    {
                        name: 'preset-default',
                        params: {
                            overrides: {
                                removeViewBox: false
                            }
                        }
                    }
                ]
            }
        }),
        vueDevTools()
    ],
    resolve: {
        alias: {
            '@': fileURLToPath(new URL('./src', import.meta.url))
        }
    },
    css: {
        preprocessorOptions: {
            scss: {
                api: 'modern-compiler'
            }
        }
    },
    server: {
        proxy: {
            '/google-script': {
                target: 'https://script.google.com',
                changeOrigin: true,
                rewrite: (path) =>
                    path.replace(
                        /^\/google-script/,
                        '/macros/s/AKfycbwCluZ9VfnsrMs0sswC0HyNxPnhzlEirOAiJyEYKD174gXV0PTjGK06rKiHq10RlcWjfQ/exec'
                    ),
                configure: (proxy) => {
                    proxy.on('proxyRes', (proxyRes) => {
                        proxyRes.headers['Access-Control-Allow-Origin'] = '*'
                        proxyRes.headers['Access-Control-Allow-Methods'] =
                            'GET, POST, PUT, DELETE, OPTIONS'
                        proxyRes.headers['Access-Control-Allow-Headers'] = 'Content-Type'
                    })
                }
            }
        }
    }
})
