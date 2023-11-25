import React, { useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import WhtBdPage from './components/whtBdPage';
import HeaderMenu from "./components/header";
import Home from "./components/home";
import SignUpForm from "./components/signUpForm";
import LoginForm from "./components/loginForm";
import UserPage from "./components/userPage";
import ListFlashMessages from './components/listFlashMessages';
import setAuthorizationToken from './utils/setAuthorizationToken';
import jwtDecode from 'jwt-decode';
import { atom, useAtom, Provider } from 'jotai';

export const isAuthAtom = atom(false);
export const flashMsgListAtom = atom([{id:0, type:"success", text:"test"}]);
export const usernameAtom = atom("");
export const identifierAtom = atom("");
export const passwordAtom = atom("");
export const mtgTypesAtom = atom("");
export const userAtom = atom({firstname:"", lastname:"", roomname:"", username:"", mtgTypes:""});
export const signingUpAtom = atom(false);
export const userPhotoAtom = atom(null);

const App = (props) => {
	// const [isAuthenticated, setIsAuthenticated] = useAtom(isAuthAtom);
	// const [userName, setUserName] = useAtom(usernameAtom);
/*  This token decoding is done in login.js and seems unnecessary here
	if (localStorage.jwtToken) {
		const token = localStorage.jwtToken;
		const decodedToken = jwtDecode(token);
		const { id, username, iat } = decodedToken;
		console.log("jwtToken found. id: ", id, "  username: ", username, "  iat: ", iat);
  }
  */

  return (
		<BrowserRouter>
          <Routes>
            <Route path="/" element={<><HeaderMenu /><ListFlashMessages /><Home/></>}/>
            <Route path="/signup" element={<><HeaderMenu /><ListFlashMessages /><SignUpForm /></>} />
            <Route path="/login" element={<><HeaderMenu /><ListFlashMessages /><LoginForm /></>} />
            <Route path="/mtgScheduler/userPage" element={<><HeaderMenu /><ListFlashMessages /><UserPage /></>} />
            <Route path="/mtgScheduler/whiteboard" element={<><WhtBdPage /></>} />
          </Routes>
		</BrowserRouter>
	);
}

export default App

