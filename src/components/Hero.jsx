export default function Hero({ recipes = [], averageTime = 0 }) {
  return (
    <section className="hero">
      <div className="hero-left">
        <p className="eyebrow eyebrow-light">Community Recipe Platform</p>
        <h1>Discover &amp; Share<br />Beautiful Recipes</h1>
        <p className="cook-sub">A polished, modern recipe-sharing experience for food lovers, home chefs, and MERN developers.</p>
        <div className="hero-actions">
          <a href="#" className="btn btn-white">Sign up free</a>
          <a href="#" className="btn btn-outline">Log in</a>
        </div>
      </div>

      <div className="hero-visual">
        <img
          src="https://images.unsplash.com/photo-1466637574441-749b8f19452f?auto=format&fit=crop&w=900&q=80"
          alt="Table with freshly plated dishes"
        />
      </div>

      <div className="hero-stats">
        <div className="stat">
          <span className="stat-num">{recipes.length}</span>
          <span className="stat-label">Recipes</span>
        </div>
        <div className="stat">
          <span className="stat-num">{averageTime}m</span>
          <span className="stat-label">Avg time</span>
        </div>
        <div className="stat">
          <span className="stat-num">{recipes.filter((recipe) => recipe.difficulty === "Easy").length}</span>
          <span className="stat-label">Easy picks</span>
        </div>
      </div>
    </section>
  );
}