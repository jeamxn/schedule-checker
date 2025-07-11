import Elysia from "elysia";

import createRoomRouter from "./createRoom";
import getRoomRouter from "./getRoom";

const IndexRouter = new Elysia({
  name: "Index",
  prefix: "",
})
  .use(createRoomRouter)
  .use(getRoomRouter);

export default IndexRouter;
