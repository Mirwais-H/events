const calendarBody = document.getElementById('calendar-body');
const monthYear = document.getElementById('month-year');
const prevButton = document.getElementById('prev');
const nextButton = document.getElementById('next');
const modal = document.getElementById('event-modal');
const closeModal = document.getElementById('close-modal');
const eventForm = document.getElementById('event-form');
const eventTitleInput = document.getElementById('event-title');
const eventTimeInput = document.getElementById('event-time');
const eventStartDateInput = document.getElementById('event-start-date');
const eventEndDateInput = document.getElementById('event-end-date');

let currentDate = new Date();
let currentMonth = currentDate.getMonth();
let currentYear = currentDate.getFullYear();

// Load events from localStorage or initialize as an empty object
let events = JSON.parse(localStorage.getItem('events')) || {};

const months = ["January", "February", "March", "April", "May", "June", 
                "July", "August", "September", "October", "November", "December"];

// Colors array to assign unique colors for each event
const colors = ["#FF5733", "#33FF57", "#3357FF", "#FF33C4", "#33FFF4", "#FFC733"];
let colorIndex = 0;

function getNextColor() {
    const color = colors[colorIndex % colors.length];
    colorIndex++;
    return color;
}

function renderCalendar(month, year) {
    calendarBody.innerHTML = '';

    const firstDay = new Date(year, month).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    monthYear.innerHTML = `${months[month]} ${year}`;

    let date = 1;
    for (let i = 0; i < 6; i++) {
        const row = document.createElement('tr');

        for (let j = 0; j < 7; j++) {
            const cell = document.createElement('td');

            if (i === 0 && j < firstDay) {
                cell.textContent = '';
            } else if (date > daysInMonth) {
                cell.textContent = '';
            } else {
                const formattedDate = `${year}-${String(month + 1).padStart(2, '0')}-${String(date).padStart(2, '0')}`;
                cell.textContent = date;

                // Check for events on this date
                for (let key in events) {
                    events[key].forEach((event, eventIndex) => {
                        // Handle multi-day events
                        if (isDateInRange(formattedDate, event.startDate, event.endDate)) {
                            const eventDiv = document.createElement('div');
                            eventDiv.classList.add('event');
                            eventDiv.textContent = `${event.time} - ${event.title}`;
                            eventDiv.style.backgroundColor = event.color; // Apply event color

                            // Create remove button
                            const removeButton = document.createElement('button');
                            removeButton.textContent = 'x';
                            removeButton.classList.add('remove-event');
                            removeButton.addEventListener('click', (e) => {
                                e.stopPropagation(); // Prevent triggering modal
                                removeEvent(event.startDate, eventIndex);
                            });

                            eventDiv.appendChild(removeButton);
                            cell.appendChild(eventDiv);
                        }
                    });
                }

                // Highlight today's date
                if (date === currentDate.getDate() && month === currentDate.getMonth() && year === currentDate.getFullYear()) {
                    cell.classList.add('today');
                }

                // Add click event to open the modal
                cell.addEventListener('click', () => {
                    openModal(formattedDate);
                });

                date++;
            }
            row.appendChild(cell);
        }
        calendarBody.appendChild(row);
    }
}

// Helper function to check if a date is within the start and end range of an event
function isDateInRange(date, startDate, endDate) {
    const d = new Date(date);
    const s = new Date(startDate);
    const e = new Date(endDate);
    return d >= s && d <= e;
}

function openModal(date) {
    modal.style.display = 'block';
    eventStartDateInput.value = date; // Save the selected start date to the hidden input field
    eventEndDateInput.value = date; // Default the end date to the same day
}

function closeModalHandler() {
    modal.style.display = 'none';
    eventForm.reset();
}

prevButton.addEventListener('click', () => {
    currentMonth--;
    if (currentMonth < 0) {
        currentMonth = 11;
        currentYear--;
    }
    renderCalendar(currentMonth, currentYear);
});

nextButton.addEventListener('click', () => {
    currentMonth++;
    if (currentMonth > 11) {
        currentMonth = 0;
        currentYear++;
    }
    renderCalendar(currentMonth, currentYear);
});

closeModal.addEventListener('click', closeModalHandler);

eventForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const eventTitle = eventTitleInput.value;
    const eventTime = eventTimeInput.value;
    const eventStartDate = eventStartDateInput.value;
    const eventEndDate = eventEndDateInput.value;

    // Get a unique color for the event
    const eventColor = getNextColor();

    // Store the event as a multi-day event (if applicable)
    const eventData = {
        title: eventTitle,
        time: eventTime,
        startDate: eventStartDate,
        endDate: eventEndDate,
        color: eventColor // Store the color of the event
    };

    if (!events[eventStartDate]) {
        events[eventStartDate] = [];
    }

    events[eventStartDate].push(eventData);

    // Save updated events to localStorage
    localStorage.setItem('events', JSON.stringify(events));

    closeModalHandler();
    renderCalendar(currentMonth, currentYear);
});

window.onclick = function(event) {
    if (event.target == modal) {
        closeModalHandler();
    }
};

// Function to remove an event
function removeEvent(date, eventIndex) {
    if (events[date]) {
        events[date].splice(eventIndex, 1);
        if (events[date].length === 0) {
            delete events[date];
        }

        // Update localStorage after removal
        localStorage.setItem('events', JSON.stringify(events));

        // Re-render calendar
        renderCalendar(currentMonth, currentYear);
    }
}

// Load events from localStorage when the page loads
window.addEventListener('DOMContentLoaded', function() {
    renderCalendar(currentMonth, currentYear);
});
