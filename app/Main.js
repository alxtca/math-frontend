import React, { useEffect, Suspense } from "react"
import ReactDom from "react-dom"
import { useImmerReducer } from "use-immer"
import { BrowserRouter, Routes, Route } from "react-router-dom"
import { CSSTransition } from "react-transition-group"
import Axios from "axios"
//Axios.defaults.baseURL = "http://localhost:8080"
Axios.defaults.baseURL = process.env.BACKENDURL || "https://alxtca-math.herokuapp.com"

//to back up all lazy loading components
import LoadingDotsIcon from "./components/LoadingDotsIcon"

//components
import Header from "./components/Header"
import HomeGuest from "./components/HomeGuest"
import Footer from "./components/Footer"
import About from "./components/About"
import Terms from "./components/Terms"
import Home from "./components/Home"
//import CreatePost from "./components/CreatePost"
const CreatePost = React.lazy(() => import("./components/CreatePost"))

//import ViewSinglePost from "./components/ViewSinglePost"
const ViewSinglePost = React.lazy(() => import("./components/ViewSinglePost"))

import FlashMessages from "./components/FlashMessages"
import Profile from "./components/Profile"
import EditPost from "./components/EditPost"
import NotFound from "./components/NotFound"
import Search from "./components/Search"
//see video#76 for lazy loading of components inside SCCTransition
//const Search = React.lazy(() => import("./components/Search"))

import Chat from "./components/Chat"

//context
import StateContext from "./StateContext"
import DispatchContext from "./DispatchContext"

function Main() {
  //the appState (initial value. Updated value is in "state" variable)
  const initialState = {
    loggedIn: Boolean(localStorage.getItem("complexappToken")),
    flashMessages: [],
    user: {
      token: localStorage.getItem("complexappToken"),
      username: localStorage.getItem("complexappUsername"),
      avatar: localStorage.getItem("complexappAvatar")
    },
    isSearchOpen: false,
    isChatOpen: false,
    unreadChatCount: 0
  }

  //useReducer function
  //state is replaced w draft to make changes - Immer. Use 'state' to read from
  function ourReducer(draft, action) {
    switch (action.type) {
      case "login":
        draft.loggedIn = true
        draft.user = action.data
        return

      case "logout":
        draft.loggedIn = false
        return

      case "flashMessage":
        draft.flashMessages.push(action.value)
        return

      case "openSearch":
        draft.isSearchOpen = true
        return

      case "closeSearch":
        draft.isSearchOpen = false
        return

      case "toggleChat":
        draft.isChatOpen = !draft.isChatOpen
        return

      case "closeChat":
        draft.isChatOpen = false
        return

      case "incrementUnreadChatCount":
        draft.unreadChatCount++
        return

      case "clearUnreadChatCount":
        draft.unreadChatCount = 0
        return

      default:
        return draft
    }
  }

  //tpo keep and update global state
  const [state, dispatch] = useImmerReducer(ourReducer, initialState)

  //To reduce usage of local storage to only when logging in and logging out
  useEffect(() => {
    if (state.loggedIn) {
      localStorage.setItem("complexappToken", state.user.token)
      localStorage.setItem("complexappUsername", state.user.username)
      localStorage.setItem("complexappAvatar", state.user.avatar)
    } else {
      localStorage.removeItem("complexappToken")
      localStorage.removeItem("complexappUsername")
      localStorage.removeItem("complexappAvatar")
    }
  }, [state.loggedIn])

  //check if token has expired or not on first render
  useEffect(() => {
    if (state.loggedIn) {
      //Send axios request here
      //create token to cancel axios request in case request is canceled by the user
      const ourRequest = Axios.CancelToken.source()
      async function fetchResults() {
        try {
          const response = await Axios.post("/checkToken", { token: state.user.token }, { cancelToken: ourRequest.token })
          if (!response.data) {
            dispatch({ type: "logout" })
            dispatch({ type: "flashMessage", value: "Your session has expired. Please log in again" })
          }
        } catch (e) {
          console.log("There was a problem or the request was cancelled.")
        }
      }
      fetchResults()
      //clean up function for the useEffect
      return () => ourRequest.cancel()
    }
  }, [])

  return (
    <StateContext.Provider value={state}>
      <DispatchContext.Provider value={dispatch}>
        <BrowserRouter>
          <FlashMessages messages={state.flashMessages} />
          <Header />
          <Suspense fallback={<LoadingDotsIcon />}>
            <Routes>
              <Route path="/profile/:username/*" element={<Profile />} />
              <Route path="/" element={state.loggedIn ? <Home /> : <HomeGuest />} />
              <Route path="/post/:id" element={<ViewSinglePost />} />
              <Route path="/post/:id/edit" element={<EditPost />} />
              <Route path="/create-post" element={<CreatePost />} />
              <Route path="/about-us" element={<About />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
          <CSSTransition timeout={330} in={state.isSearchOpen} classNames="search-overlay" unmountOnExit>
            <Search />
          </CSSTransition>
          <Chat />
          <Footer />
        </BrowserRouter>
      </DispatchContext.Provider>
    </StateContext.Provider>
  )
}

ReactDom.render(<Main />, document.querySelector("#app"))
