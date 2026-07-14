const categories = ["All", "Italian", "Mexican", "Indian", "French", "American", "Japanese", "Thai", "Chinese", "Greek"];

export default function SearchFilter({ search, setSearch, category, setCategory }) {
  return (
    <div className="search-filter">
      <div className="search-box">
        <span className="search-icon">🔍</span>
        <input
          type="text"
          placeholder="Search recipes by title..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
      <div className="pill-row">
        {categories.map((c) => (
          <button
            key={c}
            className={`pill ${category === c ? "pill-active" : ""}`}
            onClick={() => setCategory(c)}
          >
            {c}
          </button>
        ))}
      </div>
    </div>
  );
}