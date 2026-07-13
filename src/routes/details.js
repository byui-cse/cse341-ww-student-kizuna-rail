import { getSchedulesByTrip, getTripById } from '../models/model.js';

export default async (req, res) => {
    const { tripId } = req.params;
    const details = await getTripById(tripId);
    details.schedules = await getSchedulesByTrip(tripId);

    // TODO: getCompleteTripDetails instead

    res.render('trips/details', {
        title: 'Trip Details',
        details
    });
};