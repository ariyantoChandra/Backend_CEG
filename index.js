import express from "express";

const app = express();
app.use(express.json());

app.get("/", (req,res) => {
    res.status(200).json({
        message: "IZINNNN"
    })
})

app.listen(() =>
{
    console.log(`Run at http://localhost:5000`);
});