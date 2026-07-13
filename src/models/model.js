import { generateConfirmationCode } from '../includes/helpers.js';
import { getDb as db } from './db-in-file.js';

// TRIP MODEL FUNCTIONS

export const getAllTrips = async () => {
    return db().routes;
};

export const getListOfRegions = async () => {
    const regions = new Set(db().routes.map(route => route.region));
    return Array.from(regions);
};

export const getListOfSeasons = async () => {
    const seasons = new Set(db().routes.map(route => route.bestSeason));
    return Array.from(seasons);
};

export const getTripById = async (tripId) => {
    return db().routes.find(route => route.id == tripId) || null;
};

export const getTripsByRegion = async (region) => {
    return db().routes.filter(route => route.region.toLowerCase() == region.toLowerCase());
};

export const getTripsBySeason = async (season) => {
    return db().routes.filter(route => route.bestSeason.toLowerCase() == season.toLowerCase());
};

export const getTripsByMonth = async (month) => {
    return db().routes.filter(route => route.operatingMonths.includes(month));
};

export const getTripsByDuration = async () => {
    return [...db().routes].sort((a, b) => {
        const aDuration = parseFloat(a.duration);
        const bDuration = parseFloat(b.duration);
        return aDuration - bDuration;
    });
};

export const getTripsByDistance = async () => {
    return [...db().routes].sort((a, b) => a.distance - b.distance);
};

// STATION MODEL FUNCTIONS

export const getAllStations = async () => {
    return db().stations;
};

export const getStationById = async (stationId) => {
    return db().stations.find(station => station.id === stationId) || null;
};

export const getStationsByRegion = async (region) => {
    return db().stations.filter(station => station.region.toLowerCase() == region.toLowerCase());
};

export const getStationsByPrefecture = async (prefecture) => {
    return db().stations.filter(station => station.prefecture.toLowerCase() == prefecture.toLowerCase());
};

export const getStationsByFacility = async (facility) => {
    return db().stations.filter(station => station.facilities.includes(facility));
};

// SCHEDULE MODEL FUNCTIONS

export const getAllSchedules = async () => {
    return db().schedules;
};

export const getScheduleById = async (scheduleId) => {
    return db().schedules.find(schedule => schedule.id == scheduleId) || null;
};

export const getSchedulesByTrip = async (tripId) => {
    return db().schedules.filter(schedule => schedule.routeId == tripId);
};

export const getAvailableSchedulesByTrip = async (tripId) => {
    return db().schedules.filter(schedule => schedule.routeId == tripId && schedule.status == true);
};

export const getSchedulesByDay = async (day) => {
    return db().schedules.filter(schedule => schedule.daysOfWeek.includes(day.toLowerCase()));
};

export const getSchedulesByDepartureTime = async () => {
    return [...db().schedules].sort((a, b) => {
        return a.departureTime.localeCompare(b.departureTime);
    });
};

// TICKET CLASS MODEL FUNCTIONS

export const getAllTicketClasses = async () => {
    return db().ticketClasses;
};

export const getTicketClassByName = async (className) => {
    return db().ticketClasses.find(tc => tc.class.toLowerCase() == className.toLowerCase()) || null;
};

export const getTicketClassesByPrice = async () => {
    return [...db().ticketClasses].sort((a, b) => a.pricePerKm - b.pricePerKm);
};

// COMBINED/UTILITY MODEL FUNCTIONS

export const getTripWithStations = async (tripId) => {
    const trip = await getTripById(tripId);
    if (!trip) return null;

    const startStation = await getStationById(trip.startStation);
    const endStation = await getStationById(trip.endStation);

    return {
        ...trip,
        startStationDetails: startStation,
        endStationDetails: endStation
    };
};

export const getTripWithSchedules = async (tripId) => {
    const trip = await getTripById(tripId);
    if (!trip) return null;

    const tripSchedules = await getSchedulesByTrip(tripId);

    return {
        ...trip,
        schedules: tripSchedules
    };
};

export const getCompleteTripDetails = async (tripId) => {
    const trip = await getTripById(tripId);
    if (!trip) return null;

    const startStation = await getStationById(trip.startStation);
    const endStation = await getStationById(trip.endStation);
    const tripSchedules = await getSchedulesByTrip(tripId);

    return {
        ...trip,
        startStationDetails: startStation,
        endStationDetails: endStation,
        schedules: tripSchedules
    };
};

export const calculateTicketPrice = async (tripId, className) => {
    const trip = await getTripById(tripId);
    const ticketClass = await getTicketClassByName(className);

    if (!trip || !ticketClass) return null;

    return trip.distance * ticketClass.pricePerKm;
};

export const getTicketOptionsForTrip = async (tripId) => {
    const trip = await getTripById(tripId);
    if (!trip) return null;

    return db().ticketClasses.map(tc => ({
        class: tc.class,
        name: tc.name,
        price: trip.distance * tc.pricePerKm,
        amenities: tc.amenities,
        description: tc.description
    }));
};

export const getTicketOptionsForSchedule = async (scheduleId) => {
    const schedule = await getScheduleById(scheduleId);
    if (!schedule) return null;

    return getTicketOptionsForTrip(schedule.routeId);
};

export const isTripOperating = async (tripId) => {
    const trip = await getTripById(tripId);
    if (!trip) return false;

    const currentMonth = new Date().getMonth() + 1;
    return trip.operatingMonths.includes(currentMonth);
};

export const getScheduleWithTrip = async (scheduleId) => {
    const schedule = await getScheduleById(scheduleId);
    if (!schedule) return null;

    const trip = await getTripById(schedule.routeId);

    return {
        ...schedule,
        tripDetails: trip
    };
};

export const searchTrips = async (keyword) => {
    const searchTerm = keyword.toLowerCase();
    return db().routes.filter(route => {
        return (
            route.name.toLowerCase().includes(searchTerm) ||
            route.description.toLowerCase().includes(searchTerm) ||
            route.highlights.some(highlight => highlight.toLowerCase().includes(searchTerm))
        );
    });
};

// CONFIRMATION MODEL FUNCTIONS

export const createConfirmation = async (confirmationData) => {
    const dbObj = db();
    const newConfirmation = {
        id: generateConfirmationCode(),
        createdAt: new Date().toISOString(),
        ...confirmationData
    };
    
    // Auto-saves via Proxy
    dbObj.confirmations = [...dbObj.confirmations, newConfirmation];
    
    return newConfirmation.id;
};

export const getConfirmationById = async (confirmationId) => {
    return db().confirmations.find(conf => conf.id === confirmationId) || null;
};

export const getAllConfirmations = async () => {
    return db().confirmations;
};