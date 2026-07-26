import { useEffect, useMemo, useState } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import RecipeGrid from './components/RecipeGrid';
import AddRecipeForm from './components/AddRecipeForm';
import AuthModal from './components/AuthModal';
import WhatCanICook from './components/WhatCanICook';
import Footer from './components/Footer';
import { API_BASE_URL } from './config';

export default function App() {
  const [view, setView] = useState('browse');
  const [user, setUser] = useState(null);
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [favourites, setFavourites] = useState([]);
  const [authOpen, setAuthOpen] = useState(false);

  // Restore whoever was logged in last time, if anyone
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (!storedUser) return;
    try {
      setUser(JSON.parse(storedUser));
    } catch {
      localStorage.removeItem('user');
    }
  }, []);

  // Favourites are per-user and persisted locally
  useEffect(() => {
    if (!user) {
      setFavourites([]);
      return;
    }
    const stored = localStorage.getItem(`favourites_${user._id || user.id}`);
    setFavourites(stored ? JSON.parse(stored) : []);
  }, [user]);

  // Recipes always come live from the API — nothing hardcoded
  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const response = await fetch(`${API_BASE_URL}/api/recipes`);
        const data = await response.json();
        if (!cancelled) setRecipes(Array.isArray(data) ? data : data.recipes || []);
      } catch (error) {
        console.error('Failed to load recipes', error);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const averageTime = useMemo(() => {
    const numeric = recipes.map((r) => parseInt(r.cookTime, 10)).filter((n) => !Number.isNaN(n));
    if (!numeric.length) return 0;
    return Math.round(numeric.reduce((sum, n) => sum + n, 0) / numeric.length);
  }, [recipes]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setView('browse');
  };

  const handleRecipeAdded = (newRecipe) => {
    setRecipes((prev) => [newRecipe, ...prev]);
    setView('browse');
  };

  const handleDeleteRecipe = async (id) => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`${API_BASE_URL}/api/recipes/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Could not delete recipe');
      setRecipes((prev) => prev.filter((r) => (r._id || r.id) !== id));
      setFavourites((prev) => prev.filter((fid) => fid !== id));
      setSelectedRecipe((prev) => (prev && (prev._id || prev.id) === id ? null : prev));
    } catch (error) {
      console.error(error);
    }
  };

  const handleToggleFavourite = (id) => {
    if (!user) {
      setAuthOpen(true);
      return;
    }
    setFavourites((prev) => {
      const next = prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id];
      localStorage.setItem(`favourites_${user._id || user.id}`, JSON.stringify(next));
      return next;
    });
  };

  const goToView = (next) => {
    if ((next === 'add' || next === 'favourites') && !user) {
      setAuthOpen(true);
      return;
    }
    setView(next);
  };

  const visibleRecipes = view === 'favourites'
    ? recipes.filter((r) => favourites.includes(r._id || r.id))
    : recipes;

  return (
    <div className="app-shell">
      <Navbar view={view} setView={goToView} user={user} onLoginClick={() => setAuthOpen(true)} onLogout={handleLogout} />

      {view === 'browse' && <Hero recipes={recipes} averageTime={averageTime} />}

      {(view === 'browse' || view === 'favourites') && (
        <RecipeGrid
          recipes={visibleRecipes}
          loading={loading}
          favourites={favourites}
          selectedRecipe={selectedRecipe}
          onSelectRecipe={setSelectedRecipe}
          onDeleteRecipe={handleDeleteRecipe}
          onToggleFavourite={handleToggleFavourite}
          isLoggedIn={!!user}
        />
      )}

      {view === 'add' && user && <AddRecipeForm onRecipeAdded={handleRecipeAdded} />}

      {view === 'cook' && (
        <WhatCanICook
          recipes={recipes}
          onSelectRecipe={(recipe) => {
            setSelectedRecipe(recipe);
            setView('browse');
          }}
        />
      )}

      <Footer />

      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} onAuthenticated={setUser} />
    </div>
  );
}
