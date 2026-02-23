const request = require("supertest");

describe("Task 1", () => {
  describe("POST /parse", () => {
    const getTask1 = async (inputStr) => {
      return await request("http://localhost:8080")
        .post("/parse")
        .send({ input: inputStr });
    };

    it("example1", async () => {
      const response = await getTask1("Riz@z RISO00tto!");
      expect(response.body).toStrictEqual({ msg: "Rizz Risotto" });
    });

    it("example2", async () => {
      const response = await getTask1("alpHa-alFRedo");
      expect(response.body).toStrictEqual({ msg: "Alpha Alfredo" });
    });

    it("error case", async () => {
      const response = await getTask1("");
      expect(response.status).toBe(400);
    });

    // My personal extra tests that I have made

    it("meatball", async () => {
      const response = await getTask1("meatball");
      expect(response.body).toStrictEqual({ msg: "Meatball" });
    });

    it("Skibidi spaghetti", async () => {
      const response = await getTask1("Skibidi spaghetti");
      expect(response.body).toStrictEqual({ msg: "Skibidi Spaghetti" });
    });

    it("$$$meat #ball$", async () => {
      const response = await getTask1("$$$meat #ball$");
      expect(response.body).toStrictEqual({ msg: "Meat Ball" });
    });

    it("Skibidi --spaghetti", async () => {
      const response = await getTask1("Skibidi --spaghetti");
      expect(response.body).toStrictEqual({ msg: "Skibidi Spaghetti" });
    });

    it("Skibidi_____spaghetti", async () => {
      const response = await getTask1("Skibidi_____spaghetti");
      expect(response.body).toStrictEqual({ msg: "Skibidi Spaghetti" });
    });

    it("@@@####  ###$$$", async () => {
      const response = await getTask1("@@@####  ###$$$");
      expect(response.status).toBe(400);
    });

    it("     ball$", async () => {
      const response = await getTask1("     ball$");
      expect(response.body).toStrictEqual({ msg: "Ball" });
    });
  });
});

describe("Task 2", () => {
  describe("POST /entry", () => {
    const putTask2 = async (data) => {
      return await request("http://localhost:8080").post("/entry").send(data);
    };

    it("Add Ingredients", async () => {
      const entries = [
        { type: "ingredient", name: "Egg", cookTime: 6 },
        { type: "ingredient", name: "Lettuce", cookTime: 1 },
      ];
      for (const entry of entries) {
        const resp = await putTask2(entry);
        expect(resp.status).toBe(200);
        expect(resp.body).toStrictEqual({});
      }
    });

    it("Add Recipe", async () => {
      const meatball = {
        type: "recipe",
        name: "Meatball",
        requiredItems: [{ name: "Beef", quantity: 1 }],
      };
      const resp1 = await putTask2(meatball);
      expect(resp1.status).toBe(200);
    });

    it("bad Recipe", async () => {
      const meatball = {
        type: "recipe",
        name: "Meatball",
        requiredItems: [{ name: "Beef", quantity: 1 }, { name: "Beef", quantity: 1 }],
      };
      const resp1 = await putTask2(meatball);
      expect(resp1.status).toBe(400);
    });

    it("Congratulations u burnt the pan pt2 (cooktime)", async () => {
      const resp = await putTask2({
        type: "ingredient",
        name: "beef",
        cookTime: -1,
      });
      expect(resp.status).toBe(400);
    });

    it("Congratulations u burnt the pan pt3 (type)", async () => {
      const resp = await putTask2({
        type: "pan",
        name: "pan",
        cookTime: 20,
      });
      expect(resp.status).toBe(400);
    });

    it("Unique names error", async () => {
      const resp = await putTask2({
        type: "ingredient",
        name: "Beef",
        cookTime: 10,
      });
      expect(resp.status).toBe(200);

      const resp2 = await putTask2({
        type: "ingredient",
        name: "Beef",
        cookTime: 8,
      });
      expect(resp2.status).toBe(400);

      const resp3 = await putTask2({
        type: "recipe",
        name: "Beef",
        cookTime: 8,
      });
      expect(resp3.status).toBe(400);
    });
  });
});

