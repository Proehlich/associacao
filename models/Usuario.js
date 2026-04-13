const { Sequelize, DataTypes } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASS, {
  host: process.env.DB_HOST,
  dialect: 'mysql',
  logging: false
});

const Usuario = sequelize.define('Usuario', {
  nome: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING, allowNull: false, unique: true },
  senha: { type: DataTypes.STRING, allowNull: false },
  tipo: { type: DataTypes.ENUM('motoboy', 'restaurante', 'oficina', 'admin'), allowNull: false },
  cpf: { type: DataTypes.STRING, unique: true },
  cnh: { type: DataTypes.STRING },
  telefone: { type: DataTypes.STRING },
  placa_moto: { type: DataTypes.STRING },
  cnh_status: { type: DataTypes.ENUM('regular', 'irregular'), defaultValue: 'regular' },
  moto_status: { type: DataTypes.ENUM('regular', 'irregular'), defaultValue: 'regular' },
  foto_perfil: { type: DataTypes.STRING, defaultValue: 'padrao.png' },
  status_assinatura: { type: DataTypes.BOOLEAN, defaultValue: true },
  // CAMPO DE VALIDAÇÃO SEMESTRAL (DENTRO DO MODELO)
  data_ultima_validacao: { 
    type: DataTypes.DATE, 
    defaultValue: Sequelize.NOW 
  }
});

async function criarTabela() {
  try {
    await sequelize.sync({ alter: true });
    console.log("✅ TABELA DE USUÁRIOS ATUALIZADA COM SUCESSO!");
  } catch (error) {
    console.log("❌ ERRO AO CRIAR TABELA:", error.message);
  }
}

module.exports = Usuario;

