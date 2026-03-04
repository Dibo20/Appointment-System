const http = require('http');
const fs = require('fs');
const querystring = require('querystring');

const DATA_FILE = 'appointments.json';

const timeSlots = [
    "09:00", "09:30", "10:00", "10:30",
    "11:00", "11:30", "12:00"
];

let appointments = [];
if (fs.existsSync(DATA_FILE)) {
    appointments = JSON.parse(fs.readFileSync(DATA_FILE));
}

const server = http.createServer((req, res) => {

    if (req.method === 'GET' && req.url === '/') {
        fs.readFile('index.html', (err, data) => {
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(data);
        });
    }

    else if (req.method === 'GET' && req.url === '/times') {
        const booked = appointments.map(a => a.time);
        const available = timeSlots.filter(t => !booked.includes(t));

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(available));
    }

    else if (req.method === 'POST' && req.url === '/book') {
        let body = '';

        req.on('data', chunk => body += chunk.toString());

        req.on('end', () => {
            const data = querystring.parse(body);

            if (!data.name || !data.id || !data.time) {
                res.writeHead(400);
                return res.end('❌ بيانات ناقصة');
            }

            const exists = appointments.find(a => a.time === data.time);
            if (exists) {
                res.writeHead(400);
                return res.end('❌ الموعد محجوز');
            }

            appointments.push({
                name: data.name,
                id: data.id,
                time: data.time
            });

            fs.writeFileSync(DATA_FILE, JSON.stringify(appointments, null, 2));

            res.writeHead(200);
            res.end('✅ تم الحجز');
        });
    }

    else if (req.method === 'GET' && req.url === '/admin') {
        let html = "<h2>الحجوزات</h2>";

        appointments.forEach(a => {
            html += `<p>${a.name} - ${a.id} - ${a.time}</p>`;
        });

        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(html);
    }

});

const PORT = process.env.PORT || 3000;
server.listen(PORT, '0.0.0.0', () => {
    console.log('Running...');
});
