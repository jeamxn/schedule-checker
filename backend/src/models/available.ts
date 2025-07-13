import Elysia from "elysia";
import mongoose from "mongoose";

import { Available, IDocument } from "@common/types";

const NAME = "available";
type TYPE = Available;

const schema = new mongoose.Schema({
  roomId: { type: String, required: true },
  name: { type: String, required: true },
  password: { type: String, required: false },
  datetime: {
    type: Map,
    of: [String],
    required: true,
  },
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