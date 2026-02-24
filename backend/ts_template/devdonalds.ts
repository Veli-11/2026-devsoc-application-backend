import express, { Request, Response } from "express";

// ==== Type Definitions, feel free to add or modify ==========================
interface cookbookEntry {
  name: string;
  type: string;
}

interface requiredItem {
  name: string;
  quantity: number;
}

interface recipe extends cookbookEntry {
  requiredItems: requiredItem[];
}

interface ingredient extends cookbookEntry {
  cookTime: number;
}

interface summary {
  name: string,
  cookTime: number,
  ingredients: requiredItem[]
}

// =============================================================================
// ==== HTTP Endpoint Stubs ====================================================
// =============================================================================
const app = express();
app.use(express.json());

// Store your recipes here!
const cookbook: {recipes: recipe[], ingredients: ingredient[]} = {
  recipes: [],
  ingredients: []
};

// Task 1 helper (don't touch)
app.post("/parse", (req:Request, res:Response) => {
  const { input } = req.body;

  const parsed_string = parse_handwriting(input)
  if (parsed_string == null) {
    res.status(400).send("this string is cooked");
    return;
  } 
  res.json({ msg: parsed_string });
  return;
  
});

// [TASK 1] ====================================================================
// Takes in a recipeName and returns it in a form that 
const parse_handwriting = (recipeName: string): string | null => {
  let newRecipe: string[] = [];
  const len = recipeName.length;
  let capitalise = true;
  let removeWhitespace = true;

  for (let i = 0; i < len; i++) {
    // No invalid letters
    if (!isValidLetter(recipeName[i])) {
      continue;
    }
    // Removr excess whitespace after we saw a whitespace
    if (removeWhitespace && isWhitespace(recipeName[i])) {
      continue;
    }

    // We just saw a whitespace (word ended)
    if (isWhitespace(recipeName[i])) {
      capitalise = true;
      removeWhitespace = true;
      newRecipe.push(' ');
      continue;
    }

    // We have found a letter, meaning it is a new word
    removeWhitespace = false;

    // Add the normal letter in
    if (capitalise) {
      newRecipe.push(recipeName[i].toUpperCase());
      capitalise = false;
    } else {
      newRecipe.push(recipeName[i].toLowerCase());
    }
  }

  // Cut any excess whitespace at the end that snuck in
  while(isWhitespace(newRecipe[newRecipe.length - 1])) {
    newRecipe.pop();
  }

  // Nothing left
  if (newRecipe.length === 0) {
    return null;
  }

  // COmbine it all together
  const returnedRecipe: string = newRecipe.join("");
  
  return returnedRecipe;
}

/**
 * This function checks if its alphanumeric or whitespace
 * @param {string} letter - The letter to check
 * @returns {boolean} 1 if true, 0 if false
 */
function isValidLetter(letter: string): boolean {
  if ('a' <= letter && letter <= 'z') {
    return true;
  }

  if ('A' <= letter && letter <= 'Z') {
    return true
  }

  if (letter === ' ') {
    return true;
  }

  if (letter === '-' || letter === '_') {
    return true;
  }

  return false;
}

/**
 * This function checks if the character is whitespace or not
 * @param {string} letter - The character to check
 * @returns {boolean} 1 if true
 */
function isWhitespace(letter: string): boolean {
  if (letter === ' ') {
    return true;
  }

  if (letter === '-' || letter === '_') {
    return true;
  }

  return false;
}


// [TASK 2] ====================================================================
// Endpoint that adds a CookbookEntry to your magical cookbook
app.post("/entry", (req:Request, res:Response) => {
  const body = req.body;
  const type = body.type;
  const name = body.name;

  // Its a recipe
  if (type === 'recipe') {
    const reqItems = body.requiredItems;
    try {
      addRecipe(name, reqItems);
    } catch (err) {
      res.status(400).send(err.message);
    }

    // Its an ingredient
  } else if (type === 'ingredient') {
    const cookTime = body.cookTime;
    try {
      addIngredient(name, cookTime);
    } catch (err) {
      res.status(400).send(err.message);
    }

    // Bad type
  } else {
    res.status(400).send("Bad type inputted, not <recipe> or <ingreident>");
  }

  res.status(200).send({});
});

/**
 * This function adds a recipe to the cookbook
 * @param {string} name - Name of the recipe
 * @param {requiredItem[]} requiredItems - Required items
 * @returns {}
 */
