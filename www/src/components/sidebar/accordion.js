/** @jsx jsx */
import { jsx } from "theme-ui"
import React from "react"

import Item from "./item"
import { Title, TitleButton, SplitButton } from "./section-title"

const ItemWithSubitems = ({
  itemRef,
  activeItemLink,
  isExpanded,
  isParentOfActiveItem,
  item,
  onLinkClick,
  onSectionTitleClick,
  uid,
  disableAccordions,
}) => {
  const SectionTitleComponent = disableAccordions ? Title : TitleButton
  const isActive = item.link === activeItemLink.link

  return item.link ? (
    <SplitButton
      itemRef={itemRef}
      isActive={isActive}
      isExpanded={isExpanded}
      isParentOfActiveItem={isParentOfActiveItem}
      item={item}
      onLinkClick={onLinkClick}
      onSectionTitleClick={onSectionTitleClick}
      uid={uid}
    />
  ) : (
    <SectionTitleComponent
      isActive={isActive}
      isExpanded={isExpanded}
      isParentOfActiveItem={isParentOfActiveItem}
      item={item}
      onSectionTitleClick={onSectionTitleClick}
      uid={uid}
    />
  )
}

export default function Accordion({
  itemRef,
  activeItemLink,
  activeItemParents,
  isActive,
  isParentOfActiveItem,
  item,
  location,
  onLinkClick,
  onSectionTitleClick,
  openSectionHash,
  isSingle,
  disableAccordions,
}) {
  const uid = `item${item.link.replace(/\//g, "_")}`
  const isExpanded = openSectionHash[item.title] || disableAccordions

  return (
    <li
      sx={{
        bg:
          (isParentOfActiveItem && item.level === 0) ||
          (isActive && item.level === 0)
            ? `sidebar.activeSectionBackground`
            : false,
        position: `relative`,
        transition: t =>
          `all ${t.transition.speed.fast} ${t.transition.curve.default}`,
        mt: t =>
          item.level === 0 && disableAccordions && !isSingle
            ? `${t.space[4]} !important`
            : false,
        ...(item.level === 0 &&
          !isSingle && {
            "::before": {
              content: `" "`,
              position: `absolute`,
              borderTopWidth: `1px`,
              borderTopStyle: `solid`,
              borderColor: `ui.border`,
              left: t =>
                (isParentOfActiveItem && isExpanded) || (isActive && isExpanded)
                  ? 0
                  : t.space[6],
              right: 0,
              top: 0,
            },
            ":after": {
              top: `auto`,
              bottom: -1,
            },
          }),
      }}
    >
      <ItemWithSubitems
        itemRef={itemRef}
        activeItemLink={activeItemLink}
        activeItemParents={activeItemParents}
        isActive={isActive}
        isExpanded={isExpanded}
        isParentOfActiveItem={isParentOfActiveItem}
        item={item}
        onLinkClick={onLinkClick}
        onSectionTitleClick={onSectionTitleClick}
        uid={uid}
        disableAccordions={disableAccordions}
      />
      {isExpanded && (
        <ul
          id={uid}
          sx={{
            listStyle: `none`,
            margin: 0,
            position: `relative`,
            ...(item.ui === `steps` && {
              "&:after": {
                backgroundColor: `ui.border`,
                bottom: 0,
                content: `''`,
                left: 27,
                position: `absolute`,
                top: 0,
                width: 1,
              },
            }),
          }}
        >
          {item.items.map(subitem => (
            <Item
              activeItemLink={activeItemLink}
              activeItemParents={activeItemParents}
              item={subitem}
              key={subitem.title}
              location={location}
              onLinkClick={onLinkClick}
              isExpanded={isExpanded}
              onSectionTitleClick={onSectionTitleClick}
              openSectionHash={openSectionHash}
              ui={item.ui}
            />
          ))}
        </ul>
      )}
    </li>
  )
}
