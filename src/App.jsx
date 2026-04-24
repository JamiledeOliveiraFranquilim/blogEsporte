// src/App.jsx
import React, { useState, useEffect } from 'react';
import { newsService, authService } from "./service/newService";
import './App.css';

// Componente de Login
const LoginModal = ({ isOpen, onClose, onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    nome: '',
    cargo: 'Jornalista'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    let result;
    if (isLogin) {
      result = await authService.signIn(formData.email, formData.password);
    } else {
      result = await authService.signUp(formData.email, formData.password, {
        nome: formData.nome,
        cargo: formData.cargo
      });
    }

    setLoading(false);

    if (result.success) {
      onLogin(result.data.user);
      onClose();
    } else {
      setError(result.error || 'Erro ao fazer login');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content login-modal" onClick={(e) => e.stopPropagation()}>
        <h2>{isLogin ? 'Acesso Jornalistas' : 'Cadastro de Jornalista'}</h2>
        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <>
              <input
                type="text"
                placeholder="Nome completo"
                value={formData.nome}
                onChange={(e) => setFormData({...formData, nome: e.target.value})}
                required
              />
              <select
                value={formData.cargo}
                onChange={(e) => setFormData({...formData, cargo: e.target.value})}
              >
                <option value="Jornalista">Jornalista</option>
                <option value="Editor Chefe">Editor Chefe</option>
                <option value="Redator">Redator</option>
                <option value="Repórter">Repórter</option>
              </select>
            </>
          )}
          <input
            type="email"
            placeholder="E-mail"
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
            required
          />
          <input
            type="password"
            placeholder="Senha"
            value={formData.password}
            onChange={(e) => setFormData({...formData, password: e.target.value})}
            required
          />
          {error && <div className="error-message">{error}</div>}
          <button type="submit" disabled={loading}>
            {loading ? 'Carregando...' : (isLogin ? 'Entrar' : 'Cadastrar')}
          </button>
          <button type="button" className="switch-mode" onClick={() => setIsLogin(!isLogin)}>
            {isLogin ? 'Criar conta' : 'Já tenho conta'}
          </button>
        </form>
        <div className="demo-credentials">
          <p>Demo: admin@blog.com / admin123</p>
        </div>
      </div>
    </div>
  );
};

// Componente Header
const Header = ({ currentView, setCurrentView, user, onLogout }) => {
  return (
    <header className="header">
      <div className="header-content">
        <div className="logo-area">
          <h1 className="logo">Blog do Esporte</h1>
          <p className="logo-subtitle">Sua fonte de informações esportivas</p>
        </div>
        <nav>
          <button 
            className={`nav-btn ${currentView === 'home' ? 'active' : ''}`}
            onClick={() => setCurrentView('home')}
          >
            Início
          </button>
          {user ? (
            <>
              <button 
                className={`nav-btn ${currentView === 'dashboard' ? 'active' : ''}`}
                onClick={() => setCurrentView('dashboard')}
              >
                Dashboard
              </button>
              <button 
                className={`nav-btn ${currentView === 'new' ? 'active' : ''}`}
                onClick={() => setCurrentView('new')}
              >
                Nova Notícia
              </button>
              <div className="user-info">
                <div className="user-avatar"></div>
                <span className="user-name">{user.profile?.nome || user.user_metadata?.nome || user.email}</span>
                <button className="logout-btn" onClick={onLogout}>Sair</button>
              </div>
            </>
          ) : (
            <button className="nav-btn login-btn" onClick={() => setCurrentView('login')}>
              Área do Jornalista
            </button>
          )}
        </nav>
      </div>
    </header>
  );
};

