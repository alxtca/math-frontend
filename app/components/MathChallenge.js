import React, { useState, useEffect, useContext } from "react"
import styles from "./math-challenge.module.css"
import { useImmer } from "use-immer"
import { useLocation, Link } from "react-router-dom"
import ReactTooltip from "react-tooltip"
import Axios from "axios"
import StateContext from "../StateContext"
//components
import MathCompleted from "./MathCompleted"
//images
import Pause from "./pics/pause.png"
import Happy from "./pics/happy.png"
import Cry from "./pics/cry.png"
import Play from "./pics/play.png"
import Home from "./pics/home.png"

function MathChallenge(props) {
  //to have access to user token, to store challenge results
  const appState = useContext(StateContext)
  //extract mode value that was sent with Link
  const location = useLocation()
  const mode = location.state.from
  //to render correct symbol in html. utilize unicode values.
  const modeSymbol = (function () {
    switch (mode) {
      case "plus":
        return String.fromCharCode(43)
      case "minus":
        return String.fromCharCode(8722)
      case "divide":
        return String.fromCharCode(247)
      case "mult":
        return String.fromCharCode(215)
    }
  })() //immediately invoked function express

  //answer entered by user
  const [userInput, setUserInput] = useState('')
  const [theTime, setTheTime] = useImmer({
    start: 0,
    duration: 0,
  })

  //game stats //create state with immer
  const [state, setState] = useImmer({
    //
    total: 15,
    current: 0,
    correct: 0,
    status: "pause", //play, pause, done
    firstNum: 0,
    secondNum: 0,
    correctAnswer: true,
    //values to send to "comleted" screen
    accuracy: 0, //(correct/total)*100
    rate: 0, //calculate answers per minute
    wrong: 0, //total-correct
    stars: 0,
    pointsEarned: "loading...",
    //radio button selected
    level: "1",
    //total coefficient for score calculation on backend
    totalCoefficient: 0
  })

  // on game completion send game stats to backend. Only if user is logged in(use stateContext() to check login status).
  useEffect(async() => {
    if (state.status === "done" && appState.loggedIn) {
      try {
        let results = await Axios.post('/math-challenge-results',
         {token: appState.user.token, mode: mode, level: state.level, totCoef: state.totalCoefficient})
        console.log("points earned: " + results.data)
        //update state to show points earned on screen
        setState(draft => {
          draft.pointsEarned = results.data
        })
      } catch(e) {
        console.log("failed to send data to server")
      }  
    }
    else if (state.status === "done" && !appState.loggedIn) {
      console.log("To store results please login.")
      //add flash message
    }
  }, [state.status])

    //update timer when game starts
  useEffect(() => {
    if(state.status === "play") {
      setTheTime(draft =>
        {
          draft.start= new Date()
        })       
    }
  }, [state.status])

  function generateRandomNumber() {
    return Math.floor(Math.random() * (levels[mode][state.level].max - levels[mode][state.level].min + 1) + levels[mode][state.level].min) //The maximum is inclusive and the minimum is inclusive
  }

  //generate new random numbers on first render, level change, current change. //GAME FINISH condition
  useEffect(() => {
    regenerateNums()
    //To finish the game
    if (state.current === state.total) {
      const gameTimeDuration = Math.round((new Date() - theTime.start)/1000)
      const accuracyCoefficient = state.correct / state.total
      //calculate timebonus coefficient (max possible value shall be 1) ---------- this should be affected by level
      var timebonusCoefficient = (state.total/gameTimeDuration)*(parseInt(state.level))
      if (timebonusCoefficient > 1) {timebonusCoefficient = 1}
      //total coefficient will be used on backend to add to total player score. and level played.
      const totalCoefficient = accuracyCoefficient*timebonusCoefficient
      // calculate #of stars earned (40% - 1, 70% - 2, 90% - 3) 
      const starsCount = (function (){
        if(totalCoefficient > 0.9) return 3
        else if(totalCoefficient > 0.7) return 2
        else if(totalCoefficient > 0.4) return 1
        else return 0
      })()
      //answers per minute
      const answersPerMinute = Math.round(state.total/(gameTimeDuration/60))
      setTheTime(draft =>
        {
          draft.duration = gameTimeDuration
        })
      setState(draft => {
        draft.accuracy = parseInt(accuracyCoefficient * 100)
        draft.rate = answersPerMinute
        draft.wrong = state.total - state.correct
        draft.stars = starsCount
        draft.totalCoefficient = totalCoefficient
        draft.status = "done"
      }) 
    }
  }, [state.level, state.current])
  //random numbers ranges for all modes
  const levels = {
    plus: {
      1: { min: 1, max: 5 },
      2: { min: 2, max: 10 },
      3: { min: 4, max: 19 },
      4: { min: 11, max: 29 },
      5: { min: 21, max: 99 }
    },
    minus: {
      1: { min: 1, max: 5 },
      2: { min: 2, max: 10 },
      3: { min: 4, max: 19 },
      4: { min: 11, max: 29 },
      5: { min: 21, max: 99 }
    },
    mult: {
      1: { min: 2, max: 5 },
      2: { min: 2, max: 7 },
      3: { min: 4, max: 9 },
      4: { min: 2, max: 11 },
      5: { min: 2, max: 12 }
    },
    divide: {
      1: { min: 2, max: 5 },
      2: { min: 2, max: 7 },
      3: { min: 2, max: 9 },
      4: { min: 2, max: 11 },
      5: { min: 2, max: 12 }
    }
  }
  //reset game progress if level has been changed
  useEffect(() => {
    setState(draft => {
      draft.current = 0
      draft.correct = 0
      draft.correctAnswer = true
    })
  }, [state.level])
  /*
//manage time measurement. 
  useEffect(() => {
    //start measurement only when state.status has been sett to "play"
    if(state.status === "play") {
      setGameTime(draft => {draft.start = new Date()})
    }
  }, [state.status])
*/
  function regenerateNums() {
    //to avoid similar numbers several times in a row
    //compare previous number state.firstNum to new number newNum1. Only then dispatch state update
    var newNum1
    var newNum2
    do {
      //generate new numbers depending on mode selected
      if (mode === "plus" || mode === "mult") {
        newNum1 = generateRandomNumber()
        newNum2 = generateRandomNumber()
      } else if (mode === "minus") {
        //biggest number of two generated shall be written into draft.firstNum
        const firstTemp = generateRandomNumber()
        const secondTemp = generateRandomNumber()
        if (firstTemp > secondTemp) {
          newNum1 = firstTemp
          newNum2 = secondTemp
        } else {
          newNum2 = firstTemp
          newNum1 = secondTemp
        }
      } else if (mode === "divide") {
        //multiply random two numbers , num1 = answer , num2 = one of the numbers used
        const firstTemp = generateRandomNumber()
        const secondTemp = generateRandomNumber()
        const multiplicationResult = firstTemp * secondTemp
        newNum1 = multiplicationResult
        newNum2 = firstTemp
      } else {
        //something went wrong
      }
      //regenerate numbers if both old numbers are same as both new numbers
    } while (newNum1 === state.firstNum || newNum2 === state.secondNum)

    //dispatch state update
    setState(draft => {
      draft.firstNum = newNum1
      draft.secondNum = newNum2
    })
  }

  function handleRadio(e) {
    setState(draft => {
      draft.level = e.target.value
    })
  }

  function checkUserAnswer() {
    //check depends on mode selected
    if (mode === "plus") {
      if (state.firstNum + state.secondNum === parseInt(userInput)) {
        setState(draft => {
          draft.correct++
          draft.correctAnswer = true
        })
      } else {
        setState(draft => {
          draft.correctAnswer = false
        })
      }
    } else if (mode === "minus") {
      if (state.firstNum - state.secondNum === parseInt(userInput)) {
        setState(draft => {
          draft.correct++
          draft.correctAnswer = true
        })
      } else {
        setState(draft => {
          draft.correctAnswer = false
        })
      }
    } else if (mode === "divide") {
      if (state.firstNum / state.secondNum === parseInt(userInput)) {
        setState(draft => {
          draft.correct++
          draft.correctAnswer = true
        })
      } else {
        setState(draft => {
          draft.correctAnswer = false
        })
      }
    } else if (mode === "mult") {
      if (state.firstNum * state.secondNum === parseInt(userInput)) {
        setState(draft => {
          draft.correct++
          draft.correctAnswer = true
        })
      } else {
        setState(draft => {
          draft.correctAnswer = false
        })
      }
    } else {
      //something went wrong
      alert("something went wrong during answer check")
    }
  }

  function handleSubmit(e) {
    e.preventDefault()
    setState(draft => {draft.current++})
    checkUserAnswer()
    //clear input field
    setUserInput("")
  }

  function playHandler() {
    setState(draft => {
      draft.status = "play"
    })
  }
  function pauseHandler() {
    setState(draft => {
      draft.status = "pause"
    })
  }

//--RENDER COMPONENTS
  if (state.status === "pause") {
    return (
      <>
        <div className={[styles.content, styles.frow].join(" ")}>
          {/*<!-- settings area -->*/}
          <div className={[styles.fcol, styles.mode].join(" ")}>
            <div className={[styles.frow, styles["align-a-center"], styles["mode-header"]].join(" ")}>
              <div>Mode:</div>
              <div>{modeSymbol}</div>
            </div>

            <div className={[styles.fcol, styles["mode-select"]].join(" ")}>
              <p className={styles["align-a-center"]}>Select Level: &nbsp;</p>

              <label className="">
                <input type="radio" name="lvl" value="1" checked={state.level === "1"} onChange={handleRadio} />1
              </label>
              <label className="">
                <input type="radio" name="lvl" value="2" checked={state.level === "2"} onChange={handleRadio} />2
              </label>
              <label>
                <input type="radio" name="lvl" value="3" checked={state.level === "3"} onChange={handleRadio} />3
              </label>
              <label>
                <input type="radio" name="lvl" value="4" checked={state.level === "4"} onChange={handleRadio} />4
              </label>
              <label>
                <input type="radio" name="lvl" value="5" checked={state.level === "5"} onChange={handleRadio} />5
              </label>
            </div>

            <div className={styles["align-a-center"]}>
              numbers: {levels[mode][state.level].min}-{levels[mode][state.level].max}
            </div>
          </div>

          {/*<!-- action area -->*/}
          <div className={[styles.fcol, styles.act].join(" ")}>
            <div className={[styles.frow, styles["act-header"]].join(" ")}>
              <div className="">
                <img className={[styles.pause, styles.clickable, styles.hideit].join(" ")} src={Pause} alt="pause" />
              </div>

              <div className={styles["align-a-center"]}>
                <p className="">
                  {state.current}/{state.total}
                </p>
              </div>
              <div className={styles["align-a-center"]}>
                <p className="">correct: {state.correct}</p>
              </div>
            </div>

            <div className={[styles.play, styles.buttons].join(" ")}>

              <Link to="/math-select_mode" className={[styles.fcol].join(" ")}>
                <img data-for="home" data-tip="Back to Home" className={[styles.home, styles.clickable].join(" ")} src={Home} alt="main" />
                <ReactTooltip place="bottom" id="home" className="custom-tooltip" />{" "}
              </Link>
              
              <img data-for="play" data-tip="Play" onClick={playHandler} className={[styles.pause, styles.clickable].join(" ")} src={Play} alt="pause" />
              <ReactTooltip place="bottom" id="play" className="custom-tooltip" />{" "}
            </div>
          </div>
        </div>
      </>
    )
  }

  if (state.status === "done") {
    return <MathCompleted points={state.pointsEarned} starsCount={state.stars} gametime={theTime.duration} accuracy={state.accuracy} 
    rate={state.rate} wrong={state.wrong} setState={setState} setModeSelected={props.setModeSelected} loggedin={appState.loggedIn}/>
  }
// if mode === "play"
  return (
    <>
      <div className={[styles.content, styles.frow].join(" ")}>
        {/*<!-- settings area -->*/}
        <div className={[styles.fcol, styles.mode].join(" ")}>
          <div className={[styles.frow, styles["align-a-center"]].join(" ")}>
            <div>Mode:</div>
            <div>{mode}</div>
          </div>

          <div className={[styles.fcol, styles["mode-select"]].join(" ")}>
          </div>
        </div>

        {/*<!-- action area -->*/}
        <div className={[styles.fcol, styles.act].join(" ")}>
          <div className={[styles.frow, styles["act-header"]].join(" ")}>
            <div className="">
              <img onClick={pauseHandler} className={[styles.pause, styles.clickable].join(" ")} src={Pause} alt="pause.png" />
            </div>
            <div className={styles["align-a-center"]}>
              <p className="">
                {state.current}/{state.total}
              </p>
            </div>
            <div className={styles["align-a-center"]}>
              <p className="">correct: {state.correct}</p>
            </div>
          </div>

          <div className={[styles.task].join(" ")}>
            <form onSubmit={handleSubmit} className={[styles.frow, styles["action-form"]].join(" ")}>
              <p className={styles["item-1"]}>
                {state.firstNum} {modeSymbol} {state.secondNum}
              </p>
              <p className={styles["item-2"]}>=</p>
              <div className={styles["item-3"]}>
                <input autoFocus value={userInput} onChange={e => setUserInput(e.target.value)} className={styles["action-input"]} type="text" placeholder="?" maxLength="4" size="4" autoComplete="off" />
              </div>
            </form>
          </div>

          <div className={styles["act-footer"]}>
            <img className={styles["happy"]} src={state.correctAnswer ? Happy : Cry} alt="happy" />
          </div>
        </div>
      </div>
    </>
  )
}

export default MathChallenge
