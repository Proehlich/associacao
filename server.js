require('dotenv').config();
const express = require('express');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const axios = require('axios');
const { Op } = require('sequelize');

const Usuario = require('./models/Usuario');
const Vaga = require('./models/Vaga');
const Produto = require('./models/Produto');
const Suporte = require('./models/Suporte');


const app = express();

// --- 1. CONFIGURAÇÕES E UPLOADS ---
app.use(express.json());
app.use(express.static('public'));
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'public/uploads/'),
    filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage });

// --- 2. ROTA DE LOGIN (FUNCIONAL AGORA) ---
app.post('/api/login', async (req, res) => {
    const { email, senha } = req.body;
    try {
        const usuario = await Usuario.findOne({ where: { email } });
        if (!usuario || usuario.senha !== senha) {
            return res.status(401).json({ erro: "E-mail ou senha incorretos." });
        }
        const token = jwt.sign(
            { id: usuario.id, tipo: usuario.tipo, nome: usuario.nome },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );
        res.json({ mensagem: "Bem-vindo!", token, tipo: usuario.tipo });
    } catch (error) {
        res.status(500).json({ erro: "Erro no servidor." });
    }
});

// --- 3. ROTAS DA LOJA (UMA DE CADA) ---
app.post('/api/produtos', upload.single('foto'), async (req, res) => {
    try {
        const { nome, descricao, preco } = req.body;
        if (!req.file) return res.status(400).json({ erro: "Foto obrigatória!" });
        const imagem_url = `/uploads/${req.file.filename}`;
        await Produto.create({ nome, descricao, preco, imagem_url });
        res.json({ mensagem: "Sucesso!" });
    } catch (error) {
        res.status(500).json({ erro: "Erro ao salvar produto." });
    }
});

app.get('/api/produtos', async (req, res) => {
    try {
        const produtos = await Produto.findAll();
        res.json(produtos);
    } catch (error) {
        res.status(500).json({ erro: "Erro ao buscar produtos." });
    }
});

// --- 4. ROTA DE CADASTRO COM VALIDAÇÃO DE PLACA ---
app.post('/api/usuarios/cadastro', upload.single('foto'), async (req, res) => {
    try {
        const { nome, email, senha, tipo, cpf, cnh, placa_moto, telefone } = req.body;
        const foto_perfil = req.file ? req.file.filename : 'padrao.png';

        // Dentro do app.post('/api/usuarios/cadastro'...)
        if (tipo === 'motoboy' && placa_moto) {
            try {
                const consulta = await axios.get(`https://infosimples.com`, {
                    params: {
                        token: process.env.INFOSIMPLES_TOKEN,
                        placa: placa_moto
                    }
                });

                // Se a API retornar que a placa é inválida ou tem restrição grave
                if (consulta.data.code !== 200) {
                    return res.status(400).json({ erro: "Documentação do veículo irregular. Cadastro negado." });
                }
            } catch (err) {
                // Se o seu saldo acabar ou a chave estiver errada, o sistema avisa você
                console.error("ERRO CRÍTICO NA API:", err.message);
                return res.status(500).json({ erro: "Sistema de validação indisponível. Tente mais tarde." });
            }
        }

        await Usuario.create({ nome, email, senha, tipo, cpf, cnh, placa_moto, telefone, foto_perfil });
        res.json({ mensagem: "Cadastro realizado!" });
    } catch (error) {
        res.status(500).json({ erro: "Erro ao cadastrar." });
    }
});

// ROTA PARA TROCAR SENHA COM VALIDAÇÃO DA ANTIGA
app.post('/api/usuarios/trocar-senha', async (req, res) => {
    try {
        const { id, senhaAntiga, novaSenha } = req.body;
        const usuario = await Usuario.findByPk(id);

        if (!usuario) {
            return res.status(404).json({ erro: "Usuário não encontrado." });
        }

        // Validação da senha antiga
        if (usuario.senha !== senhaAntiga) {
            return res.status(401).json({ erro: "A senha atual está incorreta." });
        }

        // Se estiver tudo certo, atualiza
        await usuario.update({ senha: novaSenha });
        res.json({ mensagem: "Senha atualizada com sucesso!" });
    } catch (error) {
        res.status(500).json({ erro: "Erro ao processar troca." });
    }
});



// --- 5. ROTAS DE VAGAS---
app.get('/api/vagas', async (req, res) => {
    try {
        const vagas = await Vaga.findAll({ where: { data_expiracao: { [Op.gt]: new Date() } }, order: [['data_criacao', 'DESC']] });
        res.json(vagas);
    } catch (error) { res.status(500).json({ erro: "Erro ao buscar vagas." }); }
});

