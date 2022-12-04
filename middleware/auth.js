import jwt from "jsonwebtoken";

const auth = async (req, res, next) => {
  try {
    const token = req.headers.authorization.split(" ")[1];
    if (!token) return res.status(403).send("Access denied.");

    const isCustomAuth = token.length < 500;

    let decodedData;

    if (isCustomAuth) {
      decodedData = jwt.verify(token, process.env.SECRET);
      req.userId = decodedData?.id;
      req.username = decodedData?.name;
    } else {
      decodedData = jwt.decode(token);
      req.userId = decodedData?.email;
      req.username = decodedData?.name;
    }

    next();
  } catch (error) {
    res.status(400).send("Invalid token.");
  }
};

export default auth;
