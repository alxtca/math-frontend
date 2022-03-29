import React, { useEffect } from "react"
import styles from "./math-completed.module.css"
import { Link } from "react-router-dom"
import ReactTooltip from "react-tooltip"
//images
import Home from "./pics/home.png"
import Repeat from "./pics/repeat.png"
import Star from "./pics/star.png"

function MathCompleted(props) {
  function handleClick() {
    //reset game stats and game status
    props.setState(draft => {
      draft.status = "play"
      draft.current = 0
      draft.correct = 0
      draft.correctAnswer = true
    })
  }

  return (
    <>
      <div className={styles.content}>
        <div className={[styles.fcol, styles.completed].join(" ")}>
          <h1 className="">Completed</h1>
          <div className={[styles.stars, styles.frow].join(" ")}>
            <img className={styles[`${props.starsCount >= 2 ? "star-big" : "star-small"}`]} src={Star} alt="*" />
            <img className={styles[`${props.starsCount >= 1 ? "star-big" : "star-small"}`]} src={Star} alt="*" />
            <img className={styles[`${props.starsCount >= 3 ? "star-big" : "star-small"}`]} src={Star} alt="*" />
          </div>

          <div className={styles.stats}>
            <div className="">
              <p>
                <span>Accuracy :</span>&nbsp; {props.accuracy}%
              </p>
            </div>
            <div>
              <p>
                <span>Rate :</span>&nbsp; {props.rate}/min
              </p>
            </div>
            <div>
              <p>
                <span>Wrong :</span>&nbsp; {props.wrong}
              </p>
            </div>
          </div>

          <div className={[styles.frow, styles.fot].join(" ")}>
            <div>
              <Link to="/math-select_mode" className={[styles.fcol].join(" ")}>
                <img data-for="home" data-tip="Back to Home" className={[styles.home, styles.clickable].join(" ")} src={Home} alt="main" />
                <ReactTooltip place="bottom" id="home" className="custom-tooltip" />{" "}
              </Link>
              
            </div>

            <div className={styles.fcol} onClick={handleClick}>
              <img data-for="repeat" data-tip="Repeat" className={[styles.repeat, styles.clickable].join(" ")} src={Repeat} alt="repeat" />
              <ReactTooltip place="bottom" id="repeat" className="custom-tooltip" />{" "}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default MathCompleted
