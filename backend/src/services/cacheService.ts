import NodeCache from 'node-cache';

// Create a new cache instance with a 5-minute TTL
const cache = new NodeCache({ stdTTL: 300, checkperiod: 600 });

// Generate a cache key for the holidays endpoint
const getHolidaysKey = 'holidays_all';

// Generate a cache key for the activities endpoint
const getActivitiesKey = (userId: string) => `activities_${userId}`;

// Get data from cache or set it if not exists
export const getOrSet = async <T>(
  key: string,
  fetchData: () => Promise<T>
): Promise<T> => {
  const cachedData = cache.get<T>(key);
  if (cachedData) {
    console.log(`Cache hit for key: ${key}`);
    return cachedData;
  }

  console.log(`Cache miss for key: ${key}`);
  const data = await fetchData();
  cache.set(key, data);
  return data;
};

// Invalidate cache for a specific key
export const invalidateCache = (key: string) => {
  cache.del(key);
  console.log(`Cache invalidated for key: ${key}`);
};

// Invalidate all cache
export const clearAllCache = () => {
  cache.flushAll();
  console.log('All cache cleared');
};

export { getHolidaysKey, getActivitiesKey };
