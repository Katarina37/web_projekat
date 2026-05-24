export interface Activity{
    id: number;
    travelPlanId: number;
    name: string;
    activityDate: string;
    activityTime?: string;
    location?: string;
    description?: string;
    estimatedCost: number;
    status: string;
}

export interface CreateActivityDto{
    name: string;
    activityDate: string;
    activityTime?: string;
    location?: string;
    description?: string;
    estimatedCost: number;
    status: string;
}