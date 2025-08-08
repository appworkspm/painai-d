import { Request, Response } from 'express';
export declare const getMyTimesheets: (req: Request, res: Response) => Promise<void>;
export declare const getPendingTimesheets: (req: Request, res: Response) => Promise<void>;
export declare const getAllTimesheets: (req: Request, res: Response) => Promise<void>;
export declare const createTimesheet: (req: Request, res: Response) => Promise<void>;
export declare const updateTimesheet: (req: Request, res: Response) => Promise<void>;
export declare const deleteTimesheet: (req: Request, res: Response) => Promise<void>;
export declare const submitTimesheet: (req: Request, res: Response) => Promise<void>;
export declare const approveTimesheet: (req: Request, res: Response) => Promise<void>;
export declare const rejectTimesheet: (req: Request, res: Response) => Promise<void>;
export declare const getTimesheetHistory: (req: Request, res: Response) => Promise<void>;
export declare const getUserTimesheetHistory: (req: Request, res: Response) => Promise<void>;
//# sourceMappingURL=timesheetController.d.ts.map