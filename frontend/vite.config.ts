import {defineConfig, loadEnv} from 'vite'
import react from '@vitejs/plugin-react'
import {resolve} from 'path';
import {readFileSync, writeFileSync} from 'fs';

export default defineConfig({
    plugins: [
        react(),
        {
            name: 'add_runtime_environment_template',
            apply: 'build',
            closeBundle() {
                const scriptName = 'runtime-env.js';
                const indexPath = resolve(__dirname, 'dist/index.html');

                //create runtime-env.js template
                const runtimeEnvFilePath = resolve(__dirname, 'dist', 'assets', scriptName);
                writeFileSync(runtimeEnvFilePath, "window._env_ = { /** Your environment variables will be added here during docker-compose up **/ }");

                // Update index.html
                let indexHtml = readFileSync(indexPath, 'utf-8');
                indexHtml = indexHtml.replace(
                    '</body>',
                    `<script src="/assets/${scriptName}"></script></body>`
                );
                writeFileSync(indexPath, indexHtml);
            },
        }
    ],
    server: {
        port: 80,
    },
    //@ts-ignore
    test: {
        include: ['tests/**/*.test.{js,ts,jsx,tsx}'],
        globals: true,
        environment: 'jsdom',
        env: loadEnv('test', process.cwd(), ''),
        setupFiles: './tests/setupTest.tsx',
    },
})
