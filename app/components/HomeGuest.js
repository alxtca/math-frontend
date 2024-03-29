import React, {useEffect, useState, useContext} from "react"
import Page from "./Page"
import Axios from 'axios'
import { useImmerReducer } from "use-immer"
import {CSSTransition} from 'react-transition-group'
import DispatchContext from "../DispatchContext"

function HomeGuest() {
  const appDispatch = useContext(DispatchContext)
  const initialState = {
    username:{
      value: "",
      harErrors: false,
      message: "",
      isUnique: false,
      checkCount: 0
    },
    email:{
      value: "",
      harErrors: false,
      message: "",
      isUnique: false,
      checkCount: 0
    },
    password:{
      value: "",
      harErrors: false,
      message: "",
    },
    submitCount: 0
  }

  function ourReducer(draft, action){
    switch (action.type) {
      case "usernameImmediately":
        draft.username.hasErrors = false
        draft.username.value = action.value
        if(draft.username.value.length > 30){
          draft.username.hasErrors = true
          draft.username.message = "Username cannot exceed 30 characters"
        }
        if (draft.username.value && !/^([a-zA-Z0-9]+)$/.test(draft.username.value)) {
          draft.username.hasErrors = true
          draft.username.message = "Username can only contain letters and numbers"
        }
        return
      
      case "usernameAfterDelay":
        if(draft.username.value.length < 3) {
          draft.username.hasErrors = true
          draft.username.message ="Username must be at least 3 characters"
        }
        // && this way we don't bother checking "is unique" if we just submitting the form instead of actually typing in the field
        // this condition will pass only when NOT submitting the form? ( will not pass on form submitt)
        if (!draft.username.hasErrors && !action.noRequest) {
          draft.username.checkCount++
        }
        return
    
      case "usernameUniqueResults":
        //if axios response is true(user name exist)
        if(action.value) {
          draft.username.hasErrors = true
          draft.username.isUnique = false
          draft.username.message = "That username is already taken."
        } else {
          draft.username.isUnique = true
        }
        return

      case "emailImmediately":
        draft.email.hasErrors = false
        draft.email.value = action.value
        return
      
      case "emailAfterDelay":
        //if the string of text does not match basic pattern of email
        if (!/^\S+@\S+$/.test(draft.email.value)) {
          draft.email.hasErrors = true
          draft.email.message = "You must provide a valid email address"
        }
        if (!draft.email.hasErrors && !action.noRequest) {
          draft.email.checkCount++
        }
        return
    
      case "emailUniqueResults":
        //if email allready exist (axios response.data == true)
        if(action.value) {
          draft.email.hasErrors = true
          draft.email.isUnique = false
          draft.email.message = "That email is already being used"
        } else {
          draft.email.isUnique = true
        }
        return

      case "passwordImmediately":
        draft.password.hasErrors = false
        draft.password.value = action.value
        if (draft.password.value.length > 50) {
          draft.password.hasErrors = true
          draft.password.message = "Password cannot exceed 50 characters."
        }
        return
      
      case "passwordAfterDelay":
        if(draft.password.value.length < 12) {
          draft.password.hasErrors = true
          draft.password.message = "Password must be at least 12 characters."
        }
        return
      
      case "submitForm":
        if (!draft.username.hasErrors && draft.username.isUnique 
          && !draft.email.hasErrors && draft.email.isUnique && !draft.password.hasErrors) {
            //increase count so useEffect can send axios request
            draft.submitCount++
        }
        return
    }
  }

  const [state, dispatch] = useImmerReducer(ourReducer, initialState)

  //to run form field validation after delay after typing inside input field
  useEffect(()=>{
    if(state.username.value) {
      const delay = setTimeout( () => dispatch({type: "usernameAfterDelay"}), 800)
      //useEffect clean up. Will run on next render,
      // to avoid several timeout to fire one after another. Only last one shall fire.
      //this return function will run first when component unmounts, which is next time components renders (?)
      return () => clearTimeout(delay)
    }
  }, [state.username.value])

  //to run form field validation after delay after typing inside input field
  useEffect(()=>{
    if(state.email.value) {
      const delay = setTimeout( () => dispatch({type: "emailAfterDelay"}), 800)
      //useEffect clean up. Will run on next render,
      // to avoid several timeout to fire one after another. Only last one shall fire.
      //this return function will run first when component unmounts, which is next time components renders (?)
      return () => clearTimeout(delay)
    }
  }, [state.email.value])

  //to run form field validation after delay after typing inside input field
  useEffect(()=>{
    if(state.password.value) {
      const delay = setTimeout( () => dispatch({type: "passwordAfterDelay"}), 800)
      //useEffect clean up. Will run on next render,
      // to avoid several timeout to fire one after another. Only last one shall fire.
      //this return function will run first when component unmounts, which is next time components renders (?)
      return () => clearTimeout(delay)
    }
  }, [state.password.value])

//send axios request (once state.username.checkCount changes) 
  useEffect(() => {
    if (state.username.checkCount) {
      //Send axios request here
      //create token to cancel axios request in case request is canceled by the user
      const ourRequest = Axios.CancelToken.source()
      async function fetchResults() {
        try {
          const response = await Axios.post("/doesUsernameExist", { username: state.username.value }, { cancelToken: ourRequest.token })
          dispatch({type: "usernameUniqueResults", value: response.data})
        } catch (e) {
          console.log("There was a problem or the request was cancelled.")
        }
      }
      fetchResults()
      //clean up function for the useEffect
      return () => ourRequest.cancel()
    }
  }, [state.username.checkCount])

  //send axios request (once state.username.checkCount changes) 
  useEffect(() => {
    if (state.email.checkCount) {
      //Send axios request here
      //create token to cancel axios request in case request is canceled by the user
      const ourRequest = Axios.CancelToken.source()
      async function fetchResults() {
        try {
          const response = await Axios.post("/doesEmailExist", { email: state.email.value }, { cancelToken: ourRequest.token })
          dispatch({type: "emailUniqueResults", value: response.data})
        } catch (e) {
          console.log("There was a problem or the request was cancelled.")
        }
      }
      fetchResults()
      //clean up function for the useEffect
      return () => ourRequest.cancel()
    }
  }, [state.email.checkCount])


  /* v1
  const [username, setUsername] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
*/

//send axios request for the form submit (once state.submitCount changes) 
useEffect(() => {
  if (state.submitCount) {
    //Send axios request here
    //create token to cancel axios request in case request is canceled by the user
    const ourRequest = Axios.CancelToken.source()
    async function fetchResults() {
      try {
        const response = await Axios.post("/register", { username: state.username.value, email: state.email.value, password: state.password.value }, { cancelToken: ourRequest.token })
        //log in automatically right after registration
        appDispatch({type: "login", data: response.data})
        appDispatch({type: "flashMessage", value: "Congrats! Welcome to your new account."})
      } catch (e) {
        console.log("There was a problem or the request was cancelled.")
      }
    }
    fetchResults()
    //clean up function for the useEffect
    return () => ourRequest.cancel()
  }
}, [state.submitCount])

  async function handleSubmit(e){
    e.preventDefault()
    dispatch({type: "usernameImmediately", value: state.username.value})
    dispatch({type: "usernameAfterDelay", value: state.username.value, noRequest: true})
    dispatch({type: "emailImmediately", value: state.email.value})
    dispatch({type: "emailAfterDelay", value: state.email.value, noRequest: true})
    dispatch({type: "passwordImmediately", value: state.password.value})
    dispatch({type: "passwordAfterDelay", value: state.password.value})
    dispatch({type: "submitForm"})
    /* v1
    try{ 
      await Axios.post('/register', {username, email, password})
      console.log("User was created")
    } catch(e) {
      console.log("Error creating user")
    }
    */
  }

  return (
    <Page title="Welcome">
      <div className="row align-items-center">
        <div className="col-lg-7 py-3 py-md-5">
          <h1 className="display-3">About this project</h1>
          <p className="lead text-muted">
          This page is based on a result of a course <a href="https://www.udemy.com/course/react-for-the-rest-of-us/">React For The Rest Of Us. </a>
          ComplexApp is the functionlality that is build throughout the course.</p>
          <p className="lead text-muted">MathApp is functionality build by me with the use of knowledge from the course.</p>
          <p className="lead text-muted">What I did:</p>
          <ul className="lead text-muted">
            <li>Idea and design of MathApp</li>
            <li>Implementation of html, css, react(.js)</li>
            <li>New routes and functions on backend</li>
          </ul>
        </div>
        <div className="col-lg-5 pl-lg-5 pb-3 py-lg-5">

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="username-register" className="text-muted mb-1">
                <small>Username</small>
              </label>
              <input onChange={ e => dispatch({type: "usernameImmediately", value: e.target.value})} id="username-register" name="username" className="form-control" type="text" placeholder="Pick a username" autoComplete="off" />
              <CSSTransition in={state.username.hasErrors} timeout={330} classNames="liveValidateMessage" unmountOnExit >
                <div className="alert alert-danger small liveValidateMessage">{state.username.message}</div>
              </CSSTransition>
              <CSSTransition in={!state.username.hasErrors && state.username.value.length > 2} timeout={330} classNames="liveValidateMessage" unmountOnExit >
                <div className="alert alert-success small liveValidateMessage">username is available</div>
              </CSSTransition>
            </div>
            <div className="form-group">
              <label htmlFor="email-register" className="text-muted mb-1">
                <small>Email</small>
              </label>
              <input onChange={ e => dispatch({type: "emailImmediately", value: e.target.value})} id="email-register" name="email" className="form-control" type="text" placeholder="you@example.com" autoComplete="off" />
              <CSSTransition in={state.email.hasErrors} timeout={330} classNames="liveValidateMessage" unmountOnExit >
                <div className="alert alert-danger small liveValidateMessage">{state.email.message}</div>
              </CSSTransition>
            </div>
            <div className="form-group">
              <label htmlFor="password-register" className="text-muted mb-1">
                <small>Password</small>
              </label>
              <input onChange={ e => dispatch({type: "passwordImmediately", value: e.target.value})} id="password-register" name="password" className="form-control" type="password" placeholder="Create a password" />
              <CSSTransition in={state.password.hasErrors} timeout={330} classNames="liveValidateMessage" unmountOnExit >
                <div className="alert alert-danger small liveValidateMessage">{state.password.message}</div>
              </CSSTransition>
            </div>
            <button type="submit" className="py-3 mt-4 btn btn-lg btn-success btn-block">
              Sign up for ComplexApp
            </button>
          </form>

        </div>
      </div>
    </Page>
  )
}

export default HomeGuest