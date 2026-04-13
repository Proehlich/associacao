const Usuario = require('./models/Usuario');

async function criarPresidente() {
  try {
    await Usuario.create({
      nome: 'Nome do Presidente',
      email: 'admin@associacao.com',
      senha: '123',
      tipo: 'admin',
      cargo: 'Presidente',
      status_assinatura: true // Admin não paga
    });
    console.log("✅ PRESIDENTE CADASTRADO COM SUCESSO!");
    process.exit();
  } catch (error) {
    console.log("❌ ERRO AO CADASTRAR:", error.message);
    process.exit();
  }
}

criarPresidente();
