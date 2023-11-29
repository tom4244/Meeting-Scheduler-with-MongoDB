import React, { useState, useEffect, useRef, useReducer } from "react";
import axios from "axios";
import AnonymousPic from "../img/userPhotos/anonymous.jpg";
import WelcomePagePic from "../img/meeting.jpg";
import "./styles/userPage.scss";
import { useAtom } from "jotai";
import { mtgTypesAtom } from "../app.js";
import { userAtom } from "../app.js";
import { userPhotoAtom } from "../app.js";

function UploadUserInfo(props) {
  const [selectedPhotoFile, setSelectedPhotoFile] = useState({});
  const [selfIntroUpdated, setSelfIntroUpdated] = useState(false);
  const [updatedIndicator, setUpdatedIndicator] = useState("");
  const [startTime, setStartTime] = useState(new Date());
  const [endTime, setEndTime] = useState(new Date());
  const [introText, setIntroText] = useState("");
  const [changedPhoto, setChangedPhoto] = useState(false);
  const [changedMtgTypes, setChangedMtgTypes] = useState(false);
  const [beginningSelfIntroText, setBeginningSelfIntroText] = useState("");
  const [mtgTypes, setMtgTypes] = useAtom(mtgTypesAtom);
  const [user, setUser] = useAtom(userAtom);
  const [userPhoto, setUserPhoto] = useAtom(userPhotoAtom);
  const tick = () => {
    setEndTime(new Date());
  };

  const getSelfIntro = (user) => {
    return axios.get(`/api/selfIntro/${user}`);
  };

  const fetchSelfIntroText = () => {
    getSelfIntro(user.username)
      .then((data) => {
				setBeginningSelfIntroText(data.data.text);
      })
      .catch((error) => console.log("Error in fetchSelfIntroText: ", error));
  };
 
  useEffect(() => {
    fetchSelfIntroText();
  }); 

  const inputRef = useRef(null);

  const handleIntroTextChange = (event) => {
    setIntroText(event.target.value);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const dataString = { user: user.username, selfIntro: introText };
    axios
      .post("/api/selfIntro", dataString)
      .then((result) => {setSelfIntroUpdated(true)})
      .catch((errors) => console.log("Errors in handleSubmit: ", errors));
  };
  
    // setMtgTypes(event.target.value);
  const handleMtgTypesChange = (event) => {
    setUser({...user, mtg_types: event.target.value});
  };

  const handleMtgTypesClick = (event) => {
    event.preventDefault();
    const dataString = { user: user.username, mtg_types: user.mtg_types };

    axios
      .post("/api/uploadMtgTypes", dataString)
      .then((result) => {
				setChangedMtgTypes(true);
      })
      .catch((errors) =>
        console.log("Errors in handleMtgTypesClick: ", errors)
      );
  };

  const importAll = (r) => {
    return r.keys().map(r);
  };

  const Fragment = React.Fragment;

  const handleChoosePhotoClick = (e) => {
	inputRef.current.click();
  };

  // The changed photo will update when the page is next loaded
  const handleImgFileChange = event => {
    const selectedPhoto = event.target.files && event.target.files[0];
	if (!selectedPhoto) {
	  return;
	}
	event.target.value = null;
	let userImgName = user.username + ".jpg";
    let formData = new FormData();
    formData.set("user", user.username);
	formData.set("name", userImgName);
    formData.set("selectedPhotoFile", selectedPhoto);
    axios
      .post("/api/uploadPhoto", formData)
      .catch((errors) => {
         console.log("Errors in handleImgFileChange: ", errors)
      });
    setChangedPhoto(true);
  }
    try {
	  setUserPhoto(require("../img/userPhotos/" + user.username + ".jpg"));
	} 
	catch(err) {
	    setUserPhoto(require("../img/userPhotos/anonymous.jpg"));
    };
	return (
	<>
    <div>
      <h2 className='h2mt0'>Personal Photo and Self-Introduction</h2>
      <div className='vSpace5px' />
      <img key={Date.now()} src= {userPhoto} className='photoImg'/>
	  <div>
        <input 
          type="file"
          label="Select Photo File" 
	      id="file-upload"
	  	  ref={inputRef}
          onChange={handleImgFileChange}
		  style={{display: 'none'}}
        />
      </div>
	  <div className='flexRow'>
        <button onClick={handleChoosePhotoClick} className='buttonRounded200' >
        Choose personal Photo </button>&nbsp;&nbsp; {changedPhoto ? (<h4> Your new photo will be visible the next time you visit the site.</h4>) : null }
	  </div>
          <div className='vSpace5px' />
        &nbsp;&nbsp;
    </div>
	<div>
      <form onSubmit={handleSubmit} name="selfIntroForm" encType="multipart/form-data" >
        <div className='inputColumn'>
          <textarea 
            name="selfIntro"
		        className="mtgTypesTextArea"
		        rows="6"
		        columns="30"
            form="selfIntroForm"
            defaultValue={beginningSelfIntroText}
            onChange={handleIntroTextChange}
        />
        <div className='vSpace5px' />
		<div className='flexRow'>
           <button className='buttonRounded200' type="submit">
           Enter Self-Intro
              </button>&nbsp;&nbsp; {selfIntroUpdated ? (<h4> Self-intro text has been updated.</h4>) : null }
          </div>
        </div>
      </form>
	</div>
	<div>
      <div className='vSpace10px'/>
      <div className='vSpace10px'/>

      <form onSubmit={handleMtgTypesClick} name="mtgTypesForm">
        <div className='inputColumn'>
            <h3>
              Typical meetings:
            </h3>
            <textarea 
		          className='mtgTypesTextArea'
              name="mtgTypesArea"
	            rows="6"
	            columns="30"
              form="mtgTypesForm"
              //defaultValue={props.user.mtg_types}
              defaultValue={user.mtgTypes}
              onChange={handleMtgTypesChange}
            />
          <div className='vSpace5px' />
            <button className='buttonRounded200' type="submit" >
              Enter Meeting Types 
            </button>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
		        {changedMtgTypes ? (
				  		<h3>Meeting types updated.</h3>
				  	) : null}
        </div>
        <div className='vSpace5px' />
        <div className='vSpace5px' />
        <div className='vSpace5px' />
      </form>
    </div>
	</>
  );
}

export default UploadUserInfo;
