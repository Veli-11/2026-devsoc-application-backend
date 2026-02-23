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

// =============================================================================
// ==== HTTP Endpoint Stubs ====================================================
// =============================================================================
const app = express();
app.use(express.json());

// Store your recipes here!
const cookbook: any = null;

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

  const returnedRecipe: string = newRecipe.join("");
  
  return returnedRecipe;
}

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
  // TODO: implement me
  res.status(500).send("not yet implemented!")

});

// [TASK 3] ====================================================================
// Endpoint that returns a summary of a recipe that corresponds to a query name
app.get("/summary", (req:Request, res:Request) => {
  // TODO: implement me
  res.status(500).send("not yet implemented!")

});

// =============================================================================
// ==== DO NOT TOUCH ===========================================================
// =============================================================================
const port = 8080;
app.listen(port, () => {
  console.log(`Running on: http://127.0.0.1:8080`);
});
