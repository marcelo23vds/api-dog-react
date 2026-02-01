import React, { useState } from 'react';
import './App.css';

// Define o formato exato que esperamos receber da API
interface BreedImagesResponse {
  message: string[]; // Um array de URLs (strings) das fotos
  status: string; // O status da resposta ('success' ou 'error')
}


function App() {
  // Definição de Estados (Hooks)
  
  // Estado para armazenar o texto que o usuário digita no input
  const [searchTerm, setSearchTerm] = useState<string>('');
  // Estado para armazenar a lista de URLs das fotos recebidas
  const [images, setImages] = useState<string[]>([]);
  // Estado booleano para controlar o feedback visual de "Carregando..."
  const [loading, setLoading] = useState<boolean>(false);
  // Estado para armazenar mensagens de erro caso a busca falhe
  const [error, setError] = useState<string | null>(null);
  // Estado para controlar a navegação simples (tela de busca vs. tela de resultados)
  const [view, setView] = useState<'search' | 'results'>('search');

  // Função Principal de Busca
  const handleSearch = async (e: React.FormEvent<HTMLFormElement>) => {
    // Previne o recarregamento padrão da página ao enviar o formulário
    e.preventDefault();
    // Limpa espaços em branco e converte para minúsculas (a API exige minúsculas)
    const breed = searchTerm.trim().toLowerCase();
    // Se o usuário não digitou nada, paramos a função aqui
    if (!breed) return;

    // Inicia o estado de carregamento e limpa erros anteriores
    setLoading(true);
    setError(null);

    try {
      // Faz a requisição assíncrona para a Dog API
      const response = await fetch(`https://dog.ceo/api/breed/${breed}/images`);
      // Converte a resposta em JSON, forçando a tipagem com nossa Interface
      const data: BreedImagesResponse = await response.json();

      // Verificação específica da API: às vezes ela retorna status 'error' no corpo do JSON
      // se a raça não for encontrada, mesmo que a requisição HTTP funcione
      if (data.status === 'error') {
        throw new Error(`Raça "${breed}" não encontrada.`);
      }

      // Sucesso: Pegamos apenas as primeiras 30 imagens para não sobrecarregar a tela
      setImages(data.message.slice(0, 30));
      // Mudamos a "view" para mostrar a tela de resultados
      setView('results');
    } catch (err) {
      // Captura qualquer erro (de rede ou lançado manualmente acima) e salva no estado
      setError(err instanceof Error ? err.message : 'Erro ao buscar.');
    } finally {
      // O bloco finally roda SEMPRE, dando certo ou errado
      // Garante que o botão de carregar volte ao normal
      setLoading(false);
    }
  };

  // Função de "Reset"
  const handleBack = () => {
    // Restaura a aplicação para o estado inicial
    setView('search');
    setSearchTerm('');
    setImages([]);
    setError(null);
  };

  return (
    <div className="app-container">
      {view === 'search' ? (
        <section className="search-view">
          <div className="search-content">
            <h1 className="dogg-title">
              <span style={{color: '#4285F4'}}>D</span>
              <span style={{color: '#EA4335'}}>o</span>
              <span style={{color: '#FBBC05'}}>g</span>
              <span style={{color: '#34A853'}}>g</span>
            </h1>
           
            <form onSubmit={handleSearch} className="search-form">
              <div className="search-bar-wrapper">
                <input
                  type="text"
                  className="search-input"
                  placeholder="Pesquise uma raça"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  autoFocus
                />
              </div>
             
              <div className="search-buttons">
                <button type="submit" className="dogg-button" disabled={loading}>
                  {loading ? 'Pesquisando...' : 'Pesquisa Dogg'}
                </button>
              </div>
             
              {error && <p className="error-text">{error}</p>}
            </form>
          </div>
        </section>
      ) : (
        <section className="results-view">
          <header className="results-header">
            <div className="header-content">
               <button onClick={handleBack} className="back-button">
                ← Voltar
              </button>
              <h2>Exibindo fotos de: <span>{searchTerm}</span></h2>
            </div>
          </header>

          <main className="image-grid">
            {images.map((img, index) => (
              <div key={index} className="image-card">
                <img src={img} alt="Dog" loading="lazy" />
              </div>
            ))}
          </main>
        </section>
      )}
    </div>
  );
}

export default App;
