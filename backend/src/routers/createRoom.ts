import dayjs from "dayjs";
import Elysia, { t } from "elysia";

import rooms from "@back/models/rooms";
import exit, { errorElysia } from "@back/utils/error";

const createRoomRouter = new Elysia().use(rooms.model).post(
  "rooms",
  async ({ roomsModel, body, error }) => {
    const start = dayjs(body.start);
    const end = dayjs(body.end);
    console.log("start", start, "end", end);
    if (
      !start.isValid()
      || !end.isValid()
      || start.isBefore(dayjs())
      || start.isAfter(end)
      || end.isBefore(dayjs())
    ) {
      return exit(error, "INVALID_DATETIME_FORMAT");
    }

    const add = await roomsModel.db.create({
      start: body.start,
      end: body.end,
      name: body.name,
    });

    return add._id.toString();
  },
  {
    body: t.Object({
      start: t.String(),
      end: t.String(),
      name: t.String(),
    }),
    response: {
      ...errorElysia(["NOT_FOUNDED_KEY"]),
    },
  },
);

export default createRoomRouter;
