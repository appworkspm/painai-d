declare const getHolidaysKey = "holidays_all";
declare const getActivitiesKey: (userId: string) => string;
export declare const getOrSet: <T>(key: string, fetchData: () => Promise<T>) => Promise<T>;
export declare const invalidateCache: (key: string) => void;
export declare const clearAllCache: () => void;
export { getHolidaysKey, getActivitiesKey };
//# sourceMappingURL=cacheService.d.ts.map