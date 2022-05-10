import fetch from 'unfetch';
import insertMobileMenu from './insertMobileMenu';
import insertTabs from './insertTabs';
import insertTimeSlots from './insertTimeSlots';
import selectTabs from "./selectMobileTabs";
import { setUrlDate, setUrl } from '../app';

const timeSlotsFunc = (data) => {

    // Get object keys for venue names
    const keys = Object.keys(data);

    // Insert tabs in to calendar container
    const tabsWrapper = `<article id="tabs" class="tabs"></article>`;

    const getCalendarContainer = document.getElementById('calendar');

    getCalendarContainer.innerHTML += tabsWrapper;

    const getTabsContainer = document.getElementById('tabs');
    getTabsContainer.innerHTML = insertTabs(keys);

    const tabone = document.getElementById('tab0');
    tabone.setAttribute('checked', 'checked');

    // Insert Mobile Menu
    const mobileMenu = insertMobileMenu(keys);

    getTabsContainer.innerHTML = mobileMenu + getTabsContainer.innerHTML;

    // Individual venue data
    let dataArr = [];
    Object.values(data).forEach((item) => {
        dataArr.push(item);
    });

    // Check availability status
    const checkAvailability = (keys) => {
        const result = Object.entries(keys).reduce((acc, element) => {
            // Destrcuture key, values here
            const [key, status] = element;
            // Run a map to fetch the status and then assign it to the key
            acc[key] = status.map((item) => item.Status);
            return acc;
        }, {});

        return result;
    }

    // Create a array of availabilty status
    const availability = Object.values(dataArr).map((item) => {
        return checkAvailability(item);
    }, []);

    // Loop over tab elements in DOM and insert available time slots 
    const tabsArr = document.querySelectorAll('.tabs__tab > .tab__inner > .tabs__slots-container');

    for (let i = 0; i < tabsArr.length; i++) {
        for (let i = 0; i < availability.length; i++) {
            tabsArr[i].innerHTML = insertTimeSlots(availability[i]);
        }
    }

    // Set an ID for the checkboxes
    const slotsCheckBoxes = document.querySelectorAll('.slots__checkbox');
    slotsCheckBoxes.forEach((el, index) => {
        el.setAttribute('id', `slot${index}`);
    });

    // Set corresponding for ID to checkboxes labels
    const slotsLabels = document.querySelectorAll('.slots__label');
    slotsLabels.forEach((el, index) => {
        el.setAttribute('for', `slot${index}`);
    });

    // Show message if there are no slots available
    if (slotsCheckBoxes.length < 1) {
        const tabsContentMsg = document.querySelector('.tabs__tab p');
        tabsContentMsg.innerHTML = `There are no more appointments available for today. Please try again tomorrow.`;
    }

    // Only allow one slot to be checked/booked at the same time
    // Loop over all slots adding an eventListener to each
    const slots = document.querySelectorAll('.slots__checkbox');
    for (let i = 0; i < slots.length; i++)
        slots[i].addEventListener('change', (e) => {
            if (slots[i].checked) {
                // If checkbox is checked run limiter function
                checkboxLimiter();
            } else {
                // If checkbox is not checked run enable function
                enable();
            }
        });

    const checkboxLimiter = () => {
        let markedBoxCount = document.querySelectorAll('.slots__checkbox:checked').length;
        // If one checkbox is checked run disable function
        if (markedBoxCount == 1) {
            disable();
        }
    }

    const disable = () => {
        let unmarkedBoxCount = document.querySelectorAll('.slots__checkbox:not(:checked)');
        // Get all unchecked checkboxes and disable
        for (let i = 0; i < unmarkedBoxCount.length; i++)
            unmarkedBoxCount[i].disabled = true;
    }

    const enable = () => {
        let unmarkedBoxCount = document.querySelectorAll('.slots__checkbox:not(:checked)');
        // Get all unchecked checkboxes and enable again
        for (let i = 0; i < unmarkedBoxCount.length; i++)
            unmarkedBoxCount[i].disabled = false;
    }

    // Get select element for mobile navigation
    const select = document.getElementById('location');

    // Event listener for selecting tabs event for mobile
    select.addEventListener('change', (e) => {
        selectTabs(e);
    });

    // Create status objects from data array
    const getSlotData = (keys) => {
        const result = Object.entries(keys).reduce((acc, element) => {
            // Destrcuture key, values here
            const [key, slot] = element;
            // Run a map to fetch the status and then assign it to the key
            // If bookingID exists then return it too
            acc[key] = slot.map((item) => {
                return item.bookingID ? [item.Status, item.Span_id, item.Venue, item.Pitch_num, item.Sport, item.Year, item.Week, item.Day, item.Slot, item.Li_text, item.bookingID] : [item.Status, item.Span_id, item.Venue, item.Pitch_num, item.Sport, item.Year, item.Week, item.Day, item.Slot, item.Li_text]
            });
            return acc;
        }, []);
        return result;
    };

    // Create a booking data array
    const bookingDataArr = dataArr.map((item) => {
        return getSlotData(item);
    }, []);

    // Condense status data
    const allSlotData = [];
    for (const slot of bookingDataArr) {
        for (const time in slot) {
            allSlotData.push(slot[time]);
        }
    }

    // Flatten the new arrays to just one large array
    const flattenArrData = allSlotData.reduce((acc, item) => {
        return acc.concat(item);
    }, []);

    // Select all checkboxes/time slots
    const timeSlots = document.querySelectorAll('.slots__checkbox');
    let selectedSlot = [];

    // Find iframe
    const iframe = document.getElementById('bookingsiframe');

    // Provisional Booking element
    const provisionalBookingInfo = document.getElementById('provisionalbookings');

    // Use Array.forEach to add an event listener to each checkbox
    timeSlots.forEach((checkbox) => {
        checkbox.addEventListener('change', () => {
            selectedSlot =
                Array.from(timeSlots) // Convert checkboxes to an array to use filter and map
                    .filter(i => i.checked) // Use Array.filter to remove unchecked checkboxes
                    .map(i => [i.name, i.parentNode.parentNode.getAttribute('data-venue')]) // Use Array.map to extract only the checkbox attributes from the array of objects
                    .reduce((acc, item) => {
                        return acc.concat(item);
                    }, []); // Flatten the array

            // Check if array is empty, then destructure if not
            if (selectedSlot.length >= 1) {
                const [time, venue] = selectedSlot; // Destructure the array 

                // Check data array against checked checkbox slot
                const filteredTimeSlots = flattenArrData.filter((slot) => {
                    return slot.includes('Available') && slot[9].includes(venue) && slot[9].includes(time);
                });

                // Pop last item from available slots array
                let slotToBook = filteredTimeSlots.pop();

                // Destructure chosen slot as the first item (availability) isn't required
                let [, spanId, venueID, pitchNumber, sportID, year, week, day, timeslotID, liText] = slotToBook;
                const finalSlotData = [spanId, venueID, pitchNumber, sportID, year, week, day, timeslotID, liText];

                // Pass final data to the iframe book function
                iframe.contentWindow.book(...finalSlotData);

                // Update the provisional Booking element with the selected slot info
                provisionalBookingInfo.innerHTML = `<p>You have reserved an appointment for ${liText.replace(",", " at")}.</p> 
                <p>This appointment time will be held for 15 minutes to allow you time to complete the rest of your appointment booking.<br/> Please click 'Next' if you are happy to accept your appointment time & proceed.</p>`

                // Store slot id in browser's local storage
                localStorage.setItem('reservedSlotId', spanId);

            } else {
                // Get current date for API URL
                let today = new Date();

                let urlDate = setUrlDate(today);

                // Get date from local storage
                const storedDate = localStorage.getItem('date');
                const apiUrl = storedDate ? setUrl(storedDate) : setUrl(urlDate);

                // Make a new fetch call to get the updated reserved slots
                fetch(apiUrl)
                    .then(checkStatus)
                    .then(response => response.json())
                    .then(updatedData => {

                        // Get slot id from local storage
                        const reservedSlot = localStorage.getItem('reservedSlotId');

                        // the keys from updated json
                        const updatedKeys = Object.keys(updatedData);

                        // Create new individual venue data
                        let updatedDataArr = [];
                        Object.values(updatedData).forEach((item) => {
                            updatedDataArr.push(item);
                        });

                        // Create status new objects from data array
                        const getUpdatedSlotData = (updatedKeys) => {
                            const updatedResult = Object.entries(updatedKeys).reduce((acc, element) => {
                                // Destrcuture key, values here
                                const [key, slot] = element;
                                // Run a map to fetch the status and then assign it to the key
                                // If bookingID exists then return it too
                                acc[key] = slot.map((item) => {
                                    return item.bookingID ? [item.Status, item.Span_id, item.Venue, item.Pitch_num, item.Sport, item.Year, item.Week, item.Day, item.Slot, item.Li_text, item.bookingID] : [item.Status, item.Span_id, item.Venue, item.Pitch_num, item.Sport, item.Year, item.Week, item.Day, item.Slot, item.Li_text]
                                });
                                return acc;
                            }, []);

                            return updatedResult
                        }

                        // Create an updated booking data array
                        const updatedBookingDataArr = updatedDataArr.map((item) => {
                            return getUpdatedSlotData(item);
                        }, []);

                        // Condense latest updated status data
                        const allUpdatedSlotData = [];
                        for (const slot of updatedBookingDataArr) {
                            for (const time in slot) {
                                allUpdatedSlotData.push(slot[time]);
                            }
                        }

                        // Flatten the new arrays to just one large array
                        const flattenUpdatedArrData = allUpdatedSlotData.reduce((acc, item) => {
                            return acc.concat(item);
                        }, []);

                        // Check the updated dat for a 'Reserved' status and whether is exists in the user's localStorage
                        // If so return the bookingID
                        const filterReservedSlot = flattenUpdatedArrData.filter((slot) => {
                            if (slot.includes('Reserved') && slot.includes(reservedSlot)) {
                                return slot;
                            }
                        }).reduce((acc, item) => {
                            return acc.concat(item).pop();
                        }, []);

                        // Pass bookingID to the iframe cancel booking function
                        iframe.contentWindow.cancel_booking(filterReservedSlot);

                        // Clear the provisional Booking element of the selected slot info
                        provisionalBookingInfo.innerHTML = '';

                        // If there's a match, then delete the ID from localStorage
                        localStorage.removeItem('reservedSlotId');

                    });

                const checkStatus = (response) => {
                    if (response.ok) {
                        return response;
                    } else {
                        var error = new Error(response.statusText);
                        error.response = response;
                        return Promise.reject(error);
                    }
                }
            }

        });
    });
}

export { timeSlotsFunc as default }