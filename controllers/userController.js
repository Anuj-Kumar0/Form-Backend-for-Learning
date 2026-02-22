const usersStorage = require("../storages/usersStorage");

// This just shows the new stuff we're adding to the existing contents
const { body, validationResult, matchedData } = require("express-validator");

const alphaErr = "must only contain letters.";
const lengthErr = "must be between 1 and 10 characters.";

const validateUser = [
  body("firstName").trim()
    .isAlpha().withMessage(`First name ${alphaErr}`)
    .isLength({ min: 1, max: 10 }).withMessage(`First name ${lengthErr}`),
  body("lastName").trim()
    .isAlpha().withMessage(`Last name ${alphaErr}`)
    .isLength({ min: 1, max: 10 }).withMessage(`Last name ${lengthErr}`),
    body("email")
    .trim()
    .isEmail().withMessage("Must provide a valid email address.")
    .normalizeEmail(),

  body("age")
    .optional({ checkFalsy: true }) 
    .isInt({ min: 0, max: 120 })
    .withMessage("Age must be a number between 0 and 120."),

  body("bio")
    .optional({ checkFalsy: true })
    .isLength({ max: 200 })
    .withMessage("Bio must be less than 200 characters.")
    .trim()
];

exports.usersListGet = (req, res) => {
  res.render("index", {
    title: "User list",
    users: usersStorage.getUsers(),
  });
};

exports.usersCreateGet = (req, res) => {
  res.render("createUser", {
    title: "Create user",
  });
};

// We can pass an entire array of middleware validations to our controller.
exports.usersCreatePost = [
    validateUser,
    (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).render("createUser", {
          title: "Create user",
          errors: errors.array(),
        });
      }
      const { firstName, lastName, email, age, bio } = matchedData(req);
      usersStorage.addUser({ firstName, lastName, email, age, bio });
      res.redirect("/");
    }
  ];

  exports.usersUpdateGet = (req, res) => {
    const user = usersStorage.getUser(req.params.id);
    res.render("updateUser", {
      title: "Update user",
      user: user,
    });
  };
  
  exports.usersUpdatePost = [
    validateUser,
    (req, res) => {
      const user = usersStorage.getUser(req.params.id);
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).render("updateUser", {
          title: "Update user",
          user: user,
          errors: errors.array(),
        });
      }
      const { firstName, lastName, email, age, bio } = matchedData(req);
      usersStorage.updateUser(req.params.id, { firstName, lastName, email, age, bio });
      res.redirect("/");
    }
  ];
  
  // Tell the server to delete a matching user, if any. Otherwise, respond with an error.
exports.usersDeletePost = (req, res) => {
    usersStorage.deleteUser(req.params.id);
    res.redirect("/");
  };
  
  exports.usersSearchGet = (req, res) => {
    const { firstName, email, bio } = req.query;

    let users = [];

    if (firstName || email) {
        users = usersStorage.getUsers();

        if (firstName) {
            users = users.filter(user =>
                user.firstName.toLowerCase().includes(firstName.toLowerCase())
            );
        }

        if (email) {
            users = users.filter(user =>
                user.email.toLowerCase().includes(email.toLowerCase())
            );
        }
    }

    res.render("search", {
        title: "Search Results",
        users,
    });
};