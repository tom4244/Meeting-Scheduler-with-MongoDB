import React from "react";
import { PropTypes } from "prop-types";
import axios from "axios";
import "./styles/userPage.scss";

class ListClasses extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      enteredIDs: "",
      IDsToCancel: [],
      showPastBtnText: "See Past Meetings",
      pastClassList: [],
      displayPastClasses: false,
      attendees: "",
      activeClassIDs: [],
      intervalID: 0,
      timeoutID: 0,
    };

    this.handleChange = this.handleChange.bind(this);
    this.handleSelect = this.handleSelect.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.cancelClasses = this.cancelClasses.bind(this);
    this.handlePastClassesChoice = this.handlePastClassesChoice.bind(this);
    this.getPastClassList = this.getPastClassList.bind(this);
    this.updatePastClassList = this.updatePastClassList.bind(this);
  }

  componentDidMount() {
    this.state.timeoutID = setTimeout(() => {
      this.props.getClassList(this.props.user);
      this.updatePastClassList(this.props.user);
    }, 0);
    if (this.props.classList.length !== 0) {
      this.props.isMeetingOnNow(this.props.classList);
    }

    this.state.intervalID = setInterval(() => {
      this.props.getClassList(this.props.user);
      this.updatePastClassList(this.props.user);
      if (this.props.classList.length !== 0) {
        this.props.isMeetingOnNow(this.props.classList);
      }
    }, 60000);
  }

  componentWillUnmount() {
    clearInterval(this.state.intervalID);
    clearTimeout(this.state.timeoutID);
  }

  //Handler for number input field by Select button
  handleChange(event) {
    this.setState({ enteredIDs: event.target.value });
  }

  //Handler for Select button
  handleSelect(event) {
    event.preventDefault();
    const selectedIDs = this.state.enteredIDs
      .split(",");
    this.setState({ IDsToCancel: selectedIDs });
    const firstItem = selectedIDs[0];
    let mtgAttendees = "";
    if (this.state.displayPastClasses) {
      mtgAttendees = this.state.pastClassList.find(
        ({ id }) => id === firstItem
      );
    } else {
      mtgAttendees = this.props.classList.find(({ id }) => id === firstItem)
    }
    if (mtgAttendees) {
      this.setState({ attendees: mtgAttendees.mtg_requester + ", " + mtgAttendees.students_string });
    } else {
      this.setState({ attendees: "meeting ID not found" });
    }
  }

  //Handler for Cancel Meetings button
  async handleSubmit(event) {
    event.preventDefault();
    try {
      this.props.resetLRButtonColor();
      let msg = await this.cancelClasses(this.state.IDsToCancel);
      console.log(
        "Cancelled meetings: ",
        this.state.IDsToCancel,
        "  msg: ",
        msg
      );
	  // Try using a change of state here to force the update
	  // forceUpdate();  "not defined"
    } catch (errors) {
      console.log("Error cancelling meetings: ", errors);
    }
    try {
      await this.props.getClassList(this.props.user);
    } catch (errors) {
      console.log("Error updating classList after cancellations  ", errors);
    }
    this.setState({
      enteredIDs: "",
      IDsToCancel: [],
      attendees: "",
    });
  }

  cancelClasses(IDsToCancel) {
    console.log("IDsToCancel: ", IDsToCancel, "  this.state.IDsToCancel: ", this.state.IDsToCancel);
    return axios.post("/api/cancellations", this.state.IDsToCancel);
  }

  handlePastClassesChoice(event) {
    if (this.state.showPastBtnText == "See Past Meetings") {
      this.setState({
        displayPastClasses: true,
        showPastBtnText: "See Upcoming Meetings",
      });
    } else {
      this.setState({
        displayPastClasses: false,
        showPastBtnText: "See Past Meetings",
      });
    }
  }

  getPastClassList(user) {
    return axios.get(`/api/pastClasses/${user}`);
  }

  updatePastClassList(user) {
    this.getPastClassList(user)
      // See if it is time for the first (soonest) class
      .then((classes) => {
        //if (classes.data.sessions && classes.data.sessions_list.length != 0) {
        if (classes.data.sessions_list.length != 0) {
          this.setState({ pastClassList: classes.data.sessions_list });
        }
      })
      .catch((errors) => {
        console.log("Error in updatePastClassList in ListClasses.js: ", errors);
      });
  }
	render() {
    return (
      <div className='classList'>
        <div className='showPastDiv'>
          <h3>
            {this.state.displayPastClasses
              ? ""
              : this.props.timeForClass
              ? "Time for your meeting!"
              : ""}
          </h3>
          <p className='p5'>
            <strong>
              {!this.state.displayPastClasses ? "Upcoming" : "Past"} Meetings
            </strong>
          </p>
          <button className='buttonRounded140'
            onClick={this.handlePastClassesChoice}
          >
            {this.state.showPastBtnText}
          </button>
        </div>
        <ClassTable
          classesList={
            !this.state.displayPastClasses
              ? this.props.classList
              : this.state.pastClassList
          }
          style={{ overflow: "scroll" }}
          IDsToCancel={this.state.IDsToCancel}
          timeForClass={this.props.timeForClass}
          activeClassIDs={this.props.activeClassIDs}
          conflictIDNumbers={this.props.conflictIDNumbers}
			    UTCtoLocal={this.props.UTCtoLocal}
        />

        <p className='p3'>
          <b>To see attendees for a meeting:</b> Enter the meeting ID number below and click
          "Select". The person scheduling the meeting is listed first.
          <br />
          <br />
          <b>To delete meetings from the schedule:</b> Enter ID numbers separated by
          commas or copy and paste to the entry box with the mouse and click "Select". ID numbers will be highlighted in
          <span className='p3Red'> red</span>. After verifying meetings to be deleted, click "Cancel Meetings" to delete them.
        </p>

        <form onSubmit={this.handleSubmit} className='formRow'>
          <input
            onChange={this.handleChange}
            value={this.state.enteredIDs}
            id="deleteIDs"
            type="text"
          />
          <button className='buttonRounded2020'
           onClick={this.handleSelect}
            style={{ height: "36px", width: "60px" }}
          >
            Select
          </button>
          <br />
          {(this.state.IDsToCancel.length !== 0) 
            ? <p className='p3'> Meeting {this.state.IDsToCancel[0]} attendees:{" "} {this.state.attendees} </p>
            : <p>  </p>
          }
          <div className='vSpace10px' />
          <button className='buttonRounded140'
            type="submit"
          >Cancel Meetings</button>
        </form>
      </div>
    );
  }
}

