import React from 'react'
import { Link } from 'react-router-dom'

export default function Post(props) {
  const post = props.post
  const date = new Date(post.createdDate)
  const dateFormatted = `${
    // date in dd/mm/yyyy format
    date.getMonth() + 1
  }/${date.getDate()}/${date.getFullYear()}`

  return (
    <Link
      onClick={props.onClick}
      to={`/post/${post._id}`}
      className="list-group-item list-group-item-action"
    >
      <img className="avatar-tiny" src={post.author.avatar} />{' '}
      <strong>{post.title}</strong>{' '}
      <span className="text-muted small">
        {!props.noAthor && <> by {post.author.username}</>} on {dateFormatted}{' '}
      </span>
    </Link>
  )
}
