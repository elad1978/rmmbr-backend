const express = require("express");
const app = express();
const port = 3000;
const cors = require("cors");
app.use(express.json());
app.use(cors());
const multer = require("multer");
const path = require("path");
const { memoryWall } = require("./DB");
const { users } = require("./DB");
const jwt = require("jsonwebtoken");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    console.log("imageDetails", file);
    cb(null, "uploads/"); // Files will be saved in the 'uploads' directory
  },
  filename: (req, file, cb) => {
    //console.log(file);
    cb(null, file.originalname); // Use the original filenames
  },
});

const upload = multer({ storage: storage });

app.use(express.static(path.join(__dirname, "uploads")));

app.get("/uploads/:imageName", (req, res) => {
  const { imageName } = req.params;
  res.sendFile(path.join(__dirname, "uploads", imageName));
});

//                                                                                                       //memoryWall
//get memoryWall
app.get("/api/memoryWall", (req, res) => {
  res.json(memoryWall);
});

//get memoryWll by id
app.get("/api/memoryWall/:id", (req, res) => {
  const oneMemoryWall = memoryWall.find((m) => m.id === req.params.id);
  res.json(oneMemoryWall);
});

//post memoryWall
app.post("/api/memoryWall", (req, res) => {
  memoryWall.push(req.body);
  res.json(memoryWall);
});

//                                                                                                          //users
// get users
app.get("/api/users", (req, res) => {
  res.json(users);
});

//login
// app.post("/api/login/", (req, res) => {
//   const { email, password } = req.body;
//   let user = users.find((u) => u.email === email);
//   if (!user) {
//     res.status(400).send("email or password are missing");
//     return;
//   }

//   if (user.password != password) {
//     res.status(404).send("Email or password is incorrect");
//     return;
//   }

//   let token = jwt.sign({ email: user.email, role: user.role }, "tatatatatata");
//   res.json({ token: token, user: user, expiresIn: 86400 });
// });

app.post("/api/login/", (req, res) => {
  const { email, password } = req.body;
  let user = users.find((u) => u.email === email);
  if (!user) {
    res.status(400).send("email or password are missing");
    return;
  }

  if (user.password != password) {
    res.status(404).send("Email or password is incorrect");
    return;
  }

  let token = jwt.sign({ email: user.email, role: user.role }, "tatatatatata");
  let theUser = user;
  if (user.imgPath == null) {
    theUser.imgPath = "http://localhost:3000/uploads/avatar.jpg";
  }
  res.json({ token: token, user: theUser, expiresIn: 86400 });
});

//                                                                                                       //.highlightsNews
//get highlightsNews
app.get("/api/getMemoryWallById/:id/highlightsNews", (req, res) => {
  const memoryWallData = memoryWall.find((m) => m.id === req.params.id);
  res.json(memoryWallData.highlightsNews);
});

