import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common'
import { EntityNotFoundError, QueryFailedError } from 'typeorm'
import type { Request, Response } from 'express'

/**
 * Global error filter — returns a stable error envelope and maps TypeORM
 * QueryFailedError codes to the right HTTP status.
 */
@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name)

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp()
    const req = ctx.getRequest<Request>()
    const res = ctx.getResponse<Response>()

    let status: number = HttpStatus.INTERNAL_SERVER_ERROR
    let message: string | string[] = 'Internal server error'
    let error = 'InternalServerError'
    let code: string | undefined

    if (exception instanceof HttpException) {
      status = exception.getStatus()
      const payload = exception.getResponse() as
        string | { message?: string | string[]; error?: string; code?: string }
      if (typeof payload === 'string') {
        message = payload
      } else {
        message = payload.message ?? exception.message
        error = payload.error ?? exception.name
        code = payload.code
      }
    } else if (exception instanceof QueryFailedError) {
      const driverErr = exception.driverError as { code?: string }
      code = driverErr.code
      if (code === '23505') {
        status = HttpStatus.CONFLICT
        message = 'Resource already exists'
        error = 'Conflict'
      } else if (code === '23503') {
        status = HttpStatus.BAD_REQUEST
        message = 'Invalid foreign key reference'
        error = 'BadRequest'
      } else {
        status = HttpStatus.BAD_REQUEST
        message = 'Database query failed'
        error = 'BadRequest'
      }
    } else if (exception instanceof EntityNotFoundError) {
      status = HttpStatus.NOT_FOUND
      message = 'Entity not found'
      error = 'NotFound'
    } else if (exception instanceof Error) {
      message = exception.message
    }

    if (status >= 500) {
      this.logger.error(
        `${req.method} ${req.url} → ${status} ${String(message)}`,
        exception instanceof Error ? exception.stack : undefined
      )
    }

    res.status(status).json({
      statusCode: status,
      error,
      message,
      code,
      path: req.url,
      timestamp: new Date().toISOString(),
    })
  }
}
