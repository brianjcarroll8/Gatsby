import semver from "semver"
import { isCI } from "gatsby-core-utils"
import signalExit from "signal-exit"
import reporterActions from "./redux/actions"

import loggerIPC from "./loggers/ipc"
import loggerJSON from "./loggers/json"
import loggerYurnalist from "./loggers/yurnalist"
import loggerINK from "./loggers/ink"

import util from "util"
import { stripIndent } from "common-tags"
import chalk from "chalk"
import { trackError } from "gatsby-telemetry"
import * as opentracing from "opentracing"

import { getErrorFormatter } from "./errors"
import { getStore } from "./redux"
import constructError from "../structured-errors/construct-error"

import { LogLevels, ActivityStatuses, ActivityTypes } from "./constants"
import {
  IActivityTracker,
  IActivityArgs,
  IReporter,
  StatusText,
  IPhantomActivityTracker,
  IStructuredErrorDetails,
  IProgressTracker,
  StructuredError,
} from "./ts-types"

const tracer = opentracing.globalTracer()

let inkExists = false
try {
  inkExists = !!require.resolve(`ink`)
  // eslint-disable-next-line no-empty
} catch (err) {}

if (!process.env.GATSBY_LOGGER) {
  if (
    inkExists &&
    semver.satisfies(process.version, `>=8`) &&
    !isCI() &&
    typeof jest === `undefined`
  ) {
    process.env.GATSBY_LOGGER = `ink`
  } else {
    process.env.GATSBY_LOGGER = `yurnalist`
  }
}
// if child process - use ipc logger
if (process.send) {
  // process.env.FORCE_COLOR = `0`
  loggerIPC.activate()
}

if (process.env.GATSBY_LOGGER.includes(`json`)) {
  loggerJSON.activate()
} else if (process.env.GATSBY_LOGGER.includes(`yurnalist`)) {
  loggerYurnalist.activate()
} else {
  loggerINK.activate()
}

const errorFormatter = getErrorFormatter()

const addMessage = (level: typeof LogLevels) => (text: string): object =>
  reporterActions.createLog({ level, text })

let isVerbose = false

/**
 * Reporter module.
 * @module reporter
 */
