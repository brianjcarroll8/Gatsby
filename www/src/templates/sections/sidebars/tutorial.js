import { useStaticQuery, graphql } from "gatsby"

function useTutorialSidebar() {
  const { sidebarItemList } = useStaticQuery(graphql`
    {
      sidebarItemList(section: "tutorial")
    }
  `)
  return sidebarItemList
}

export default useTutorialSidebar
