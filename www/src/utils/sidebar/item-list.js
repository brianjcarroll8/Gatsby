import React, { useContext } from "react"
import { getLocaleAndBasePath } from "../i18n"

const ItemListContext = React.createContext({})

function useItemList() {
  return useContext(ItemListContext)
}

function ItemListProvider({ sidebar, location, children }) {
  const { locale } = getLocaleAndBasePath(location.pathname)
  const itemList = sidebar[locale]
  return (
    <ItemListContext.Provider value={itemList}>
      {children}
    </ItemListContext.Provider>
  )
}

export { ItemListProvider, useItemList }
