import React, { useState } from "react"
import { Link } from "react-router-dom"
import styles from "./math-selectMode.module.css"

function MathSelectMode() {
  //const [mode, setMode] = useState("")

  return (
    <>
      <div className={styles.content}>
        <div className={styles.frow}>
          {/* <!-- leaderboard --> */}
          <div className={styles["lb-container"]}>
            <div className={styles["align-a-center"]}>
              <h4>Leaderboard</h4>
            </div>

            <div className={styles.player}>
              <a href="#" className="">
                <img className={styles["avatar-tiny"]} src="https://gravatar.com/avatar/b9216295c1e3931655bae6574ac0e4c2?s=128" />
              </a>

              <div className="">
                <p>Bobik12345_012345678</p>
              </div>

              <div className={styles["align-a-center"]}>
                <p>934</p>
              </div>
            </div>
          </div>

          {/*<!-- mode selector --> */}
          <div className={styles["mode-container"]}>
            <div className={[styles.frow, styles["header-board"]].join(" ")}>
              <div className={styles["select-challenge"]}>
                <p>select challenge mode</p>
              </div>
              <div className={styles["your-score"]}>
                <p>your overall score: ---</p>
              </div>
            </div>

            <div className={styles["mode-row"]}>
              <Link to="/math-challenge" state={{ from: "plus" }} className={[styles.box, styles.clickable].join(" ")}>
                  <h1>+</h1>
              </Link>

              <Link to="/math-challenge" state={{ from: "minus" }} className={[styles.box, styles.clickable].join(" ")}>
                <h1>&minus;</h1>
              </Link>
              <hr />
              <Link to="/math-challenge" state={{ from: "divide" }} className={[styles.box, styles.clickable].join(" ")}>
                <h1>&divide;</h1>
              </Link>
              <Link to="/math-challenge" state={{ from: "times" }} className={[styles.box, styles.clickable].join(" ")}>
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
