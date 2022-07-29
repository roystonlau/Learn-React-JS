import Axios from 'axios'
import React, { useEffect, useContext, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import LoadingDotIcon from './LoadingDotIcon'

export default function ProfileFollowers() {
  const { username } = useParams()
  console.log(username)
  const [isLoading, setIsLoading] = useState(true)
  const [posts, setPosts] = useState([])

  useEffect(() => {
    const cancelTokenSource = Axios.CancelToken.source()

    async function fetchPost() {
      try {
        const response = await Axios.get(`/profile/${username}/followers`, {
          cancelToken: cancelTokenSource.token,
        })
        setPosts(response.data)
        setIsLoading(false)
      } catch (error) {
        console.log(error)
      }
    }
    fetchPost()
    return () => {
      cancelTokenSource.cancel()
    }
  }, [username])

  if (isLoading) return <LoadingDotIcon />
  return (
    <div className="list-group">
      {posts.map((follower, index) => {
        return (
          <Link
            to={`/profile/${follower.username}`}
            key={index}
            className="list-group-item list-group-item-action"
          >
            {(follower, username)}
            <img className="avatar-tiny" src={follower.avatar} />{' '}
          </Link>
        )
      })}
    </div>
  )
}
