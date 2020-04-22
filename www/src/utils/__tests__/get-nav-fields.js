import { getNavFields } from "../get-nav-fields"

const itemList = [
  { link: "/" },
  { link: "/plot-summary/" },
  {
    link: "/themes/",
    items: [
      { link: "/themes/#the-american-dream" },
      { link: "/themes/#class-inequality" },
    ],
  },
  {
    link: "/characters/",
    items: [
      { link: "/characters/jay-gatsby/" },
      { link: "/characters/nick-carraway/" },
      {
        link: "/characters/buchanan/",
        items: [
          { link: "/characters/daisy-buchanan/" },
          { link: "/characters/tom-buchanan/" },
        ],
      },
    ],
  },
  {
    link: "/motifs/",
    items: [{ link: "/motifs/green-light/" }, { link: "/motifs/eyes/" }],
  },
]

const items = [
  {
    items: itemList,
  },
]

describe("getNavFields", () => {
  describe("parent", () => {
    it("can access the immediate parent of a link", () => {
      expect(getNavFields("/characters/jay-gatsby/", items).parent).toEqual(
        "/characters/"
      )
    })

    it("returns the correct top level link", () => {
      expect(getNavFields("/plot-summary/", items).parent).toEqual("/")
    })

    it("does not return a parent for a top level item", () => {
      expect(getNavFields("/", items).parent).toBeUndefined()
    })
  })

  describe("parents", () => {
    it("returns the entire hierarchy of parents for a link", () => {
      expect(
        getNavFields("/characters/daisy-buchanan/", items).parents
      ).toEqual(["/characters/buchanan/", "/characters/", "/"])
    })

    it("returns an empty array for a top level item", () => {
      expect(getNavFields("/", items).parents).toEqual([])
    })
  })

  describe("child items", () => {
    it("lists the child items of a section", () => {
      expect(getNavFields("/characters/", items).children).toEqual([
        "/characters/jay-gatsby/",
        "/characters/nick-carraway/",
        "/characters/buchanan/",
      ])
    })

    it("returns an empty array for leaf links", () => {
      expect(getNavFields("/plot-summary/", items).children).toEqual([])
    })
  })

  describe("previous and next", () => {
    it("gets sibling items in the same level", () => {
      const navFields = getNavFields("/characters/nick-carraway/", items)
      expect(navFields.prev).toEqual("/characters/jay-gatsby/")
      expect(navFields.next).toEqual("/characters/buchanan/")
    })

    it("gets sibling items in different levels", () => {
      expect(getNavFields("/characters/tom-buchanan/", items).next).toEqual(
        "/motifs/"
      )
      expect(getNavFields("/motifs/", items).prev).toEqual(
        "/characters/tom-buchanan/"
      )
    })

    it("does not return a sibling for the first and last item of the list", () => {
      expect(getNavFields("/", items).prev).toBeUndefined()
      expect(getNavFields("/motifs/eyes/", items).next).toBeUndefined()
    })

    it("ignores hash items", () => {
      expect(getNavFields("/themes/", items).next).toEqual("/characters/")
      expect(getNavFields("/characters/", items).prev).toEqual("/themes/")
    })
  })
})
