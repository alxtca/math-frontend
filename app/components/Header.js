import React, { useContext} from 'react'
import { Link } from 'react-router-dom'
import HeaderLoggedOut from './HeaderLoggedOut'
import HeaderLoggedIn from './HeaderLoggedIn'
import StateContext from '../StateContext'

function Header(props) {
  const appState = useContext(StateContext)
  //to create static html (to display before all content is loaded on slow internet connection)
  //this will be rendered normally if props dont contain: staticEmpty={true}
  const headerContent = appState.loggedIn ? <HeaderLoggedIn /> : <HeaderLoggedOut /> 

  return(
    <>
      <header className="header-bar bg-primary mb-3">
        <div className="container d-flex flex-column flex-md-row align-items-center p-3">
          <h4 className="my-0 mr-md-auto font-weight-normal">
            <Link to="/" className="text-white">
              ComplexApp
            </Link>
          </h4>
          <h4 className="my-0 mr-md-auto font-weight-normal">
            <Link to="/math-select_mode" className="text-white">
              MathApp
            </Link>
          </h4>
          {!props.staticEmpty ? headerContent : ""}   
        </div>
      </header>
    </>
  )
}

export default Header