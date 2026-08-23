const fs = require('fs');

let file = fs.readFileSync('artifacts/api-server/src/routes/ticketing.ts', 'utf8');

const oldReturn = `    res.status(201).json({
      id: \`b-\${Date.now()}\`,
      reference,
      eventTitle: "Indian Movie",
      venue: "Mumbai Cinema",
      date: "24 Aug",
      time: "7:30 PM",
      seats: validSeats.map(s => s.id.toString()),
      total: validSeats.length * 500,
      status: "Confirmed",
      qr: qrUrl
    });`;

const newReturn = `    const showDetails = await db.select({
      eventTitle: eventsTable.title,
      venueName: venuesTable.name,
      showDate: showsTable.showDate
    }).from(showsTable)
      .innerJoin(eventsTable, eq(showsTable.eventId, eventsTable.id))
      .innerJoin(venuesTable, eq(showsTable.venueId, venuesTable.id))
      .where(eq(showsTable.id, validSeats[0].showId));

    const seatDetails = await db.select({
      row: seatLayoutsTable.row,
      number: seatLayoutsTable.number
    }).from(showSeatsTable)
      .innerJoin(seatLayoutsTable, eq(showSeatsTable.seatLayoutId, seatLayoutsTable.id))
      .where(inArray(showSeatsTable.id, validSeats.map(s => s.id)));

    const seatLabels = seatDetails.map(s => \`\${s.row}-\${s.number}\`);

    res.status(201).json({
      id: \`b-\${Date.now()}\`,
      reference,
      eventTitle: showDetails[0].eventTitle,
      venue: showDetails[0].venueName,
      date: showDetails[0].showDate.toLocaleDateString(),
      time: showDetails[0].showDate.toLocaleTimeString(),
      seats: seatLabels,
      total: finalAmount,
      status: "Confirmed",
      qr: qrUrl
    });`;

file = file.replace(oldReturn, newReturn);

// Also fix the 410 error bug so it doesn't crash the server
const oldError = `    if (validSeats.length === 0) {
      res.status(410).json({ error: "Your seat hold expired. Please choose seats again." });
    }`;

const newError = `    if (validSeats.length === 0) {
      res.status(410).json({ error: "Your seat hold expired. Please choose seats again." });
      return;
    }`;

file = file.replace(oldError, newError);

fs.writeFileSync('artifacts/api-server/src/routes/ticketing.ts', file);
console.log("POST /bookings fixed");
