"use client";

import Link from "next/link";
import React from "react";

import { Room } from "@common/types";

import Button from "@front/components/button";
import Icons from "@front/components/icons";
import IconTitle from "@front/components/iconTitle";
import Input from "@front/components/input";

const RoomIn = ({ 
  room
}: {
  id: string;
  room: Room;
}) => {
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
          type="datetime-local"
          value={room.start}
          readOnly
        />
        <Input
          label="종료 날짜"
          type="datetime-local"
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
        >방 공유하기</Button>
      </div>

      <div className="flex flex-col gap-4 max-w-md max-md:max-w-full">
        <IconTitle icon="Nights">시간 맞추기</IconTitle>
      </div>
    </div>
  );
};

export default RoomIn;