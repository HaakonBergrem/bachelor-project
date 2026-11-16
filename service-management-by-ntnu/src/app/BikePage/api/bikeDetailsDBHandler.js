import { supabase } from '@/app/utils/supabaseBikedetails'

/**
 * Updates the booking details with distance travelled.
 * This function attempts to update the distance travelled in 'booking' table based on the asset number.
 * @param {Object} bookingDetails - Object of booking details
 * @param {string} assetNr - Asset number used to id the booking to be updated.
 * @returns {Promise<boolean>} Returns true if the update was successful, false otherwise.
 * **/
export async function updateBookingDetails(bookingDetails, assetNr){
    try{
        const {data, error} = await supabase
            .from('booking')
            .update({
                distance_travelled: bookingDetails.distance_travelled,
            })
            .eq('asset_nr', bookingDetails.asset_nr);
        if(error){
            console.error("Error updating booking details. ");
            return false;
        } else {
            console.log("Booking details updated successfully.");
            return true;
        }
    }catch(error){
        console.error("Not able to update the booking details.");
        return false;
    }
}

/**
 * Fetches data to a specific booking by param booking_id from 'booking' table.
 * Returns all the data to the booking as object or null if no booking has this id.
 * @param {number} booking_id - Unique id that identifies a booking.
 * @returns {Promise<Object|null>} a single booking object if successful or null if not found or error.
 * **/
export async function fetchBookingByBookingId(booking_id){
    try{
        const {data, error} = await supabase
            .from('booking')
            .select('*' )
            .eq('booking_id', booking_id)
            .single();

        if(error){
            console.log("Error fetching booking details by booking id.")
            return null;
        }
        return data;
    }catch(error){
        return null;
    }
}

/**
 * Fetches asset data with a given booking_id from the 'booking' table.
 * This function query for the booking_id and asset_nr related to that booking.
 * @param {number} booking_id - Unique id for the booking
 * @returns {Promise<Object|null>} - Asset data related to the booking if found, null if there is an error or no data found.
 **/
export async function fetchAssetByBookingId(booking_id){
    try{
        const {data, error} = await supabase
            .from('booking')
            .select('booking_id, asset_nr' )
            .eq('booking_id', booking_id)


        if(error){
            console.log("Error fetching asset by booking id.")
            return null;
        }
        return data;
    }catch(error){
        return null;
    }
}

/**
 * Fetches services for a specific asset number from 'booking' table.
 * The function query for details of all important service data related to the asset.
 * @param {string} assetNr - The assetNr used to get services.
 * @returns {Promise<Object|null>} - Returns an array of services related to the assetNr, returns an empty array if no services are found or if error occurs.
 **/
export async function fetchServicesByAsset(assetNr) {
    try {
        const { data, error } = await supabase
            .from('booking')
            .select('asset_nr, booking_id, service:booking_id (service_id, service_status, service_sparePartCost, service_cost,service_totalCost, service_name, service_length)')
            .eq('asset_nr', assetNr);

        if (error) {
            console.error("Error fetching services by asset.");
            return [];
        }
        return data;

    } catch (error) {
        console.error("Error in fetchServicesByAsset function.");
        return [];  // Returns [] for the UI, to keep the bikeServices in bikeDetails more consistent.
    }
}
