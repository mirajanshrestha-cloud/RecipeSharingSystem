import { useState } from 'react';
import { API_BASE_URL } from '../config';

const emptyRecipe = {
  title: '',
  cuisine: 'Italian',
  cookTime: '',
  difficulty: 'Easy',
  ingredients: [''],
  steps: [''],
};

export default function AddRecipeForm({ onRecipeAdded }) {
  const [form, setForm] = useState(emptyRecipe);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleField = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleListChange = (type, index, value) => {
    const list = [...form[type]];
    list[index] = value;
    setForm((prev) => ({ ...prev, [type]: list }));
  };

  const addListItem = (type) => {
    setForm((prev) => ({ ...prev, [type]: [...prev[type], ''] }));
  };

  const removeListItem = (type, index) => {
    const list = form[type].filter((_, i) => i !== index);
    setForm((prev) => ({ ...prev, [type]: list.length ? list : [''] }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const payload = {
        ...form,
        ingredients: form.ingredients.filter(Boolean),
        steps: form.steps.filter(Boolean),
      };

      const response = await fetch(`${API_BASE_URL}/api/recipes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Could not add recipe');

      setForm(emptyRecipe);
      setMessage('Recipe added successfully');
      onRecipeAdded(data);
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="add-recipe-form" onSubmit={handleSubmit}>
      <h3>Add a new recipe</h3>
      <input name="title" value={form.title} onChange={handleField} placeholder="Recipe title" required />
      <input name="cookTime" value={form.cookTime} onChange={handleField} placeholder="Cook time" required />
      <select name="cuisine" value={form.cuisine} onChange={handleField}>
        <option>Italian</option>
        <option>Mexican</option>
        <option>Indian</option>
        <option>French</option>
        <option>Thai</option>
        <option>Japanese</option>
        <option>American</option>
        <option>Greek</option>
        <option>Chinese</option>
      </select>
      <select name="difficulty" value={form.difficulty} onChange={handleField}>
        <option>Easy</option>
        <option>Medium</option>
        <option>Hard</option>
      </select>

      <div className="list-section">
        <label>Ingredients</label>
        {form.ingredients.map((ingredient, index) => (
          <div className="list-row" key={`ingredient-${index}`}>
            <input value={ingredient} onChange={(e) => handleListChange('ingredients', index, e.target.value)} placeholder={`Ingredient ${index + 1}`} />
            <button type="button" className="ghost-btn" onClick={() => removeListItem('ingredients', index)}>Remove</button>
          </div>
        ))}
        <button type="button" className="ghost-btn" onClick={() => addListItem('ingredients')}>Add ingredient</button>
      </div>

      <div className="list-section">
        <label>Steps</label>
        {form.steps.map((step, index) => (
          <div className="list-row" key={`step-${index}`}>
            <input value={step} onChange={(e) => handleListChange('steps', index, e.target.value)} placeholder={`Step ${index + 1}`} />
            <button type="button" className="ghost-btn" onClick={() => removeListItem('steps', index)}>Remove</button>
          </div>
        ))}
        <button type="button" className="ghost-btn" onClick={() => addListItem('steps')}>Add step</button>
      </div>

      {message && <p className="form-message">{message}</p>}
      <button className="btn btn-solid full" type="submit" disabled={loading}>{loading ? 'Saving...' : 'Publish recipe'}</button>
    </form>
  );
}
