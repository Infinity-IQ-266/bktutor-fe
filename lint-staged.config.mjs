export default {
    '*.{ts,tsx}': ['eslint --fix', 'prettier --write'],
    '**/*.ts?(x)': () => 'tsc --noEmit',
};
