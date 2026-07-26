import { useMemo, useState } from "react";
import RecipeCard from "./RecipeCard";
import SearchFilter from "./SearchFilter";

export default function RecipeGrid({ recipes = [], loading = false, favourites = [], selectedRecipe, onSelectRecipe, onDeleteRecipe, onToggleFavourite, isLoggedIn }) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");

  const filtered = useMemo(() => {
    return recipes.filter((recipe) => {
      const matchesCategory = category === "All" || recipe.cuisine === category;
      const matchesSearch = recipe.title.toLowerCase().includes(search.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [recipes, search, category]);

  return (
    <section className="recipes-section">
      <SearchFilter search={search} setSearch={setSearch} category={category} setCategory={setCategory} />
      {loading ? <p className="no-results">Loading recipes...</p> : null}
      <div className="grid-recipes">
        {filtered.map((recipe) => (
          <RecipeCard
            key={recipe._id || recipe.id}
            recipe={recipe}
            isFavourite={favourites.includes(recipe._id || recipe.id)}
            onSelectRecipe={onSelectRecipe}
            onToggleFavourite={onToggleFavourite}
            onDeleteRecipe={onDeleteRecipe}
            isLoggedIn={isLoggedIn}
          />
        ))}
        {!loading && filtered.length === 0 && <p className="no-results">No recipes match that search.</p>}
      </div>

      {selectedRecipe && (
        <div className="detail-panel">
          <img
            className="detail-image"
            src={selectedRecipe.image || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=900&q=80'}
            alt={selectedRecipe.title}
          />
          <div className="detail-header">
            <div>
              <p className="recipe-category">{selectedRecipe.cuisine?.toUpperCase()}</p>
              <h3>{selectedRecipe.title}</h3>
            </div>
            <button className="btn btn-solid" onClick={() => onToggleFavourite(selectedRecipe._id || selectedRecipe.id)}>Save</button>
          </div>
          <p className="detail-meta">Cook time: {selectedRecipe.cookTime} • Difficulty: {selectedRecipe.difficulty}</p>
          <div className="detail-list">
            <div>
              <h4>Ingredients</h4>
              <ul>
                {(selectedRecipe.ingredients || []).map((ingredient) => <li key={ingredient}>{ingredient}</li>)}
              </ul>
            </div>
            <div>
              <h4>Steps</h4>
              <ol>
                {(selectedRecipe.steps || []).map((step) => <li key={step}>{step}</li>)}
              </ol>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}