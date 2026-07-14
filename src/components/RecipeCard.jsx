export default function RecipeCard({ title, category, difficulty, time, author, image }) {
  return (
    <article className="recipe-card">
      <div className="recipe-photo" style={{ backgroundImage: `url(${image})` }}>
        <span className={`badge badge-${difficulty.toLowerCase()}`}>{difficulty}</span>
        <button className="heart-btn" aria-label="Save recipe">♡</button>
      </div>
      <div className="recipe-body">
        <p className="recipe-category">{category.toUpperCase()}</p>
        <h3>{title}</h3>
        <div className="recipe-meta">
          <span>🕐 {time}</span>
          <span>👤 {author}</span>
        </div>
      </div>
    </article>
  );
}