function addRecipe(name: string, requiredItems: requiredItem[]): {} {
  // Unique entry names
  if (findRecipeByName(name) || findIngredientByName(name)) {
    throw new Error(`The name: ${name} already exists in the cookbook!`);
  }

  // No two required items can be the same
  let seenNames: string[] = [];
  for (let reqItem of requiredItems) {
    if (reqItem.name in seenNames) {
      throw new Error(`A required ingredients name ${reqItem.name} appears twice!`);
    }
    seenNames.push(reqItem.name);
  }

  // Add the recipe
  let newRecipe = {
    type: 'recipe', 
    name: name, 
    requiredItems: requiredItems
  }

  cookbook.recipes.push(newRecipe);
  return {};
}

/**
 * This function adds an ingredient to the cookbook
 * @param {string} name - Name of the recipe
 * @param {number} cookTime - Required items
 * @returns {}
 */
function addIngredient(name: string, cookTime: number): {} {
  // Must have positive cooktime
  if (cookTime < 0) {
    throw new Error(`Cooktime must be 0 or positive only. Inputted: ${cookTime}`);
  }

  // Unique entry names
  if (findRecipeByName(name) || findIngredientByName(name)) {
    throw new Error(`The name: ${name} already exists in the cookbook!`);
  }

  // All good, add it
  let newIngredient = {
    type: 'ingredient', 
    name: name,
    cookTime: cookTime
  }

  cookbook.ingredients.push(newIngredient);
  return {}
}


// [TASK 3] ====================================================================
// Endpoint that returns a summary of a recipe that corresponds to a query name
app.get("/summary", (req:Request, res:Response) => {
  const name = req.query.name as string;

  try {
    const summary = summariseRecipe(name);
    res.status(200).send(summary);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }

});

/**
 * This function finds a recipe given its name
 * @param {string} nameRecipe - Name of the recipe
 * @returns {recipe} Recipe if we could find it
 * @returns {null} If we could not find the recipe
 */
function findRecipeByName(nameRecipe: string): recipe | null {
  const foundRecipe = cookbook.recipes.find(recipe => recipe.name === nameRecipe);
  if (!foundRecipe) {
    return null;
  }

  return foundRecipe;
}

/**
 * This function finds an ingredient given its name
 * @param {string} nameIngredient - Name of the recipe
 * @returns {ingredient} Ingredient if we could find it
 * @returns {null} If we could not find the recipe
 */
function findIngredientByName(nameIngredient: string): ingredient | null {
  const foundIngredient = cookbook.ingredients.find(ingred => ingred.name === nameIngredient);
  if (!foundIngredient) {
    return null;
  }

  return foundIngredient;
}

function summariseRecipe(name: string): summary {
  // Tries to find a recipe with the name
  const recipe = findRecipeByName(name);
  if (recipe === null) {
    throw new Error(`Cant find a recipe with the name: ${name}`);
  }

  // Set up the stack and add the ingredients of the recipe
  let stack: {name: string, amount: number}[] = [];
  for (const ingred of recipe.requiredItems) {
    stack.push({name: ingred.name, amount: ingred.quantity});
  }

  // Holds the cook time and required ingredients
  let currCookTime = 0;
  let currReqIngreds: requiredItem[] = [];

  // While the stack is empty, there is still stuff to process
  while (stack.length !== 0) {
    // Take the final item, and see what type it is
    let currEntry = stack[stack.length - 1];
    stack.pop();

    const isRecipe = findRecipeByName(currEntry.name);
    // We know the current entry is for a recipe, add the req items of it to the stack
    if (isRecipe !== null) {
      for (const ingred of isRecipe.requiredItems) {
        stack.push({name: ingred.name, amount: ingred.quantity * currEntry.amount});
      }
      // Move to the next entry, we are done
      continue;
    }

    // If we get to here, we will check if its an ingredient or not
    const isIngred = findIngredientByName(currEntry.name);
    if (isIngred !== null) {

      // Add the ingredient and check if its there already or not
      const existingIngredient = currReqIngreds.find(currReq => currReq.name === isIngred.name);
      if (!existingIngredient) {
        currReqIngreds.push({name: isIngred.name, quantity: currEntry.amount});
      } else {
        existingIngredient.quantity += currEntry.amount;
      }

      // Add the time
      currCookTime += isIngred.cookTime * currEntry.amount;
      // Move to the next entry
      continue;
    }

    // The required item does not exist!
    throw new Error(`The subsidary item: ${currEntry.name} is not in the cookbook`);
  }

  // Return the finished summary
  const summary = {
    name: name,
    cookTime: currCookTime,
    ingredients: currReqIngreds
  }
  return summary;
}


// =============================================================================
// ==== DO NOT TOUCH ===========================================================
// =============================================================================
const port = 8080;
app.listen(port, () => {
  console.log(`Running on: http://127.0.0.1:8080`);
});
