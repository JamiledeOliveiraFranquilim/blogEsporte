// src/services/newsService.js
import { supabase } from '../lib/supabase';

// Dados mockados para desenvolvimento
const mockNews = [
  {
    id: 1,
    titulo: 'Brasil conquista hexacampeonato mundial em jogo emocionante',
    resumo: 'Seleção brasileira faz história ao vencer a Argentina por 3 a 2 na final da Copa do Mundo',
    conteudo: 'Em uma partida histórica no Maracanã, o Brasil conquistou seu sexto título mundial com uma virada espetacular nos acréscimos...',
    autor: 'Carlos Mendes',
    imagem: 'https://images.unsplash.com/photo-1459865264687-595d652de67e?w=800',
    destaque: true,
    visualizacoes: 15234,
    data_publicacao: '2024-03-15',
    status: 'publicado',
    categorias: { id: 1, nome: 'futebol', icone: '⚽', cor: '#4CAF50' }
  },
  {
    id: 2,
    titulo: 'NBA: Warriors vencem Lakers em jogo decisivo',
    resumo: 'Stephen Curry brilha com 42 pontos e garante vitória na prorrogação',
    conteudo: 'Em um jogo eletrizante, os Golden State Warriors venceram os Lakers por 125-120 na prorrogação...',
    autor: 'Ana Paula Rodrigues',
    imagem: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=800',
    destaque: false,
    visualizacoes: 8765,
    data_publicacao: '2024-03-14',
    status: 'publicado',
    categorias: { id: 2, nome: 'basquete', icone: '🏀', cor: '#FF9800' }
  },
  {
    id: 3,
    titulo: 'Brasil vence Itália e se aproxima da classificação no vôlei',
    resumo: 'Seleção brasileira de vôlei vence mais uma na Liga das Nações',
    conteudo: 'Com atuação impecável, o Brasil derrotou a Itália por 3 sets a 0...',
    autor: 'Roberto Almeida',
    imagem: 'https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?w=800',
    destaque: false,
    visualizacoes: 5432,
    data_publicacao: '2024-03-13',
    status: 'publicado',
    categorias: { id: 3, nome: 'volei', icone: '🏐', cor: '#2196F3' }
  }
];

let localNews = [...mockNews];

export const newsService = {
  async getAllNews(filters = {}) {
    try {
      // Tenta buscar do Supabase
      const { data, error } = await supabase
        .from('noticias')
        .select('*, categorias(*)')
        .order('data_publicacao', { ascending: false });

      if (error) throw error;
      
      if (data && data.length > 0) {
        let filteredData = [...data];
        if (filters.categoria && filters.categoria !== 'all') {
          filteredData = filteredData.filter(n => n.categorias?.nome === filters.categoria);
        }
        return { success: true, data: filteredData };
      }
      
      // Fallback para dados mockados
      let filteredMock = [...localNews];
      if (filters.categoria && filters.categoria !== 'all') {
        filteredMock = filteredMock.filter(n => n.categorias?.nome === filters.categoria);
      }
      return { success: true, data: filteredMock };
    } catch (error) {
      console.log('Usando dados locais:', error.message);
      let filteredMock = [...localNews];
      if (filters.categoria && filters.categoria !== 'all') {
        filteredMock = filteredMock.filter(n => n.categorias?.nome === filters.categoria);
      }
      return { success: true, data: filteredMock };
    }
  },

  async createNews(newsData) {
    try {
      const newNews = {
        id: Date.now(),
        ...newsData,
        visualizacoes: 0,
        status: 'publicado',
        data_publicacao: newsData.data_publicacao || new Date().toISOString().split('T')[0],
        categorias: { 
          nome: newsData.categoria,
          icone: '🏅',
          cor: '#9E9E9E'
        }
      };
      localNews = [newNews, ...localNews];
      return { success: true, data: newNews };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  async updateNews(id, newsData) {
    try {
      const index = localNews.findIndex(n => n.id === id);
      if (index !== -1) {
        localNews[index] = { ...localNews[index], ...newsData };
        return { success: true, data: localNews[index] };
      }
      return { success: false, error: 'Notícia não encontrada' };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  async deleteNews(id) {
    try {
      localNews = localNews.filter(n => n.id !== id);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  async getStats() {
    return {
      success: true,
      data: {
        total: localNews.length,
        thisMonth: localNews.filter(n => {
          const data = new Date(n.data_publicacao);
          const agora = new Date();
          return data.getMonth() === agora.getMonth() && data.getFullYear() === agora.getFullYear();
        }).length,
        totalViews: localNews.reduce((sum, n) => sum + (n.visualizacoes || 0), 0)
      }
    };
  }
};

export const authService = {
  async signIn(email, password) {
    // Login de desenvolvimento
    if (email === 'admin@blog.com' && password === 'admin123') {
      return {
        success: true,
        data: {
          user: {
            id: 1,
            email: 'admin@blog.com',
            user_metadata: { nome: 'Administrador' },
            profile: { nome: 'Administrador', cargo: 'Editor Chefe' }
          }
        }
      };
    }
    
    // Permite qualquer email/senha para teste
    if (email && password) {
      return {
        success: true,
        data: {
          user: {
            id: Date.now(),
            email: email,
            user_metadata: { nome: email.split('@')[0] },
            profile: { nome: email.split('@')[0], cargo: 'Jornalista' }
          }
        }
      };
    }
    
    return { success: false, error: 'Credenciais inválidas' };
  },

  async signOut() {
    return { success: true };
  },

  async getCurrentUser() {
    return { success: true, user: null };
  }
};