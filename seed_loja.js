require('dotenv').config();
const Produto = require('./models/Produto');

async function cadastrarProdutoTeste() {
  try {
    await Produto.create({
      nome: 'Pneu Pirelli City Dragon 90/90-18',
      descricao: 'Pneu traseiro de alta durabilidade para o dia a dia.',
      preco_mercado: 250.00, // Preço para quem não é associado
      preco_associado: 180.00, // PREÇO DE FÁBRICA
      estoque: 15,
      imagem_url: 'pneu.jpg' 
    });

    console.log("✅ PRODUTO CADASTRADO COM SUCESSO!");
    process.exit();
  } catch (error) {
    console.error("❌ ERRO AO CADASTRAR PRODUTO:", error.message);
    process.exit();
  }
}

cadastrarProdutoTeste();
