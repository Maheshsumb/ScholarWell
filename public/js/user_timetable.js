const createTimetableButton = document.getElementById('create-timetable');
const displayTimetableButton = document.getElementById('display-timetable');
const deleteTableButton = document.getElementById('delete-table');
const addEntryForm = document.getElementById('add-entry-form');
const tableName = sessionStorage.username + "timetable";
const userContent = document.getElementById('user-content');
const timeTableEntry = document.getElementById('time-table');
const dataEntry = document.getElementById('data-entry');
const insertInTable = document.getElementById('insert-in-table');
userContent.style.display = 'none';
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
createTimetableButton.addEventListener('click', () => {
    userContent.style.display = 'none';
    // Send an AJAX request to create a table
    fetch(`/create-table?tableName=${tableName}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        }
    })
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                showAlert('error', data.error); // Show error message if table creation fails
            } else {
                showAlert('success',data.message); // Show success message if table is created
            }
        })
        .catch(error => {
            showAlert('error:', error);
        });
});
// Add event listeners to delete buttons
function addDeleteButtonListeners() {
    const deleteButtons = document.querySelectorAll('.delete-button');
    deleteButtons.forEach(button => {
        button.addEventListener('click', () => {
            const entryId = button.getAttribute('data-id');
            const tableName = sessionStorage.username + "timetable";
            deleteEntry(entryId, tableName);
        });
    });
}

// Function to delete an entry
function deleteEntry(entryId, tableName) {
    userContent.style.display = '';
    dataEntry.style.display = 'none';
    timeTableEntry.style.display = '';
    // Send an AJAX request to delete the entry
    fetch(`/delete-entry?entryId=${entryId}&tableName=${tableName}`, {
        method: 'DELETE'
    })
        .then(response => response.json())
        .then(data => {
            showAlert(data.message); // Show success or error message
            // Refresh the displayed table after deletion
            displayTimetableButton.click(); // Trigger display button click event to refresh table
        })
        .catch(error => {
            showAlert('error:', error);
        });
}
displayTimetableButton.addEventListener('click', () => {
    userContent.style.display = '';
    dataEntry.style.display = 'none';
    timeTableEntry.style.display = '';
    // Send an AJAX request to fetch table data
    fetch(`/display-table?username=${tableName}`)
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                showAlert('error',data.error); // Show error message if table does not exist or there's an error fetching data
            } else {
                // Display the table data (You can implement your own logic to display the data)
                console.log(data);
                // Example: Displaying data in a table
                const tableBody = document.getElementById('table-body');
                tableBody.innerHTML = ''; // Clear existing table data
                data.forEach(row => {
                    const tr = document.createElement('tr');
                    tr.innerHTML = `
                    <td>${row.lecture_no}</td>
                    <td>${row.monday}</td>
                    <td>${row.tuesday}</td>
                    <td>${row.wednesday}</td>
                    <td>${row.thursday}</td>
                    <td>${row.friday}</td>
                    <td>${row.saturday}</td>
                    <td><button class="delete-button web-button" data-id="${row.id}">Delete</button></td>
                    `;
                    tableBody.appendChild(tr);
                });
                // Add event listeners to delete buttons
                addDeleteButtonListeners();
            }
        })
        .catch(error => {
            console.error('Error:', error);
        });
});
deleteTableButton.addEventListener('click', () => {
    userContent.style.display = 'none';
    // Send an AJAX request to delete the table
    fetch(`/delete-table?username=${tableName}`, {
        method: 'DELETE'
    })
        .then(response => response.json())
        .then(data => {
            showAlert('success',data.message); // Show success or error message
        })
        .catch(error => {
            console.error('Error:', error);
        });
});
insertInTable.addEventListener('click', () => {
    userContent.style.display = '';
    dataEntry.style.display = '';
    timeTableEntry.style.display = 'none';
    addEntryForm.addEventListener('submit', (event) => {
        event.preventDefault(); // Prevent default form submission
        const formData = new FormData(addEntryForm);
        const entryData = {};
        formData.forEach((value, key) => {
            entryData[key] = value;
        });

        // Send an AJAX request to add the entry
        fetch(`/add-entry?username=${tableName}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(entryData)
        })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    showAlert('success',data.message); // Show success or error message
                    addEntryForm.reset();// Clear form inputs on successful submission
                }
                if (data.error) {
                    showAlert('error',data.error)
                }
            })
            .catch(error => {
                showAlert('error',error);
                console.error('Error:', error);
            });
    });
});
// Event listener for download button
const downloadTimetableBtn = document.getElementById('download-timetable');
downloadTimetableBtn.addEventListener('click', async () => {
    try {
        const pdf = new jsPDF(); // Initialize jsPDF

        const header = 'Timetable Report';
        const date = new Date().toLocaleDateString();

        pdf.setFontSize(16); // Decreased font size
        pdf.text(header, 10, 20);

        pdf.setFontSize(10); // Decreased font size
        pdf.text(`Date: ${date}`, 10, 30);

        const timetableData = await fetchTimetableData();
        let startY = 40;
        const columnHeaders = ['Lecture No', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const rows = [];

        timetableData.forEach(entry => {
            const lectureNo = entry.lecture_no;
            const monday = entry.monday || '-';
            const tuesday = entry.tuesday || '-';
            const wednesday = entry.wednesday || '-';
            const thursday = entry.thursday || '-';
            const friday = entry.friday || '-';
            const saturday = entry.saturday || '-';

            rows.push([lectureNo, monday, tuesday, wednesday, thursday, friday, saturday]);
        });

        // Manually draw the table with adjusted column widths and row heights
        const columnWidths = [20, 25, 25, 25, 25, 25, 25]; // Adjusted column widths
        const rowHeight = 8; // Adjusted row height
        const lineWidth = 0.1; // Border line width

        // Draw column headers with adjusted widths
        pdf.setLineWidth(lineWidth);
        pdf.setFontStyle('bold');
        columnHeaders.forEach((header, index) => {
            pdf.rect(10 + index * 25, startY, columnWidths[index], rowHeight, 'S');
            pdf.text(header, 10 + index * 25 + 2, startY + rowHeight / 2 + 2, { align: 'left', valign: 'middle' });
        });

        pdf.setFontStyle('normal');
        startY += rowHeight;

        // Draw table content with adjusted widths and heights
        rows.forEach(row => {
            row.forEach((cell, index) => {
                pdf.rect(10 + index * 25, startY, columnWidths[index], rowHeight, 'S');
                pdf.text(cell.toString(), 10 + index * 25 + 2, startY + rowHeight / 2 + 2, { align: 'left', valign: 'middle' });
            });
            startY += rowHeight;
        });

        pdf.save('timetable_report.pdf');
        showAlert('success','Timetable Downloaded Successfully')
    } catch (error) {
        console.error('Error fetching or processing timetable data:', error);
    }
});

// Fetch timetable data asynchronously (replace this with your actual data fetching logic)
async function fetchTimetableData() {
    try {
        const response = await fetch(`/display-table?username=${tableName}`); // Adjust URL as needed
        if (!response.ok) {
            throw new Error('Failed to fetch timetable data');
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching timetable data:', error);
        throw error;
    }
}
