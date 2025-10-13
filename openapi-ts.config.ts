import { defineConfig } from '@hey-api/openapi-ts';

export default defineConfig({
    input: 'src/services/api/api-docs.yaml',
    output: 'src/services/client/',
    plugins: ['@tanstack/react-query'],
});
