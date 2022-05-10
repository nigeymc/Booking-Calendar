export default function selectTabs(e) {
    const target = e.target.value;
    const venueTab = document.querySelector("#" + target);
    venueTab.checked = true;
}