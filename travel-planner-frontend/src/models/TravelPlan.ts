export interface TravelPlan{
    id: number;
    userId: number;
    title: string;
    description?: string;
    startDate: string;
    endDate: string;
    budget: number;
    notes?: string;
    createdAt: string;
}

export interface CreateTravelPlanDto{
    title: string;
    description?: string;
    startDate: string;
    endDate: string;
    budget: number;
    notes?: string;
}