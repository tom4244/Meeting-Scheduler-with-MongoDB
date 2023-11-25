import React from "react";
import { useNavigate } from "react-router-dom";
import "./styles/home.scss";

const WhtBdButton = () => (
  <RoundedButton
    onClick={() => { navigate('/whiteboard') }}>
    Whiteboard 
  </RoundedButton>
)

const Home = () => {
  const navigate = useNavigate();
		return (
    	<div className='home'>
	      <div className='titlesDiv'>
		       <h3 className='h3'>Meeting Scheduler</h3>
	         <div className='text' style={{margin: 0}}>Keep track of multiple meetings or classes</div>
	      </div>
    	  <SchedulerIntro />
    	</div>
    );
}

export default Home;

const SchedulerIntro = () => (
	<div className='schedulerIntro'>
	  <div className='meetingImg'/>
	  <MeetingText/> 
	</div>
)	

const MeetingText = () => (
	<div className='homecolumn'>
	  <div className='text'>
	  * <strong>Meetings</strong> can be scheduled with participants selected from menus. <br/>* Participants can <strong>view schedules</strong> of all past and future meetings that include them.<br/>* An online real-time <strong>whiteboard</strong> is simultaneously available to all users.
	  </div>
	  <br/><br/>
	  <div className='smalltext'>
	    Try it by logging in as "bill" with password "bb".	
	  </div>
	</div>
)



	
