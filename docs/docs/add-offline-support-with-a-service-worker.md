---
title: Adding Offline Support with a Service Worker
---

If you've run an [audit with Lighthouse](/docs/audit-with-lighthouse/), you may have noticed a lackluster score in the "Progressive Web App" category. Let's address how you can improve that score.

1.  You can [add a manifest file](/docs/add-a-manifest-file/). Ensure that the manifest plugin is listed _before_ the offline plugin so that the offline plugin can cache the created `manifest.webmanifest`.
2.  You can also add offline support, since another requirement for a website to qualify as a PWA is the use of a [service worker](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API). [Gatsby's offline plugin](/packages/gatsby-plugin-offline/) makes a Gatsby site work offline--and makes it more resistant to bad network conditions--by creating a service worker for your site.

## What is a service worker?

A service worker is a script that your browser runs in the background, separate from a web page, opening the door to features that don't need a web page or user interaction. They increase your site availability in spotty connections, and are essential to making a nice user experience.

It supports features like push notifications and background synchronization.

## Using service workers in Gatsby with `gatsby-plugin-offline`

Gatsby provides a plugin to create and load a service worker into your site: [gatsby-plugin-offline](/packages/gatsby-plugin-offline).

## Installing and using `gatsby-plugin-offline`

Install the plugin

```shell
npm install --save gatsby-plugin-offline
```

Add the plugin to your `gatsby-config.js`

```javascript:title=gatsby-config.js
{
  plugins: [
    {
      resolve: `gatsby-plugin-manifest`,
      options: {
        ...
      }
    },
    'gatsby-plugin-offline' // highlight-line
  ]
}
```

The recommended usage for `gatsby-plugiin-offline` is together with the [manifest plugin](/packages/gatsby-plugin-manifest). The offline plugin should be listed after the manifest plugin in the plugins array so that the manifest file can be included in the service worker.

### Configuring options for the offline plugin

The offline plugin is what will register a service worker that gets loaded in the client. The service worker will create an [app shell](https://developers.google.com/web/fundamentals/architecture/app-shell) which is essentially separate components of your application (e.g. header, footer, sidebar, etc.) that are instantly available from a service worker while dynamic content is fetched in the background. This creates a great end user experience, as the application is able to instantly render pieces of the layout as data and other JavaScript load in the background.

You can provide options to the offline plugin to add other features like custom service worker code or precached pages by the service worker.

```javascript:title=gatsby-config.js
{
  plugins: [
    {
      resolve: `gatsby-plugin-manifest`,
      options: {
        ...
      }
    },
    {
      resolve: `gatsby-plugin-offline`,
      options: {
        appendScript: require.resolve(`src/custom-sw-code.js`), // highlight-line
        precachePages: [`/about-us/`, `/projects/*`], // highlight-line
      }
    },
  ]
}
```

You can read about the specific of these options in the plugin's README.

Note: Service worker registers only in production builds (`gatsby build`).

## Displaying a message when a service worker updates

To display a custom message once your service worker finds an update, you can use the [`onServiceWorkerUpdateReady`](/docs/browser-apis/#onServiceWorkerUpdateReady) browser API in your `gatsby-browser.js` file. The following code will display a confirm prompt asking the user whether they would like to refresh the page when an update is found:

```javascript:title=gatsby-browser.js
export const onServiceWorkerUpdateReady = () => {
  const answer = window.confirm(
    `This application has been updated. ` +
      `Reload to display the latest version?`
  )

  if (answer === true) {
    window.location.reload()
  }
}
```

## Using a custom service worker in Gatsby

You can add a custom service worker if your use case requires something that `gatsby-plugin-offline` doesn't support, or you don't want the behavior provided by the plugin.

In order to add your own service worker without using the plugin, add a file called `sw.js` in the `static` folder.

Use the [`registerServiceWorker`](/docs/browser-apis/#registerServiceWorker) browser API in your `gatsby-browser.js` file.

```javascript:title=gatsby-browser.js
export const registerServiceWorker = () => true
```

By returning true from the `registerServiceWorker` API, Gatsby will look for the `sw.js` file and register the custom service worker from your file.

## Removing the service worker

If you would like to fully remove the service worker from your site, you can use the plugin `gatsby-plugin-remove-serviceworker` in place of `gatsby-plugin-offline`. See [the README for `gatsby-plugin-offline`](/packages/gatsby-plugin-offline/#remove) for instructions how to do this.

## References

- [gatsby-plugin-offline README](/packages/gatsby-plugin-offline)
- [Service Workers: an Introduction](https://developers.google.com/web/fundamentals/primers/service-workers/)
- [Service Worker API](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
