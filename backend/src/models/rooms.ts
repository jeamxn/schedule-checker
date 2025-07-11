import Elysia from "elysia";
import mongoose from "mongoose";

import { IDocument, Room } from "@common/types";

const NAME = "rooms";
type TYPE = Room;

const schema = new mongoose.Schema({
  start: { type: String, required: true },
  end: { type: String, required: true },
  name: { type: String, required: true },
});

export const db = mongoose.model<IDocument<TYPE>>(NAME, schema);

const get = async (id: string) => {
  return db.findById(id, {
    _id: 0,
    __v: 0,
  }, { lean: true });
};

const model = new Elysia()
  .decorate(`${NAME}Model`, {
    db, get
  });
const exports = {
  [NAME]: {
    schema, db, model,
  },
};
export default exports[NAME];