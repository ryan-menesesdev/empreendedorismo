import { Router, Request, Response } from 'express';
import path from 'path';

const router = Router();

const publicPath = path.join(__dirname, '../../../frontend/public');

router.get('/login', (req: Request, res: Response) => {
    res.sendFile(path.join(publicPath, 'login.html'));
});

export default router;