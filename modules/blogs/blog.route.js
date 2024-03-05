const multer = require("multer");
const router = require("express").Router();
const BlogController = require("./blog.controller");
const { checkRole } = require("../../utils/sessionManager");
const { validate } = require("./blog.validator");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./public/images/blogs"); // make sure the new folders are in the public folder
  },
  filename: function (req, file, cb) {
    cb(
      null,
      file.fieldname + "-" + Date.now() + "." + file.originalname.split(".")[1]
    );
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: Number(process.env.MAX_FILE_SIZE) },
});

router.get("/", checkRole(["admin"]), async (req, res, next) => {
  try {
    const { author, title, page, limit } = req.query;
    const search = { author, title };
    const result = await BlogController.list(search, page, limit);
    res.json({ data: result });
  } catch (e) {
    next(e);
  }
});

router.get("/publishedOnly", async (req, res, next) => {
  try {
    // Database Call
    const { author, page, limit } = req.query;
    const result = await BlogController.getPublishedBlogOnly(
      author,
      page,
      limit
    );
    res.json({ data: result });
  } catch (e) {
    next(e);
  }
});

router.get("/authors", async (req, res, next) => {
  try {
    const { author, page, limit } = req.query;
    if (!author) throw new Error("Author missing");
    const result = await BlogController.getAuthorBlogs(author, page, limit);
    res.json({ data: result });
  } catch (e) {
    next(e);
  }
});

router.get("/:id", checkRole(["admin", "user"]), async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await BlogController.getById(id);
    res.json({ data: result });
  } catch (e) {
    next(e);
  }
});

router.get("/slug/:slug", async (req, res, next) => {
  try {
    const { slug } = req.params;
    if (!slug) throw new Error("slug is missing");
    const result = await BlogController.getBySlug(slug);
    res.json({ data: result });
  } catch (e) {
    next(e);
  }
});

router.post(
  "/",
  upload.single("image"),
  checkRole(["admin", "user"]),
  validate,
  async (req, res, next) => {
    try {
      const data = req.body;
      if (req.file) {
        const { path } = req.file;
        data.image = path.replace("public", "");
      }
      const result = await BlogController.create(data);
      res.json({ data: result });
    } catch (e) {
      next(e);
    }
  }
);

router.put(
  "/:id",
  checkRole(["admin", "user"]),
  validate,
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const data = req.body;
      // Database Call
      const result = await BlogController.updateById(id, data);
      res.json({ data: result });
    } catch (e) {
      next(e);
    }
  }
);

router.patch(
  "/status/:id",
  checkRole(["admin", "user"]),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      // Database Call
      const result = await BlogController.updateStatus(id);
      res.json({ data: result });
    } catch (e) {
      next(e);
    }
  }
);

router.patch(
  "/:id",
  checkRole(["admin", "user"]),
  validate,
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const data = req.body;
      // Database Call
      const result = await BlogController.updateById(id, data);
      res.json({ data: result });
    } catch (e) {
      next(e);
    }
  }
);

router.delete("/:id", checkRole(["admin"]), async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await BlogController.deleteById(id);
    res.json({ data: result });
  } catch (e) {
    next(e);
  }
});

module.exports = router;
