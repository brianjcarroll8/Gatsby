import chalk from "chalk"
import opentracing from "opentracing"
import reporterActions from "./redux/actions"
import { ActivityStatuses } from "./constants"

export enum StatusText {}
export type StructuredError = any // TODO, should represent structured-errors/construct-error response

export interface IActivityTracker {
  start(): void
  end(): void
  setStatus(status: StatusText): void
  span: opentracing.Span
  panic: IReporter["panic"]
  panicOnBuild(...args: Array<any>): void
}

export interface IPhantomActivityTracker {
  start(): void
  end(): void
  span: opentracing.Span
}

export interface IProgressTracker {
  start(): void
  setStatus(status: StatusText): void
  tick(increment: number): void
  panicOnBuild(...args: Array<any>): void
  panic: IReporter["panic"]
  done(): void
  updateTotal(value: number): void
  span: opentracing.Span
}

export interface IActivityArgs {
  id?: string
  parentSpan?: opentracing.Span
}

type LogMessageType = (format: string, ...args: Array<any>) => void

export interface IReporter {
  stripIndent: Function
  format: typeof chalk
  pendingActivity: typeof reporterActions.createPendingActivity
  setVerbose(isVerbose: boolean): void
  setNoColor(isNoColor: boolean): void
  panic(...args: Array<any>): void
  panicOnBuild(...args: Array<any>): void
  error(
    errorMeta: string | object,
    error?: object
  ): StructuredError | StructuredError[]
  uptime(prefix: string): void
  success: LogMessageType
  verbose: LogMessageType
  info: LogMessageType
  warn: LogMessageType
  log: LogMessageType
  activityTimer(name: string, activityArgs: IActivityArgs): IActivityTracker
  completeActivity(id: string, status: typeof ActivityStatuses): void
  phantomActivity(
    text: string,
    activityArgs: IActivityArgs
  ): IPhantomActivityTracker
  createProgress(
    text: string,
    total: number,
    start: number,
    activityArgs: IActivityArgs | undefined
  ): IProgressTracker
  _setStage(): void // @deprecated
}

export interface IStructuredErrorDetails {
  error?: Error
  context?: {
    sourceMessage: string
  }
}
