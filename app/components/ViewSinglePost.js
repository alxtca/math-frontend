import React, { useEffect, useState, useContext } from "react"
import Page from "./Page"
import {useParams, Link, useNavigate} from 'react-router-dom'
import Axios from "axios"
import LoadingDotsIcon from "./LoadingDotsIcon"
import ReactMarkdown from "react-markdown"
// allowedElements={"b", "h4", "bla bla"}
import ReactTooltip from "react-tooltip"
import NotFound from "./NotFound"
import StateContext from "../StateContext"
import DispatchContext from "../DispatchContext"

function ViewSinglePost() {
  const navigate = useNavigate()
  const appState = useContext(StateContext)
  const appDispatch = useContext(DispatchContext)
  const {id} = useParams()
  const [isLoading, setIsLoading] = useState(true)
  const [post, setPost] = useState()

  useEffect(() => {
    const ourRequest = Axios.CancelToken.source()

    async function fetchPost(){
      try {
        //Axios request. third argument is for clean up action
        const response = await Axios.get(`/post/${id}`, {cancelToken: ourRequest.token})
        setPost(response.data)
        setIsLoading(false)
      } catch(e){
        console.log("there was a problem or request was canceled.")
      }
    }
    fetchPost()

    //clean up (case: user navigates away before axios request finishes)
    //other cases: remove event listeners when they are no longer needed.
    return () => {
      ourRequest.cancel()
    }

  }, [id])

  if (!isLoading && !post){
    return <NotFound />
  }

  if (isLoading) return <Page title="..."> <LoadingDotsIcon /> </Page>

  const date = new Date(post.createdDate)
  const dateFormatted = `${date.getDate()}.${date.getMonth()+1}.${date.getFullYear()}`

  //to display "edit" & "delete" icons only for the author of the post
  function isOwner() {
    if (appState.loggedIn) {
      //
      return appState.user.username == post.author.username
    }
    return false
  }

  async function deleteHandler() {
    //default model (if it is considered a model)
    const areYouSure = window.confirm("Do you really want to delete this post?")
    if (areYouSure) {
      //perform action if user click "OK"
      try {
        const response = await Axios.delete(`/post/${id}`, {data: {token: appState.user.token}})
        if(response.data == "Success") {
          // 1. dosplay a flash message
          appDispatch({ type: "flashMessage", value: "Post was successfully deleted."})
          // 2. redirect back to the current user's profile
          navigate(`/profile/${appState.user.username}`)
        }
      } catch (e) {
        console.log("There was a problem.")
      }
    }
  }

  return (
    <Page title={post.title}>
      <div className="d-flex justify-content-between">
        <h2>{post.title}</h2>
        {isOwner() && (
        <span className="pt-2">
          <Link to={`/post/${post._id}/edit`} data-tip="Edit" data-for="edit" className="text-primary mr-2"><i className="fas fa-edit"></i></Link>
          <ReactTooltip id="edit" className="custom-tooltip" />
          {" "}
          <a onClick={deleteHandler} data-tip="Delete" data-for="delete" className="delete-post-button text-danger"><i className="fas fa-trash"></i></a>
          <ReactTooltip id="delete" className="custom-tooltip" />
        </span>)}

      </div>

      <p className="text-muted small mb-4">
        <Link to={`/profile/${post.author.username}`}>
          <img className="avatar-tiny" src={post.author.avatar} />
        </Link>
        Posted by <Link to={`/profile/${post.author.username}`}>{post.author.username}</Link> on {dateFormatted}
      </p>

      <div className="body-content">
        <ReactMarkdown children={post.body} />
        {}        
      </div>      
    </Page>
  )
}

export default ViewSinglePost