class ClassTable extends React.Component {
  constructor(props) {
    super(props);

    this.dtStringFormat = this.dtStringFormat.bind(this);
    this.getWeekday = this.getWeekday.bind(this);
  }
  
	dtStringFormat(dtString) {
      const local = new Date(dtString);
	  const options = { timeZone: 'America/New_York' };
	  const timestring = local.toLocaleString("en-US", options);
	  let formatted_time = timestring.slice(-11, -6) + (timestring.slice(-2) === 'AM' ? ' a.m.' : ' p.m.');
	  if ((formatted_time === '0.00 a.m.')  || (formatted_time === '12:00 a.m.')) {
		return 'midnight';
	  }
	  else if (formatted_time === '12:00 p.m.'){
		return 'noon';
	  }
	  else {
      return formatted_time;
	  }
  }

  getWeekday(dateString) {
    const local = new Date(dateString);
		const options = { timeZone: 'America/New_York', weekday: "long" };
    return local.toLocaleDateString("en-US", options);
  }

  render() {
    let {
      classesList,
      IDsToCancel,
      timeForClass,
      activeClassIDs,
      conflictIDNumbers,
    } = this.props;

    const nt_header = [
      <React.Fragment key={"fragmentHdr"}>
        <div className='tRow' key={"IDRow"}>
          <div className='tWord' key={"IDhdr"} style={{ flexBasis: "120px" }}>
            ID
          </div>
        </div>
        <div className='tRow' key={"wkdyRow"}>
          <div className='tWord' key={"wkdyhdr"} style={{ flexBasis: "120px" }}>
            Weekday
          </div>
        </div>
        <div className='tRow' key={"dtRow"}>
          <div className='tWord' key={"dthdr"} >
            Date
          </div>
        </div>
        <div className='tRow' key={"timeRow"}>
          <div className='tWord' key={"timehdr"} style={{ flexBasis: "120px" }}>
            Time
          </div>
        </div>
        <div className='tRow' key={"untilRow"}>
          <div className='tWord' key={"untilhdr"} style={{ flexBasis: "120px" }}>
            Until
          </div>
        </div>
        <div className='tRow' key={"weekRow"}>
          <div className='tWord' key={"weekhdr"} style={{ flexBasis: "120px" }}>
            Week
          </div>
        </div>
        <div className='tRow' key={"subjRow"}>
          <div className='tWord' key={"subjhdr"} style={{ flexBasis: "120px" }}>
            Topic
          </div>
        </div>
      </React.Fragment>,
    ];

    if (this.props.classesList.length != 0) {
	  let nt_rows = {};
      nt_rows = this.props.classesList.map((row) => (
        <div className='column' key={"column".concat(row.class_datetime)}>
          <div className='tRow'
            key={"IDrow".concat(row._id)}
            style={{
              color: this.props.IDsToCancel.includes(row.id)
                ? "red"
                : conflictIDNumbers.includes(row.id)
                ? "orange"
                : activeClassIDs.includes(row.id) && this.timeForClass
                ? "springgreen"
                : "blue",
            }}
          >
            <div className='tWord' key={"IDword".concat(row._id)} style={{ flexBasis: "160px" }}>
              {row.id}
            </div>
          </div>
          <div className='tRow' key={"Weekday" + row._id * 10}>
            <div className='tWord' key={"wkdy" + row.weekday} style={{ flexBasis: "120px" }}>
              {this.getWeekday(row.class_datetime)}
            </div>
          </div>
          <div className='tRow' key={"Date" + row._id * 10}>
            <div className='tWord'
              key={"dt" + row.class_datetime}
              style={{ flexBasis: "120px" }}
            >
              {this.props.UTCtoLocal(row.class_datetime).slice(0, 10)}
            </div>
          </div>
          <div className='tRow' key={"Time" + row._id * 10}>
            <div className='tWord'
              key={"time" + row.class_datetime.slice(-13)}
              style={{ flexBasis: "100px" }}
            >
              {this.dtStringFormat(row.class_datetime)}
            </div>
          </div>
          <div className='tRow' key={"Until" + row._id * 10}>
            <div className='tWord'
              key={"until" + row.endtime.substring(0, 5)}
              style={{ flexBasis: "100px" }}
            >
              {this.dtStringFormat(row.endtime)}
            </div>
          </div>
          <div className='tRow' key={"Week" + row._id * 10}>
            <div className='tWord' key={"week" + row.week_number} style={{ flexBasis: "80px" }}>
              {row.week_number + " of " + row.number_of_weeks}
            </div>
          </div>
          <div className='tRow' key={"Topic" + row._id * 10}>
            <div className='tWord' key={"subj" + row.mtg_types} style={{ flexBasis: "120px" }}>
              {row.mtg_types}
            </div>
          </div>
        </div>
      ));

      return (
        <div className='row' key={"row"}>
          <div className='column' key={"column"}>{nt_header}</div>
          <div className='row' key={"ntrow"} style={{ flexWrap: "wrap" }}>
            {nt_rows}
          </div>
        </div>
      );
    } else {
      return null;
    }
  }
}

export default ListClasses;

