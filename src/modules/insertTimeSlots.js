const insertTimeSlots = (status) => {
    if (Object.keys(status).length > -1) {
        // insert time slots

        return `
                ${Object.entries(status).map((item, index) => {
            const [key, statusArr] = item;

            if (statusArr.includes("Available")) {
                return `<div class="tabs__slot">
                        <input class="slots__checkbox" type="checkbox" tabindex="0" name=${key}>
                        <label class="slots__label" title="Click here to reserve this ${key} appointment time">${key}</label>
                    </div>`;
            }
        }).join('')}`;
    }

}


export { insertTimeSlots as default };