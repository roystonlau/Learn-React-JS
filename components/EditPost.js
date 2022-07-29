import React, { useContext } from 'react'
import Page from './Page'
import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import Axios from 'axios'
import LoadingDotIcon from './LoadingDotIcon'
import { useImmerReducer } from 'use-immer'
import StateContext from '../StateContext'
import DispatchContext from '../DispatchContext'
import NotFound from './NotFound'

export default function EditPost() {
  const appState = useContext(StateContext)
  const appDispatch = useContext(DispatchContext)
  const navigate = useNavigate()

  const initialState = {
    title: {
      value: '',
      hasErrors: false,
      message: '',
    },
    body: {
      value: '',
      hasErrors: false,
      message: '',
    },
    isFetching: true,
    isSaving: false,
    id: useParams().id,
    sendCount: 0,
    notFound: false,
  }

  function ourReducer(draft, action) {
    switch (action.type) {
      case 'fetchComplete':
        draft.title.value = action.value.title
        draft.body.value = action.value.body
        draft.isFetching = false

        break

      case 'titleChange':
        draft.title.hasErrors = false
        draft.title.value = action.value
        break
      case 'bodyChange':
        draft.body.hasErrors = false
        draft.body.value = action.value
        break

      case 'submitRequest':
        if (!draft.title.hasErrors && !draft.body.hasErrors) {
          draft.sendCount++
        }
        break

      case 'saveRequestStarted':
        draft.isSaving = true
        break
      case 'saveRequestFinished':
        draft.isSaving = false
        break

      case 'titleRules':
        if (!action.value.trim()) {
          draft.title.hasErrors = true
          draft.title.message = 'You must provide a title'
        }
        break

      case 'bodyRules':
        if (!action.value.trim()) {
          draft.body.hasErrors = true
          draft.body.message = 'You must provide a body content'
        }
        break
      case 'notFound':
        draft.notFound = true
        break
      default:
        break
    }
  }
  const [state, dispatch] = useImmerReducer(ourReducer, initialState)

  function submitHandler(e) {
    e.preventDefault()
    dispatch({ type: 'titleRules', value: state.title.value })
    dispatch({ type: 'bodyRules', value: state.body.value })
    dispatch({ type: 'submitRequest' })
  }

  useEffect(() => {
    const ourRequests = Axios.CancelToken.source()
    async function fetchPost() {
      try {
        const response = await Axios.get(`/post/${state.id}`, {
          cancelToken: ourRequests.token,
        })
        if (response.data) {
          dispatch({ type: 'fetchComplete', value: response.data })
          if (appState.user.username != response.data.author.username) {
            appDispatch({
              type: 'flashMessage',
              value: 'You do not have permission to edit that post',
            })
            navigate('/')
          }
        } else {
          dispatch({ type: 'notFound' })
        }
      } catch (error) {
        console.log(error ? error : 'User cancel')
      }
    }
    fetchPost()
    return () => {
      ourRequests.cancel()
    }
  }, [])

  useEffect(() => {
    if (state.sendCount) {
      dispatch({ type: 'saveRequestStarted' })
      const ourRequests = Axios.CancelToken.source()
      async function fetchPost() {
        try {
          const response = await Axios.post(
            `/post/${state.id}/edit`,
            {
              title: state.title.value,
              body: state.body.value,
              token: appState.user.token,
            },
            {
              cancelToken: ourRequests.token,
            },
          )
          dispatch({ type: 'saveRequestFinished' })
          appDispatch({ type: 'flashMessage', value: 'Post was updated' })
        } catch (error) {
          console.log(error ? error : 'User cancel')
        }
      }
      fetchPost()
      return () => {
        ourRequests.cancel()
      }
    }
  }, [state.sendCount])

  if (state.notFound) {
    return <NotFound></NotFound>
  }

  if (state.isFetching)
    return (
      <Page title="...">
        <LoadingDotIcon />
      </Page>
    )

  return (
    <Page title="Edit Post">
      <Link className="small font-weight-bold" to={`/post/${state.id}`}>
        &laquo; Back to post permalink
      </Link>
      <form className='"mt' onSubmit={submitHandler}>
        <div className="form-group">
          <label htmlFor="post-title" className="text-muted mb-1">
            <small>Title</small>
          </label>
          <input
            onChange={(e) => {
              dispatch({ type: 'titleChange', value: e.target.value })
            }}
            autoFocus
            value={state.title.value}
            name="title"
            id="post-title"
            className="form-control form-control-lg form-control-title"
            type="text"
            placeholder=""
            autoComplete="off"
            onBlur={(e) =>
              dispatch({ type: 'titleRules', value: e.target.value })
            }
          />
          {state.title.hasErrors && (
            <div className="alert alert-danger small liveValidateMessage">
              {state.title.message}
            </div>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="post-body" className="text-muted mb-1 d-block">
            <small>Body Content</small>
          </label>
          <textarea
            onChange={(e) => {
              dispatch({ type: 'bodyChange', value: e.target.value })
            }}
            name="body"
            id="post-body"
            className="body-content tall-textarea form-control"
            type="text"
            value={state.body.value}
            onBlur={(e) =>
              dispatch({ type: 'bodyRules', value: e.target.value })
            }
          />
          {state.body.hasErrors && (
            <div className="alert alert-danger small liveValidateMessage">
              {state.body.message}
            </div>
          )}
        </div>

        <button disabled={state.isSaving} className="btn btn-primary">
          Save Update
        </button>
      </form>
    </Page>
  )
}
