import { Router, Request, Response } from 'express';
import path from 'path';

const router = Router();
const publicPath = path.join(process.cwd(), 'frontend', 'public');

router.get('/login', (_req: Request, res: Response) => {
    res.sendFile(path.join(publicPath, 'index.html'));
});

export default router;