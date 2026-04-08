export const apiCache = new Map<string, { data: any; timestamp: number }>();

export const getCachedData = (key: string) => {
    const cached = apiCache.get(key);
    // Cache is valid for 5 minutes
    if (cached && Date.now() - cached.timestamp < 5 * 60 * 1000) {
        return cached.data;
    }
    return null;
};

export const setCachedData = (key: string, data: any) => {
    apiCache.set(key, { data, timestamp: Date.now() });
};

export const clearCache = () => apiCache.clear();
