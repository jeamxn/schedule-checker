"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import Link from "next/link";
import React from "react";

import dayjs from "@common/time";
import { AvailableApi, AvailableDateTime, ResponseError, Room } from "@common/types";

import Button from "@front/components/button";
import Icons from "@front/components/icons";
import IconTitle from "@front/components/iconTitle";
import Input from "@front/components/input";
import Select from "@front/components/select";
import instance from "@front/utils/instance";

const groupContinuousTimes = (date: string, times: string[]): string[] => {
  if (times.length === 0) return [];

  const sorted = times
    .map(t => dayjs(`${date} ${t}`, "YYYY-MM-DD HH:mm"))
    .sort((a, b) => a.valueOf() - b.valueOf());

  const result: string[] = [];
  let start = sorted[0];
  let prev = sorted[0];

  for (let i = 1; i < sorted.length; i++) {
    const curr = sorted[i];
    const diff = curr.diff(prev, "minute");

    if (diff === 10) {
      prev = curr;
    } else {
      if (start.isSame(prev)) {
        result.push(start.format("HH시 mm분"));
      } else {
        result.push(`${start.format("HH시 mm분")} ~ ${prev.format("HH시 mm분")}`);
      }
      start = curr;
      prev = curr;
    }
  }

  // 마지막 그룹 추가
  if (start.isSame(prev)) {
    result.push(start.format("HH시 mm분"));
  } else {
    result.push(`${start.format("HH시 mm분")} ~ ${prev.format("HH시 mm분")}`);
  }

  return result;
};

