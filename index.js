var express = require('express');
const app = express()

// Enable CORS.
var cors = require('cors');
app.use(cors({optionsSuccessStatus: 200}));


// Listen to port.
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server listening on ${PORT}`);
});

// Middleware.
app.use('/public', express.static(__dirname + '/public'));

// Routes.
app.get('/', (req, res) => {
    absolutePath = __dirname + '/views/index.html';
    res.sendFile(absolutePath);
});