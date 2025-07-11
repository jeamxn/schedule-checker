"use client";

import { useMutation } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React from "react";

import { ResponseError } from "@common/types";

import Button from "@front/components/button";
import Icons from "@front/components/icons";
import IconTitle from "@front/components/iconTitle";
import Input from "@front/components/input";
import instance from "@front/utils/instance";

const Laundry = () => {
  const router = useRouter();

  const [roomCode, setRoomCode] = React.useState("");
  const [name, setName] = React.useState("");
  const [start, setStart] = React.useState("");
  const [end, setEnd] = React.useState("");

  const { mutate: createRoom, isPending } = useMutation({
    mutationKey: ["createRoom", name, start, end],
    mutationFn: async () => {
      const response = await instance.post("/rooms", {
        name,
        start,
        end,
      });
      return response.data;
    },
    onSuccess: (data) => {
      router.push(`/room/${data}`);
    },
    onError: (error: ResponseError) => { 
      if (error.response?.data?.message) {
        alert(error.response.data.message);
      } else {
        alert("방 생성에 실패했습니다. 다시 시도해주세요.");
      }
    },
  });

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
        <IconTitle icon="Present">방 입장하기</IconTitle>
        <div className="w-full max-w-md max-md:max-w-full flex flex-row gap-2">
          <Input
            type="text"
            placeholder="방 코드 입력"
            value={roomCode}
            onChange={(e) => setRoomCode(e.target.value)}
          >
            <div>
              <Button onClick={() => {
                if (!roomCode) {
                  alert("방 코드를 입력해주세요.");
                  return;
                }
                router.push(`/room/${roomCode}`);
              }}>입장하기</Button>
            </div>
          </Input>
        </div>
      </div>

      <div className="flex flex-col gap-4 max-w-md max-md:max-w-full">
        <IconTitle icon="Beenhere">방 만들기</IconTitle>

        <div className="flex flex-col gap-3 w-full">
          <Input
            type="text"
            label="모임 이름"
            placeholder="ex) 여행 일정 정하기"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <Input
            label="시작 날짜"
            type="datetime-local"
            value={start}
            onChange={(e) => setStart(e.target.value)}
          />
          <Input
            label="종료 날짜"
            type="datetime-local"
            value={end}
            onChange={(e) => setEnd(e.target.value)}
          />
        </div>
        <Button
          disabled={!name || !start || !end || isPending}
          onClick={() => createRoom()}
        >만들기</Button>
      </div>


    </div>
  );
};

export default Laundry;