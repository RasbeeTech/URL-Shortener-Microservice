require('dotenv').config();
var express = require('express');
var bodyParser = require("body-parser");
var mongoose = require('mongoose');
var cors = require('cors');
const app = express();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

// DB Schema.
const Schema = mongoose.Schema;

const urlSchema = new Schema({
    original_url: {type: String, required: true},
    short_url: {type: Number}
});

// Create DB model.
let Urls = mongoose.model("url", urlSchema);

// DB methods.
const findOrCreateUrl = (originalURL, done) => {
    // Counts number of entries.
    Urls.countDocuments({}, (err, count) => {
        if(err) return console.error(err);
        // Use number for the short url.
        let shortUrl = count;
        
        // Check if entry already exists.
        Urls.findOne({original_url: originalURL}, (err, foundUrl) => {
            if(err) return console.error(err);
            // Creates new entry if it does NOT already exist;
            if(!foundUrl){
                let newURL = new Urls({
                    original_url: originalURL,
                    short_url: shortUrl
                });
                newURL.save((err) => {
                    if(err) return console.error(err);
                    done(null, newURL);
                });
            } else {
                done(null, foundUrl);
            }
        });
    });
};

// Listen to port.
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server listening on ${PORT}`);
});

// Middleware.
app.use('/public', express.static(__dirname + '/public'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors({optionsSuccessStatus: 200}));

// Routes.
app.get('/', (req, res) => {
    absolutePath = __dirname + '/views/index.html';
    res.sendFile(absolutePath);
});

// checks if url is valid.
function validURL(str) {
    return /^(?:(?:(?:https?|ftp):)?\/\/)(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})))(?::\d{2,5})?(?:[/?#]\S*)?$/i.test(str);
}

app.post('/api/shorturl', (req, res) => {
    // parse request body.
    let { url } = req.body;
    // Checks if url is valid before finding or create MongoDB entry.
    if(validURL(url)){
        findOrCreateUrl(url, (err, data) => {
            if(err) console.error(err);
            res.json({
                original_url: data.original_url,
                short_url: data.short_url
            });
        });
    } else {
        // Returns an error in case of invalid url formats.
        res.json({
            error: "Invalid URL"
        });
    }
});

app.get('/api/shorturl/:shorturl?', (req, res) => {
    let { shorturl } = req.params;
    Urls.findOne({short_url: Number(shorturl)}, (err, foundUrl) => {
        if(err) return console.error(err);
        if(foundUrl){
            res.redirect(foundUrl.original_url);
        } else {
            res.json({
                error: "No short URL found for the given input"
            });
        }
        
    });
});