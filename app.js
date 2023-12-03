const express = require("express");
const app = express();
app.use(express.json());
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");
const dbPath = path.join(__dirname, "cricketTeam.db");
const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: "cricketTeam.db",
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server is running at http://localhost:3000/todos/");
    });
  } catch (e) {
    console.log(`DB Error is ${e.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();

const getCamelCase = (obj) => {
  return {
    id: obj.id,
    todo: obj.todo,
    priority: obj.priority,
    status: obj.status,
  };
};

const hasPriorityAndStatus = (requestQuery) => {
  return (
    requestQuery.priority !== undefined && requestQuery.status !== undefined
  );
};
const hasPriority = (requestQuery) => {
  return requestQuery.priority !== undefined;
};

const hasStatus = (requestQuery) => {
  return requestQuery.status !== undefined;
};

app.get("/todos/", async (request, response) => {
  const { search_q = "", priority, status } = request.query;
  let getQuery = "";
  let data = null;
  switch (true) {
    case hasPriorityAndStatus(request.query):
      getQuery = `
            SELECT * 
            FROM todo
            WHERE 
                todo LIKE '%${search_q}%'
                AND status = '${status}'
                AND priority = '${priority}';
            `;
      break;
    case hasPriority(request.query):
      getQuery = `
            SELECT *
            FROM todo
            WHERE 
                todo LIKE '%${search_q}%'
                AND priority = '${priority}';
            `;
      break;
    case hasStatus(request.query):
      getQuery = `
            SELECT *
            FROM todo
            WHERE 
                todo LIKE '%${search_q}'
                AND status = '${status}';
            `;
      break;
    default:
      getQuery = `
            SELECT *
            FROM todo
            WHERE 
                todo LIKE '%${search_q}';
            `;
  }
  data = await db.all(getQuery);
  response.send(data);
});

app.get("/todos/:todoId/", async (request, response) => {
  const { id } = request.params;
  const getOneQuery = `
    SELECT * 
    FROM 
        todo
    WHERE 
        id = ${id};
    `;
  const dataResult = await db.get(getOneQuery);
  response.send(dataResult);
});

app.post("/todos/", async (request, response) => {
  const { id, todo, priority, status } = request.body;
  const insertTodo = `
        INSERT INTO todo (id, todo, priority, status)
        VALUES (${id},'${todo}','${priority}','${status}');`;
  await db.run(insertTodo);
  response.send("Todo Successfully Added");
});

app.put("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const updateVar = "";
  const todoDetails = request.body;
  switch (true) {
    case todoDetails.status !== undefined:
      updateVar = "Status";
      break;
    case todoDetails.priority !== undefined:
      updateVar = "Priority";
      break;
    case todoDetails.todo !== undefined:
      updateVar = "Todo";
      break;
  }
  const { status, priority, todo } = todoDetails;
  const putQuery = `
    UPDATE todo
    SET
        status = '${status}',
        priority = '${priority},
        todo = '${todo}';
    `;
  await db.run(putQuery);
  response.send(Update);
});

app.delete("/todos/:todoId/", async (request, response) => {
  const { id } = request.params;
  const deleteQuery = `DELETE FROM todo
    WHERE id = ${todoId}`;
  await db.run(deleteQuery);
  response.send("Todo Deleted");
});
module.exports = app;
