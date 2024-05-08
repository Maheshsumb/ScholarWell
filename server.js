const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const knex = require('knex');
process.env.TZ = 'UTC'; // Set timezone to UTC
const port = process.env.PORT || 3000;

// Your Node.js application code here

const db = knex({
    client: 'pg',
    connection: {
        host: 'localhost',
        user: 'postgres',
        password: '9823',
        database: 'logininfo'
    }
})


const app = express();
const session = require('express-session');
const { start } = require('repl');
let intialPath = path.join(__dirname, "public");

app.use(bodyParser.json());
app.use(express.static(intialPath));

app.get('/', (req, res) => {
    res.sendFile(path.join(intialPath, "home.html"));
})

app.get('/login', (req, res) => {
    res.sendFile(path.join(intialPath, "login.html"));
})

app.get('/register', (req, res) => {
    res.sendFile(path.join(intialPath, "register.html"));
})
app.get('/about', (req, res) => {
    res.sendFile(path.join(intialPath, "about.html"));
})

app.post('/register-user', (req, res) => {
    const { name, lname, email, phone, username, password } = req.body;

    if (!name.length || !lname || !email.length || !password.length || !phone.length || !username.length) {
        res.json('fill all the fields');
    } else {
        db("pbl_user").insert({
            name: name,
            lname: lname,
            email: email,
            phone: phone,
            password: password,
            username: username
        })
            .returning(["name", "email", "username"])
            .then(data => {
                res.json(data[0])
            })
            .catch(err => {
                if (err.detail.includes('already exists')) {
                    res.json('Email or Phone already exists');
                }
            })
    }
})

app.post('/login-user', (req, res) => {
    const { email, password } = req.body;

    db.select('name', 'email', 'username')
        .from('pbl_user ')
        .where({
            email: email,
            password: password
        })
        .then(data => {
            if (data.length) {
                res.json(data[0]);

            } else {
                res.json('email or password is incorrect');
            }
        })
})
// Add a route to handle table creation
app.post('/create-table', (req, res) => {
    const tableName = req.query.tableName;

    // Check if the table already exists
    db.schema.hasTable(tableName)
        .then(tableExists => {
            if (tableExists) {
                res.json({ error: 'Sorry! Table already exists you can add lecture' });
            } else {
                // Create the table if it doesn't exist
                db.schema.createTable(tableName, table => {
                    table.increments('id');
                    table.integer('lecture_no').unique();
                    table.string('monday');
                    table.string('tuesday');
                    table.string('wednesday');
                    table.string('thursday');
                    table.string('friday');
                    table.string('saturday');
                })

                    .then(() => {
                        res.json({ message: 'Table created successfully' });
                    })
                    .catch(error => {
                        res.json({ error: 'Error creating table' });
                    });
            }
        })
        .catch(error => {
            res.json({ error: 'Error checking table existence' });
        });
});

