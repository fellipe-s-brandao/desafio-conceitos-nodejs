const express = require("express");
const cors = require("cors");

const { v4, validate } = require("uuid");

const app = express();

app.use(express.json());
app.use(cors());

function logRequests(request, response, next) {
  const { method, url } = request;
  const logLabel = `[${method}] ${url}`;

  console.time(logLabel);
  next();
  console.timeEnd(logLabel);
}

function validateProjectId(request, response, next) {
  const { id } = request.params;

  if (!validate(id)) {
    return response.status(400).json({ erro: "Invalid project Id." });
  }

  return next();
}

app.use(logRequests);
app.use("/repositories/:id", validateProjectId);

const repositories = [];

app.get("/repositories", (request, response) => {
  const result = repositories;

  return response.json(result);
});

app.post("/repositories", (request, response) => {
  const { title, url, techs } = request.body;
  const repository = { id: v4(), title, url, techs, likes: 0 };

  repositories.push(repository);

  return response.json(repository);
});

app.put("/repositories/:id", (request, response) => {
  const { id } = request.params;
  const { title, url, techs } = request.body;

  const repositoryIndex = repositories.findIndex(
    (repository) => repository.id == id
  );

  if (repositoryIndex < 0) {
    return response.status(400).json({ error: "Project not found" });
  }

  const likes = repositories[repositoryIndex].likes;
  const repository = {
    id,
    title,
    url,
    techs,
    likes,
  };

  repositories[repositoryIndex] = repository;
  return response.json(repository);
});

app.delete("/repositories/:id", (request, response) => {
  const { id } = request.params;
  const repositoryIndex = repositories.findIndex(
    (repository) => repository.id == id
  );

  if (repositoryIndex < 0) {
    return response.status(400).json({ error: "Project not found" });
  }

  repositories.splice(repositoryIndex, 1);
  return response.status(204).send();
});

app.post("/repositories/:id/like", (request, response) => {
  const { id } = request.params;
  const repositoryIndex = repositories.findIndex(
    (repository) => repository.id == id
  );

  if (repositoryIndex < 0) {
    return response.status(400).json({ error: "Project not found" });
  }

  repositories[repositoryIndex].likes += 1;

  return response.json(repositories[repositoryIndex]);
});

module.exports = app;
