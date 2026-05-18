const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs/promises");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// ----------------------
// Serve React build
// ----------------------
app.use(express.static(path.join(__dirname, "client/build")));

// ----------------------
// Animals JSON file
// ----------------------
const animalsFile = path.join(__dirname, "animals.json");

let animals = [];

// Load animals from file
const loadAnimals = async () => {
  try {
    const data = await fs.readFile(animalsFile, "utf-8");
    animals = JSON.parse(data);
  } catch (err) {
    console.error("Error loading animals.json:", err.message);
    animals = [];
  }
};

loadAnimals();

// ----------------------
// API ROUTES
// ----------------------

// GET all animals
app.get("/api/animals", (req, res) => {
  res.json(animals);
});

// GET animal by ID
app.get("/api/animals/:id", (req, res) => {
  const animal = animals.find((a) => a.id == req.params.id);

  if (!animal) {
    return res.status(404).json({ error: "Animal not found" });
  }

  res.json(animal);
});

// POST new animal
app.post("/api/animals", async (req, res) => {
  const { name, species, status, health } = req.body;

  if (!name || !species) {
    return res.status(400).json({
      error: "Missing required fields",
    });
  }

  const newAnimal = {
    id: animals.length ? animals[animals.length - 1].id + 1 : 1,
    name,
    species,
    status: status || "open",
    health: health || "Healthy",
  };

  animals.push(newAnimal);

  try {
    await fs.writeFile(
      animalsFile,
      JSON.stringify(animals, null, 2)
    );

    res.status(201).json(newAnimal);
  } catch (err) {
    console.error("Error writing animals.json:", err.message);

    res.status(500).json({
      error: "Failed to save animal",
    });
  }
});

// ----------------------
// React catch-all route (FIXED)
// ----------------------
// This replaces app.get("*") which breaks in newer Express versions
app.get(/.*/, (req, res) => {
  res.sendFile(
    path.join(__dirname, "client/build", "index.html")
  );
});

// ----------------------
// Start server
// ----------------------
app.listen(PORT, () => {
  console.log(`Zoo API running at http://localhost:${PORT}`);
});