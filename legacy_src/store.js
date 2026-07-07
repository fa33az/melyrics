import { Redis } from '@upstash/redis';

let redis = null;
try {
    const url = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
    const token = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;
    if (url && token) {
        redis = new Redis({
            url: url,
            token: token,
        });
    }
} catch (e) {
    console.warn("KV Redis not configured properly. Falling back to memory store.");
}

// Fallback memory store
const memStore = {
    accessToken: null,
    refreshToken: null
};

export const getTokens = async () => {
    if (redis) {
        try {
            const data = await redis.get('spotify_tokens');
            return data || { accessToken: null, refreshToken: null };
        } catch (e) {
            console.error("Failed to read from KV", e);
            return memStore;
        }
    }
    return memStore;
};

export const saveTokens = async (accessToken, refreshToken) => {
    if (redis) {
        try {
            await redis.set('spotify_tokens', { accessToken, refreshToken });
        } catch (e) {
            console.error("Failed to write to KV", e);
        }
    }
    memStore.accessToken = accessToken;
    memStore.refreshToken = refreshToken;
};

export const clearTokens = async () => {
    if (redis) {
        await redis.del('spotify_tokens');
    }
    memStore.accessToken = null;
    memStore.refreshToken = null;
};
