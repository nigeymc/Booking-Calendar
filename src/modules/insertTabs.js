const insertTabs = (keys) => {
    // If keys exist, map over them and insert each tab section in to the DOM
    if (keys.length > -1) {
        // Otherwise, insert time slots
        const radioCheck = document.querySelector('.tabs__radio');

        return `
        ${keys.length > 1 ? `<div class="tabs__message--desktop"><p>Please select a location for your appointment</p></div>` : `<div class="tabs__message--desktop"><p>Location:</p></div>`}
    ${keys.map((item, index) => {
            return `
                <input class="tabs__radio" type="radio" tabindex="0" name="location" id="tab${index}">
                <label class="tabs__label" for="tab${index}" title="${item}">${item}</label>
                <section class="tabs__tab" tabindex="0">
                <p>Reserve your 30 minute appointment from the available times at ${item}</p>
                <div class="tab__inner">
                <div class="tabs__slots-container" tabindex="0" data-venue="${item}"></div>
                </div>
                </section>`;
        }).join('')}`;
    }
}

export { insertTabs as default };