const reporter: IReporter = {
  /**
   * Strip initial indentation template function.
   */
  stripIndent,
  format: chalk,
  /**
   * Toggle verbosity.
   * @param {boolean} [_isVerbose=true]
   */
  setVerbose: (_isVerbose = true) => {
    isVerbose = _isVerbose
  },
  /**
   * Turn off colors in error output.
   * @param {boolean} [isNoColor=false]
   */
  setNoColor(isNoColor = false): void {
    if (isNoColor) {
      errorFormatter.withoutColors()
    }

    // disables colors in popular terminal output coloring packages
    //  - chalk: see https://www.npmjs.com/package/chalk#chalksupportscolor
    //  - ansi-colors: see https://github.com/doowb/ansi-colors/blob/8024126c7115a0efb25a9a0e87bc5e29fd66831f/index.js#L5-L7
    if (isNoColor) {
      process.env.FORCE_COLOR = `0`
      // chalk determines color level at import time. Before we reach this point,
      // chalk was already imported, so we need to retroactively adjust level
      chalk.level = 0
    }
  },
  /**
   * Log arguments and exit process with status 1.
   * @param {*} args
   */
  panic(errorMeta: string | object, err?: Record<string, any>) {
    const error = reporter.error(errorMeta, err)
    trackError(`GENERAL_PANIC`, { error })
    prematureEnd() // eslint-disable-line @typescript-eslint/no-use-before-define
    process.exit(1)
  },

  panicOnBuild(
    errorMeta: string | object,
    err?: Record<string, any>
  ): StructuredError | StructuredError[] {
    const error = reporter.error(errorMeta, err)
    trackError(`BUILD_PANIC`, { error })
    if (process.env.gatsby_executing_command === `build`) {
      prematureEnd() // eslint-disable-line @typescript-eslint/no-use-before-define
      process.exit(1)
    }
    return error
  },

  error(errorMeta: any, error?: Error): StructuredError | StructuredError[] {
    let details: IStructuredErrorDetails = {}
    // Many paths to retain backcompat :scream:
    if (error) {
      if (Array.isArray(error)) {
        return error.map(errorItem => this.error(errorMeta, errorItem))
      }
      details.error = error
      details.context = {
        sourceMessage: errorMeta + ` ` + error.message,
      }
    } else if (arguments.length === 1 && errorMeta instanceof Error) {
      details.error = errorMeta
      details.context = {
        sourceMessage: errorMeta.message,
      }
    } else if (arguments.length === 1 && Array.isArray(errorMeta)) {
      // when we get an array of messages, call this function once for each error
      return errorMeta.map(errorItem => this.error(errorItem))
    } else if (arguments.length === 1 && typeof errorMeta === `object`) {
      details = Object.assign({}, errorMeta)
    } else if (arguments.length === 1 && typeof errorMeta === `string`) {
      details.context = {
        sourceMessage: errorMeta,
      }
    }

    const structuredError = constructError({ details })
    if (structuredError) {
      reporterActions.createLog(structuredError)
    }

    // TODO: remove this once Error component can render this info
    // log formatted stacktrace
    if (structuredError.error) {
      this.log(errorFormatter.render(structuredError.error))
    }
    return structuredError
  },

  /**
   * Set prefix on uptime.
   * @param {string} prefix - A string to prefix uptime with.
   */
  uptime(prefix: string): void {
    this.verbose(`${prefix}: ${(process.uptime() * 1000).toFixed(3)}ms`)
  },

  verbose: (text): void => {
    if (isVerbose) {
      reporterActions.createLog({
        level: LogLevels.Debug,
        text,
      })
    }
  },

  success: addMessage(LogLevels.Success),
  info: addMessage(LogLevels.Info),
  warn: addMessage(LogLevels.Warning),
  log: addMessage(LogLevels.Log),

  pendingActivity: reporterActions.createPendingActivity,

  completeActivity: (id: string, status: string = ActivityStatuses.Success) => {
    reporterActions.endActivity({ id, status })
  },

  /**
   * Time an activity.
   * @param {string} text - Name of activity.
   * @param {ActivityArgs} activityArgs - optional object with tracer parentSpan
   * @returns {ActivityTracker} The activity tracker.
   */
  activityTimer(
    text: string,
    activityArgs: IActivityArgs = {}
  ): IActivityTracker {
    let { parentSpan, id } = activityArgs
    const spanArgs = parentSpan ? { childOf: parentSpan } : {}
    if (!id) {
      id = text
    }

    const span = tracer.startSpan(text, spanArgs)

    return {
      start(): void {
        reporterActions.startActivity({
          id,
          text,
          type: ActivityTypes.Spinner,
        })
      },
      setStatus(statusText: StatusText): void {
        reporterActions.setActivityStatusText({
          id,
          statusText,
        })
      },
      panicOnBuild(...args: Array<any>): void {
        span.finish()

        reporterActions.setActivityErrored({
          id,
        })

        return reporter.panicOnBuild(...args)
      },
      panic(...args): void {
        span.finish()

        reporterActions.endActivity({
          id,
          status: ActivityStatuses.Failed,
        })

        return reporter.panic(...args)
      },
      end(): void {
        span.finish()

        reporterActions.endActivity({
          id,
          status: ActivityStatuses.Success,
        })
      },
      span,
    }
  },

  /**
   * Create an Activity that is not visible to the user
   *
   * During the lifecycle of the Gatsby process, sometimes we need to do some
   * async work and wait for it to complete. A typical example of this is a job.
   * This work should set the status of the process to `in progress` while running and
   * `complete` (or `failure`) when complete. Activities do just this! However, they
   * are visible to the user. So this function can be used to create a _hidden_ activity
   * that while not displayed in the CLI, still triggers a change in process status.
   *
   * @param {string} text - Name of activity.
   * @param {ActivityArgs} activityArgs - optional object with tracer parentSpan
   * @returns {ActivityTracker} The activity tracker.
   */
  phantomActivity(
    text: string,
    activityArgs: IActivityArgs = {}
  ): IPhantomActivityTracker {
    let { parentSpan, id } = activityArgs
    const spanArgs = parentSpan ? { childOf: parentSpan } : {}
    if (!id) {
      id = text
    }

    const span = tracer.startSpan(text, spanArgs)

    return {
      start(): void {
        reporterActions.startActivity({
          id,
          text,
          type: ActivityTypes.Hidden,
        })
      },
      end(): void {
        span.finish()

        reporterActions.endActivity({
          id,
          status: ActivityStatuses.Success,
        })
      },
      span,
    }
  },

  /**
   * Create a progress bar for an activity
   * @param {string} text - Name of activity.
   * @param {number} total - Total items to be processed.
   * @param {number} start - Start count to show.
   * @param {ActivityArgs} activityArgs - optional object with tracer parentSpan
   * @returns {ActivityTracker} The activity tracker.
   */
  createProgress(
    text: string,
    total = 0,
    start = 0,
    activityArgs: IActivityArgs = {}
  ): IProgressTracker {
    let { parentSpan, id } = activityArgs
    const spanArgs = parentSpan ? { childOf: parentSpan } : {}
    if (!id) {
      id = text
    }
    const span = tracer.startSpan(text, spanArgs)

    let lastUpdateTime = 0
    let unflushedProgress = 0
    let unflushedTotal = 0
    const progressUpdateDelay = Math.round(1000 / 10) // 10 fps *shrug*

    const updateProgress = (forced?: boolean): void => {
      const t = Date.now()
      if (!forced && t - lastUpdateTime <= progressUpdateDelay) return

      if (unflushedTotal > 0) {
        reporterActions.setActivityTotal({ id, total: unflushedTotal })
        unflushedTotal = 0
      }
      if (unflushedProgress > 0) {
        reporterActions.activityTick({ id, increment: unflushedProgress })
        unflushedProgress = 0
      }
      lastUpdateTime = t
    }

    return {
      start(): void {
        reporterActions.startActivity({
          id,
          text,
          type: ActivityTypes.Progress,
          current: start,
          total,
        })
      },
      setStatus(statusText: StatusText): void {
        reporterActions.setActivityStatusText({
          id,
          statusText,
        })
      },
      tick(increment = 1): void {
        unflushedProgress += increment // Have to manually track this :/
        updateProgress()
      },
      panicOnBuild(...args): void {
        span.finish()

        reporterActions.setActivityErrored({
          id,
        })

        return reporter.panicOnBuild(...args)
      },
      panic(...args): void {
        span.finish()

        reporterActions.endActivity({
          id,
          status: ActivityStatuses.Failed,
        })

        return reporter.panic(...args)
      },
      done(): void {
        updateProgress(true)
        span.finish()
        reporterActions.endActivity({
          id,
          status: ActivityStatuses.Success,
        })
      },
      updateTotal(value: number): void {
        unflushedTotal = value
        updateProgress()
      },
      span,
    }
  },
  // This method was called in older versions of gatsby, so we need to keep it to avoid
  // "reporter._setStage is not a function" error when gatsby@<2.16 is used with gatsby-cli@>=2.8
  _setStage() {},
}

