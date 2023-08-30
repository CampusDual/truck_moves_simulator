const express = require("express");
const app = express();
const PORT = 5000;

app.use(express.json())
let volume = 0
let csv = [];
let truck_inside = []
const header = ['dev', 'date', 'scan_volume', 'plate', 'height', 'width', 'length', 'trailer_plate', 'delivery_note', 'volume'];
app.post("/", (request, response) => {
    // console.log(request.body);
    const data = request.body;
    const { dev, scan_volume, date, plate } = data;
    if (dev.includes("IN")) {
        volume += scan_volume;
        truck_inside.push(plate);
    } else {
        volume -= scan_volume;
        if (truck_inside.includes(plate)) {
            truck_inside = truck_inside.filter(t => t != plate);
            console.table({ output: plate })
        } else {
            console.warn(`Detected truck output without entrance: ${plate}`)
        }
    }
    csv.push({ ...data, volume })
    console.table([{ dev, scan_volume, volume, date, plate }])

    response.send("OK");
});

app.get("/clear", (req, res) => { csv = []; res.send('ok') })
app.get("/csv", (req, res) => {
    let csv_text = `${header.join(";")}\n${csv
        .map(x => header
            .map(y => x[y])
            .join(";")
        )
        .join("\n")}`
    res.header("Content-Type", "text/plain");
    res.send(csv_text)
});
app.get("/get_trucks_in", (req, res) => {
    res.json(truck_inside)
})

app.listen(PORT, "0.0.0.0", () => {
    console.log(`Listen on the port ${PORT}...`);
});