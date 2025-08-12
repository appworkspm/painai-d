export declare const logActivity: ({ userId, type, message, severity, }: {
    userId?: string;
    type: string;
    message: string;
    severity?: string;
}) => Promise<{
    id: string;
    createdAt: Date;
    userId: string | null;
    type: string;
    message: string;
    severity: string;
}>;
//# sourceMappingURL=activityLogService.d.ts.map