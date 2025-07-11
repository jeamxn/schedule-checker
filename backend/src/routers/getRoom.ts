import Elysia, { t } from "elysia";

import rooms from "@back/models/rooms";
import { errorElysia } from "@back/utils/error";

const getRoomRouter = new Elysia().use(rooms.model).get(
  "rooms/:id",
  async ({ roomsModel, params }) => {
    return roomsModel.get(params.id);
  },
  {
    params: t.Object({
      id: t.String(),
    }),
    response: {
      ...errorElysia(["NOT_FOUNDED_KEY"]),
    },
  },
);

export default getRoomRouter;
