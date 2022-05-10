import "core-js/stable";
import fetch from 'unfetch';
import timeSlotsFunc from './modules/timeSlotsFunc';

let date = new Date();

export const setUrlDate = (todaysDate) => {
    // Get current date for API URL
    return todaysDate.toISOString().slice(0, 10);
}

let urlDate = setUrlDate(date);

// Set API URL
export const setUrl = (urlDate) => {

    let url = `https://www.royalgreenwich.gov.uk/site/custom_scripts/repo/apps/pitch-bookings2/covid-tests/calendar-json.php?sport=20&todayDate=${urlDate}`;

    return url;
}

let apiUrl = setUrl(urlDate);

export const fetchFunc = (url) => {
    return fetch(url)  // return this promise
        .then(checkStatus)
        .then(response => response.json())
        .then(data => (data))
}

const checkStatus = (response) => {
    if (response.ok) {
        return response;
    } else {
        var error = new Error(response.statusText);
        error.response = response;
        return Promise.reject(error);
    }
}

fetchFunc(apiUrl)
    .then(data => {
        timeSlotsFunc(data);
    });  // call `then()` on the returned promise 

// Insert date picker element
const controlsWrapper = document.querySelector('.controls');

let today = date.setTime(date.getTime());
let day = 24 * 60 * 60 * 1000;
let dateVal;
let controlDate;
const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
let displayDate = date.toLocaleDateString();
let dayOfWeek = days[date.getDay()];

controlsWrapper.innerHTML = `<button class="button button--arrow-left prev" title="Previous day"></button><p class="controls__date">${dayOfWeek}, ${displayDate}</p><button class="button button--arrow next" title="Next day"></button>`;

const next = document.querySelector(".next");
next.addEventListener("click", (e) => {
    dateVal = today += day;
    controlDate = new Date(dateVal);
    let formattedControlDate = controlDate.toISOString().slice(0, 10);
    let displayDate = controlDate.toLocaleDateString();
    let displayDateEl = document.querySelector('.controls__date');
    let dayOfWeek = days[controlDate.getDay()];

    // Store date in localStorage
    localStorage.setItem('date', formattedControlDate);
    displayDateEl.innerHTML = `${dayOfWeek}, ${displayDate}`;

    fetchFunc(setUrl(formattedControlDate))
        .then(data => {
            timeSlotsFunc(data);
        });
});

const prev = document.querySelector(".prev");
prev.addEventListener("click", (e) => {
    dateVal = today -= day;
    controlDate = new Date(dateVal);
    let formattedControlDate = controlDate.toISOString().slice(0, 10);
    let displayDate = controlDate.toLocaleDateString();
    let displayDateEl = document.querySelector('.controls__date');
    let dayOfWeek = days[controlDate.getDay()];

    // Store date in localStorage
    localStorage.setItem('date', formattedControlDate);
    displayDateEl.innerHTML = `${dayOfWeek}, ${displayDate}`;

    fetchFunc(setUrl(formattedControlDate))
        .then(data => {
            timeSlotsFunc(data);
        });
});