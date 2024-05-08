const sleepTableCreate = document.getElementById("sleep-table");
const addSleepData = document.getElementById("add-sleep");
const deleteSleepData = document.getElementById("delete-sleep");
const displaySleepData = document.getElementById("display-sleep");
const tableName = sessionStorage.username + "sleeptable";
const inputs = document.getElementById("inputs");
const representations = document.getElementById("representations");
const downloadReport = document.getElementById('downloadReport');
        downloadReport.style.display = 'none';
addSleepData.addEventListener("click", () => {
    inputs.style.display = '';
    representations.style.display = 'none';
});
inputs.style.display = 'none';
representations.style.display = 'none';
function reloadSiteWithDelay(delay) {
    setTimeout(function () {
        // Reload the current page
        location.reload();
    }, delay);
}

// Function to display pop-up message
function showAlert(type, message) {
    const alertBox = document.createElement('div');
    alertBox.classList.add('alert', `alert-${type}`);
    alertBox.textContent = message;
    document.body.appendChild(alertBox);
    // Trigger reflow to enable transition
    alertBox.offsetHeight;
    // Set opacity to 1 for transition effect
    alertBox.style.opacity = '1';
    // Remove the alert after 3 seconds
    setTimeout(() => {
        alertBox.style.opacity = '0';
        setTimeout(() => {
            alertBox.remove();
        }, 400); // Transition duration
    }, 800);
}
// JavaScript code to create the sleep table
const createSleepTable = () => {
    inputs.style.display = 'none';
    representations.style.display = 'none';
    fetch(`/create-sleep-table?tableName=${tableName}`, {
        method: 'POST'
    })
        .then(response => response.json())
        .then(data => {
            if (data.message) {
                showAlert('success', data.message);
            }
            else if (data.error === 'Error checking sleep table existence') {
                showAlert('error', data.error);
            }
            else if (data.error === 'Sorry! Sleep table already exists') {
                showAlert('error', data.error);
            }
            else {
                showAlert('error', 'Error creating sleep table');
            }
            // Clear the form after submission if needed
            sleepForm.reset();
        })
        .catch(error => {
            console.error('Error:', error);
            showAlert('error', 'An error occurred while adding sleep data');
        });
};
sleepTableCreate.addEventListener('click', () => {
    createSleepTable();
    console.log('sleep table button pressed')
});
const sleepDateInput = document.getElementById("sleepDate");
// Get today's date in YYYY-MM-DD format
const today = new Date().toISOString().slice(0, 10);
// Set the value of the date input field to today's date
sleepDate.innerHTML = "Date:" + today;
// JavaScript code to handle form submission and display pop-up messages
document.addEventListener("DOMContentLoaded", function () {
    const sleepForm = document.getElementById("sleepForm");
    sleepForm.addEventListener("submit", function (event) {
        event.preventDefault(); // Prevent the default form submission behavior
        const sleepHours = parseFloat(document.getElementById("sleepHours").value);
        const currentDate = new Date().toISOString().slice(0, 10); // Get today's date in YYYY-MM-DD format
        const formData = {
            date: currentDate,
            sleep_hours: sleepHours
        };
        fetch(`/add-sleep-data?tableName=${tableName}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        })
            .then(response => response.json())
            .then(data => {
                if (data.message) {
                    showAlert('success', data.message);
                } else if (data.error === 'Sleep data for this date already exists') {
                    showAlert('error', data.error);
                } else {
                    showAlert('error', 'An error occurred while adding sleep data');
                }
                // Clear the form after submission if needed
                sleepForm.reset();
            })
            .catch(error => {
                console.error('Error:', error);
                showAlert('error', 'An error occurred while adding sleep data');
            });
    });
});
// JavaScript code to fetch and display sleep data
document.addEventListener("DOMContentLoaded", function () {

    const displaySleepDataButton = document.getElementById("display-sleep");

    displaySleepData.addEventListener("click", () => {
        fetchSleepDataGraph(); // Call fetchSleepDataGraph when the button is clicked
    });

    function fetchSleepDataGraph() {
        fetch(`/fetch-sleep-data?tableName=${tableName}`)
            .then(response => response.json())
            .then(data => {
                if (data.error) {
                    showAlert('error',data.error); // Show error message if table does not exist or there's an error fetching data
                    reloadSiteWithDelay(900);
                } else {
                    if (Array.isArray(data)) {
                        displaySleepDataFunction(data); // Call displaySleepDataFunction to display the data
                        createChart(data); // Call createChart to create the chart
                        const sleepCategories = categorizeSleep(data);
                        createPieChart(sleepCategories);
                    } else {
                        console.error('Error fetching sleep data');
                    }
                }
            })
            .catch(error => {
                console.error('Error:', error);
            });
    }

    function displaySleepDataFunction(data) {
        inputs.style.display = 'none';
        representations.style.display = '';
        downloadReport.style.display = '';
        const sleepDataDiv = document.getElementById('sleepData');
        // Clear existing data
        sleepDataDiv.innerHTML = '';
        // Create a table element
        const table = document.createElement('table');
        table.classList.add('display-sleep-table');
        // Create table headers
        const headers = ['Date', 'Sleep Hours', 'Actions'];
        const headerRow = document.createElement('tr');
        headers.forEach(headerText => {
            const th = document.createElement('th');
            th.textContent = headerText;
            headerRow.appendChild(th);
        });
        table.appendChild(headerRow);
        console.log(data);
        // Populate table with data
        data.forEach(entry => {
            const row = document.createElement('tr');
            const dateCell = document.createElement('td');
            const date = new Date(entry.date).toISOString().slice(0, 10);
            console.log(date);
            dateCell.textContent = date;
            const sleepHoursCell = document.createElement('td');
            sleepHoursCell.textContent = entry.sleep_hours;

            // Create delete button
            const deleteButtonCell = document.createElement('td');
            const deleteButton = document.createElement('button');
            deleteButton.textContent = 'Delete';
            deleteButton.className='web-button';
            deleteButton.addEventListener('click', () => {
                deleteSleepEntry(entry.id); // Call function to delete entry when button is clicked
            });
            deleteButtonCell.appendChild(deleteButton);

            row.appendChild(dateCell);
            row.appendChild(sleepHoursCell);
            row.appendChild(deleteButtonCell);
            table.appendChild(row);
        });

        sleepDataDiv.appendChild(table);
    }

    // Function to delete sleep entry
    function deleteSleepEntry(entryId) {
        fetch(`/delete-entry?entryId=${entryId}&tableName=${tableName}`, {
            method: 'DELETE'
        })
            .then(response => {
                if (response.ok) {
                    // Entry deleted successfully, fetch updated data and display
                    fetchSleepDataGraph();
                    showAlert('success', 'Entry deleted successfully');
                } else {
                    showAlert('error', 'Error deleting entry');
                }
            })
            .catch(error => {
                console.error('Error:', error);
                showAlert('error', 'An error occurred while deleting entry');
            });
    }


    // Call fetchSleepDataGraph when the page loads
    document.addEventListener("DOMContentLoaded", function () {
        fetchSleepDataGraph();
    });
});
let sleepChart;
function createChart(data) {
    const dates = data.map(entry => new Date(entry.date).toISOString().slice(0, 10));
    const sleepHours = data.map(entry => entry.sleep_hours);

    const ctx = document.getElementById('sleepChart').getContext('2d');
    // Destroy existing chart instance if it exists
    if (sleepChart) {
        sleepChart.destroy();
    }

    // Create new chart instance
    sleepChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: dates,
            datasets: [{
                label: 'Sleep Hours',
                data: sleepHours,
                backgroundColor: 'rgba(54, 162, 235, 0.2)',
                borderColor: 'rgba(54, 162, 235, 1)',
                borderWidth: 2
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true // Ensure y-axis starts from zero
                }
            }
        }
    });
}
function categorizeSleep(data) {
    // Initialize counters for each category
    let lessThan6 = 0;
    let equalTo8 = 0;
    let between6And8 = 0;
    let greaterThan8 = 0;

    // Iterate through each entry and categorize based on sleep duration
    data.forEach(entry => {
        if (entry.sleep_hours <= 6) {
            lessThan6++;
        } else if (entry.sleep_hours === 8) {
            equalTo8++;
        } else if (entry.sleep_hours < 8) {
            between6And8++;
        } else {
            greaterThan8++;
        }
    });

    return [lessThan6, equalTo8, between6And8, greaterThan8];
}
let sleepPieChart;
function createPieChart(sleepCategories) {
    const ctx = document.getElementById('sleepPieChart').getContext('2d');
    if (sleepPieChart) {
        sleepPieChart.destroy();
    }
    sleepPieChart = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: ['Sleep <= 6', 'Sleep = 8', '6 < Sleep < 8', 'Sleep > 8'],
            datasets: [{
                label: 'Sleep Categories',
                data: sleepCategories,
                backgroundColor: [
                    'rgba(255, 99, 132, 0.5)',
                    'rgba(54, 162, 235, 0.5)',
                    'rgba(255, 206, 86, 0.5)',
                    'rgba(75, 192, 192, 0.5)',
                ],
                borderColor: [
                    'rgba(255, 99, 132, 1)',
                    'rgba(54, 162, 235, 1)',
                    'rgba(255, 206, 86, 1)',
                    'rgba(75, 192, 192, 1)',
                ],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            legend: {
                position: 'bottom',
            },
            title: {
                display: true,
                text: 'Sleep Categories Pie Chart'
            },
            animation: {
                animateRotate: true,
                animateScale: true
            }
        }
    });
}

displaySleepData.addEventListener('click', () => {
    fetchAndDisplaySleepSuggestion();
});

function fetchAndDisplaySleepSuggestion() {
    const today = new Date().toISOString().slice(0, 10);
    console.log(today);
    fetch(`/fetch-sleep-data-suggestion?tableName=${tableName}&date=${today}`)
        .then(response => response.json())
        .then(data => {
            if (Array.isArray(data) && data.length > 0) {
                const sleepHoursToday = data[0].sleep_hours;
                const suggestion = suggestSleep(sleepHoursToday);
                displaySuggestion(suggestion);
            } else {
                displaySuggestion("No sleep data available for today.");
            }
        })
        .catch(error => {
            console.error('Error:', error);
            displaySuggestion("An error occurred while fetching sleep data.");
        });
}

function suggestSleep(sleepHours) {
    let suggestion = "";
    console.log(sleepHours);
    if (sleepHours <= 6) {
        suggestion = "Consider extending your sleep duration to improve overall health and well-being. Adequate rest is essential for cognitive function, mood stability, and physical health. Try adjusting your bedtime routine or minimizing distractions before sleep to enhance sleep quality.";
    } else if (sleepHours === 8) {
        suggestion = "Congratulations! Your sleep duration appears to be optimal. Continue maintaining consistent sleep patterns to support overall health and well-being. Adequate sleep of around 8 hours per night promotes cognitive function, emotional stability, and physical recovery, contributing to a healthier lifestyle.";
    } else if (sleepHours < 8 && sleepHours > 6) {
        suggestion = "Your sleep duration is slightly below the recommended range. Aim for a minimum of 7-9 hours of sleep per night for optimal health. Consider adjusting your bedtime routine, reducing screen time before sleep, and creating a relaxing sleep environment to improve sleep quality and duration.";
    } else {
        suggestion = "While adequate sleep is crucial, excessively long sleep durations may indicate underlying issues. Ensure a balanced lifestyle by maintaining consistent sleep patterns and addressing factors such as stress, sleep disorders, or medical conditions. Consult a healthcare professional if excessive sleep persists despite lifestyle adjustments.";
    }

    return suggestion;
}
function displaySuggestion(suggestion) {
    const suggestionElement = document.getElementById("suggestionBox");
    suggestionElement.textContent = suggestion;
}

deleteSleepData.addEventListener('click', () => {
    // Send an AJAX request to delete the table
    fetch(`/delete-table?username=${tableName}`, {
        method: 'DELETE'
    })
        .then(response => response.json())
        .then(data => {
            console.log(data);
            if (data.error === 'Table does not exist') {
                showAlert('error', data.error);
            }
            if (data.message === 'Table deleted successfully') {
                showAlert('success', data.message);
            }
            reloadSiteWithDelay(900);
        })
        .catch(error => {
            console.error('Error:', error);
        });
});
function fetchAndDisplaySleepSuggestion() {
    const today = new Date().toISOString().slice(0, 10);
    console.log(today);
    fetch(`/fetch-sleep-data-suggestion?tableName=${tableName}&date=${today}`)
        .then(response => response.json())
        .then(data => {
            if (Array.isArray(data) && data.length > 0) {
                const sleepHoursToday = data[0].sleep_hours;
                const suggestion = suggestSleep(sleepHoursToday);
                displaySuggestion(suggestion);
            } else {
                displaySuggestion("No sleep data available for today.");
            }
        })
        .catch(error => {
            console.error('Error:', error);
            displaySuggestion("An error occurred while fetching sleep data.");
        });
}
function fetchSleepDataGraph() {
    fetch(`/fetch-sleep-data?tableName=${tableName}`)
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                showAlert('error', data.error); // Show error message if table does not exist or there's an error fetching data
                reloadSiteWithDelay(900);
            } else {
                if (Array.isArray(data)) {
                    
                } else {
                    console.error('Error fetching sleep data');
                }
            }
        })
        .catch(error => {
            console.error('Error:', error);
        });
}
const downloadReportButton = document.getElementById("downloadReport");

downloadReportButton.addEventListener("click", async () => {
    try {
        const pdf = new jsPDF(); // Initialize jsPDF

        const header = 'Sleep Data Report';
        const date = new Date().toLocaleDateString();
        
        pdf.setFontSize(18);
        pdf.text(header, 10, 20);

        pdf.setFontSize(12);
        pdf.text(`Date: ${date}`, 10, 30);

        const sleepData = await fetchSleepDataGraph();
        let startY = 40;
        const columnHeaders = ['', ''];
        const rows = [['Date', 'Sleep Hours']];

        sleepData.forEach(entry => {
            const date = new Date(entry.date).toLocaleDateString();
            const sleepHours = entry.sleep_hours;
            rows.push([date, sleepHours]);
        });

        // Manually draw the table
        const columnWidths = [50, 50]; // Adjust column widths as needed
        const rowHeight = 10; // Adjust row height as needed

        // Draw column headers
        pdf.setFontStyle('bold');
        pdf.text(columnHeaders[0], 10, startY + rowHeight);
        pdf.text(columnHeaders[1], 60, startY + rowHeight);

        pdf.setFontStyle('normal');
        startY += rowHeight;

        // Draw table content
        rows.forEach(row => {
            const [date, sleepHours] = row;
            pdf.text(date, 10, startY + rowHeight);
            pdf.text(sleepHours.toString(), 60, startY + rowHeight);
            startY += rowHeight;
        });

        pdf.save(sessionStorage.name+'_sleep_data_report.pdf');
        showAlert('success','Report Downloaded successfully');
    } catch (error) {
        console.error('Error fetching or processing sleep data:', error);
    }
});

// Fetch sleep data asynchronously
async function fetchSleepDataGraph() {
    try {
        const response = await fetch(`/fetch-sleep-data?tableName=${tableName}`);
        if (!response.ok) {
            throw new Error('Failed to fetch sleep data');
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching sleep data:', error);
        throw error;
    }
}
