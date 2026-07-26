import { useMemo, useState } from "react";

function parseIngredients(text) {
  return text
    .toLowerCase()
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

export default function WhatCanICook({ recipes = [], onSelectRecipe }) {
  const [ingredients, setIngredients] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const wanted = useMemo(() => parseIngredients(ingredients), [ingredients]);

  // Fully dynamic: ranks every recipe currently in the app by how many of
  // the typed ingredients it actually contains. No hardcoded suggestions.
  const matches = useMemo(() => {
    if (!wanted.length) return [];
    return recipes
      .map((recipe) => {
        const recipeIngredients = (recipe.ingredients || []).map((i) => i.toLowerCase());
        const hits = wanted.filter((want) =>
          recipeIngredients.some((ing) => ing.includes(want) || want.includes(ing))
        );
        return { recipe, hitCount: hits.length, coverage: hits.length / wanted.length };
      })
      .filter((entry) => entry.hitCount > 0)
      .sort((a, b) => b.coverage - a.coverage || b.hitCount - a.hitCount)
      .slice(0, 6);
  }, [recipes, wanted]);

  const applyChip = (chip) => {
    setIngredients(chip);
    setSubmitted(true);
  };

  return (
    <section className="cook-section">
      <div className="cook-shell">
        <div className="cook-icon">✨</div>
        <h2>What Can I Cook?</h2>
        <p className="cook-sub">Turn your pantry ingredients into a complete meal with a smart, polished recipe suggestion experience.</p>

        <div className="cook-card">
          <label>
            <span className="cook-label">Your ingredients</span>
            <span className="cook-label-sub"> — comma separated</span>
          </label>
          <textarea
            placeholder="e.g. chicken, garlic, lemon, spinach, cream..."
            value={ingredients}
            onChange={(e) => {
              setIngredients(e.target.value);
              setSubmitted(false);
            }}
          />
          <button
            className="btn btn-generate"
            disabled={!ingredients.trim()}
            onClick={() => setSubmitted(true)}
          >
            ✨ Generate Recipe
          </button>
        </div>

        <div className="cook-hints">
          <span className="cook-chip" onClick={() => applyChip("chicken, garlic")}>Chicken &amp; garlic</span>
          <span className="cook-chip" onClick={() => applyChip("pasta, tomato")}>Pasta &amp; tomato</span>
          <span className="cook-chip" onClick={() => applyChip("eggs, spinach")}>Eggs &amp; spinach</span>
          <span className="cook-chip" onClick={() => applyChip("rice, vegetables")}>Rice &amp; vegetables</span>
        </div>

        {submitted && (
          <div className="cook-results">
            {matches.length === 0 ? (
              <p className="no-results">No recipes in the collection match those ingredients yet — try a different combination, or add one yourself!</p>
            ) : (
              <>
                <h3>You can make this</h3>
                <div className="grid-recipes">
                  {matches.map(({ recipe, hitCount }) => (
                    <article
                      key={recipe._id || recipe.id}
                      className="recipe-card"
                      onClick={() => onSelectRecipe && onSelectRecipe(recipe)}
                    >
                      <div
                        className="recipe-photo"
                        style={{ backgroundImage: `url(${recipe.image || "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&q=80"})` }}
                      >
                        <span className={`badge badge-${(recipe.difficulty || "Easy").toLowerCase()}`}>{recipe.difficulty || "Easy"}</span>
                      </div>
                      <div className="recipe-body">
                        <p className="recipe-category">{(recipe.cuisine || "Recipe").toUpperCase()}</p>
                        <h3>{recipe.title}</h3>
                        <div className="recipe-meta">
                          <span>🕐 {recipe.cookTime}</span>
                          <span>🥕 {hitCount} match{hitCount === 1 ? "" : "es"}</span>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