const RoomIn = ({
  id,
  room
}: {
  id: string;
  room: Room;
}) => {
  const start = React.useMemo(() => dayjs(room.start), [room.start]);
  const end = React.useMemo(() => dayjs(room.end), [room.end]);
  const diff = React.useMemo(() => end.diff(start, "days"), [start, end]);

  const months = React.useMemo(() => {
    const dates = Array.from({ length: diff + 1 }, (_, i) => start.add(i, "day"));

    const result: { title: string; weeks: (dayjs.Dayjs | null)[][] }[] = [];

    let currentMonth = -1;
    let monthDates: dayjs.Dayjs[] = [];

    const flushMonth = () => {
      if (monthDates.length === 0) return;

      const startPadding = monthDates[0].day();
      const endPadding = 6 - monthDates.at(-1)!.day();

      const paddedDates = [
        ...Array.from({ length: startPadding }, () => null),
        ...monthDates,
        ...Array.from({ length: endPadding }, () => null),
      ];

      const weeks: (dayjs.Dayjs | null)[][] = [];
      for (let i = 0; i < paddedDates.length; i += 7) {
        weeks.push(paddedDates.slice(i, i + 7));
      }

      result.push({
        title: monthDates[0].format("M월"),
        weeks,
      });
    };

    for (const date of dates) {
      if (date.month() !== currentMonth) {
        flushMonth();
        currentMonth = date.month();
        monthDates = [date];
      } else {
        monthDates.push(date);
      }
    }

    flushMonth();
    return result;
  }, [start, diff]);

  const [selectedDate, setSelectedDate] = React.useState<dayjs.Dayjs | null>(null);
  const [myAvailableDateTimes, setMyAvailableDateTimes] = React.useState<AvailableDateTime>({});
  // const [availableDAteTimes] = React.useState<AvailableDateTime[]>([]);
  // const mergedAvailableDateTimes = React.useMemo(() => {
  //   return [
  //     ...availableDAteTimes,
  //     myAvailableDateTimes,
  //   ];
  // }, [myAvailableDateTimes, availableDAteTimes]);


  const [name, setName] = React.useState("");
  const [password, setPassword] = React.useState("");

  const { data: myData, mutate: join, isPending: isPendingJoin } = useMutation({
    mutationKey: ["room", id, name, password],
    mutationFn: async () => {
      const response = await instance.post<AvailableApi>("/join", {
        roomId: id,
        name,
        password,
      });
      return response.data;
    },
    onSuccess: (data) => {
      setMyAvailableDateTimes(data.datetime);
      localStorage.setItem(`room-${id}`, JSON.stringify({
        name: data.name,
        password: data.password,
      }));
      return data;
    },
    onError: (error: ResponseError) => {
      if (error.response?.data?.message) {
        alert(error.response.data.message);
      } else {
        alert("방 참여에 실패했습니다. 다시 시도해주세요.");
      }
    }
  });
  const isLogined = React.useMemo(() => !!myData, [myData]);

  React.useLayoutEffect(() => {
    const storedData = localStorage.getItem(`room-${id}`);
    if (storedData) {
      const { name, password } = JSON.parse(storedData);
      setName(name);
      setPassword(password);
      setTimeout(() => {
        join();
      }, 1);
    }
  }, [id, join]);


  const { data } = useQuery({
    queryKey: ["room-save", id, name, password, myAvailableDateTimes],
    queryFn: async () => {
      const response = await instance.post<AvailableApi>("/join", {
        roomId: id,
        name,
        password,
        datetime: myAvailableDateTimes,
      });
      return response.data;
    },
    enabled: isLogined,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    initialData: {
      _id: myData?._id || "",
      roomId: id,
      name: myData?.name || "",
      password: myData?.password || "",
      datetime: myData?.datetime || {},
      all: myData?.all || {},
      users: [],
    },
  });

  const [selectedUserId, setSelectedUserId] = React.useState<string>(data._id);
  const selectedUser = React.useMemo(() => {
    return data.users.find(user => user._id === selectedUserId) || undefined;
  }, [data.users, selectedUserId]);

  return (
    <div className="w-full p-6 max-md:p-4 flex flex-col gap-9">
      <div className="w-full flex flex-col gap-12 max-md:gap-9">
        <Link href="/" className="w-fit">
          <button className="w-fit button-scale">
            <div className="flex flex-row items-center gap-2">
              <Icons.Logo className="w-8 h-8 fill-key" />
              <div className="flex flex-row items-start gap-2">
                <h1 className="font-bold text-2xl">시간 맞추기</h1>
              </div>
            </div>
          </button>
        </Link>
      </div>

      <div className="flex flex-col gap-4 max-w-md max-md:max-w-full">
        <IconTitle icon="Home">방 정보</IconTitle>
        <Input
          type="text"
          label="모임 이름"
          placeholder="ex) 여행 일정 정하기"
          value={room.name}
          readOnly
        />
        <Input
          label="시작 날짜"
          type="date"
          value={room.start}
          readOnly
        />
        <Input
          label="종료 날짜"
          type="date"
          value={room.end}
          readOnly
        />
        <Button
          onClick={() => {
            navigator.share({
              title: `시간 맞추기 방 이름: ${room.name}`,
              text: `방에 참여하려면 아래 링크를 클릭하세요:\n${window.location.href}`,
              url: window.location.href,
            }).catch(() => {
              navigator.clipboard.writeText(window.location.href);
              alert("URL이 클립보드에 복사되었습니다.");
            });
          }}
        >
          방 공유하기
        </Button>
      </div>

      <div className="flex flex-col gap-4 ">
        <IconTitle icon="Icecream">모두가 가능한 날짜 및 시간</IconTitle>
        <div>
          {
            Object.keys(data.all).length === 0 ? (
              <p className="text-key/30">아직 선택된 날짜가 없습니다.</p>
            ) : (
              <div className="flex flex-col gap-2">
                {
                  Object.entries(data.all).map(([date, times]) => {
                    const groupedTimes = groupContinuousTimes(date, times);
                    return groupedTimes.length ? (
                      <div key={date} className="flex flex-col items-start gap-2">
                        <p className="font-semibold">{dayjs(date).format("M월 D일")}</p>
                        <p className="text-key/70">{groupedTimes.join(", ")}</p>
                      </div>
                    ) : null;
                  })
                }
              </div>
            )
          }
        </div>
      </div>

      {
        isLogined ? (
          <div className="flex flex-col gap-4">
            <IconTitle icon="Beenhere">참가자별 정보</IconTitle>
            <Select.Col
              label="참가자 선택"
              value={selectedUserId}
              options={data.users.map(user => user.name)}
              values={data.users.map(user => user._id)}
              placeholder="참가자를 선택해주세요"
              onClick={async (value, index, _value) => {
                setSelectedUserId(_value || "");
              }}
            />
            {
              selectedUser ? (
                <div>
                  {
                    Object.keys(selectedUser.datetime).length === 0 ? (
                      <p className="text-key/30">아직 선택된 날짜가 없습니다.</p>
                    ) : (
                      <div className="flex flex-col gap-2">
                        {
                          Object.entries(selectedUser.datetime).map(([date, times]) => {
                            const groupedTimes = groupContinuousTimes(date, times);
                            return (
                              <div key={date} className="flex flex-col items-start gap-2">
                                <p className="font-semibold">{dayjs(date).format("M월 D일")}</p>
                                {
                                  groupedTimes.length > 0 ? (
                                    <p className="text-key/70">{groupedTimes.join(", ")}</p>
                                  ) : (
                                    <p className="text-key/30">선택된 시간이 없습니다.</p>
                                  )
                                }
                              </div>
                            );
                          })
                        }
                      </div>
                    )
                  }
                </div>
              ) : null
            }
          </div>
        ) : (
          <div className="flex flex-col gap-4 max-w-md max-md:max-w-full">
            <IconTitle icon="Beenhere">참가자 로그인하기</IconTitle>
            <Input
              type="text"
              label="내 닉네임"
              placeholder="ex) 멋쟁이박준범"
              value={name}
              onChange={(e) => setName(e.target.value)}
              readOnly={isLogined}
            />
            <Input
              type="password"
              label="비밀번호 (선택)"
              placeholder="ex) qkrwnsqjaqkqh"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              readOnly={isLogined}
            />
            <Button
              disabled={!name || isPendingJoin || isLogined}
              onClick={() => {
                join();
              }}
            >
              방 참여하기
            </Button>
          </div>
        )
      }

      {
        isLogined ? (
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <IconTitle icon="Nights">내 시간 선택하기</IconTitle>
              <p className="text-key/30">자신이 가능한 날짜를 선택하고, 가능한 시간을 선택해주세요!</p>
            </div>
            <div className="flex flex-row gap-3 w-full max-md:flex-col">
              <div className="w-full h-fit border border-key/20 rounded-xl p-3 flex flex-col gap-6 max-w-md max-md:max-w-full">
                <div
                  className="flex flex-col gap-1 w-full"
                >
                  <div
                    className="px-2 flex flex-row gap-4 w-full items-center justify-between"
                  >
                    {
                      Array.from({ length: 7 }, (_, i) => (
                        <p
                          className={[
                            i === 0 ? "text-red-500" :
                              i === 6 ? "text-blue-500" : ""
                          ].join(" ")}
                          key={i}
                        >
                          {dayjs().day(i).format("ddd")}
                        </p>
                      ))
                    }
                  </div>                    
                </div>
                {months.map((month, monthIndex) => (
                  <div
                    key={monthIndex}
                    className="flex flex-col gap-1 w-full"
                  >
                    <p className="text-lg font-semibold">{month.title}</p>
                    <div className="flex flex-col gap-6 w-full px-2">
                      {month.weeks.map((week, weekIndex) => (
                        <div
                          key={weekIndex}
                          className="flex flex-row gap-4 w-full items-center justify-between"
                        >
                          {
                            week.map((date, i) => {
                              if (!date) {
                                return <div key={i} className="w-10 h-10 p-2 -m-2" />;
                              }
                              const weekSelected = myAvailableDateTimes[date.format("YYYY-MM-DD")]?.length;
                              return (
                                <button
                                  key={i}
                                  className={[
                                    "flex items-center justify-center w-10 h-10 rounded-full outline-key/20",
                                    "button-scale transition-colors",
                                    selectedDate && selectedDate.isSame(date, "day") ? "outline-1 " : ""
                                  ].join(" ")}
                                  style={{
                                    backgroundColor: weekSelected > 0 ? `rgba(var(--key), ${weekSelected / 144})` : undefined,
                                  }}
                                  onClick={() => {
                                    if (selectedDate && selectedDate.isSame(date, "day")) {
                                      setSelectedDate(null);
                                    } else {
                                      setSelectedDate(date);
                                    }
                                  }}
                                >
                                  <p
                                    className={[
                                      date.day() === 0 ? "text-red-500" :
                                        date.day() === 6 ? "text-blue-500" : 
                                          weekSelected / 144 > 0.5 ? "text-background" : "",
                                    ].join(" ")}
                                  >{date.format("D")}</p>
                                </button>
                              );
                            })
                          }
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {
                selectedDate ? (
                  <div className="w-full border border-key/20 rounded-xl p-3 flex flex-col gap-2 max-w-md max-md:max-w-full">
                    <p className="font-medium">{selectedDate.format("M월 D일")} 가능한 시간 선택하기</p>
                    <p className="text-key/30 font-light">1칸당 10분입니다. 가능한 시간 모두 선택해주세요!</p>
                    <button
                      className={[
                        "w-32 flex flex-row cursor-pointer items-center transition-colors justify-center border border-key/20 rounded-lg h-8 overflow-hidden",
                        myAvailableDateTimes[selectedDate.format("YYYY-MM-DD")]?.length === 144 ? "bg-key border-background" : "bg-transparent hover:bg-key/10 border-key/20"
                      ].join(" ")}
                      onClick={() => {
                        const isAllSelected = myAvailableDateTimes[selectedDate.format("YYYY-MM-DD")]?.length === 144;
                        setMyAvailableDateTimes((prev) => { 
                          const dateKey = selectedDate.format("YYYY-MM-DD");
                          if (isAllSelected) {
                            return {
                              ...prev,
                              [dateKey]: [],
                            };
                          } else {
                            return {
                              ...prev,
                              [dateKey]: Array.from({ length: 24 * 6 }, (_, i) => {
                                const hour = Math.floor(i / 6).toString().padStart(2, "0");
                                const minute = (i % 6) * 10;
                                return `${hour}:${minute.toString().padStart(2, "0")}`;
                              }),
                            };
                          }
                        });
                      }}
                    >
                            
                      <p className={[
                        "text-sm whitespace-nowrap",
                        myAvailableDateTimes[selectedDate.format("YYYY-MM-DD")]?.length === 144 ? "text-background font-semibold" : "text-key/20"
                      ].join(" ")}>전체 선택</p>
                    </button>
                    <div className="flex flex-col gap-1 w-full">
                      {
                        Array.from({ length: 24 }, (_, hour) => {
                          const hourStr = hour.toString().padStart(2, "0");
                          const isTimeSelected = myAvailableDateTimes[selectedDate.format("YYYY-MM-DD")]?.filter(t => t.startsWith(`${hourStr}:`)).length === 6;
                          return (
                            <div key={hour} className="w-full flex flex-row gap-1">
                              <button
                                className={[
                                  "w-16 flex flex-row cursor-pointer items-center transition-colors justify-center border border-key/20 rounded-lg h-8 overflow-hidden",
                                  isTimeSelected ? "bg-key border-background" : "bg-transparent hover:bg-key/10 border-key/20"
                                ].join(" ")}
                                onClick={() => {
                                  setMyAvailableDateTimes((prev) => {
                                    const dateKey = selectedDate.format("YYYY-MM-DD");
                                    const newTimes = prev[dateKey] || [];
                                    const filteredTimes = newTimes.filter(t => !t.startsWith(`${hourStr}:`));
                                    if (isTimeSelected) {
                                      return {
                                        ...prev,
                                        [dateKey]: filteredTimes,
                                      };
                                    } else {
                                      return {
                                        ...prev,
                                        [dateKey]: [...filteredTimes, `${hourStr}:00`, `${hourStr}:10`, `${hourStr}:20`, `${hourStr}:30`, `${hourStr}:40`, `${hourStr}:50`],
                                      };
                                    }
                                  });
                                }}
                              >
                            
                                <p className={[
                                  "text-sm whitespace-nowrap",
                                  isTimeSelected ? "text-background font-semibold" : "text-key/20"
                                ].join(" ")}>{hour}시</p>
                              </button>
                              <div
                                className="flex flex-row items-center w-full border border-key/20 rounded-lg h-8 overflow-hidden"
                              >
                                {
                                  Array.from({ length: 6 }, (_, minute) => {
                                    const time = dayjs().hour(hour).minute(minute * 10);
                                    const isSelected = myAvailableDateTimes[selectedDate.format("YYYY-MM-DD")]?.includes(time.format("HH:mm"));
                                    return (
                                      <button
                                        key={minute}
                                        className={[
                                          "flex items-center justify-center cursor-pointer h-full w-full border-r last:border-r-0 transition-colors",
                                          isSelected ? "bg-key border-background" : "bg-transparent hover:bg-key/10 border-key/20"
                                        ].join(" ")}
                                        onClick={() => {
                                          setMyAvailableDateTimes((prev) => {
                                            const dateKey = selectedDate.format("YYYY-MM-DD");
                                            const newTimes = prev[dateKey] || [];
                                            if (isSelected) {
                                              return {
                                                ...prev,
                                                [dateKey]: newTimes.filter(t => t !== time.format("HH:mm")),
                                              };
                                            } else {
                                              return {
                                                ...prev,
                                                [dateKey]: [...newTimes, time.format("HH:mm")],
                                              };
                                            }
                                          });
                                        }}
                                      >
                                        <p className={[
                                          "text-sm",
                                          isSelected ? "text-background font-semibold" : "text-key/20"
                                        ].join(" ")}>{time.format("mm")}</p>
                                      </button>
                                    );
                                  })
                                }
                              </div>
                            </div>
                          );
                        })
                      }
                    </div>
                  </div>
                ) : null
              }
            </div>
          </div>
        ) : null
      }


    </div>
  );
};

export default RoomIn;
