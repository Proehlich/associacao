require('dotenv').config();
const Usuario = require('./models/Usuario');

async function criarParceirosFantasmas() {
  try {
    const parceiros = [
      { nome: 'Pizzaria do Vale', email: 'pizzaria@vale.com', senha: '123', tipo: 'restaurante', foto_perfil: 'pizzaria.jpg' },
      { nome: 'Oficina MotoSpeed', email: 'oficina@speed.com', senha: '123', tipo: 'oficina', foto_perfil: 'oficina.jpg' },
      { nome: 'Hambúrguer do Grau', email: 'grau@burger.com', senha: '123', tipo: 'restaurante', foto_perfil: 'burguer.jpg' },
      { nome: 'Mecânica Duas Rodas', email: 'mecanica@2rodas.com', senha: '123', tipo: 'oficina', foto_perfil: 'mecanica.jpg' },
      { nome: 'Posto Central (Combustível)', email: 'posto@central.com', senha: '123', tipo: 'restaurante', foto_perfil: 'posto.jpg' }
    ];

    for (let p of parceiros) {
      // O findOrCreate evita criar duplicados se você rodar o código duas vezes
      await Usuario.findOrCreate({
        where: { email: p.email },
        defaults: { ...p, status_assinatura: true }
      });
    }

    console.log("✅ 5 PARCEIROS FANTASMAS CRIADOS COM SUCESSO!");
    process.exit();
  } catch (error) {
    console.error("❌ ERRO:", error.message);
    process.exit();
  }
}

criarParceirosFantasmas();
