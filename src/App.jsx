import { useState } from "react";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import RecipeGrid from "./components/RecipeGrid";
import WhatCanICook from "./components/WhatCanICook";
import Footer from "./components/Footer";
import "./App.css";

export default function App() {
  const [view, setView] = useState("browse");

  return (
    <>
      <Navbar view={view} setView={setView} />
      {view === "browse" ? (
        <>
          <Hero />
          <RecipeGrid />
        </>
      ) : (
        <WhatCanICook />
      )}
      <Footer />
    </>
  );
}