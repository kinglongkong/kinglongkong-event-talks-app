const fs = require('fs');
const talks = require('./data.js');

const cssStyles = `
body {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    line-height: 1.6;
    color: #333;
    max-width: 900px;
    margin: 2rem auto;
    padding: 0 1rem;
    background-color: #f9f9f9;
}
h1, h2 {
    color: #1a1a1a;
    text-align: center;
}
h1 {
    border-bottom: 2px solid #3498db;
    padding-bottom: 10px;
}
#search-container {
    text-align: center;
    margin-bottom: 2rem;
}
#category-search {
    padding: 10px 15px;
    width: 60%;
    max-width: 400px;
    border: 2px solid #ddd;
    border-radius: 25px;
    font-size: 1rem;
    transition: border-color 0.3s;
}
#category-search:focus {
    outline: none;
    border-color: #3498db;
}
.schedule-item {
    background-color: #fff;
    border-left: 5px solid #3498db;
    margin-bottom: 1.5rem;
    padding: 1.5rem;
    border-radius: 0 8px 8px 0;
    box-shadow: 0 2px 5px rgba(0,0,0,0.05);
    transition: transform 0.2s;
}
.schedule-item:hover {
    transform: translateY(-5px);
}
.schedule-item.break {
    border-left-color: #e67e22;
    text-align: center;
}
.time {
    font-weight: bold;
    font-size: 1.1rem;
    color: #3498db;
}
.break .time {
    color: #e67e22;
}
.title {
    font-size: 1.5rem;
    margin: 0.5rem 0;
    color: #2c3e50;
}
.speakers {
    font-style: italic;
    color: #555;
    margin-bottom: 0.5rem;
}
.description {
    margin-bottom: 1rem;
}
.categories {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
}
.category {
    background-color: #ecf0f1;
    color: #34495e;
    padding: 5px 12px;
    border-radius: 15px;
    font-size: 0.85rem;
}
.hidden {
    display: none;
}
`;

const clientScript = `
document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('category-search');
    const scheduleItems = document.querySelectorAll('.schedule-item[data-categories]');

    searchInput.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();

        scheduleItems.forEach(item => {
            const categories = item.getAttribute('data-categories').toLowerCase();
            if (categories.includes(searchTerm)) {
                item.classList.remove('hidden');
            } else {
                item.classList.add('hidden');
            }
        });
    });
});
`;

function generateScheduleHTML(talks) {
    let html = '';
    const startTime = new Date();
    startTime.setHours(10, 0, 0, 0); // Event starts at 10:00 AM

    const formatTime = (date) => date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });

    talks.forEach((talk, index) => {
        const talkStartTime = new Date(startTime);
        const talkEndTime = new Date(talkStartTime.getTime() + talk.duration * 60000);

        html += `
            <div class="schedule-item" data-categories="${talk.categories.join(', ').toLowerCase()}">
                <div class="time">${formatTime(talkStartTime)} - ${formatTime(talkEndTime)}</div>
                <h2 class="title">${talk.title}</h2>
                <div class="speakers">By: ${talk.speakers.join(', ')}</div>
                <p class="description">${talk.description}</p>
                <div class="categories">
                    ${talk.categories.map(cat => `<span class="category">${cat}</span>`).join('')}
                </div>
            </div>
        `;

        startTime.setTime(talkEndTime.getTime() + 10 * 60000); // 10 minute transition

        // Lunch break after the 3rd talk
        if (index === 2) {
            const lunchStartTime = new Date(talkEndTime.getTime() + 10 * 60000); // After transition
            const lunchEndTime = new Date(lunchStartTime.getTime() + 60 * 60000); // 1 hour lunch
            html += `
            <div class="schedule-item break">
                <div class="time">${formatTime(lunchStartTime)} - ${formatTime(lunchEndTime)}</div>
                <h2 class="title">Lunch Break</h2>
            </div>
            `;
            startTime.setTime(lunchEndTime.getTime());
        }
    });

    return html;
}


const scheduleHtml = generateScheduleHTML(talks);

const finalHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Tech Event Schedule</title>
    <style>${cssStyles}</style>
</head>
<body>
    <header>
        <h1>Tech Event Schedule</h1>
    </header>
    <main>
        <div id="search-container">
            <input type="text" id="category-search" placeholder="Search by category (e.g., AI, Web)...">
        </div>
        <div id="schedule">
            ${scheduleHtml}
        </div>
    </main>
    <script>${clientScript}<\/script>
</body>
</html>
`;

fs.writeFileSync('index.html', finalHtml);
console.log('Successfully created index.html');
