import { Request, Response, NextFunction } from 'express'

/** Simple API-key guard — checks Authorization: Bearer <key> */
export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const token = req.headers.authorization?.replace('Bearer ', '')
  if (!token || token !== process.env.API_KEY) {
    res.status(401).json({ error: 'Unauthorized' })
    return
  }
  next()
}

