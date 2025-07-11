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

export interface Award {
  icon: string;
  url: string;
  name: string;
  host: string;
  organizer: string;
  by: string;
  period: string;
  when: string;
}

export interface Project {
  icon: string;
  cover: string;
  priority: number;
  url: string;
  data: {
    title: string;
    description: string;
    startDate: string;
    endDate: string;
  };
}

export interface Team {
  priority: number;
  url: string;
  icon: string;
  name: string;
}