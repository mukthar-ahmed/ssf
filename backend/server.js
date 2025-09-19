const express = require('express');
const { PORT } = require('./config/index');
const dbConnect = require('./database/index');
const router = require('./routes/index');
const errorHandler = require('./middleware/errorHandler');
const cookieParser = require('cookie-parser');
const cors = require('cors');

const app = express();

app.use(cookieParser());
//payload size limits
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ limit: "2mb", extended: true }));


// app.use(
//     cors({
//         origin: function (origin, callback) {
//             return callback(null, true);
//         },
//         optionsSuccessStatus: 200,
//         credentials: true,
//     })
// );
app.use(
    cors({
        origin: [
            "https://ssf.vercel.app",   // your deployed frontend on Vercel
            "http://localhost:3000"     // keep for local development
        ],
        credentials: true,
    })
);


app.use(express.json());

app.use(router);

dbConnect();

app.use(errorHandler);

app.listen(PORT, () => {
    console.log(`the app is running on port http://localhost:${PORT}`);
});