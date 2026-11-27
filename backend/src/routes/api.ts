import { Router, Request, Response } from 'express';
import { pool } from '../config/db';

const router = Router();

// Função auxiliar para calcular o status de risco automaticamente
function calcularStatus(faltas: number, media: number): 'REGULAR' | 'SUSPEITA' | 'RISCO' {
    if (faltas >= 10 || media < 5.5) return 'RISCO';
    if (faltas >= 6 || media < 7.0) return 'SUSPEITA';
    return 'REGULAR';
}

// 1. LOGIN
router.post('/login', async (req: Request, res: Response) => {
    const { email, password } = req.body;
    try {
        const result = await pool.query(
            'SELECT id, nome, email, cargo, escola FROM gestores WHERE email = $1 AND senha_hash = $2',
            [email, password]
        );
        if (result.rows.length > 0) {
            return res.json({ success: true, user: result.rows[0] });
        }
        return res.status(401).json({ success: false, message: 'E-mail ou senha inválidos.' });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ success: false, message: 'Erro no servidor.' });
    }
});

// 2. DASHBOARD (Contadores + Alunos em atenção)
router.get('/dashboard', async (_req: Request, res: Response) => {
    try {
        const stats = await pool.query(`
            SELECT
                COUNT(*)::int AS total,
                COUNT(*) FILTER (WHERE status_atual = 'REGULAR')::int AS regulares,
                COUNT(*) FILTER (WHERE status_atual = 'SUSPEITA')::int AS suspeita,
                COUNT(*) FILTER (WHERE status_atual = 'RISCO')::int AS risco
            FROM alunos
        `);

        const atencao = await pool.query(`
            SELECT id, nome_completo, turma, dificuldades_observadas, status_atual
            FROM alunos
            WHERE status_atual IN ('RISCO', 'SUSPEITA')
            ORDER BY CASE status_atual WHEN 'RISCO' THEN 1 ELSE 2 END, faltas_periodo DESC
            LIMIT 5
        `);

        res.json({ stats: stats.rows[0], atencao: atencao.rows });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erro ao carregar dashboard' });
    }
});

// 3. LISTAR ALUNOS
router.get('/alunos', async (_req: Request, res: Response) => {
    try {
        const result = await pool.query(
            'SELECT * FROM alunos ORDER BY id ASC'
        );
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erro ao listar alunos' });
    }
});

// 4. DETALHES DE UM ALUNO (Usado em perfil-aluno, editar-aluno e detalhe-alerta)
router.get('/alunos/:id', async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        const aluno = await pool.query('SELECT * FROM alunos WHERE id = $1', [id]);
        if (aluno.rows.length === 0) {
            return res.status(404).json({ error: 'Aluno não encontrado' });
        }

        const [notas, faltas, alertas, intervencoes] = await Promise.all([
            pool.query('SELECT * FROM notas_disciplinas WHERE aluno_id = $1 ORDER BY id ASC', [id]),
            pool.query('SELECT * FROM faltas_mensais WHERE aluno_id = $1 ORDER BY ano ASC, mes ASC', [id]),
            pool.query('SELECT * FROM alertas WHERE aluno_id = $1 ORDER BY criado_em DESC', [id]),
            pool.query('SELECT * FROM intervencoes WHERE aluno_id = $1 ORDER BY data_registro DESC', [id])
        ]);

        res.json({
            aluno: aluno.rows[0],
            notas: notas.rows,
            faltas: faltas.rows,
            alertas: alertas.rows,
            intervencoes: intervencoes.rows
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erro ao buscar dados do aluno' });
    }
});

// 5. ADICIONAR ALUNO
router.post('/alunos', async (req: Request, res: Response) => {
    const {
        nome_completo, data_nascimento, matricula, turma,
        responsavel_nome, responsavel_telefone,
        faltas_periodo, media_geral, dificuldades_observadas
    } = req.body;

    const faltasNum = Number(faltas_periodo) || 0;
    const mediaNum = Number(String(media_geral).replace(',', '.')) || 0;
    const status = calcularStatus(faltasNum, mediaNum);
    const frequencia = Math.max(0, 100 - faltasNum * 2);

    try {
        const result = await pool.query(
            `INSERT INTO alunos (
                matricula, nome_completo, data_nascimento, turma,
                responsavel_nome, responsavel_telefone,
                faltas_periodo, frequencia_percentual, media_geral,
                dificuldades_observadas, status_atual
            ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) RETURNING *`,
            [
                matricula, nome_completo, data_nascimento || null, turma || '8º A',
                responsavel_nome || null, responsavel_telefone || null,
                faltasNum, frequencia, mediaNum,
                dificuldades_observadas || null, status
            ]
        );

        const novoAluno = result.rows[0];

        if (status !== 'REGULAR') {
            await pool.query(
                `INSERT INTO alertas (aluno_id, nivel, titulo, motivo) VALUES ($1, $2, $3, $4)`,
                [
                    novoAluno.id,
                    status,
                    status === 'RISCO' ? 'Alerta de Risco' : 'Alerta de Suspeita',
                    dificuldades_observadas || `Cadastro inicial com ${faltasNum} faltas e média ${mediaNum}.`
                ]
            );
        }

        res.status(201).json(novoAluno);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erro ao cadastrar aluno (verifique se a matrícula já existe).' });
    }
});

// 6. EDITAR ALUNO
router.put('/alunos/:id', async (req: Request, res: Response) => {
    const { id } = req.params;
    const { nome_completo, turma, faltas_periodo, media_geral, dificuldades_observadas } = req.body;

    const faltasNum = Number(faltas_periodo) || 0;
    const mediaNum = Number(String(media_geral).replace(',', '.')) || 0;
    const status = calcularStatus(faltasNum, mediaNum);
    const frequencia = Math.max(0, 100 - faltasNum * 2);

    try {
        const result = await pool.query(
            `UPDATE alunos
             SET nome_completo = $1, turma = $2, faltas_periodo = $3,
                 frequencia_percentual = $4, media_geral = $5,
                 dificuldades_observadas = $6, status_atual = $7,
                 atualizado_em = CURRENT_TIMESTAMP
             WHERE id = $8 RETURNING *`,
            [nome_completo, turma, faltasNum, frequencia, mediaNum, dificuldades_observadas || null, status, id]
        );
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erro ao atualizar aluno' });
    }
});

// 7. CENTRAL DE ALERTAS (Kanban)
router.get('/alertas', async (_req: Request, res: Response) => {
    try {
        const result = await pool.query(`
            SELECT id, nome_completo, turma, faltas_periodo, media_geral,
                   frequencia_percentual, dificuldades_observadas, status_atual
            FROM alunos
            ORDER BY faltas_periodo DESC
        `);
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erro ao carregar alertas' });
    }
});

// 8. REGISTRAR INTERVENÇÃO / OBSERVAÇÃO
router.post('/alunos/:id/intervencoes', async (req: Request, res: Response) => {
    const { id } = req.params;
    const { tipo_acao, descricao, gestor_id } = req.body;
    try {
        const result = await pool.query(
            `INSERT INTO intervencoes (aluno_id, gestor_id, tipo_acao, descricao)
             VALUES ($1, $2, $3, $4) RETURNING *`,
            [id, gestor_id || 1, tipo_acao || 'Intervenção', descricao]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Erro ao registrar intervenção' });
    }
});

export default router;