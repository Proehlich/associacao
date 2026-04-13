const { Sequelize, DataTypes } = require('sequelize');
const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASS, {
    host: process.env.DB_HOST, dialect: 'mysql', logging: false
});

const Suporte = sequelize.define('Suporte', {
    usuario_nome: { type: DataTypes.STRING, allowNull: false },
    mensagem: { type: DataTypes.TEXT, allowNull: false },
    visto_por: { type: DataTypes.STRING, defaultValue: null }, // Aqui entra "Presidente", "Vice", etc.
    status: { type: DataTypes.ENUM('pendente', 'resolvido'), defaultValue: 'pendente' }
});

async function criarTabela() {
    await sequelize.sync({ alter: true });
    console.log("✅ Tabela de Suporte Pronta!");
}
criarTabela();
module.exports = Suporte;
