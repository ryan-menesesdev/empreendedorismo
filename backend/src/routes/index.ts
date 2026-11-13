import { Router } from 'express';

const router = Router();

router.get('/login', (_req, res) => {
    res.redirect('/');
});

export default router;