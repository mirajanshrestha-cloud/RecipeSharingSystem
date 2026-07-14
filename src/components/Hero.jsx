import recipes from "../data/recipes";

export default function Hero() {
  const avgTime = Math.round(
    recipes.reduce((sum, r) => sum + parseInt(r.time), 0) / recipes.length
  );

  return (
    <section className="hero">
      <div className="hero-left">
        <p className="eyebrow eyebrow-light">Community Recipe Platform</p>
        <h1>Discover &amp; Share<br />Great Recipes</h1>
        <div className="hero-actions">
          <a href="#" className="btn btn-white">Sign up free</a>
          <a href="#" className="btn btn-outline">Log in</a>
        </div>
      </div>
      <div className="hero-stats">
        <div className="stat">
          <span className="stat-num">{recipes.length}</span>
          <span className="stat-label">Recipes</span>
        </div>
        <div className="stat">
          <span className="stat-num">{avgTime}m</span>
          <span className="stat-label">Avg time</span>
        </div>
        <div className="stat">
          <span className="stat-num">0</span>
          <span className="stat-label">Saved</span>
        </div>
      </div>
    </section>
  );
}