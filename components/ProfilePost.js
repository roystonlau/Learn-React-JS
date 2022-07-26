import Axios from 'axios'
import React, { useEffect, useContext, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import LoadingDotIcon from './LoadingDotIcon'
import Post from './Post'

export default function ProfilePost() {
  const { username } = useParams()
  console.log(username)
  const [isLoading, setIsLoading] = useState(true)
  const [posts, setPosts] = useState([])

  useEffect(() => {
    const cancelTokenSource = Axios.CancelToken.source()

    async function fetchPost() {
      try {
        const response = await Axios.get(`/profile/${username}/posts`, {
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
      {posts.map((post) => {
        return <Post post={post} key={post._id} noAuthor={true} />
      })}
    </div>
  )
}
