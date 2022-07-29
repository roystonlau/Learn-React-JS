import React from 'react'
import Page from './Page'
import { useState, useEffect, useContext } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import Axios from 'axios'
import LoadingDotIcon from './LoadingDotIcon'
import ReactMarkdown from 'react-markdown'
import NotFound from './NotFound'
import ReactTooltip from 'react-tooltip'
import StateContext from '../StateContext'
import DispatchContext from '../DispatchContext'

export default function ViewSinglePost() {
  const navigate = useNavigate()
  const { id } = useParams()
  const [isLoading, setIsLoading] = useState(true)
  const [post, setPost] = useState()
  const appState = useContext(StateContext)
  const appDispatch = useContext(DispatchContext)
  useEffect(() => {
    const ourRequests = Axios.CancelToken.source()
    async function fetchPost() {
      try {
        const response = await Axios.get(`/post/${id}`, {
          cancelToken: ourRequests.token,
        })
        setPost(response.data)
        setIsLoading(false)
      } catch (error) {
        console.log(error ? error : 'User cancel')
      }
    }
    fetchPost()
    return () => {
      ourRequests.cancel()
    }
  }, [id])

  if (!isLoading && !post) {
    return <NotFound />
  }

  if (isLoading)
    return (
      <Page title="...">
        <LoadingDotIcon />
      </Page>
    )

  const date = new Date(post.createdDate)
  const dateFormatted = `${
    // date in dd/mm/yyyy format
    date.getMonth() + 1
  }/${date.getDate()}/${date.getFullYear()}`

  function isOwner() {
    if (appState.loggedIn) {
      return appState.user.username == post.author.username
    }
    return false
  }
  async function deleteHandler() {
    const areYouSure = window.confirm('Do you really want to delete this post')
    if (areYouSure) {
      try {
        const res = await Axios.delete(`/post/${id}`, {
          data: { token: appState.user.token },
        })
        if (res.data == 'Success') {
          appDispatch({ type: 'flashMessage', value: 'Post deleted' })
          navigate(`/profile/${appState.user.username}`)
        }
      } catch (err) {
        console.log(err)
      }
    }
  }

  return (
    <Page title={post.title}>
      <div className="d-flex justify-content-between">
        <h2>{post.title}</h2>
        {isOwner() && (
          <span className="pt-2">
            <Link
              to={`/post/${post._id}/edit`}
              data-tip="Edit"
              data-for="edit"
              className="text-primary mr-2"
            >
              <i className="fas fa-edit"></i>
            </Link>
            <ReactTooltip id="edit" className="custom-tooltips" />{' '}
            <a
              onClick={deleteHandler}
              data-tip="Delete"
              data-for="delete"
              className="delete-post-button text-danger"
            >
              <i className="fas fa-trash"></i>
              <ReactTooltip id="delete" className="custom-tooltips" />
            </a>
          </span>
        )}
      </div>

      <p className="text-muted small mb-4">
        <Link to={`/profile/${post.author.username}`}>
          <img className="avatar-tiny" src={post.author.avatar} />
        </Link>
        Posted by{' '}
        <Link to={`/profile/${post.author.username}`}>
          {post.author.username}
        </Link>{' '}
        on {dateFormatted}
      </p>

      <div className="body-content">
        <ReactMarkdown
          children={post.body}
          allowedElements={[
            'p',
            'br',
            'strong',
            'em',
            'h1',
            'h2',
            'h3',
            'h4',
            'h5',
            'h6',
            'ol',
            'li',
          ]}
        />
      </div>
    </Page>
  )
}