console.log = (format: any, ...param: any[]): void =>
  reporter.log(util.format(format, ...param))
console.warn = (format: any, ...param: any[]): void =>
  reporter.warn(util.format(format, ...param))
console.info = (format: any, ...param: any[]): void =>
  reporter.info(util.format(format, ...param))
console.error = (format: any, ...param: any[]): void =>
  reporter.error(util.format(format, ...param))

const interuptActivities = (): void => {
  const { activities } = getStore().getState().logs
  Object.keys(activities).forEach(activityId => {
    const activity = activities[activityId]
    if (
      activity.status === ActivityStatuses.InProgress ||
      activity.status === ActivityStatuses.NotStarted
    ) {
      reporter.completeActivity(activityId, ActivityStatuses.Interrupted)
    }
  })
}

const prematureEnd = (): void => {
  // hack so at least one activity is surely failed, so
  // we are guaranteed to generate FAILED status
  // if none of activity did explicitly fail
  reporterActions.createPendingActivity({
    id: `panic`,
    status: ActivityStatuses.Failed,
  })

  interuptActivities()
}

signalExit((code: number, signal: string): void => {
  if (code !== 0 && signal !== `SIGINT` && signal !== `SIGTERM`) prematureEnd()
  else interuptActivities()
})

export default reporter
