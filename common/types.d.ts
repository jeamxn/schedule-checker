import { AxiosError } from "axios";
import { ObjectId, type Document } from "mongoose";

import { ERROR_MESSAGE } from "./const";
export type IDocument<T> = Document<ObjectId, any, T> & T & {
  _id: any;
};

export type ERROR_MESSAGE_TYPE = typeof ERROR_MESSAGE;
export type ERROR_KEY = keyof ERROR_MESSAGE_TYPE;
export type ERROR_STATUS = ERROR_MESSAGE_TYPE[ERROR_KEY][0];
export type ERROR_MESSAGES = ERROR_MESSAGE_TYPE[ERROR_KEY][1];
export type ERROR_RESPONSE = {
  success: false;
  code: ERROR_KEY;
  message: ERROR_MESSAGES;
};

export type ResponseError = AxiosError<{
  success: boolean;
  code: ERROR_KEY;
  message: ERROR_MESSAGES;
}>;

export interface Room {
  start: string;
  end: string;
  name: string;
}

export interface AvailableDateTime {
  [date: string]: string[];
}

export interface Available { 
  roomId: string;
  name: string;
  password?: string;
  datetime: AvailableDateTime;
}

export type AvailableApi = Available & {
  _id: string;
  all: AvailableDateTime;
  users: {
    _id: string;
    name: Available["name"];
    datetime: Available["datetime"];
  }[];
};