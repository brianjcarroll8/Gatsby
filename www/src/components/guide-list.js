import React from "react"
import { Trans } from "@lingui/macro"

const GuideList = ({ items = [] }) => {
  const subitemList = items.map((subitem, i) => (
    <li key={i}>
      <a href={subitem.link}>{subitem.title}</a>
    </li>
  ))
  const toc = subitemList.length ? (
    <>
      <h2>
        <Trans>In this section:</Trans>
      </h2>
      <ul>{subitemList}</ul>
    </>
  ) : null
  return toc
}

export default GuideList
