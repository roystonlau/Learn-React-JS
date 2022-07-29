import React, { useState, useReducer, useEffect } from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Axios from 'axios'
import StateContext from '../StateContext'
import DispatchContext from '../DispatchContext'
import { useImmerReducer } from 'use-immer'
import { CSSTransition } from 'react-transition-group'

// My Components
import Search from '../components/Search'
import Header from '../components/Header'
import HomeGuest from '../components/HomeGuest'
import Footer from '../components/Footer'
import About from '../components/About'
import Terms from '../components/Terms'
import Home from '../components/Home'
import CreatePost from '../components/CreatePost'
import ViewSinglePost from '../components/ViewSinglePost'
import FlashMessages from '../components/FlashMessages'
import Profile from '../components/Profile'
import EditPost from '../components/EditPost'
import NotFound from '../components/NotFound'
import Chat from '../components/Chat'

Axios.defaults.baseURL = 'http://localhost:8080'

function Main() {
  const initialState = {
    loggedIn: Boolean(localStorage.getItem('complexappToken')),
    flashMessages: [],
    user: {
      token: localStorage.getItem('complexappToken'),
      username: localStorage.getItem('complexappUsername'),
      avatar: localStorage.getItem('complexappAvatar'),
    },
    isSearchOpen: false,
    isChatOpen: false,
    unreadChatCount: 0,
  }
  function reducerfunct(draft, action) {
    switch (action.type) {
      case 'login':
        draft.loggedIn = true
        draft.user = action.data
        break

      case 'logout':
        draft.loggedIn = false
        break
      case 'flashMessage':
        draft.flashMessages.push(action.value)
        break

      case 'openSearch':
        draft.isSearchOpen = true
        break
      case 'closeSearch':
        draft.isSearchOpen = false
        break

      case 'toggleChat':
        draft.isChatOpen = !draft.isChatOpen
        break

      case 'closeChat':
        draft.isChatOpen = false
        break
      case 'incrementUnreadChatCount':
        draft.unreadChatCount++
        break

      case 'clearUnreadChatCount':
        draft.unreadChatCount = 0
        break
      default:
        break
    }
  }

  const [state, dispatch] = useImmerReducer(reducerfunct, initialState)

  useEffect(() => {
    if (state.loggedIn) {
      localStorage.setItem('complexappToken', state.user.token)
      localStorage.setItem('complexappUsername', state.user.username)
      localStorage.setItem('complexappAvatar', state.user.avatar)
    } else {
      localStorage.removeItem('complexappToken')
      localStorage.removeItem('complexappUsername')
      localStorage.removeItem('complexappAvatar')
    }
  }, [state.loggedIn])

  return (
    <StateContext.Provider value={state}>
      <DispatchContext.Provider value={dispatch}>
        <BrowserRouter>
          <FlashMessages messages={state.flashMessages} />
          <Header />
          <Routes>
            <Route path="/profile/:username/*" element={<Profile />} />
            <Route
              path="/"
              element={state.loggedIn ? <Home /> : <HomeGuest />}
            />
            <Route path="/post/:id" element={<ViewSinglePost />} />
            <Route path="/post/:id/edit" element={<EditPost />} />
            <Route path="/create-post" element={<CreatePost />} />
            <Route path="/about-us" element={<About />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
          <CSSTransition
            timeout={330}
            in={state.isSearchOpen}
            classNames="search-overlay"
            unmountOnExit
          >
            <Search />
          </CSSTransition>
          <Chat />
          <Footer />
        </BrowserRouter>
      </DispatchContext.Provider>
    </StateContext.Provider>
  )
}
const root = ReactDOM.createRoot(document.querySelector('#app'))
root.render(<Main />)

if (module.hot) {
  module.hot.accept()
}
