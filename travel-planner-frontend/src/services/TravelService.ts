import axios from "axios";
import type { TravelPlan, CreateTravelPlanDto } from "../models/TravelPlan";
import type { Destination, CreateDestinationDto } from "../models/Destination";
import type { Activity, CreateActivityDto } from "../models/Activity";
import type { ChecklistItem, CreateChecklistItemDto } from "../models/ChecklistItem";

const BASE_URL = import.meta.env.VITE_TRAVEL_SERVICE_URL;

const authHeader = (token: string) => ({
    headers: {Authorization: `Bearer ${token}`},
});

export const travelService = {
    //travel plans
    getAll: async (token: string): Promise<TravelPlan[]> => {
        const response = await axios.get(`${BASE_URL}/api/travel-plans`, authHeader(token));
        return response.data;
    },
    getById: async (id: number, token: string): Promise<TravelPlan> => {
        const response = await axios.get(`${BASE_URL}/api/travel-plans/${id}`, authHeader(token));
        return response.data;
    },
    create: async (dto: CreateTravelPlanDto, token: string): Promise<TravelPlan> => {
        const response = await axios.post(`${BASE_URL}/api/travel-plans`, dto, authHeader(token));
        return response.data;
    },

    update: async (id: number, dto: CreateTravelPlanDto, token: string): Promise<TravelPlan> => {
        const response = await axios.put(`${BASE_URL}/api/travel-plans/${id}`, dto, authHeader(token));
        return response.data;
    },

    delete: async (id: number, token: string): Promise<void> => {
        await axios.delete(`${BASE_URL}/api/travel-plans/${id}`, authHeader(token));
    },

    //destinations
    getDestinations: async (travelPlanId: number, token: string): Promise<Destination[]> => {
        const response = await axios.get(`${BASE_URL}/api/travel-plans/${travelPlanId}/destinations`, authHeader(token));
        return response.data;
    },

    createDestination: async (travelPlanId: number, dto: CreateDestinationDto, token: string): Promise<Destination> => {
        const response = await axios.post(`${BASE_URL}/api/travel-plans/${travelPlanId}/destinations`, dto, authHeader(token));
        return response.data;
    },

    updateDestination: async (id: number, dto: CreateDestinationDto, token: string): Promise<Destination> => {
        const response = await axios.put(`${BASE_URL}/api/travel-plans/destinations/${id}`, dto, authHeader(token));
        return response.data;
    },

    deleteDestination: async (id: number, token: string): Promise<void> => {
        await axios.delete(`${BASE_URL}/api/travel-plans/destinations/${id}`, authHeader(token));
    },

    //activities
    getActivities: async (travelPlanId: number, token: string): Promise<Activity[]> => {
        const response = await axios.get(`${BASE_URL}/api/travel-plans/${travelPlanId}/activities`, authHeader(token));
        return response.data;
    },

    createActivity: async (travelPlanId: number, dto: CreateActivityDto, token: string): Promise<Activity> => {
        const response = await axios.post(`${BASE_URL}/api/travel-plans/${travelPlanId}/activities`, dto, authHeader(token));
        return response.data;
    },

    updateActivity: async (id: number, dto: CreateActivityDto, token: string): Promise<Activity> => {
        const response = await axios.put(`${BASE_URL}/api/travel-plans/activities/${id}`, dto, authHeader(token));
        return response.data;
    },

    deleteActivity: async (id: number, token: string): Promise<void> => {
        await axios.delete(`${BASE_URL}/api/travel-plans/activities/${id}`, authHeader(token));
    },

    //checklist
    getChecklistItems: async (travelPlanId: number, token: string): Promise<ChecklistItem[]> => {
        const response = await axios.get(`${BASE_URL}/api/travel-plans/${travelPlanId}/checklist`, authHeader(token));
        return response.data;
    },

    createChecklistItem: async (travelPlanId: number, dto: CreateChecklistItemDto, token: string): Promise<ChecklistItem> => {
        const response = await axios.post(`${BASE_URL}/api/travel-plans/${travelPlanId}/checklist`, dto, authHeader(token));
        return response.data;
    },

    toggleChecklistItem: async (id: number, token: string): Promise<ChecklistItem> => {
        const response = await axios.patch(`${BASE_URL}/api/travel-plans/checklist/${id}/toggle`, {}, authHeader(token));
        return response.data;
    },

    deleteChecklistItem: async (id: number, token: string): Promise<void> => {
        await axios.delete(`${BASE_URL}/api/travel-plans/checklist/${id}`, authHeader(token));
    },

    //sharing
    createSharedPlan: async (travelPlanId: number, accessType: string, token: string) => {
        const response = await axios.post(`${BASE_URL}/api/travel-plans/${travelPlanId}/share`, { accessType }, authHeader(token));
        return response.data;
    },

    getByToken: async (token: string): Promise<TravelPlan> => {
        const response = await axios.get(`${BASE_URL}/api/travel-plans/shared/${token}`);
        return response.data;
    },
};