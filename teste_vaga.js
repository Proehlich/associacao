require('dotenv').config();
const Vaga = require('./models/Vaga');

async function testarVaga() {
  try {
    const novaVaga = await Vaga.create({
      titulo: 'Entregador Urgente - Almoço',
      descricao: 'Precisa de motoboy para o turno das 11h às 15h. Pagamos diária + taxa.',
      contato: '(11) 99999-8888',
      restaurante_id: 1 // Simulando o ID de um restaurante
    });

    console.log("✅ VAGA DE TESTE CRIADA!");
    console.log("⏰ Criada em:", novaVaga.data_criacao.toLocaleString());
    console.log("🚀 Vai expirar em:", novaVaga.data_expiracao.toLocaleString());
    
    process.exit();
  } catch (error) {
    console.log("❌ ERRO:", error.message);
    process.exit();
  }
}

testarVaga();
