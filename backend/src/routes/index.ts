import { Router, Request, Response } from 'express';

const router = Router();

router.get('/login', (req: Request, res: Response) => {
    res.send(`
        <html>
            <body>
                <h1>Tela de Login</h1>
                <p>Acesso exclusivo para coordenadores e gestão escolar.</p>
                <a href="/acompanhamento">Entrar</a>
            </body>
        </html>
    `);
});

router.get('/acompanhamento', (req: Request, res: Response) => {
    res.send(`
        <html>
            <body>
                <h1>Tela Acompanhamento de Alunos</h1>
                <p>Lista geral de alunos com seus status atuais.</p>
                <ul>
                    <li><a href="/alertas">Ver painel de alertas de evasão</a></li>
                    <li><a href="/acompanhamento/adicionar">Adicionar novo registro</a></li>
                </ul>
            </body>
        </html>
    `);
});

router.get('/acompanhamento/adicionar', (req: Request, res: Response) => {
    res.send(`
        <html>
            <body>
                <h1>Tela Realizar Adições</h1>
                <p>Formulário para inserir faltas, notas escolares e dificuldades relatadas pelo aluno.</p>
                <a href="/acompanhamento">Voltar</a>
            </body>
        </html>
    `);
});

router.get('/alertas', (req: Request, res: Response) => {
    res.send(`
        <html>
            <body>
                <h1>Tela Alertas de Evasão</h1>
                <p>Filtragem baseada nas métricas cadastradas:</p>
                <ul>
                    <li style="color: green;">Alunos Regulares (Dentro da média de notas/frequência)</li>
                    <li style="color: orange;">Alunos em Suspeita de Evasão (Queda de rendimento ou aumento de faltas)</li>
                    <li style="color: red;">Alunos em Risco de Evasão (Dificuldades críticas apontadas + faltas excessivas)</li>
                </ul>
                <a href="/acompanhamento">Voltar ao Acompanhamento</a>
            </body>
        </html>
    `);
});

export default router;