// Componente NewsCard
const NewsCard = ({ news, onEdit, onDelete, showActions = false }) => {
  const categoria = news.categorias || { nome: 'outros', cor: '#9E9E9E' };
  
  return (
    <div className="news-card">
      <div className="card-badge" style={{ backgroundColor: categoria.cor }}>
        <span>{categoria.nome}</span>
      </div>
      
      {news.imagem && (
        <div className="card-image">
          <img src={news.imagem} alt={news.titulo} />
          <div className="image-overlay"></div>
        </div>
      )}
      
      <div className="card-content">
        <h3 className="card-title">{news.titulo}</h3>
        <p className="card-resumo">{news.resumo}</p>
        
        <div className="card-meta">
          <div className="meta-info">
            <span>{news.autor}</span>
          </div>
          <div className="meta-info">
            <span>{new Date(news.data_publicacao).toLocaleDateString('pt-BR')}</span>
          </div>
          <div className="meta-info">
            <span>{news.visualizacoes || 0} visualizações</span>
          </div>
        </div>
        
        {showActions && (
          <div className="card-actions">
            <button className="action-btn edit" onClick={() => onEdit(news)}>
              Editar
            </button>
            <button className="action-btn delete" onClick={() => onDelete(news.id)}>
              Excluir
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// Componente Dashboard
const JournalistDashboard = ({ news, onEdit, onDelete, onPublish, loading }) => {
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [stats, setStats] = useState({ total: 0, thisMonth: 0, totalViews: 0 });

  useEffect(() => {
    const loadStats = async () => {
      const result = await newsService.getStats();
      if (result.success) {
        setStats(result.data);
      }
    };
    loadStats();
  }, [news]);

  const filteredNews = news.filter(n => {
    if (filter !== 'all' && n.categorias?.nome !== filter) return false;
    if (searchTerm) {
      return n.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
             n.autor.toLowerCase().includes(searchTerm.toLowerCase());
    }
    return true;
  });

  if (loading) {
    return <div className="loading">Carregando notícias...</div>;
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h2>Painel do Jornalista</h2>
        <button className="btn-primary" onClick={onPublish}>
          Nova Notícia
        </button>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-info">
            <h3>{stats.total}</h3>
            <p>Total de notícias</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-info">
            <h3>{stats.thisMonth}</h3>
            <p>Notícias este mês</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-info">
            <h3>{stats.totalViews}</h3>
            <p>Total de visualizações</p>
          </div>
        </div>
      </div>

      <div className="dashboard-controls">
        <div className="search-box">
          <input
            type="text"
            placeholder="Buscar notícias por título ou autor..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <select 
          className="filter-select"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        >
          <option value="all">Todas categorias</option>
          <option value="futebol">Futebol</option>
          <option value="basquete">Basquete</option>
          <option value="volei">Vôlei</option>
          <option value="tenis">Tênis</option>
          <option value="natação">Natação</option>
          <option value="outros">Outros</option>
        </select>
      </div>

      <div className="news-list">
        {filteredNews.length === 0 ? (
          <div className="empty-state">
            <p>Nenhuma notícia encontrada</p>
            <button className="btn-primary" onClick={onPublish}>
              Criar primeira notícia
            </button>
          </div>
        ) : (
          filteredNews.map(item => (
            <div key={item.id} className="news-list-item">
              <div className="news-preview">
                {item.imagem && <img src={item.imagem} alt={item.titulo} />}
                <div className="news-preview-info">
                  <h4>{item.titulo}</h4>
                  <p>{item.resumo.substring(0, 100)}...</p>
                  <div className="news-meta">
                    <span>{new Date(item.data_publicacao).toLocaleDateString('pt-BR')}</span>
                    <span>{item.visualizacoes || 0} visualizações</span>
                    <span>{item.autor}</span>
                    <span className="category-badge" style={{backgroundColor: item.categorias?.cor || '#999'}}>
                      {item.categorias?.nome || 'Sem categoria'}
                    </span>
                  </div>
                </div>
              </div>
              <div className="news-list-actions">
                <button 
                  className="action-btn edit" 
                  onClick={() => onEdit(item)}
                >
                  Editar
                </button>
                <button 
                  className="action-btn delete" 
                  onClick={() => onDelete(item.id)}
                >
                  Excluir
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

// Componente NewsForm
const NewsForm = ({ onSubmit, initialData, onCancel, loading }) => {
  const [formData, setFormData] = useState({
    titulo: '',
    resumo: '',
    conteudo: '',
    categoria: 'futebol',
    autor: '',
    imagem: '',
    tags: '',
    destaque: false,
    data_publicacao: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        ...initialData,
        categoria: initialData.categorias?.nome || initialData.categoria || 'futebol',
        tags: initialData.tags?.join(', ') || ''
      });
    }
  }, [initialData]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const tagsArray = formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag);
    onSubmit({ ...formData, tags: tagsArray });
  };

  return (
    <form className="news-form" onSubmit={handleSubmit}>
      <div className="form-group">
        <label>Título da Notícia</label>
        <input
          type="text"
          placeholder="Ex: Brasil vence campeonato mundial de futebol"
          value={formData.titulo}
          onChange={(e) => setFormData({...formData, titulo: e.target.value})}
          required
        />
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>Categoria</label>
          <select
            value={formData.categoria}
            onChange={(e) => setFormData({...formData, categoria: e.target.value})}
            required
          >
            <option value="futebol">Futebol</option>
            <option value="basquete">Basquete</option>
            <option value="volei">Vôlei</option>
            <option value="tenis">Tênis</option>
            <option value="natação">Natação</option>
            <option value="outros">Outros</option>
          </select>
        </div>

        <div className="form-group">
          <label>Autor</label>
          <input
            type="text"
            placeholder="Seu nome"
            value={formData.autor}
            onChange={(e) => setFormData({...formData, autor: e.target.value})}
            required
          />
        </div>
      </div>

      <div className="form-group">
        <label>Resumo</label>
        <textarea
          placeholder="Escreva um resumo atraente da notícia (máximo 200 caracteres)"
          rows="3"
          value={formData.resumo}
          onChange={(e) => setFormData({...formData, resumo: e.target.value})}
          maxLength="200"
          required
        />
        <small>{formData.resumo.length}/200 caracteres</small>
      </div>

      <div className="form-group">
        <label>Conteúdo Completo</label>
        <textarea
          placeholder="Escreva a notícia completa aqui..."
          rows="8"
          value={formData.conteudo}
          onChange={(e) => setFormData({...formData, conteudo: e.target.value})}
          required
        />
      </div>

      <div className="form-group">
        <label>URL da Imagem (opcional)</label>
        <input
          type="url"
          placeholder="https://exemplo.com/imagem.jpg"
          value={formData.imagem}
          onChange={(e) => setFormData({...formData, imagem: e.target.value})}
        />
      </div>

      <div className="form-group">
        <label>Tags (separadas por vírgula)</label>
        <input
          type="text"
          placeholder="Ex: campeonato, final, vitória"
          value={formData.tags}
          onChange={(e) => setFormData({...formData, tags: e.target.value})}
        />
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>Data da Publicação</label>
          <input
            type="date"
            value={formData.data_publicacao}
            onChange={(e) => setFormData({...formData, data_publicacao: e.target.value})}
          />
        </div>

        <div className="form-group checkbox">
          <label>
            <input
              type="checkbox"
              checked={formData.destaque}
              onChange={(e) => setFormData({...formData, destaque: e.target.checked})}
            />
            Destacar como notícia principal
          </label>
        </div>
      </div>

      <div className="form-actions">
        <button type="button" className="btn-cancel" onClick={onCancel} disabled={loading}>
          Cancelar
        </button>
        <button type="submit" className="btn-submit" disabled={loading}>
          {loading ? 'Salvando...' : (initialData ? 'Atualizar Notícia' : 'Publicar Notícia')}
        </button>
      </div>
    </form>
  );
};

// Componente Principal
function App() {
  const [news, setNews] = useState([]);
  const [currentView, setCurrentView] = useState('home');
  const [editingNews, setEditingNews] = useState(null);
  const [selectedCategoria, setSelectedCategoria] = useState('all');
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showLoginModal, setShowLoginModal] = useState(false);

  useEffect(() => {
    loadNews();
    checkUser();
  }, []);

  const checkUser = async () => {
    const result = await authService.getCurrentUser();
    if (result.success && result.user) {
      setUser(result.user);
    }
    setLoading(false);
  };

  const loadNews = async () => {
    setLoading(true);
    const result = await newsService.getAllNews();
    if (result.success) {
      setNews(result.data);
    }
    setLoading(false);
  };

  const handleSaveNews = async (newsData) => {
    setLoading(true);
    let result;
    
    if (editingNews) {
      result = await newsService.updateNews(editingNews.id, newsData);
    } else {
      result = await newsService.createNews(newsData);
    }

    setLoading(false);

    if (result.success) {
      await loadNews();
      alert(editingNews ? 'Notícia atualizada!' : 'Notícia publicada!');
      setEditingNews(null);
      setCurrentView('dashboard');
    } else {
      alert('Erro: ' + result.error);
    }
  };

  const handleEditNews = (newsItem) => {
    setEditingNews(newsItem);
    setCurrentView('edit');
  };

  const handleDeleteNews = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir esta notícia?')) {
      setLoading(true);
      const result = await newsService.deleteNews(id);
      setLoading(false);

      if (result.success) {
        await loadNews();
        alert('Notícia excluída!');
      } else {
        alert('Erro ao excluir');
      }
    }
  };

  const handleLogin = (userData) => {
    setUser(userData);
    setCurrentView('dashboard');
  };

  const handleLogout = async () => {
    await authService.signOut();
    setUser(null);
    setCurrentView('home');
  };

  const filteredNews = selectedCategoria === 'all' 
    ? news 
    : news.filter(n => n.categorias?.nome === selectedCategoria);

  const categorias = [
    { id: 'all', nome: 'Todas' },
    { id: 'futebol', nome: 'Futebol' },
    { id: 'basquete', nome: 'Basquete' },
    { id: 'volei', nome: 'Vôlei' },
    { id: 'tenis', nome: 'Tênis' },
    { id: 'natação', nome: 'Natação' },
    { id: 'outros', nome: 'Outros' }
  ];

  if (loading && news.length === 0) {
    return <div className="loading-screen">Carregando Blog do Esporte...</div>;
  }

  return (
    <div className="app">
      <Header 
        currentView={currentView} 
        setCurrentView={setCurrentView} 
        user={user}
        onLogout={handleLogout}
      />
      
      <main className="main">
        {currentView === 'home' && (
          <>
            {news.some(n => n.destaque) && (
              <div className="featured-section">
                <h2>Notícias em Destaque</h2>
                <div className="featured-grid">
                  {news.filter(n => n.destaque).slice(0, 2).map(item => (
                    <div key={item.id} className="featured-card">
                      {item.imagem && <img src={item.imagem} alt={item.titulo} />}
                      <div className="featured-content">
                        <h3>{item.titulo}</h3>
                        <p>{item.resumo}</p>
                        <div className="featured-meta">
                          <span>{item.autor}</span>
                          <span>{new Date(item.data_publicacao).toLocaleDateString('pt-BR')}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="categories-tabs">
              {categorias.map(cat => (
                <button
                  key={cat.id}
                  className={`tab-btn ${selectedCategoria === cat.id ? 'active' : ''}`}
                  onClick={() => setSelectedCategoria(cat.id)}
                >
                  {cat.nome}
                </button>
              ))}
            </div>

            <div className="news-grid">
              {filteredNews.length === 0 ? (
                <div className="empty-state">
                  <p>Nenhuma notícia encontrada nesta categoria.</p>
                </div>
              ) : (
                filteredNews.map(item => (
                  <NewsCard key={item.id} news={item} />
                ))
              )}
            </div>
          </>
        )}

        {currentView === 'dashboard' && user && (
          <JournalistDashboard 
            news={news}
            onEdit={handleEditNews}
            onDelete={handleDeleteNews}
            onPublish={() => {
              setEditingNews(null);
              setCurrentView('new');
            }}
            loading={loading}
          />
        )}

        {(currentView === 'new' || currentView === 'edit') && user && (
          <div className="form-container">
            <div className="form-header">
              <h2>{editingNews ? 'Editar Notícia' : 'Criar Nova Notícia'}</h2>
              <button className="close-form" onClick={() => {
                setCurrentView('dashboard');
                setEditingNews(null);
              }}>×</button>
            </div>
            <NewsForm 
              onSubmit={handleSaveNews}
              initialData={editingNews}
              onCancel={() => {
                setCurrentView('dashboard');
                setEditingNews(null);
              }}
              loading={loading}
            />
          </div>
        )}

        {currentView === 'login' && !user && (
          <LoginModal 
            isOpen={true}
            onClose={() => setCurrentView('home')}
            onLogin={handleLogin}
          />
        )}
      </main>

      <footer className="footer">
        <div className="footer-content">
          <p>Blog do Esporte - Por jornalistas, para amantes do esporte</p>
          <p>© 2024 - Todos os direitos reservados</p>
        </div>
      </footer>
    </div>
  );
}

export default App;