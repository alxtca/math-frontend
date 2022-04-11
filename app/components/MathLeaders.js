import React, { useEffect } from "react"
import { Link } from "react-router-dom"
import ReactTooltip from "react-tooltip"
import styles from "./math-selectMode.module.css"

function MathLeaders(props) {

  return (
    <div className={styles.player}>
      <Link data-for="profile" data-tip="User Profile" to={`/profile/${props.leader.username}`} 
      className={[styles.avatar].join(" ")}>
        <img className={styles["avatar-tiny"]} src={props.leader.avatar} />
      </Link>
      <ReactTooltip place="bottom" id="profile" className="custom-tooltip" />{" "}

      <div className={""}>
        <p>{props.leader.username}</p>
      </div>

      <div className={[styles.alignTextEnd].join(" ")}>
        <p>{props.leader.totalMathScore}</p>
      </div>
    </div>
  )
}

export default MathLeaders
