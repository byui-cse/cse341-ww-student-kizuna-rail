import { getAllTrips, getListOfRegions, getListOfSeasons } from '../models/model.js';

export default async (req, res) => {
    const regions = await getListOfRegions();
    const trips = await getAllTrips();
    const seasons = await getListOfSeasons();

    res.render('trips/list', {
        title: 'Scenic Train Trips',
        regions,
        trips,
        seasons
    });
};