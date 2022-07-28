import Axios from 'axios'
import React, { useEffect, useContext, useState } from 'react'
import { useParams, Link } from 'react-router-dom'

export default function ProfilePost() {
  const { username } = useParams()
  const [isLoading, setIsLoading] = useState(true)
  const [posts, setPosts] = useState([])

  useEffect(() => {
    async function fetchPost() {
      try {
        const response = await Axios.get(`/profile/${username}/posts`)
        setPosts(response.data)
        setIsLoading(false)
      } catch (error) {
        console.log(error)
      }
    }

    fetchPost()
  }, [])

  if (isLoading) return <div>Loading...</div>
  return (
    <div className="list-group">
      {posts.map((post) => {
        const date = new Date(post.createdDate)
        const dateFormatterd = `${
          // date in dd/mm/yyyy format
          date.getMonth() + 1
        }/${date.getDate()}/${date.getFullYear()}`

        return (
          <Link
            to={`/post/${post._id}`}
            key={post._id}
            className="list-group-item list-group-item-action"
          >
            <img className="avatar-tiny" src={post.author.avatar} />{' '}
            <strong>{post.title}</strong>{' '}
            <span className="text-muted small">on {dateFormatterd} </span>
          </Link>
        )
      })}
    </div>
  )
}
