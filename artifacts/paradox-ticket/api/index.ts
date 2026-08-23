import app from '../../api-server/src/app.js';

export default async function handler(req: any, res: any) {
  try {
    return app(req, res);
  } catch (err: any) {
    res.status(500).json({ error: "Boot failed", details: String(err), stack: err.stack });
  }
}
