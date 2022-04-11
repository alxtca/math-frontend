import React from "react"
import Page from "./Page"

function About() {
  return (
    <Page title="About Us" wide={true}>
      <h2>MERN stack</h2>
      <p className="lead text-muted">This project is build with MERN tech stack</p>
      <p>MERN stands for MongoDB, Express, React, Node, after the four key technologies that make up the stack.</p>
      <ul>
        <li>MongoDB - document database</li>
        <li>Express(.js) - Node.js web framework</li>
        <li>React(.js) - a client-side JavaScript framework</li>
        <li>Node(.js) - the premier JavaScript web server</li>
      </ul>

       </Page>
  )
}

export default About