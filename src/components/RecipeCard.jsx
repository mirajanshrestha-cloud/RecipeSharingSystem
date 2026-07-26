export default function RecipeCard({ recipe, isFavourite, onSelectRecipe, onToggleFavourite, onDeleteRecipe, isLoggedIn }) {
  const handleFavourite = (event) => {
    event.stopPropagation();
    onToggleFavourite(recipe._id || recipe.id);
  };

  const handleDelete = (event) => {
    event.stopPropagation();
    onDeleteRecipe(recipe._id || recipe.id);
  };

  return (
    <article className="recipe-card" onClick={() => onSelectRecipe(recipe)}>
      <div className="recipe-photo" style={{ backgroundImage: `url(${recipe.image || "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&q=80"})` }}>
        <span className={`badge badge-${(recipe.difficulty || "Easy").toLowerCase()}`}>{recipe.difficulty || "Easy"}</span>
        <button className="heart-btn" aria-label="Save recipe" onClick={handleFavourite}>
          {isFavourite ? "♥" : "♡"}
        </button>
      </div>
      <div className="recipe-body">
        <p className="recipe-category">{(recipe.cuisine || "Recipe").toUpperCase()}</p>
        <h3>{recipe.title}</h3>
        <div className="recipe-meta">
          <span>🕐 {recipe.cookTime}</span>
          <span>👤 {recipe.createdBy?.name || "Community"}</span>
        </div>
        {isLoggedIn && (
          <button className="delete-btn" onClick={handleDelete}>Delete</button>
        )}
      </div>
    </article>
  );
}