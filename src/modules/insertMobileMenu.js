const insertMobileMenu = (keys) => {
    // If keys exist, map over them and insert the venue options in to DOM
    if (keys.length) {
        // Otherwise, insert venue options
        return `
        <div class="tabs__mobile-navigation" role="navigation">
            <label class="tabs__label--mobile" for="location">${keys.length > 1 ? `Please choose a location for your appoinment` : `Location:`}</label>
            <select class="form__select" id="location" aria-label="Location options">
        ${keys.map((item, index) => {
            return `<option value="tab${index}">${item}</option>`;
        }).join('')}</select></div>`;
    }
}

export { insertMobileMenu as default };