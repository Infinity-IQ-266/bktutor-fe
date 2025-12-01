export default {
    '*.{ts,tsx}': (filenames) =>
        filenames
            .filter((file) => !file.includes('draft/'))
            .flatMap((filename) => [
                `eslint --fix ${filename}`,
                `prettier --write ${filename}`,
            ]),
    '**/*.ts?(x)': (filenames) => {
        const filteredFiles = filenames.filter((file) => !file.includes('draft/'));
        return filteredFiles.length > 0 ? 'tsc --noEmit' : [];
    },
};
