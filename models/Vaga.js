require('dotenv').config();

const { Sequelize, DataTypes } = require('sequelize');
const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASS, {
    host: process.env.DB_HOST,
    dialect: 'mysql',
    logging: false
});

const Vaga = sequelize.define('Vaga', {
    titulo: { type: DataTypes.STRING, allowNull: false }, 
    local: { type: DataTypes.STRING, allowNull: false },  
    arrancada: { type: DataTypes.FLOAT, allowNull: false }, 
    taxa_minima: { type: DataTypes.FLOAT, allowNull: false }, 
    horario_inicio: { type: DataTypes.STRING, allowNull: false },
    horario_fim: { type: DataTypes.STRING, allowNull: false },
    precisa_bag: { type: DataTypes.ENUM('Sim', 'Não'), allowNull: false },
    descricao: { type: DataTypes.TEXT, allowNull: true }, 
    contato: { type: DataTypes.STRING, allowNull: false },
    motoboy_id: { type: DataTypes.INTEGER, defaultValue: null },
    nome_motoboy: { type: DataTypes.STRING, defaultValue: null }, // Faltava vírgula aqui
    data_criacao: { type: DataTypes.DATE, defaultValue: Sequelize.NOW }, // Corrigido 'defaultValue'
    data_expiracao: { type: DataTypes.DATE, defaultValue: () => new Date(Date.now() + 6 * 60 * 60 * 1000) } // Adicionado ':' e corrigido 'type'
});


// Sincronizando a tabela
async function criarTabelaVagas() {
    try {
        await sequelize.sync({ alter: true });
        console.log("✅ TABELA DE VAGAS (MURAL) CRIADA COM SUCESSO!");
    } catch (error) {
        console.log("❌ ERRO AO CRIAR TABELA DE VAGAS:", error.message);
    }
}

criarTabelaVagas();

module.exports = Vaga;
