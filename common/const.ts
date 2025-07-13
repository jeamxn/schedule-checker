export const ERROR_MESSAGE = {
  UNAUTHORIZED: [401, "권한이 없는 사용자입니다."],
  NOT_FOUNDED_KEY: [404, "찾을 수 없는 Key입니다."],
  INVALID_DATETIME_FORMAT: [400, "잘못된 날짜 형식입니다."],
  INVALID_ROOM_ID: [400, "잘못된 방 ID입니다."],
  WRONG_PASSWORD: [403, "잘못된 비밀번호입니다."],
  USER_CREATE_FAILED: [500, "사용자 생성에 실패했습니다."],
} as const;