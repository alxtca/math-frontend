import React, { useEffect, useContext } from "react"
import Page from "./Page"
import { useParams, NavLink, Routes, Route } from "react-router-dom"
import Axios from "axios"
import StateContext from "../StateContext"
import ProfilePosts from "./ProfilePosts"
import ProfileFollowers from "./ProfileFollowers"
import ProfileFollowing from "./ProfileFollowing"
import { useImmer } from "use-immer"

function Profile() {
  // useParams extracts username from URL string (video#44 8:00)
  //destructure useParams object. Could have more params depending on URL
  const { username } = useParams()

  const appState = useContext(StateContext)

  const [state, setState] = useImmer({
    followActionLoading: false,
    startFollowingRequestCount: 0,
    stopFollowingRequestCount: 0,
    profileData: {
      profileUsername: "...",
      profileAvatar: "https://gravatar.com/avatar/placeholder?s=128",
      isFollowing: false,
      counts: { postCount: "", followerCount: "", followingCount: "" }
    }
  })

  //using useEffect here to avoid sending Axios request on each page rerender. Do in on first render only.
  useEffect(() => {
    //for clean up
    const ourRequest = Axios.CancelToken.source()

    async function fetchData() {
      try {
        const response = await Axios.post(`/profile/${username}`, { token: appState.user.token })
        setState(draft => {
          draft.profileData = response.data
        })
      } catch (e) {
        console.log("error fetching data")
      }
    }
    fetchData()

    //clean up for unused axios requests
    return () => {
      ourRequest.cancel()
    }
  }, [username])

// run when "following" button was clicked
  useEffect(() => {
    //run only if
    if (state.startFollowingRequestCount) {
      //to grey out "follow" button before completed axios request
      setState(draft => {
        draft.followActionLoading = true
      })
      //for clean up
      const ourRequest = Axios.CancelToken.source()

      async function fetchData() {
        try {
          const response = await Axios.post(`/addFollow/${state.profileData.profileUsername}`, { token: appState.user.token })
          //if request completes
          setState(draft => {
            draft.profileData.isFollowing = true
            draft.profileData.counts.followerCount++
            draft.followActionLoading = false
          })
        } catch (e) {
          console.log("error fetching data")
        }
      }
      fetchData()

      //clean up for unused axios requests
      return () => {
        ourRequest.cancel()
      }
    }
  }, [state.startFollowingRequestCount])

  //run when "stop following" was clicked
  useEffect(() => {
    //run only if
    if (state.stopFollowingRequestCount) {
      //to grey out "follow" button before completed axios request
      setState(draft => {
        draft.followActionLoading = true
      })
      //for clean up
      const ourRequest = Axios.CancelToken.source()

      async function fetchData() {
        try {
          const response = await Axios.post(`/removeFollow/${state.profileData.profileUsername}`, { token: appState.user.token })
          //if request completes
          setState(draft => {
            draft.profileData.isFollowing = false
            draft.profileData.counts.followerCount--
            draft.followActionLoading = false
          })
        } catch (e) {
          console.log("error fetching data")
        }
      }
      fetchData()

      //clean up for unused axios requests
      return () => {
        ourRequest.cancel()
      }
    }
  }, [state.stopFollowingRequestCount])

  function startFollowing() {
    setState(draft => {
      draft.startFollowingRequestCount++
    })
  }

  function stopFollowing() {
    setState(draft => {
      draft.stopFollowingRequestCount++
    })
  }

  return (
    <Page title="Profile Screen">
      <h2>
        <img className="avatar-small" src={state.profileData.profileAvatar} /> {state.profileData.profileUsername}
        {appState.loggedIn && !state.profileData.isFollowing && appState.user.username != state.profileData.profileUsername && state.profileData.profileUsername != "..." && (
          <button onClick={startFollowing} disabled={state.followActionLoading} className="btn btn-primary btn-sm ml-2">
            Follow <i className="fas fa-user-plus"></i>
          </button>
        )}
        {appState.loggedIn && state.profileData.isFollowing && appState.user.username != state.profileData.profileUsername && state.profileData.profileUsername != "..." && (
          <button onClick={stopFollowing} disabled={state.followActionLoading} className="btn btn-danger btn-sm ml-2">
            Stop Following <i className="fas fa-user-times"></i>
          </button>
        )}
      </h2>

      <div className="profile-nav nav nav-tabs pt-2 mb-4">
        <NavLink to="" end className="nav-item nav-link">
          Posts: {state.profileData.counts.postCount}
        </NavLink>
        <NavLink to="followers" className="nav-item nav-link">
          Followers: {state.profileData.counts.followerCount}
        </NavLink>
        <NavLink to="following" className="nav-item nav-link">
          Following: {state.profileData.counts.followingCount}
        </NavLink>
      </div>

      <Routes >
        <Route path="" element={<ProfilePosts />} />
        <Route path="followers" element={<ProfileFollowers />} />
        <Route path="following" element={<ProfileFollowing />} />
      </Routes>
    </Page>
  )
}

export default Profile
