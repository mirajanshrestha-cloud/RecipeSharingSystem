import { useState } from "react";

export default function WhatCanICook() {
  const [ingredients, setIngredients] = useState("");

  return (
    <section className="cook-section">
      <div className="cook-icon">✨</div>
      <h2>What Can I Cook?</h2>
      <p className="cook-sub">Enter the ingredients you have on hand and we'll suggest a complete recipe.</p>

      <div className="cook-card">
        <label>
          <span className="cook-label">Your ingredients</span>
          <span className="cook-label-sub">— comma separated</span>
        </label>
        <textarea
          placeholder="e.g. chicken, garlic, lemon, spinach, cream..."
          value={ingredients}
          onChange={(e) => setIngredients(e.target.value)}
        />
        <button className="btn btn-generate" disabled={!ingredients.trim()}>
          ✨ Generate Recipe
        </button>
      </div>
    </section>
  );
}