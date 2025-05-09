const checkrole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      res.status(403);
      throw new Error(
        "Forbidden, You are not allowed to do the specified task",
      );
    }

    next();
  };
};

module.exports = checkrole;
