import { t } from "elysia";

import { ERROR_MESSAGE } from "@common/const";
import { ERROR_KEY, ERROR_MESSAGES } from "@common/types";

const tmpElysia = t.Object({
  success: t.Boolean({
    default: false,
  }),
  code: t.String({
    default: "message" as ERROR_KEY,
  }),
  message: t.String({
    default: "msg" as ERROR_MESSAGES,
  }),
});
type ElysiaObj = typeof tmpElysia;

type Statuses<T extends ERROR_KEY[]> = (typeof ERROR_MESSAGE)[T[number]][0];
interface AdditionalElysia {
  isSignIn?: Boolean;
}

export const errorElysia = <T extends ERROR_KEY[]>(messages: T, additional?: AdditionalElysia) => {
  if (additional?.isSignIn) {
    messages.push("UNAUTHORIZED");
  }

  type S = Statuses<T>;
  const obj: Record<S, ElysiaObj> = {} as Record<S, ElysiaObj>;

  for (const message of messages) {
    const [status, msg] = ERROR_MESSAGE[message];
    obj[status as S] = t.Object({
      success: t.Boolean({ default: false }),
      code: t.String({
        default: message,
      }),
      message: t.String({
        default: msg,
      }),
    });
  }

  return obj;
};

const exit = (error: any, ERROR_KEY: ERROR_KEY) => {
  const [status, message] = ERROR_MESSAGE[ERROR_KEY];
  // set.status = status;
  // return {
  //   success: false,
  //   code: ERROR_KEY,
  //   message: message,
  // };
  return error(status, {
    success: false,
    code: ERROR_KEY,
    message: message,
  });
};

export default exit;
