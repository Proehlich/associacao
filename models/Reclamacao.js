const { Sequelize, DataTypes } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASS, {
  host: process.env.DB_HOST,
  dialect: 'mysql',
  logging: false
});

const Reclamacao = sequelize.define('Reclamacao', {
  motoboy_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  mensagem: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('aberta', 'respondida'),
    defaultValue: 'aberta'
  },
  resposta: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  respondido_por: {
    type: DataTypes.STRING, // Aqui vai o nome do Admin (Presidente, Secretário, etc)
    allowNull: true
  },
  data_expiracao_log: {
    type: DataTypes.DATE,
    // Regra: 6 meses (180 dias) no futuro
    defaultValue: () => new Date(Date.now() + 180 * 24 * 60 * 60 * 1000)
  }
});

async function criarTabela() {
  try {
    await sequelize.sync({ alter: true });
    console.log("✅ TABELA DE RECLAMAÇÕES PRONTA!");
  } catch (err) {
    console.log("❌ ERRO:", err.message);
  }
}
criarTabela();

module.exports = Reclamacao;
