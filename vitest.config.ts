/// <reference types="vitest" />
import { defineConfig } from 'vitest/config';
import path from "path";

export default defineConfig({
    test: {
        globals: true,
        environment: 'happy-dom',
        setupFiles: './src/setupTests.ts',
    },
    resolve: {
        alias: {
            "@": path.resolve(process.cwd(), "src"),
        },
    },
});
