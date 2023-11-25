import React, { useState } from 'react';
import { useAtom } from 'jotai';
import validateInput from '../../../server/shared/validations/login';
import axios from 'axios';
import setAuthorizationToken from '../utils/setAuthorizationToken';
import jwtDecode from 'jwt-decode';
import { isAuthAtom, userAtom, usernameAtom, identifierAtom, passwordAtom } from '../app.js';
import { useNavigate } from "react-router-dom";
import { flashMsgListAtom } from '../app.js';
import { nanoid } from 'nanoid';
import "./styles/header.scss";

function LoginForm() {
	const [errors, setErrors] = useState([]);
	const [isLoading, setIsLoading] = useState(false);
	const [user, setUser] = useAtom(userAtom);
	const [username, setUsername] = useAtom(usernameAtom);
	const [identifier, setIdentifier] = useAtom(identifierAtom);
	const [password, setPassword] = useAtom(passwordAtom);
	const [isAuthenticated, setIsAuthenticated] = useAtom(isAuthAtom);
  const loginData = {identifier, password, errors, isLoading};
	const navigate = useNavigate();
  const [flashMsgList, setFlashMsgList] = useAtom(flashMsgListAtom);
  const addFlashMessage = ({type, text}) => {
    setFlashMsgList([ ...flashMsgList,
        {
          id: nanoid(),
          type: type,
          text: text
        }
    ])
  };
  
	const isValid = () => {
  	const { errors, isValid } = validateInput(loginData);
  	if (!isValid) {
  		setErrors({ errors });
  	}
  	return isValid;
  }

  const onSubmit = (e) => {
  	e.preventDefault();
  	if (isValid()) {  // only checks for empty fields
  	  setErrors({}); 
	  setIsLoading( true );
  	  login(loginData)
  	  .then( (person) => {
		 const { firstname, lastname, roomname, username, email, identifier, mtgTypes, photo } = person;
		 setUser({firstname:firstname, lastname:lastname, roomname:roomname, username:username, mtgTypes:mtgTypes, photo:photo});
	 	 setUsername(person.username);
		 setIsAuthenticated(true);
		 navigate('/mtgScheduler/userPage')
	   })
  	   .catch((error) => {
  		  console.log("loginForm.js onSubmit error: ", error);
  		  setErrors(error);
		  setIsLoading( false );
		  addFlashMessage({
            type: 'fail',
            text: 'The username or password is unknown. Please try again or sign up if you are a new user.'
          });
  		});
  	  }
	}
  
	const handleUsernameChange = (e) => {
		setIdentifier(e.target.value);
	}

  const handlePasswordChange = (e) => {
		setPassword(e.target.value);
	}

  return (
  	<form onSubmit={onSubmit} className='loginForm'>
    	<h3 className='h3Login' htmlFor="identifier">Please log in</h3>
	  	{ errors.form && <p className='errorMsg'>{errors.form}</p>}
        <input className='usernameInput'
    	    name='identifier'
    	    placeholder='Username / Email'
    	    value={identifier}
    	    error={errors.identifier}
    	    onChange={handleUsernameChange}
        />
        { errors.identifier && <p className='errorMsg'>{errors.identifier}</p>}
    
        <input className='passwordInput'
    	    name='password'
	  	    autoComplete='current-password'
    	    placeholder='Password'
    	    value={password}
    	    error={errors.password}
    	    onChange={handlePasswordChange}
    	    type='password'
        />
        { errors.password && <p className='errorMsg'>{errors.password}</p>}
    
        <button className='loginButton' disabled={isLoading}>Log In</button>
  	</form>
  );
}
// This has the header jwt token decoded on the server
//   and sets the result (user) as the 
//   current user with id, username, and 'iat'
export function login(data, res) {
  return axios.post('/api/auth', data)
  .then(res => {
    const token = res.data.token;
	localStorage.setItem('jwtToken', token);
	setAuthorizationToken(token);
	const decodedToken = jwtDecode(token);	
	const { id, username, iat } = decodedToken;
	const person= {
	  id: id,
	  username: username,
	  iat: iat,  // jwt "issued at" time
	  firstname: res.data.firstname,
	  lastname: res.data.lastname,
	  roomname: res.data.roomname,
	  mtgTypes: res.data.mtgTypes,
      photo: res.data.photo
	}	
	return(person);
  })
  .catch((error) => {
  console.log("login function error: ", error);
  })
}

export default LoginForm;

