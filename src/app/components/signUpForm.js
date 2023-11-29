import React, { useState } from 'react';
import { useAtom } from 'jotai';
import { useNavigate } from "react-router-dom";
import validateInput from '../../../server/shared/validations/signup';
import { login } from './loginForm.js';
import axios from 'axios';
import base64url from 'base64url';
import { userAtom } from '../app.js';
import { flashMsgListAtom } from '../app.js';
import { isAuthAtom, usernameAtom, identifierAtom, passwordAtom, mtgTypesAtom } from '../app.js'; 
import { nanoid } from 'nanoid';
import "./styles/header.scss";
import config from "../../../server/config.js";

function SignUpForm() {
  const [firstname, setFirstname] = useState("");
  const [lastname, setLastname] = useState("");
  const [roomname] = useState("");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useAtom(usernameAtom);
  const [identifier, setIdentifier] = useAtom(identifierAtom);
  const [password, setPassword] = useAtom(passwordAtom);
  const [confirmpass, setConfirmpass] = useState("");
  const [mtgTypes, setMtgTypes] = useAtom(mtgTypesAtom);	
  const [user, setUser] = useAtom(userAtom);

  const [errors, setErrors] = useState([""]);
  const [isLoading, setIsLoading] = useState(false);
  const [invalid, setInvalid] = useState(false);
  const [selectedOption, setSelectedOption] = ('is_student');
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useAtom(isAuthAtom);

  const [flashMsgList, setFlashMsgList] = useAtom(flashMsgListAtom);
  const addFlashMessage = ({type, text}) => {
    setFlashMsgList([
      ...flashMsgList,
      {
        id: nanoid(),
        type: type,
        text: text
      }
    ])  
  };  
  
	const handleFirstnameChange = (e) => {
  	setFirstname(e.target.value);
  }
	const handleLastnameChange = (e) => {
  	setLastname(e.target.value);
  }
	const handleUsernameChange = (e) => {
  	setUsername(e.target.value);
  }
	const handleEmailChange = (e) => {
  	setEmail(e.target.value);
  }
	const handlePasswordChange = (e) => {
  	setPassword(e.target.value);
  }
	const handleConfirmpassChange = (e) => {
  	setConfirmpass(e.target.value);
  }
	const handleMtgTypesChange = (e) => {
  	setMtgTypes(e.target.value);

  }
    const handleOptionChange = (e) => {
    setSelectedOption(event.target.value);
  }
	
  let signUpData = {firstname, lastname, username, email, identifier, password, confirmpass, mtgTypes};
  
  const isValid = () => {
    const {errors, isValid } = validateInput(signUpData);
    if (!isValid) {
 	  setErrors(errors);
    }
    return isValid;
  }

  const isUserExists = (identifier) => {
    return axios.get(`/api/users/${identifier}`);
  }

  const userSignUpRequest = async (userData) => {
    let res = await axios.post('/api/users', userData);
  }

  const onSubmit = (e) => {
    e.preventDefault();
	  let signUpData = {firstname, lastname, username, email, identifier: username, password, confirmpass, mtgTypes};
    if (isValid()) {              // <- runs validateInput()
	  setErrors({}); 
	  setIsLoading(true);
	  setIdentifier(username);
	  const loginData = signUpData;
  	  userSignUpRequest(signUpData)
	  .then(res => {
      	const dataString = '{"user":"' + username + '", "mtg_types":"' + mtgTypes + '"}';
      	axios.post('/api/uploadMtgTypes', JSON.parse(dataString))
        .then((result) => {
        })
      })
	  .then(function (returned) {
	    login(loginData)            // <-  LOGIN
    	.then(person => {
          addFlashMessage({
            type: 'success',
            text: 'You signed up successfully. Welcome!'
          }) 
          setIsAuthenticated(true);
          setUser({firstname:person.firstname, lastname:person.lastname, roomname:person.roomname, username:person.username, mtgTypes:person.mtgTypes});
	      setUsername(person.username);
		  navigate('/mtgScheduler/userPage');
		})
      })  
      .catch((error) => {
        console.log("signUpForm.js userSignUpRequest error.response.data.message.error: ", error.response.data.message.error);
		
    	setErrors(error.response.data.message.error); 
		setIsLoading(false);
		if (error.response.data.message.error.username) {
		  addFlashMessage({
            type: 'fail',
            text: 'This username is already in use. Please choose a different one.'
          }); 
		  navigate('/signup');
		 } else if (error.response.data.message.error.email) {
		  addFlashMessage({
            type: 'fail',
            text: 'This email is already in use by a registered user. Please log in if you have already signed up, or choose a different email for this new signup.'
          }); 
		  navigate('/signup');
        } else if (error) {
		    addFlashMessage({
              type: 'fail',
              text: 'Signup error. Please try again.'
            });
		    //navigate(config.socketAddr + '/userPage');
		    navigate('/signup');
		  };
      });
	 } // <- if (isValid())
	}  // <- onSubmit
	
	return (
	  <form onSubmit={onSubmit} className='loginForm'>
	  { <p className='<errorMsg'>{errors.firstname}</p>} 
	  <input
	    value={firstname} 
	    onChange={handleFirstnameChange}
	    type='text' 
	    name='firstname' 
	    placeholder='First Name' 
        className='usernameInput'
	  />

	  { errors.lastname && 
	    <p className='errorMsg'>{errors.lastname}</p>} 
		<input
		  value={lastname} 
		  onChange={handleLastnameChange}
		  type='text' 
		  name='lastname' 
		  placeholder='Last Name' 
          className='usernameInput'
		/>
			
		{ errors.username && 
		  <p className='errorMsg'>{errors.username}</p>} 
		  <input 
		    value={username} 
		    onChange={handleUsernameChange}
		            
		    type='text' 
		    name='username' 
		    placeholder='Username/Nickname' 
            className='usernameInput'
		  />
			
		  { errors.email && 
		    <p className='errorMsg'>{errors.email}</p>} 
		    <input 
		      value={email} 
		      onChange={handleEmailChange}
		   	      
			  type='text' 
			  name='email' 
			  placeholder='Email' 
              className='usernameInput'
			/>

	      { errors.password && 
			<p className='errorMsg'>{errors.password }</p>} 
			<input 
			  value={password} 
			  onChange={handlePasswordChange}
			  type='password' 
			  name='password' 
			  placeholder='Password' 
			  className='passwordInput'
			/>

		  { errors.confirmpass && 
			<p className='errorMsg'>{errors.confirmpass }</p>} 
			<input 
			  value={confirmpass} 
			  onChange={handleConfirmpassChange}
			  name='confirmpass' 
			  type='password' 
			  placeholder='Password once more' 
			  className='passwordInput'
			/>
            <div className='vSpace10px'/>

			<React.Fragment>
            <div className='centeredText'>Here you can optionally list meeting types you commonly attend to be displayed with your info (you can change this later):</div>
			<div className='vSpace10px'/>
			<input
			  value={mtgTypes} 
			  onChange={handleMtgTypesChange}
			  type='text' 
			  name='mtgTypes' 
			  placeholder='Meetings' 
              className='input500'
			/>
			</React.Fragment>

			<button className='signUpButton' disabled={isLoading || invalid }>Sign Up</button>

			</form>
		);
}

export default SignUpForm;

