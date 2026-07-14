import { useState } from "react";
import recipes from "../data/recipes";
import RecipeCard from "./RecipeCard";
import SearchFilter from "./SearchFilter";

export default function RecipeGrid() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");

  const filtered = recipes.filter((r) => {
    const matchesCategory = category === "All" || r.category === category;
    const matchesSearch = r.title.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <section className="recipes-section">
      <SearchFilter search={search} setSearch={setSearch} category={category} setCategory={setCategory} />
      <div className="grid-recipes">
        {filtered.map((r) => (
          <RecipeCard key={r.id} {...r} />
        ))}
        {filtered.length === 0 && <p className="no-results">No recipes match that search.</p>}
      </div>
    </section>
  );
}