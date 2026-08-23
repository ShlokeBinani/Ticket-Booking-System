export default async function handler(req: any, res: any) {
  try {
    const module = await import('../../api-server/src/app.js');
    const app = module.default;
    return app(req, res);
  } catch (err: any) {
    res.status(500).json({ error: "Boot failed", details: String(err), stack: err.stack });
  }
}
