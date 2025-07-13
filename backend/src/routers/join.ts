import Elysia, { t } from "elysia";

import { AvailableDateTime } from "@common/types";

import available from "@back/models/available";
import rooms from "@back/models/rooms";
import exit, { errorElysia } from "@back/utils/error";

const getCommonAvailableDateTime = (data: AvailableDateTime[]): AvailableDateTime => {
  if (data.length === 0) return {};

  const result: AvailableDateTime = {};

  const allDates = Object.keys(data[0]);
  for (const date of allDates) {
    let commonTimes = new Set(data[0][date]);

    for (let i = 1; i < data.length; i++) {
      if (!data[i][date]) {
        commonTimes = new Set(); // 이 날짜가 없는 경우 공통 시간 없음
        break;
      }
      const currentTimes = new Set(data[i][date]);
      commonTimes = new Set([...commonTimes].filter(time => currentTimes.has(time)));
    }

    if (commonTimes.size > 0) {
      result[date] = [...commonTimes].sort();
    }
  }

  return result;
};

const joinRouter = new Elysia().use(rooms.model).use(available.model).post(
  "join",
  async ({ availableModel, roomsModel, body, error }) => {
    const { roomId, name, password, datetime } = body;

    const room = await roomsModel.get(roomId);
    if (!room) {
      return exit(error, "INVALID_ROOM_ID");
    }

    let findDatetimes = await availableModel.db.find(
      { roomId },
      { datetime: 1, name: 1, _id: 1 },
      { lean: true },
    );
    let availableDateTimes = getCommonAvailableDateTime(
      findDatetimes
        .filter(item => item.datetime && Object.keys(item.datetime).length > 0)
        .map(item => item.datetime)
    );

    const findUser = await availableModel.db.findOne({
      roomId,
      name,
    }, {
      _id: 0,
      __v: 0,
    }, {
      lean: true,
    });
    if (!findUser) {
      const create = await availableModel.db.create({
        roomId,
        name,
        password,
        datetime: {},
      });
      if (!create) { 
        return exit(error, "USER_CREATE_FAILED");
      }
      const { __v, ...cleaned } = create.toObject();
      return {
        ...cleaned,
        all: availableDateTimes,
        users: findDatetimes,
      };
    }

    const findUserWithPassword = await availableModel.db.findOne({
      roomId,
      name,
      password,
    }, {
      __v: 0,
    }, {
      lean: true,
    });
    if (findUser && !findUserWithPassword) {
      return exit(error, "WRONG_PASSWORD");
    }

    if (datetime) {
      await availableModel.db.updateOne(
        { roomId, name, password },
        { datetime },
      );
      findDatetimes = await availableModel.db.find(
        { roomId },
        { datetime: 1, name: 1, _id: 1 },
        { lean: true },
      );
      availableDateTimes = getCommonAvailableDateTime(
        findDatetimes
          .filter(item => item.datetime && Object.keys(item.datetime).length > 0)
          .map(item => item.datetime)
      );
    }

    return {
      ...findUserWithPassword,
      all: availableDateTimes,
      users: findDatetimes,
    };
  },
  {
    body: t.Object({
      roomId: t.String(),
      name: t.String(),
      password: t.Optional(t.String()),
      datetime: t.Optional(t.Record(t.String(), t.Array(t.String()))),
    }),
    response: {
      ...errorElysia(["NOT_FOUNDED_KEY"]),
    },
  },
);

export default joinRouter;
