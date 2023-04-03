const express = require("express");
const app = express();

const PORT = 8000;

app.set("view engine", "pug");
app.use("/static", express.static("assets"));
app.use(express.urlencoded({ extended: false }));

const fs = require("fs");

//get note function
app.get("/", (req, res) => {
  fs.readFile("./data/notes.json", (err, data) => {
    if (err) throw err;

    const notes = JSON.parse(data);
    const unarchivednotes = notes.filter((note) => note.archived == false);
    res.render("home", { notes: unarchivednotes });
  });
});

//create note function

app.post("/add", (req, res) => {
  const formData = req.body;
  if (
    formData.email == "" ||
    formData.name == "" ||
    formData.description == ""
  ) {
    fs.readFile("./data/notes.json", (err, data) => {
      if (err) throw err;

      const notes = JSON.parse(data);
      const unarchivednotes = notes.filter(
        (note) => note.archived == false
      );
      res.render("home", { notes: unarchivednotes });
    });
  } else {
    fs.readFile("./data/notes.json", (err, data) => {
      if (err) throw err;

      const notes = JSON.parse(data);

      const note = {
        id: create_id(),
        archived: false,
        email: formData.email,
        name: formData.name,
        description: formData.description,
      };

      notes.push(note);

      fs.writeFile("./data/notes.json", JSON.stringify(notes), (err) => {
        if (err) throw err;

        fs.readFile("./data/notes.json", (err, data) => {
          if (err) throw err;

          const notes = JSON.parse(data);
          const unarchivednotes = notes.filter(
            (note) => note.archived == false
          );
          res.render("home", { notes: unarchivednotes, success: true });
        });
      });
    });
  }
});

app.get("/create", (req, res) => {
  res.render("create");
});

//delete note function

app.get("/:id/delete", (req, res) => {
  const id = req.params.id;

  fs.readFile("./data/notes.json", (err, data) => {
    if (err) throw err;

    const notes = JSON.parse(data);
    const filterednotes = notes.filter((note) => note.id != id);

    fs.writeFile(
      "./data/notes.json",
      JSON.stringify(filterednotes),
      (err) => {
        if (err) throw err;

        res.redirect('/')        
      }
    );
  });
});

//update

app.get("/:id/update", (req, res) => {
  const id = req.params.id;

  fs.readFile("./data/notes.json", (err, data) => {
    if (err) throw err;

    const notes = JSON.parse(data);

    const filterednotes = notes.filter((note) => note.id == id);
    res.render("update", { edit: true, notes: filterednotes });
  });
});

//update function not working properly
app.post("/update", (req, res) => {
  const formData = req.body;
  const ID = req.params.id;
  fs.readFile("./data/notes.json", (err, data) => {
    if (err) throw err;

    const notes = JSON.parse(data);
    const note = notes.find((note) => (note.id = ID));
    const noteIdx = notes.indexOf(note);
    const splicednote = notes.splice(noteIdx, 1)[0];

    splicednote.id = ID;
    splicednote.name = formData.name;
    splicednote.archived = false;
    splicednote.description = formData.description;

    notes.push(splicednote);

    fs.writeFile("./data/notes.json", JSON.stringify(notes), (err) => {
      if (err) throw err;
      res.redirect('/')
    });
  });
});

//render archived page
app.get("/archived", (req, res) => {
  fs.readFile("./data/notes.json", (err, data) => {
    if (err) throw err;

    const notes = JSON.parse(data);

    const archivednotes = notes.filter((note) => note.archived == true);
    res.render("archived", { notes: archivednotes });
  });
});

app.get("/:id/archive", (req, res) => {
  const id = req.params.id;

  fs.readFile("./data/notes.json", (error, data) => {
    if (error) throw error;

    const notes = JSON.parse(data);
    const note = notes.find((note) => note.id == id);

    let idx = notes.indexOf(note);

    notes[idx].archived = true;

    fs.writeFile("./data/notes.json", JSON.stringify(notes), (error) => {
      if (error) throw error;
      res.redirect("/archived");
    });
  });
});

app.get("/:id/unarchive", (req, res) => {
  const id = req.params.id;

  fs.readFile("./data/notes.json", (error, data) => {
    if (error) throw error;

    const notes = JSON.parse(data);
    const note = notes.find((note) => note.id == id);

    let idx = notes.indexOf(note);

    notes[idx].archived = false;

    fs.writeFile("./data/notes.json", JSON.stringify(notes), (error) => {
      if (error) throw error;
      res.redirect("/archived");
    });
  });
});

// shows details

app.get("/:id", (req, res) => {
  const id = req.params.id;

  fs.readFile("./data/notes.json", (err, data) => {
    if (err) throw err;

    const notes = JSON.parse(data);

    const filterednotes = notes.filter((note) => note.id == id);
    res.render("details", { notes: filterednotes });
  });
});

//random id function
function create_id() {
  return "_" + Math.random().toString(36).substr(2, 9);
}

app.listen(PORT, (err) => {
  if (err) throw err;
  console.log(`This app is running on port ${PORT}`);
});
