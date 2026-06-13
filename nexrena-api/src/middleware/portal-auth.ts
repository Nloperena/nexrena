import { Request, Response, NextFunction } from 'express'
import { verifyPortalToken, type PortalTokenPayload } from '../lib/portal-token'

declare module 'express-serve-static-core' {
  interface Request {
    portalUser?: PortalTokenPayload
  }
}

export function requirePortalAuth(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization
  const token = header?.startsWith('Bearer ') ? header.slice(7) : null
  if (!token) {
    res.status(401).json({ error: 'Unauthorized' })
    return
  }
  const user = verifyPortalToken(token)
  if (!user) {
    res.status(401).json({ error: 'Invalid or expired session' })
    return
  }
  req.portalUser = user
  next()
}

export function optionalPortalAuth(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization
  const token = header?.startsWith('Bearer ') ? header.slice(7) : null
  if (token) {
    const user = verifyPortalToken(token)
    if (user) {
      req.portalUser = user
    }
  }
  next()
}
