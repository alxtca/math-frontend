import React, { useEffect, useState } from "react"
import Axios from "axios"
import {useParams, Link} from 'react-router-dom'
import LoadingDotsIcon from "./LoadingDotsIcon"

function ProfileFollowers() {
  const {username} = useParams()
  const [isLoading, setIsLoading] = useState(true)
  const [posts, setPosts] = useState([])

  useEffect(() => {
    async function fetchPosts(){
      try {
        const response = await Axios.get(`/profile/${username}/followers`)
        setPosts(response.data)
        setIsLoading(false)
      } catch(e){
        console.log("error fetching data")
      }
    }
    fetchPosts()

    //to setup up a cleaning action: see ViewSinglePost.js

  }, [username])

  if (isLoading) return <LoadingDotsIcon />

  return (
    <>
      <div className="list-group">
        {posts.map((follower, index) => {
          return(
          <Link to={`/profile/${follower.username}`} className="list-group-item list-group-item-action">
            <img className="avatar-tiny" src={follower.avatar} /> {follower.username}
          </Link>)
        })}
      </div>
    </>
  )
}

export default ProfileFollowers
