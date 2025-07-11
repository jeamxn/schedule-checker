
import { redirect } from "next/navigation";
import React from "react";

import { Room } from "@common/types";

import instance from "@front/utils/instance";

import RoomIn from "./room";

const RoomsPage = async ({
  params,
}: {
  params: Promise<{ id: string }>;
  }) => {
  try {
    const { id } = await params; 
    const { data: room } = await instance.get<Room>(`/rooms/${id}`);
    return <RoomIn id={id} room={room} />;
  }
  catch {
    return redirect("/not-found");
  }
};

export default RoomsPage;