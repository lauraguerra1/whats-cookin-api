const express = require('express');
const cors = require('cors');
const port = process.env.PORT || 3001;
const app = express();
const users = require('./data/users');
const recipes = require('./data/recipes');
const ingredients = require('./data/ingredients');
const host = '0.0.0.0'

app.locals = {
  title: 'What\'s Cookin API',
  users,
  recipes,
  ingredients
}

app.use(cors());
app.use(express.json());

app.get('/api/v1/users', (req, res) => {
  res.status(200).json({ users: app.locals.users });
});

app.get('/api/v1/recipes', (req, res) => {
  res.status(200).json({ recipes: app.locals.recipes });
});

app.get('/api/v1/ingredients', (req, res) => {
  res.status(200).json({ ingredients: app.locals.ingredients });
});

app.post('/api/v1/usersRecipes', (req, res) => {
  const { userID, recipeID } = req.body;

  for (let requiredParameter of ['userID', 'recipeID']) {
    if (req.body[requiredParameter] === undefined) {
      return res.status(422).json({
        message: `You are missing a required parameter of ${requiredParameter}`
      });
    }
  }

  const foundUser = users.find(user => user.id === userID);

  if (!foundUser) {
    return res.status(422).json({
      message: `No user found with ID ${userID}`
    });
  }

  if (foundUser.recipesToCook.includes(recipeID)) {
    return res.status(422).json({
      message: `Recipe #${recipeID} is already a recipeToCook for User #${userID}`
    });
  }

  foundUser.recipesToCook.push(recipeID);

  return res.status(201).json({
    message: `Recipe #${recipeID} was added for User #${userID}`
  });
});

app.patch('/api/v1/recipeHits', (req, res) => {
  const { recipeID } = req.body;
 
  if (req.body.recipeID === undefined) {
    return res.status(422).json({
      message: `You are missing a required parameter of ${recipeID}`
    });
  }

  const foundRecipe = recipes.find(recipe => recipe.id === recipeID);

  if (!foundRecipe) {
    return res.status(422).json({
      message: `No recipe found with ID ${recipeID}`
    });
  }

  foundRecipe.hits += 1;

  return res.status(201).json({
    message: `Success. Recipe #${recipeID}'s hits has been incremented.`
  });
});

app.delete('/api/v1/usersRecipes', (req, res) => {
  const { userID, recipeID } = req.body;

  for (let requiredParameter of ['userID', 'recipeID']) {
    if (req.body[requiredParameter] === undefined) {
      return res.status(422).json({
        message: `You are missing a required parameter of ${requiredParameter}`
      });
    }
  }

  const foundUser = users.find(user => user.id === userID);

  if (!foundUser) {
    return res.status(422).json({
      message: `No user found with ID ${userID}`
    });
  }

  foundUser.recipesToCook = foundUser.recipesToCook.filter(usersRecipeID => {
    return usersRecipeID !== recipeID;
  });

  return res.status(200).json({
    message: `Recipe #${recipeID} was removed for User #${userID}`
  });
});

app.listen(port, host, () => {
  console.log(`${app.locals.title} is now running on http://${host}:${port} !`)
});