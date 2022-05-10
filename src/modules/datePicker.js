import dayjs from 'dayjs';

const datePicker = () => {

    const controlsWrapper = document.querySelector('.controls');
    const displayDate = dayjs().format('dddd D/MM/YYYY');
    controlsWrapper.innerHTML = `<button class="button button--arrow-left tabs__button prev" title="Previous day"></button><p class="tabs__date">${displayDate}</p><button class="button button--arrow tabs__button next" title="Next day"></button>`;

}

export { datePicker as default };
