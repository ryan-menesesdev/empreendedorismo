import express from 'express';
import path from 'path';
import routes from './routes';

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const publicPath = path.join(__dirname, '../../frontend/public');

app.use(express.static(publicPath));

app.get('/', (req, res) => {
    res.redirect('/login');
});

app.use('/', routes);

export default app;