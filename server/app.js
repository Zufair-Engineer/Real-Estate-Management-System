import express from "express"
const app = express();

app.use(express.json());
app.use(express.urlencoded({extended: true}));

app.get('/',(req , res) => {
    res.send("Hi zufair this is Simple Website frame")
})

export default app;