describe("Task 3", () => {
  describe("GET /summary", () => {
    const postEntry = async (data) => {
      return await request("http://localhost:8080").post("/entry").send(data);
    };

    const getTask3 = async (name) => {
      return await request("http://localhost:8080").get(
        `/summary?name=${name}`
      );
    };

    it("What is bro doing - Get empty cookbook", async () => {
      const resp = await getTask3("nothing");
      expect(resp.status).toBe(400);
    });

    it("What is bro doing - Get ingredient", async () => {
      const resp = await postEntry({
        type: "ingredient",
        name: "beef",
        cookTime: 2,
      });
      expect(resp.status).toBe(200);

      const resp2 = await getTask3("beef");
      expect(resp2.status).toBe(400);
    });

    it("exists reciple but wrong one", async () => {
      const cheese = {
        type: "recipe",
        name: "Cheese",
        requiredItems: [{ name: "Not Real", quantity: 1 }],
      };
      const resp1 = await postEntry(cheese);
      expect(resp1.status).toBe(200);

      const resp2 = await getTask3("Banana");
      expect(resp2.status).toBe(400);
    });

    it("Unknown missing item", async () => {
      const cheese = {
        type: "recipe",
        name: "Cheese",
        requiredItems: [{ name: "Not Real", quantity: 1 }],
      };
      const resp1 = await postEntry(cheese);
      expect(resp1.status).toBe(200);

      const resp2 = await getTask3("Cheese");
      expect(resp2.status).toBe(400);
    });

    it("Bro cooked", async () => {
      const meatball = {
        type: "recipe",
        name: "Skibidi",
        requiredItems: [{ name: "Bruh", quantity: 1 }],
      };
      const resp1 = await postEntry(meatball);
      expect(resp1.status).toBe(200);

      const resp2 = await postEntry({
        type: "ingredient",
        name: "Bruh",
        cookTime: 2,
      });
      expect(resp2.status).toBe(200);

      const resp3 = await getTask3("Skibidi");
      expect(resp3.status).toBe(200);
      expect(resp3.body).toStrictEqual({
        "name": "Skibidi",
        "cookTime": 2,
        "ingredients": [
          {
            "name": "Bruh",
            "quantity": 1
          }
        ]
      });
    });

    it("Multiplication", async () => {
      const item1 = {
        type: "recipe",
        name: "One",
        requiredItems: [{ name: "Two", quantity: 2 }, { name: "Four", quantity: 3 }],
      };
      const resp1 = await postEntry(item1);
      expect(resp1.status).toBe(200);

      const item2 = {
        type: "recipe",
        name: "Two",
        requiredItems: [{ name: "Three", quantity: 3 }, { name: "Four", quantity: 2 }],
      };
      const resp2 = await postEntry(item2);
      expect(resp2.status).toBe(200);

      const resp4 = await postEntry({
        type: "ingredient",
        name: "Three",
        cookTime: 2,
      });
      expect(resp4.status).toBe(200);

      const resp5 = await postEntry({
        type: "ingredient",
        name: "Four",
        cookTime: 1,
      });
      expect(resp5.status).toBe(200);

      const respFin = await getTask3("One");
      expect(respFin.status).toBe(200);
      expect(respFin.body).toStrictEqual({
        "name": "One",
        "cookTime": 19,
        "ingredients": [
          {
            "name": "Four",
            "quantity": 7
          }, 
          {
            "name": "Three", 
            "quantity": 6
          }
        ]
      });
      
    });

    it("Recursive", async () => {
      const item1 = {
        type: "recipe",
        name: "One",
        requiredItems: [{ name: "Two", quantity: 1 }],
      };
      const resp1 = await postEntry(item1);
      expect(resp1.status).toBe(200);

      const item2 = {
        type: "recipe",
        name: "Two",
        requiredItems: [{ name: "Three", quantity: 1 }],
      };
      const resp2 = await postEntry(item2);
      expect(resp2.status).toBe(200);

      const item3 = {
        type: "recipe",
        name: "Three",
        requiredItems: [{ name: "Four", quantity: 1 }, { name: "Five", quantity: 2 }],
      };
      const resp3 = await postEntry(item1);
      expect(resp3.status).toBe(200);

      const resp4 = await postEntry({
        type: "ingredient",
        name: "Four",
        cookTime: 2,
      });
      expect(resp4.status).toBe(200);

      const resp5 = await postEntry({
        type: "ingredient",
        name: "Five",
        cookTime: 1,
      });
      expect(resp5.status).toBe(200);

      const respFin = await getTask3("One");
      expect(respFin.status).toBe(200);
      expect(respFin.body).toStrictEqual({
        "name": "One",
        "cookTime": 4,
        "ingredients": [
          {
            "name": "Four",
            "quantity": 1
          }, 
          {
            "name": "Five", 
            "quantity": 2
          }
        ]
      });

      
    });

    
  });
});
