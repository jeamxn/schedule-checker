import Elysia from "elysia";

import createRoomRouter from "./createRoom";
import getRoomRouter from "./getRoom";
import joinRouter from "./join";

const IndexRouter = new Elysia({
  name: "Index",
  prefix: "",
})
  .use(createRoomRouter)
  .use(getRoomRouter)
  .use(joinRouter);

export default IndexRouter;
