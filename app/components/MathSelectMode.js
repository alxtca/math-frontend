import React, { useState, useEffect, useContext } from "react"
import { Link } from "react-router-dom"
import styles from "./math-selectMode.module.css"
import Axios from 'axios'
import StateContext from "../StateContext"
import DispatchContext from "../DispatchContext"
//components
import MathLeaders from "./MathLeaders"

function MathSelectMode() {
  //to have access to user token, to get overall score
  const appState = useContext(StateContext)
  //for flash messages
  const appDispatch = useContext(DispatchContext)
  //overall score state
  const [score, setScore] = useState("loading...")
  //leaderboard state
  const [leaders, setLeaders] = useState([{avatar: "", username: "bob_999", totalMathScore: 9999}])
//get score on first render, remove score on logout
  useEffect(async() => {
    if (appState.loggedIn) {
      try {
        let results = await Axios.post('/math-overall-score', {token: appState.user.token})         
        //update state to show points earned on screen
        setScore(results.data)
      } catch(e) {
        console.log("failed to send data to server")
      }  
    }
    else if (!appState.loggedIn) {
      setScore('000')
      appDispatch({ type: "flashMessage", value: "To store results and participate on leaderboard please login."})
    }
  }, [appState.loggedIn])

  //update leaderboard on first render //to do: update continuously through web sockets.
  useEffect(async () => {
    let results = await Axios.get('/math-leaderboard') 
    console.log(results.data)
    setLeaders(results.data)
  }, [])

  return (
    <>
      <div className={styles.content}>
        <div className={styles.frow}>
          {/* <!-- leaderboard --> */}
          <div className={styles["lb-container"]}>
            <div className={styles["align-a-center"]}>
              <h4>Leaderboard</h4>
            </div>

            {/* <!-- Players on leaderboard --> */}
            {leaders.map((obj, id) => <MathLeaders leader={obj} key={id} id={id}/> )}

          </div>

          {/*<!-- mode selector --> */}
          <div className={styles["mode-container"]}>
            <div className={[styles.frow, styles["header-board"]].join(" ")}>
              <div className={styles["select-challenge"]}>
                <p>select challenge mode</p>
              </div>
              <div className={styles["your-score"]}>
                <p>your overall score: {score}</p>
              </div>
            </div>

            <div className={styles["mode-row"]}>
              <Link to="/math-challenge" state={{ from: "plus" }} className={[styles.box, styles.clickable, styles.link].join(" ")}>
                  <h1>+</h1>
              </Link>

              <Link to="/math-challenge" state={{ from: "minus" }} className={[styles.box, styles.clickable, styles.link].join(" ")}>
                <h1>&minus;</h1>
              </Link>
              <hr />
              <Link to="/math-challenge" state={{ from: "divide" }} className={[styles.box, styles.clickable, styles.link].join(" ")}>
                <h1>&divide;</h1>
              </Link>
              <Link to="/math-challenge" state={{ from: "mult" }} className={[styles.box, styles.clickable, styles.link].join(" ")}>
                <h1>&times;</h1>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default MathSelectMode
