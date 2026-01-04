import jwt from "jsonwebtoken";


export const auth = (req, res, next) => {
  const header = req.headers.authorization;
  if (!header) return res.sendStatus(401);

  const token = header.split(" ")[1];
  if (!token) return res.sendStatus(401);

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    res.sendStatus(403);
  }
};

export const adminOnly = (req, res, next) => {
  if (req.user.role !== "ADMIN") return res.sendStatus(403);
  next();
};
