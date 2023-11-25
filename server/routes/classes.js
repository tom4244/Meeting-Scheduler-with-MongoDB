import express from 'express';
const MongoClient = require('mongodb').MongoClient;
const uri = "mongodb://127.0.0.1:27017";
let client;
let router = express.Router();

function getDayNumber(weekday) {
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  for (let dayNumber in dayNames) {
	if (weekday === dayNames[dayNumber]) {
	  return dayNumber;
    }
  }
}

function calcDayInterval(weekday, lastWeekday) {
  let diff = getDayNumber(weekday) - getDayNumber(lastWeekday);
	return(diff > 0 ? diff : diff + 7)
}

router.post('/', async(req, res) => {
  let { created_at, mtg_types, number_of_weeks, selected_weekdays, weekdaysString, classDate, classMonth, classWeekday, classYear, classHour, classMinutes, classAMPM, classEndHour, classEndMinutes, classEndAMPM, students_string, first_names_string, user, timezoneOffset, classFirstDay, classEndTime } = req.body;
  // Dates and times will be saved in the database in UTC timezone regardless of their origin, 
  //   then later converted to the proper local timezone in the client
  let addPMHours = (classAMPM == 'p.m.') ? 12 : 0;	
  let classHourAMPM = ((classHour === 12) ? 0 : classHour) + addPMHours;
  // time is part of the 'date' column in timestamptz format
  let firstDay = new Date(classFirstDay);	
  let endTime = new Date(classEndTime);
  // let thisClassDay = new Date(classFirstDay);
  let lastDate = new Date(classFirstDay).getDate();
  let hoursInterval = endTime.getHours() - firstDay.getHours();
  if (hoursInterval < 0) {
		hoursInterval = hoursInterval + 24;
  }
  let docToSave = {};
  let week_number = 0;
  let date = "";
  // Subsequent meetings are calculated based on selected weekdays and number of weeks
  // Rotate the list of weekdays as needed so that dates start with the correct first weekday
  let dayOrder = selected_weekdays;
  if (dayOrder[0] !== classWeekday) {
    do {
      dayOrder.push(dayOrder.shift());
    } while (dayOrder[0] !== classWeekday)
  }
  let lastWeekday = dayOrder[0];
  const numberOfMtgs = number_of_weeks * selected_weekdays.length;
  // Make an entry line for each meeting date
  do {
	week_number += 1;
    for (let weekday of dayOrder)  {
	  const dayInterval = calcDayInterval(weekday, lastWeekday);
	  let thisClassDay = new Date(classFirstDay);
	  if ((week_number !== 1)||(weekday !== dayOrder[0])) {
        thisClassDay.setDate(lastDate + dayInterval);
	  }
	  let weekday_endtime = new Date(thisClassDay);
	  weekday_endtime.setHours(thisClassDay.getHours() + hoursInterval);
	  weekday_endtime.setMinutes(classEndMinutes);
	  // make a unique Date object so that each one doesn't equal the newest since it's call by reference
      lastWeekday = weekday;
	  let lastDate = thisClassDay.getDate();

      // Find meeting number by counting that day's meetings
      // For each day, meetings are numbered for this 
      // meeting requester
      let mtgscount = 0; 
      try {
        client = new MongoClient(uri);
        await client.connect();
        const database = client.db('meetings');
        const session = database.collection('session');
        let daybegin = new Date(classFirstDay);
        let dayend = new Date(classFirstDay);
		daybegin.setHours(0,0,0);
        dayend.setDate(daybegin.getDate() + 1);
		dayend.setHours(0,0,0);
        const query = {$and: [{'mtg_requester': req.body.user}, {'class_datetime': { $gte: daybegin, $lt: dayend }}]};
        mtgscount = await session.countDocuments(query);
      } catch (error) {
          console.log("Caught error in classes.js get :user: ", error);
          error => res.status(500).json({ error: error});
      } finally {
          await client.close();
      }
      // _id for this meeting is the meeting date 
	  // plus the next meeting number from mtgscount + 1
	  const year = thisClassDay.getFullYear().toString();
	  let month = (thisClassDay.getMonth() + 1).toString();
	  if (month.length === 1) {month = '0' + month};
	  let dateday = thisClassDay.getDate().toString();
	  if (dateday.length === 1) {dateday = '0' + dateday};
      const date = year + month + dateday; 
      const mtg_id = date + '_' + (mtgscount + 1).toString(); 
       console.log("mtg_id: ", mtg_id);

      docToSave = { "id": mtg_id, "created_at": created_at, "mtg_types": mtg_types, "students_string": students_string, "first_names_string": first_names_string, "weekday": weekday, "class_datetime": thisClassDay, "endtime": weekday_endtime, "week_number": week_number, "number_of_weeks": number_of_weeks, "selected_weekdays": weekdaysString, "mtg_requester": user };
    }
  } while (week_number < number_of_weeks);


  try {
    client = new MongoClient(uri);
	await client.connect();
    const database = client.db('meetings');
    const session = database.collection('session');
    const result = await session.insertOne(docToSave);
	res.json({success: true, msg: result });
  } catch (error) {
      console.log("Caught error in classes.js insert docToSave: ", error);
  } finally {
      client.close();
  }
});

router.get('/:user', async(req, res) => {
  let sessions = {};
  try {
    client = new MongoClient(uri);
    await client.connect();
    const database = client.db('meetings');
    const session = database.collection('session');
	const query = {$and: [{$or: [{'mtg_requester': req.params.user}, {students_string: {$regex: req.params.user}}]}, {endtime: {$gte: new Date()}}]};
    const cursor = session.find(query);
    sessions = await cursor.toArray();
    res.json({sessions});
  } catch (error) {
      console.log("Caught error in classes.js get :user: ", error);
      error => res.status(500).json({ error: error});
  } finally {
      await client.close();
  }
});

export default router;

