const { generateSlug } = require("../../utils/slugify");
const BlogModel = require("./blog.model");

const create = (payload) => {
  payload.slug = generateSlug(payload.title);
  return BlogModel.create(payload);
};

const list = async (search, page = 1, limit = 10) => {
  // search, pagination
  const query = [];
  // lookup
  query.push(
    {
      $lookup: {
        from: "users",
        localField: "author",
        foreignField: "_id",
        as: "result",
      },
    },
    {
      $unwind: {
        path: "$result",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $project: {
        title: 1,
        _id: 0,
        slug: 1,
        content: 1,
        tags: 1,
        words: 1,
        status: 1,
        author: "$result.name",
      },
    }
  );
  // search
  if (search?.author) {
    query.push({
      $match: {
        author: new RegExp(search.author, "gi"),
      },
    });
  }
  if (search?.title) {
    query.push({
      $match: {
        title: new RegExp(search.title, "gi"),
      },
    });
  }
  // pagination
  query.push(
    {
      $facet: {
        metadata: [
          {
            $count: "total",
          },
        ],
        data: [
          {
            $skip: (+page - 1) * +limit,
          },
          {
            $limit: +limit,
          },
        ],
      },
    },
    {
      $addFields: {
        total: {
          $arrayElemAt: ["$metadata.total", 0],
        },
      },
    },
    {
      $project: {
        metadata: 0,
      },
    }
  );
  const result = await BlogModel.aggregate(query);
  return {
    data: result[0].data,
    total: result[0].total || 0,
    page: +page,
    limit: +limit,
  };
};

const getPublishedBlogOnly = async (author, page = 1, limit = 10) => {
  const query = [];
  // unwind the author name from objectId
  query.push(
    {
      $lookup: {
        from: "users",
        localField: "author",
        foreignField: "_id",
        as: "author",
      },
    },
    {
      $unwind: {
        path: "$author",
        preserveNullAndEmptyArrays: false,
      },
    },
    {
      $project: {
        author: "$author.name",
        title: 1,
        tags: 1,
        slug: 1,
        status: 1,
        content: 1,
        words: 1,
      },
    }
  );
  // if author name is passed, search that author blogs
  if (author) {
    query.push({
      $match: {
        author: new RegExp(author, "gi"),
      },
    });
  }
  // ensure blogs are published
  query.push({
    $match: {
      status: "published",
    },
  });
  // pagination
  query.push(
    {
      $facet: {
        metadata: [
          {
            $count: "total",
          },
        ],
        data: [
          {
            $skip: (+page - 1) * +limit,
          },
          {
            $limit: +limit,
          },
        ],
      },
    },
    {
      $addFields: {
        total: {
          $arrayElemAt: ["$metadata.total", 0],
        },
      },
    },
    {
      $project: {
        metadata: 0,
      },
    }
  );
  const result = await BlogModel.aggregate(query);
  return {
    data: result[0].data,
    total: result[0].total || 0,
    page: +page,
    limit: +limit,
  };
};

const getById = (_id) => {
  return BlogModel.findOne({ _id });
};

const getBySlug = (slug) => {
  return BlogModel.findOne({ slug });
};

const updateById = (_id, payload) => {
  delete payload.slug;
  if (payload.title) payload.slug = generateSlug(payload.title);
  return BlogModel.updateOne({ _id }, payload);
};

const deleteById = (_id) => {
  return BlogModel.deleteOne({ _id });
};

const getAuthorBlogs = async (name, page = 1, limit = 10) => {
  const query = [];
  query.push(
    {
      $lookup: {
        from: "users",
        localField: "author",
        foreignField: "_id",
        as: "author",
      },
    },
    {
      $unwind: {
        path: "$author",
        preserveNullAndEmptyArrays: false,
      },
    },
    {
      $project: {
        author: "$author.name",
        title: 1,
        tags: 1,
        slug: 1,
        status: 1,
        content: 1,
        words: 1,
      },
    }
  );
  if (name) {
    query.push({
      $match: {
        author: new RegExp(name, "gi"),
      },
    });
  }
  query.push(
    {
      $facet: {
        metadata: [
          {
            $count: "total",
          },
        ],
        data: [
          {
            $skip: (+page - 1) * +limit,
          },
          {
            $limit: +limit,
          },
        ],
      },
    },
    {
      $addFields: {
        total: {
          $arrayElemAt: ["$metadata.total", 0],
        },
      },
    },
    {
      $project: {
        metadata: 0,
      },
    }
  );
  const result = await BlogModel.aggregate(query);
  return {
    data: result[0].data,
    total: result[0].total || 0,
    page: +page,
    limit: +limit,
  };
};

const updateStatus = async (_id) => {
  const blog = await BlogModel.findOne({ _id });
  if (!blog) throw new Error("Blog not found");
  const payload = { status: blog?.status === "draft" ? "published" : "draft" };
  return BlogModel.updateOne({ _id }, payload);
};

module.exports = {
  create,
  list,
  getById,
  updateById,
  deleteById,
  getPublishedBlogOnly,
  updateStatus,
  getAuthorBlogs,
  getBySlug,
};
