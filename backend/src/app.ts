import express from 'express';
import path from 'path';
import routes from './routes';
import apiRoutes from './routes/api';

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const publicPath = path.join(__dirname, '../../frontend/public');

app.use(express.static(publicPath));

app.use('/api', apiRoutes);
app.use('/', routes);

export default app;