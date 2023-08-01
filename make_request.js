const axios = require("axios");
const { error } = require("console");
const fs = require('fs');
require('dotenv').config()
const readline = require("readline");


const req_files = fs.readdirSync("./requests/").sort();
const rl = readline.createInterface(process.stdin, process.stdout);

console.log(process.env.POST_URL)
const delay = (t) => new Promise((resolve) => { setTimeout(() => { resolve(); }, t) })

function getAction() {
    const banner = (`Press ENTER to perform a single request.
Press 'm' to perform a request every minute.
Press 's' to perform a request every second.
Press 'e' to exit.`);
    return new Promise((resolve) => {
        rl.question(banner, (opt) => { return resolve(opt) })
    });
}

function performRequest(file) {
    console.log(`performRequest ${file}`)
    try {
        const data = fs.readFileSync(`requests/${file}`);
        return axios.post(process.env.POST_URL,
            data,
            {
                headers: {
                    'Content-type': "application/json",
                    'Authorization': `Basic ${(new Buffer.from(`${process.env.WS_USER}:${process.env.WS_PASS}`)).toString("base64")}`
                }
            }
        )
            .then(res => console.log({ file, status: res.status, body: res.data }))
            .catch(err => console.log({ err, file }))
    } catch (error) {
        console.log(error)
        return Promise.reject(error)
    }
}
function performNextRequest() {
    // console.log("performNextRequest")
    if (!req_files.length) {
        console.warn("No more requests.")
        process.exit(0);
    }
    const file = req_files.shift();
    // console.log(file);
    return performRequest(file);
}


function performEvery(interval_s) {
    return performNextRequest()
        .catch(err => console.log(err))
        .then(_ => delay(interval_s * 1000))
        .then(_ => performEvery(interval_s))

}
async function main() {
    while (true) {
        const cmd = await getAction();
        switch (cmd.toLocaleLowerCase()) {
            case 'e':
                process.exit(0);
            case 'm':
                await performEvery(60);
                break;
            case 's':
                await performEvery(1);
                break;
            case 'c':
                await performEvery(0);
                break;
            case '':
                await performNextRequest();
                break;
            default:
                console.log(`Unknown option ${cmd}`)
                break;
        }
    }
}

// async function main() {
//     await performEvery(5);
// };

main();