//post highlightsNews
app.post(
  "/api/getMemoryWallById/:id/highlightsNews",
  upload.single("img"),
  (req, res) => {
    console.log(req.body);
    console.log(req.file);
    try {
      const memoryWallData = memoryWall.find((m) => m.id === req.params.id);

      if (!memoryWallData) {
        return res.status(404).json({ message: "Memory wall not found" });
      }

      const title = req.body.title;
      const date = req.body.date;
      const text = req.body.text;
      const img = req.file
        ? `http://localhost:3000/uploads/${req.file.filename}`
        : null;

      // Validate request data
      if (!title || !date) {
        return res
          .status(400)
          .json({ message: "name and donation amount are necessary" });
      }

      const highlightId = memoryWallData.highlightsNews.length + 1;
      const newHighlight = {
        id: highlightId,
        title: title,
        text: text,
        date: date,
        img: img,
      };

      memoryWallData.highlightsNews.push(newHighlight);
      res.json(newHighlight);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
);

//                                                                                                    //.deceasedsInfo
//get deceasedsInfo
app.get("/api/getMemoryWallById/:id/deceasedsInfo", (req, res) => {
  const memoryWallData = memoryWall.find((m) => m.id === req.params.id);
  res.json(memoryWallData.deceasedsInfo);
});

//delete one card from deceasedsInfo
app.delete(
  "/api/getMemoryWallById/:id/deceasedsInfo/:deceasedId",
  (req, res) => {
    const memoryWallData = memoryWall.find((m) => m.id === req.params.id);
    if (!memoryWallData) {
      return res.status(404).json({ error: "Memory wall not found" });
    }
    const deceasedInfoIndex = memoryWallData.deceasedsInfo.findIndex(
      (d) => d.id === parseInt(req.params.deceasedId)
    );
    if (deceasedInfoIndex === -1) {
      return res.status(404).json({ error: "Deceased info not found" });
    }
    // memoryWallData.deceasedsInfo.splice(deceasedInfoIndex, 1);
    memoryWallData.deceasedsInfo = memoryWallData.deceasedsInfo.filter(
      (d) => d.id != req.params.deceasedId
    );
    res.json(memoryWallData.deceasedsInfo);
  }
);

//POST route to handle form data and file upload for creating new card
app.post(
  "/api/getMemoryWallById/:id/deceasedsInfo",
  upload.single("imgPath"),
  (req, res) => {
    console.log(req.body);
    console.log(req.file);
    try {
      const memoryWallData = memoryWall.find((m) => m.id === req.params.id);

      if (!memoryWallData) {
        return res.status(404).json({ message: "Memory wall not found" });
      }

      const name = req.body.name;
      const donationAmount = req.body.donationAmount;
      // let imgPath = req.file ? req.file.path : null;
      let imgPath = req.file
        ? `http://localhost:3000/uploads/${req.file.filename}`
        : null;
      console.log("name", name);

      // Validate request data
      if (!name || !donationAmount) {
        return res
          .status(400)
          .json({ message: "name and donation amount are necessary" });
      }
      if (!imgPath) {
        imgPath = "uploads\\pen 6.png";
      }

      const memoryWallId = memoryWallData.deceasedsInfo.length + 1;
      const newDeceased = {
        id: memoryWallId,
        name: name,
        donationAmount: donationAmount,
        imgPath: imgPath,
      };

      memoryWallData.deceasedsInfo.push(newDeceased);
      res.json({
        message: "Data added successfully",
        newDeceased: newDeceased,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
);

//put deceasedsInfo
app.put(
  "/api/getMemoryWallById/:id/deceasedsInfo/:deceasedId",
  upload.single("imgPath"),
  (req, res) => {
    const name = req.body.name;
    let donationAmount = req.body.donationAmount;
    let imgPath = req.file
      ? `http://localhost:3000/uploads/${req.file.filename}`
      : null;
    const memoryWallId = req.params.id;
    const deceasedId = parseInt(req.params.deceasedId);

    // Find the memory wall
    const memoryWallData = memoryWall.find((m) => m.id === memoryWallId);
    if (!memoryWallData) {
      return res.status(404).json({ error: "Memory wall not found" });
    }

    // Find the deceased person
    const deceasedInfoIndex = memoryWallData.deceasedsInfo.findIndex(
      (d) => d.id === deceasedId
    );
    if (deceasedInfoIndex === -1) {
      return res.status(404).json({ error: "Deceased person not found" });
    }

    // Validate and update the deceased person's information
    if (name && typeof name === "string") {
      memoryWallData.deceasedsInfo[deceasedInfoIndex].name = name;
    }

    if (imgPath) {
      memoryWallData.deceasedsInfo[deceasedInfoIndex].imgPath = imgPath;
    }
    donationAmount = parseInt(donationAmount);
    if (donationAmount && typeof donationAmount === "number") {
      memoryWallData.deceasedsInfo[deceasedInfoIndex].donationAmount =
        donationAmount;
    }

    // Handle potential errors during the update operation
    try {
      // Save the updated memory wall data (assuming you have a save/update function)
      // saveMemoryWallData(memoryWallData);
      res.json(memoryWallData.deceasedsInfo[deceasedInfoIndex]);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

//                                                                                                             //.sliderUpdates
//get sliderUpdates
app.get("/api/getMemoryWallById/:id/sliderUpdates", (req, res) => {
  const memoryWallData = memoryWall.find((m) => m.id === req.params.id);
  res.json(memoryWallData.sliderUpdates);
});

//get user by id
app.get("/api/users/:id", (req, res) => {
  const oneUser = users.find((u) => u.id === req.params.id);
  res.json(oneUser);
});

//                                                                                                                 //.title
//get title
app.get("/api/getMemoryWallById/:id/title", (req, res) => {
  const memoryWallData = memoryWall.find((m) => m.id === req.params.id);
  res.json(memoryWallData.title);
});

//put title

app.put("/api/getMemoryWallById/:id/title", (req, res) => {
  const memoryWallData = memoryWall.find((m) => m.id === req.params.id);
  memoryWallData.title = req.body.title;
  console.log(memoryWallData.title);
  res.json(memoryWallData.title);
});

//                                                                                                                      //.about
//put about
app.put("/api/getMemoryWallById/:id/about", (req, res) => {
  const memoryWallData = memoryWall.find((m) => m.id === req.params.id);
  memoryWallData.about = req.body.aboutText;
  res.json(memoryWallData.about);
});

//delete about
app.delete("/api/getMemoryWallById/:id/about", (req, res) => {
  const memoryWallData = memoryWall.find((m) => m.id === req.params.id);
  memoryWallData.about = "";
  res.json(memoryWallData.about);
});

// start server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
