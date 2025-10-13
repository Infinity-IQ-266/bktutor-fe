function setItem<T>(key: string, value: T) {
    localStorage.setItem(key, JSON.stringify(value));
}

function getItem<T>(key: string): T | null {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
}

function removeItem(key: string) {
    localStorage.removeItem(key);
}

export const storage = {
    setItem,
    getItem,
    removeItem,
};