// Add a route to handle displaying the table
app.get('/display-table', (req, res) => {
    const username = req.query.username;
    // Check if the table exists
    db.schema.hasTable(username).then(tableExists => {
        if (tableExists) {
            // Fetch data from the table
            db(username).select('*').then(data => {
                res.json(data);
            }).catch(error => {
                res.json({ error: 'Error fetching data from table' });
            });
        } else {
            res.json({ error: 'Table does not exist' });
        }
    }).catch(error => {
        res.json({ error: 'Error checking table existence' });
    });
});
// Add a route to handle deleting the table
app.delete('/delete-table', (req, res) => {
    const username = req.query.username;

    // Check if the table exists
    db.schema.hasTable(username).then(tableExists => {
        if (tableExists) {
            // Delete the table
            db.schema.dropTable(username)
                .then(() => {
                    res.json({ message: 'Table deleted successfully' });
                })
                .catch(error => {
                    res.json({ error: 'Error deleting table' });
                });
        } else {
            res.json({ error: 'Table does not exist' });
        }
    }).catch(error => {
        res.json({ error: 'Error checking table existence' });
    });
});
// Add a route to handle adding an entry
app.post('/add-entry', (req, res) => {
    const username = req.query.username;
    const { lectureNo, monday, tuesday, wednesday, thursday, friday, saturday } = req.body;

    // Insert the entry into the database
    db(username).insert({
        lecture_no: lectureNo,
        monday: monday,
        tuesday: tuesday,
        wednesday: wednesday,
        thursday: thursday,
        friday: friday,
        saturday: saturday
    })
        .then(() => {
            res.json({ message: 'Entry added successfully' });
        })
        .catch(error => {
            res.json({ error: 'Error adding entry' });
        });
});
app.delete('/delete-entry', (req, res) => {
    const { entryId, tableName } = req.query;

    // Check if entryId and tableName are provided
    if (!entryId || !tableName) {
        return res.status(400).json({ error: 'EntryId or tableName is missing' });
    }

    // Perform deletion of the entry with the specified entryId from the provided tableName
    db(tableName)
        .where({ id: entryId })
        .del()
        .then(numDeleted => {
            if (numDeleted > 0) {
                res.json({ message: 'Entry deleted successfully' });
            } else {
                res.status(404).json({ error: 'Entry not found' });
            }
        })
        .catch(error => {
            console.error('Error deleting entry:', error);
            res.status(500).json({ error: 'Internal server error' });
        });
});
app.post('/create-sleep-table', (req, res) => {
    const tableName = req.query.tableName;

    // Check if the table already exists
    db.schema.hasTable(tableName)
        .then(tableExists => {
            if (tableExists) {
                res.json({ error: 'Sorry! Sleep table already exists' });
            } else {
                // Create the sleep table if it doesn't exist
                db.schema.createTable(tableName, table => {
                    table.increments('id');
                    table.date('date');
                    table.float('sleep_hours');
                })
                    .then(() => {
                        res.json({ message: 'Sleep table created successfully' });
                    })
                    .catch(error => {
                        res.json({ error: 'Error creating sleep table' });
                    });
            }
        })
        .catch(error => {
            res.json({ error: 'Error checking sleep table existence' });
        });
});
// Added a route to handle adding sleep data
app.post('/add-sleep-data', (req, res) => {
    const tableName = req.query.tableName;
    const { date, sleep_hours } = req.body;

    // Check if the date already exists for the user
    db(tableName)
        .where({ date: date })
        .then(existingData => {
            if (existingData.length > 0) {
                res.json({ error: 'Sleep data for this date already exists' });
            } else {
                // Insert the sleep data into the database
                db(tableName).insert({
                    date: date,
                    sleep_hours: sleep_hours
                })
                    .then(() => {
                        res.json({ message: 'Sleep data added successfully' });
                    })
                    .catch(error => {
                        res.json({ error: 'Error adding sleep data' });
                    });
            }
        })
        .catch(error => {
            res.json({ error: 'Error checking existing sleep data' });
        });
});
// Add a route to handle fetching sleep data
app.get('/fetch-sleep-data', (req, res) => {
    const tableName = req.query.tableName;

    // Check if the table exists
    db.schema.hasTable(tableName)
        .then(tableExists => {
            if (tableExists) {
                // If the table exists, fetch data from it
                db(tableName)
                    .select('*')
                    .then(data => {
                        res.json(data);
                    })
                    .catch(error => {
                        console.error('Error:', error);
                        res.json({ error: 'Error fetching sleep data' });
                    });
            } else {
                // If the table does not exist, respond accordingly
                res.json({ error: 'Table does not exist' });
            }
        })
        .catch(error => {
            console.error('Error:', error);
            res.json({ error: 'Error checking table existence' });
        });
});


// Add a route to handle deleting a sleep entry
app.delete('/delete-sleep-entry', (req, res) => {
    const { entryId, tableName } = req.query;
    // Check if entryId and tableName are provided
    if (!entryId || !tableName) {
        return res.status(400).json({ error: 'EntryId or tableName is missing' });
    }
    db(tableName)
        .where('id', entryId)
        .del()
        .then(numDeleted => {
            if (numDeleted > 0) {
                res.sendStatus(200); // Entry deleted successfully
            } else {
                res.status(404).send('Entry not found');
            }
        })
        .catch(error => {
            console.error('Error deleting entry:', error);
            res.status(500).send('Internal server error');
        });
});
// Add a route to handle fetching sleep data
app.get('/fetch-sleep-data-suggestion', (req, res) => {
    const tableName = req.query.tableName;
    const date = req.query.date;
    db(tableName)
        .select('sleep_hours')
        .where('date', date)
        .then(data => {
            res.json(data);
        })
        .catch(error => {
            console.error('Error:', error);
            res.status(500).json({ error: 'Error fetching sleep data' });
        });
});



app.listen(port, (req, res) => {
    console.log('listening on port 3000......')
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    console.log('Current Timezone ' + timeZone);
})
