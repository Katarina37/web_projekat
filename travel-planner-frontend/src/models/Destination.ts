export interface Destination{
    id: number;
    travelPlanId: number;
    name: string;
    location?: string;
    arrivalDate: string;
    departureDate: string;
    description?: string;
}

export interface CreateDestinationDto{
    name: string;
    location?: string;
    arrivalDate: string;
    departureDate: string;
    description?: string;
}