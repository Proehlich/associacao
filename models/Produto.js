const { Sequelize, DataTypes } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASS, {
    host: process.env.DB_HOST,
    dialect: 'mysql',
    logging: false
});

const Produto = sequelize.define('Produto', {
    nome: {
        type: DataTypes.STRING,
        allowNull: false
    },
    descricao: {
        type: DataTypes.TEXT
    },
    // APENAS UM PREÇO AGORA
    preco: { 
        type: DataTypes.DECIMAL(10, 2), 
        allowNull: false 
    },
    estoque: {
        type: DataTypes.INTEGER,
        defaultValue: 0
    },
    imagem_url: {
        type: DataTypes.STRING 
    }
});

async function criarTabela() {
    try {
        // O { force: true } vai "limpar" a tabela velha e criar a nova perfeita
        await sequelize.sync({ force: true }); 
        console.log("✅ TABELA DA LOJA RESETADA E PRONTA!");
    } catch (err) {
        console.log("❌ ERRO:", err.message);
    }
}
criarTabela();

module.exports = Produto;
