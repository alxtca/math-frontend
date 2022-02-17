import React, { useEffect, useContext } from "react"
import DispatchContext from "../DispatchContext"
import { useImmer } from "use-immer"
import Axios from "axios"
import { Link } from "react-router-dom"
import Post from "./Post"

function Search() {
  const appDispatch = useContext(DispatchContext)

  //to handle search based on user input
  const [state, setState] = useImmer({
    searchTerm: "",
    results: [],
    show: "neither",
    requestCount: 0
  })

  //side effect: listen for keyboard press "esc"
  // set it up only once on first render
  // and set a clean up
  useEffect(() => {
    document.addEventListener("keyup", searchKeyPressHandler)

    return () => {
      document.removeEventListener("keyup", searchKeyPressHandler)
    }
  }, [])

  //To send server request once user has stopped typing for 700ms
  useEffect(() => {
    if (state.searchTerm.trim()) {
      //to indicate for the user that something is going on
      setState(draft => {
        draft.show = 'loading'
      })

      const delay = setTimeout(() => {
        setState(draft => {
          draft.requestCount++
        })
      }, 700)
  
      //clean up (to remove all timeouts that were created fo every key stroke, so only last one will increase requestCount).
      // will run the next time this useEffect will run again
      return () => clearTimeout(delay)

    } else {
      setState(draft => {
        draft.show = 'neither'
      })
    }
  }, [state.searchTerm])

  //send axios request (once requestCount changes) 
  useEffect(() => {
    if (state.requestCount) {
      //Send axios request here
      //create token to cancel axios request in case request is canceled by the user
      const ourRequest = Axios.CancelToken.source()
      async function fetchResults() {
        try {
          const response = await Axios.post("/search", { searchTerm: state.searchTerm }, { cancelToken: ourRequest.token })
          setState(draft => {
            draft.results = response.data
            draft.show = "results"
          })
        } catch (e) {
          console.log("There was a problem or the request was cancelled.")
        }
      }
      fetchResults()
      //clean up function for the useEffect
      return () => ourRequest.cancel()
    }
  }, [state.requestCount])

  function searchKeyPressHandler(e) {
    //if key pressed is "esc" then close search window
    if (e.keyCode == 27) {
      appDispatch({ type: "closeSearch" })
    }
  }

  function handleInput(e) {
    const value = e.target.value
    setState(draft => {
      draft.searchTerm = value
    })
  }

  return (
    <div className="search-overlay">
      <div className="search-overlay-top shadow-sm">
        <div className="container container--narrow">
          <label htmlFor="live-search-field" className="search-overlay-icon">
            <i className="fas fa-search"></i>
          </label>
          <input onChange={handleInput} autoFocus type="text" autoComplete="off" id="live-search-field" className="live-search-field" placeholder="What are you interested in?" />
          <span onClick={e => appDispatch({ type: "closeSearch" })} className="close-live-search">
            <i className="fas fa-times-circle"></i>
          </span>
        </div>
      </div>

      <div className="search-overlay-bottom">
        <div className="container container--narrow py-3">
          <div className={"circle-loader " + (state.show == "loading" ? "circle-loader--visible" : "")}> </div>
          <div className={"live-search-results " + (state.show == "results" ? "live-search-results--visible" : "")}>

            <div className="list-group shadow-sm">
              <div className="list-group-item active">
                <strong>Search Results</strong> ({state.results.length} {state.results.length > 1 ? "items" : "item"} found)
              </div>
              {state.results.map(post => {
                return <Post post={post} key={post._id} onClick={() => appDispatch({type: "closeSearch"})} />
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Search
