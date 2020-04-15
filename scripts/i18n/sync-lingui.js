const fs = require(`fs`)
const log4js = require(`log4js`)
const shell = require(`shelljs`)
const { graphql: baseGraphql } = require(`@octokit/graphql`)
let logger = log4js.getLogger(`sync-lingui`)
logger.level = `info`

require(`dotenv`).config()

const token = process.env.GITHUB_API_TOKEN
const host = `https://${token}@github.com`
const cacheDir = `.cache`
const owner = `gatsbyjs`
const repoBase = `gatsby`

// get the git short hash
function getShortHash(hash) {
  return hash.substr(0, 7)
}

function cloneOrUpdateRepo(repoName, repoUrl) {
  if (shell.ls(repoName).code !== 0) {
    logger.debug(`cloning ${repoName}`)
    shell.exec(`git clone ${repoUrl}`)
    shell.cd(repoName)
  } else {
    // if the repo already exists, pull from it
    shell.cd(repoName)
    shell.exec(`git checkout master`)
    shell.exec(`git pull origin master`)
  }
}

// Run the query and exit if there are errors
async function graphql(query, params) {
  const graphqlWithAuth = baseGraphql.defaults({
    headers: {
      authorization: `token ${token}`,
    },
  })
  try {
    return await graphqlWithAuth(query, params)
  } catch (error) {
    logger.error(error.message)
    return process.exit(1)
  }
}

async function getRepository(owner, name) {
  const { repository } = await graphql(
    `
      query($owner: String!, $name: String!) {
        repository(owner: $owner, name: $name) {
          id
        }
      }
    `,
    {
      owner,
      name,
      syncLabel: syncLabelName,
    }
  )
  return repository
}

const localesDir = `../../www/src/data/locales`
const messagesFileName = `messages.po`

async function syncLingui() {
  const langs = JSON.parse(fs.readFileSync(`../../www/i18n.json`))
  if (shell.cd(cacheDir).code !== 0) {
    logger.debug(`creating ${cacheDir}`)
    shell.mkdir(cacheDir)
    shell.cd(cacheDir)
  }

  // Clone all the translation repos
  for (const { code } of langs) {
    const transRepoName = `${repoBase}-${code}`
    const transRepoUrl = `${host}/${owner}/${transRepoName}`
    cloneOrUpdateRepo(transRepoName, transRepoUrl)
    shell.cd(`..`)

    logger.info(`creating directory for ${code}: ${localesDir}/${code}`)
    fs.mkdirSync(`${localesDir}/${code}`, { recursive: true })
    // copy all the messages.po files to the www/public directory
    try {
      fs.copyFileSync(
        `${cacheDir}/${transRepoName}/${messagesFileName}`,
        `${localesDir}/${code}/${messagesFileName}`
      )
    } catch (e) {
      logger.info(`Found no messages.po file to extract`)
    }
  }

  // Run lingui extract
  shell.cd(`../../www`)
  shell.exec(`yarn`)
  shell.exec(`yarn lingui:extract`)
  shell.cd(`../scripts/i18n/${cacheDir}`)

  // Copy each of those files back over to the individual repos
  // And create a pull request for each update
  for (const { code } of langs) {
    const transRepoName = `${repoBase}-${code}`
    fs.copyFileSync(
      `${localesDir}/${code}/${messagesFileName}`,
      `${cacheDir}/${transRepoName}/${messagesFileName}`
    )
    // create a new branch, push the changes

    // create a new PR for the updated lingui file
  }
}

syncLingui()