app.post('/api/vagas', async (req, res) => {
    try {
        const { titulo, local, arrancada, taxa_minima, horario_inicio, horario_fim, precisa_bag, descricao, restaurante_id } = req.body;

        // Busca o dono da vaga para pegar o telefone automático
        const dono = await Usuario.findByPk(restaurante_id);
        if (!dono) return res.status(404).json({ erro: "Dono da vaga não encontrado" });

        const novaVaga = await Vaga.create({
            titulo,
            local,
            arrancada: parseFloat(arrancada),
            taxa_minima: parseFloat(taxa_minima),
            horario_inicio,
            horario_fim,
            precisa_bag,
            descricao,
            contato: dono.telefone || dono.contato || "Sem Telefone",
            restaurante_id,
            data_expiracao: new Date(Date.now() + 6 * 60 * 60 * 1000) // 6 horas a partir de AGORA
        });

        res.json({ mensagem: "Sucesso!", vaga: novaVaga });
    } catch (error) {
        console.error("Erro no Servidor:", error);
        res.status(500).json({ erro: "Erro ao salvar: verifique se todos os campos obrigatórios foram preenchidos." });
    }
});


app.post('/api/vagas', async (req, res) => {
    console.log("--- NOVA TENTATIVA DE POSTAGEM ---");
    console.log("Corpo recebido:", req.body); // Isso vai aparecer no seu terminal do VS Code

    try {
        const { restaurante_id, titulo, local, arrancada, taxa_minima } = req.body;

        if (!restaurante_id) {
            console.log("❌ ERRO: restaurante_id veio VAZIO do navegador");
            return res.status(400).json({ erro: "ID do contratante não identificado." });
        }

        const dono = await Usuario.findByPk(restaurante_id);

        if (!dono) {
            console.log(`❌ ERRO: O ID ${restaurante_id} não existe na tabela de Usuarios`);
            return res.status(404).json({ erro: "Usuário contratante não encontrado no banco." });
        }

        const novaVaga = await Vaga.create({
            ...req.body,
            contato: dono.telefone || dono.contato || "Sem Telefone"
        });

        console.log("✅ VAGA CRIADA COM SUCESSO!");
        res.json({ mensagem: "Sucesso!", vaga: novaVaga });

    } catch (error) {
        console.error("❌ ERRO NO BANCO:", error.message);
        res.status(500).json({ erro: error.message });
    }
});


app.get('/api/usuarios/motoboys', async (req, res) => {
    try {
        const motoboys = await Usuario.findAll({ where: { tipo: 'motoboy' }, order: [['nome', 'ASC']] });
        res.json(motoboys);
    } catch (error) { res.status(500).json({ erro: "Erro ao buscar motoboys." }); }
});

app.get('/api/publicidade/banners', async (req, res) => {
    try {
        const parceiros = await Usuario.findAll({ where: { tipo: { [Op.or]: ['restaurante', 'oficina'] } }, attributes: ['nome', 'foto_perfil'] });
        res.json(parceiros.sort(() => Math.random() - 0.5));
    } catch (error) { res.status(500).json({ erro: "Erro ao carregar banners" }); }
});

// ROTA PARA EXCLUIR USUÁRIO
app.post('/api/usuarios/excluir/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await Usuario.destroy({ where: { id } });
        res.json({ mensagem: "Membro removido com sucesso!" });
    } catch (error) {
        res.status(500).json({ erro: "Erro ao excluir membro." });
    }
});

// ROTA PARA EXCLUIR PRODUTO
app.post('/api/produtos/excluir/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await Produto.destroy({ where: { id } });
        res.json({ mensagem: "Produto removido!" });
    } catch (error) {
        res.status(500).json({ erro: "Erro ao excluir produto." });
    }
});

// Qualquer um envia mensagem
app.post('/api/suporte', async (req, res) => {
    try {
        const { nome, mensagem } = req.body;
        await Suporte.create({ usuario_nome: nome, mensagem });
        res.json({ mensagem: "Enviado com sucesso!" });
    } catch (e) { res.status(500).json({ erro: "Erro ao enviar" }); }
});

// Apenas Admins listam mensagens
app.get('/api/suporte', async (req, res) => {
    const mensagens = await Suporte.findAll({ order: [['createdAt', 'DESC']] });
    res.json(mensagens);
});

// Admin marca como visto/resolvido
app.post('/api/suporte/visto/:id', async (req, res) => {
    const { id } = req.params;
    const { admin_nome } = req.body;
    const msg = await Suporte.findByPk(id);
    await msg.update({ visto_por: admin_nome, status: 'resolvido' });
    res.json({ mensagem: "Marcado como visto!" });
});

const PORTA_FINAL = process.env.PORT || 3000;
const conexaoBD = Usuario.sequelize;

conexaoBD.sync()
    .then(() => {
        app.listen(PORTA_FINAL, () => {
            console.log(`\n\n🚀 O SITE ESTÁ NO AR, FERA!`);
            console.log(`🔗 Link: http://localhost:${PORTA_FINAL}\n\n`);
        });
    })
    .catch(err => {
        console.log("\n❌ ERRO REAL NO BANCO:");
        console.log(err.message);
    });


