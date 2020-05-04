## Problem description:

Currently there is no good way to add dependencies to webpack bundles in cases where those depend on data. Examples of those are:

- `gatsby-plugin-mdx` where users can add arbitrary import statements in their `.mdx` files
- page builders where CMS provides set of components and page template then need to map those to actual react components. Right now page template need to import all possible components and determine which to use in template.

There are currently 2 approaches to this and each have its own problems:

1.  Use lazy loading (`loadable-components` / `react-loadable` / custom solutions using dynamic imports):
    - This means we don't load unneeded chunks as only what's needed get fetched
    - It also means there is request waterfall: we first need to load page template chunk, evaluate and run it and only then we star fetching resources for those additional components. It also mean that first paint of page doesn't show those components (it can show placeholders) so there also is bad UX involved with content jumping around. It also might cause problems with SSR depending on the solution (either render placeholders in SSR, or render final one - but then there are hydrations issues)
2.  Add every potentially needed components into page template or app chunks. This cause fetching and parsing more js that is needed.

## Proposed API:

### `context.pageDependencies.addModule`

NOTE: in this proposal, this is only available in graphql resolvers and not in general gatsby-node context. Reason for it is that Gatsby being in charge of running queries makes it easier to avoid weird edge cases and only thing that need to be coordinated is query running and webpack using this limitation. Additionally gatsby is aware what page query is run for, so users don't need to handle assigning modules to particular pages, because this is done behind the scenes. On top of that we already have query results invalidation that will also handle cases of removing stale modules, which otherwise would be responsibility of users/plugins and given our experience with caching problems in 3rd party code I think it's safe assumption that if users/plugins would be responsible for it it wouldn't be done correctly (it would also be heard to teach / document).

This is responsible for adding given module to webpack bundle (if it didn't exist yet) and to add it to `page-data.json` / `app-data.json` so runtime loader knows that it is page/app dependency it needs to fetch.

```js
const identifier = context.pageDependencies.addModule({
  // TBD figure out who should be reponsible for handling local paths - do we require either absolute path or node_modules package name?
  // Example of something that is unclear what would be responsible for resolving: `import Something from "../../src/components/component-used-in-mdx"`
  source: `some-module`,

  // import type:
  //  - default (`import DefaultExport from "some-module"`)
  //  - named (`import { NamedExport } from "some-module"`)
  //  - namespace (`import * as Namespace from "some-module")
  type: `default` | `named` | `namespace`,

  // optional - only for `named` type (`import { NamedExport } from "some-module"`)
  import: `NamedExport`,
})
```

Return value of this function (module identifier) will be used in frontend code to access modules.

If you want to include multiple named exports - you call `context.pageDependencies.addModule` (with same `source`) multiple times for each named export.

Using `context.pageDependencies.*` also allow to cheaply add more kind of dependencies for page in future - examples:

- asset resources like images/fonts that would only need to preload
- json payloads that don't need to be handled by webpack

### `import { getModule } from "gatsby"`

`context.pageDependencies.addModule` API makes sure modules are bundled and are loaded. We still need a way to access those in frontend code.

```js
import { getModule, graphql } from "gatsby"

...

const someModule = getModule(moduleIdentifier)
```

API is low-level and primary usage is meant for plugins (like MDX), but users could make use of it in their sites as well for scenarios like Page Builders that you assign each block in CMS to particular component in your source code.

Use case like this is perfect, because we will load only components that given page needs and not all the components available.

```jsx
import { getModule } from "gatsby"

const PageTemplate = ({ data }) => {

  return <>
    {data.listOfPageBuilderElements.map(({ moduleID, data}) => {
      const Component = getModule(moduleID)

      return <Component data={data} />
    })}
  </>
}

export pageQuery = graphql`
  {
    listOfPageBuilderElements {
      moduleID
      data
    }
  }
`
```

In future this will become hopefully more manageable with GraphQL Components / Query data processors that would abstract usage of `getModule` from user's code.

As alternative to `getModules` this could be just set as page prop (or maybe both of those could be implemented). I don't have strong opinions on frontend part of the API.

### (optional) `actions.registerModule`:

While this part of API is not needed to make it work. Users/plugins being able to explicitly register modules (without tying them to pages yet) is something to consider. Consider scenario when there is component that is used from time to time (for example "limited-time offer component"). If the component is added to webpack deps only when it's used means there will be webpack hash change every time when component is added/removed forcing Gatsby to rewrite all .html files. Ensuring that component is bundled (even if it's not used) can stabilize webpack hashes and avoid the need to rewrite all .html pages because of content change.

## Tangential: feature checking

There is common problem with Gatsby plugins and new APIs is that plugins trying to make use of new APIs just break on older version of Gatsby. This often requires doing MAJOR version bump and declaring that plugin requires Gatsby core version ^x.y.z (whenever API was implemented). This however is problematic for users, because it's on them to keep track of things like that and they won't get benefits "for free".

Testing for existence of some APIs is one way to go about it now, but it only works in limited number of scenarios. For example - you can't do that for `gatsby-X.js` hooks (like `createSchemaCustomization`). You also wouldn't really be able to do that here. At the time you get to calling field resolvers (when users would first get ability to call `context.pageDependencies.addModule`) - this would already be too late. There is lot of logic that happens before that right now which could be disabled if plugin knew that API exists (different code path).

I would really love to have `@supports`-like (CSS-inspired) function in Gatsby that would help plugin authors and plugin users (in my opinion)
