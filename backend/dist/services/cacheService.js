"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getActivitiesKey = exports.getHolidaysKey = exports.clearAllCache = exports.invalidateCache = exports.getOrSet = void 0;
const node_cache_1 = __importDefault(require("node-cache"));
const cache = new node_cache_1.default({ stdTTL: 300, checkperiod: 600 });
const getHolidaysKey = 'holidays_all';
exports.getHolidaysKey = getHolidaysKey;
const getActivitiesKey = (userId) => `activities_${userId}`;
exports.getActivitiesKey = getActivitiesKey;
const getOrSet = async (key, fetchData) => {
    const cachedData = cache.get(key);
    if (cachedData) {
        console.log(`Cache hit for key: ${key}`);
        return cachedData;
    }
    console.log(`Cache miss for key: ${key}`);
    const data = await fetchData();
    cache.set(key, data);
    return data;
};
exports.getOrSet = getOrSet;
const invalidateCache = (key) => {
    cache.del(key);
    console.log(`Cache invalidated for key: ${key}`);
};
exports.invalidateCache = invalidateCache;
const clearAllCache = () => {
    cache.flushAll();
    console.log('All cache cleared');
};
exports.clearAllCache = clearAllCache;
//# sourceMappingURL=cacheService.js.map