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

//                                                                            //memoryWall
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

//                                                                               //users
// get users
app.get("/api/users", (req, res) => {
  res.json(users);
});

//                                                                            //.highlightsNews
//get highlightsNews
app.get("/api/getMemoryWallById/:id/highlightsNews", (req, res) => {
  const memoryWallData = memoryWall.find((m) => m.id === req.params.id);
  res.json(memoryWallData.highlightsNews);
});

//post highlightsNews
app.post("/api/getMemoryWallById/:id/highlightsNews", (req, res) => {
  const newHighlight = req.body;
  const memoryWallData = memoryWall.find((m) => m.id === req.params.id);
  memoryWallData.highlightsNews.push(newHighlight);
  res.json(memoryWallData.highlightsNews);
});

//                                                                            //.deceasedsInfo
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

app.put("/api/getMemoryWallById/:id/deceasedsInfo/:deceasedId", (req, res) => {
  const { name, donationAmount, imgPath } = req.body;
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

  if (imgPath && typeof imgPath === "string") {
    memoryWallData.deceasedsInfo[deceasedInfoIndex].imgPath = imgPath;
  }

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
});

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    console.log("sss", file);
    cb(null, "uploads/"); // Files will be saved in the 'uploads' directory
  },
  filename: (req, file, cb) => {
    //console.log(file);
    cb(null, file.originalname); // Use the original filename
  },
});

const upload = multer({ storage: storage });

// Set up Multer storage and file filtering
// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     cb(null, "uploads/"); // Files will be saved in the 'uploads' directory
//   },
//   filename: (req, file, cb) => {
//     cb(
//       null,
//       file.fieldname + "-" + Date.now() + path.extname(file.originalname)
//     ); // Use a unique filename
//   },
// });

// const upload = multer({
//   storage: storage,
//   // limits: {
//   //   fileSize: 1024 * 1024 * 5, // 5 MB file size limit (adjust as needed)
//   // },
//   fileFilter: (req, file, cb) => {
//     const allowedFileTypes = /jpeg|jpg|png/; // Allowed file types (JPEG, JPG, PNG)
//     const extname = allowedFileTypes.test(
//       path.extname(file.originalname).toLowerCase()
//     );
//     const mimetype = allowedFileTypes.test(file.mimetype);
//     if (extname && mimetype) {
//       cb(null, true); // Accept the file
//     } else {
//       cb(new Error("Only JPEG, JPG, and PNG files are allowed."), false); // Reject the file
//     }
//   },
// });

// //post deceasedsInfo - with no file input
// app.post("/api/getMemoryWallById/:id/deceasedsInfo", (req, res) => {
//   const memoryWallData = memoryWall.find((m) => m.id === req.params.id);
//   const newDeceased = req.body;
//   newDeceased.id = memoryWallData.deceasedsInfo.length + 1;
//   memoryWallData.deceasedsInfo.push(newDeceased);
//   res.json(memoryWallData.deceasedsInfo);
// });

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
      let imgPath = req.file ? req.file.path : null;
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

      // Handle the file upload and form data for creating new records
      // Your database insertion logic here...
      // Example: YourDatabaseModel.create(newDeceased);

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

// app.post(
//   "/api/getMemoryWallById/:id/deceasedsInfo",
//   upload.single("imgPath"),
//   (req, res) => {
//     console.log(req); // Check if req.body contains the expected data
//     //console.log("req.body.name", req.body.name);
//     console.log(req.file);

//     const newId = memoryWallData.deceasedsInfo.length + 1;
//     const name = req.body.name;
//     const donationAmount = req.body.donationAmount;
//     // const imgPath = req.file ? req.file.path : "default-image-path.png";
//     const imgPath = req.file.path;
//     console.log(req.file.path);

//     // Validate name and donationAmount
//     if (!name || !donationAmount) {
//       return res
//         .status(400)
//         .json({ message: "name and donation amount are necessary" });
//     }

//     // Handle the data and file as needed (e.g., store in a database)
//     // ...

//     res.json({
//       message: "Data added successfully",
//       newDeceased: { name, donationAmount, imgPath },
//     });
//   }
// );

//                                                                            //.sliderUpdates
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

//                                                                                  //.title
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

//                                                                            //.about
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
