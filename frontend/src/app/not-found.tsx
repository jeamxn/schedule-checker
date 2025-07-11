"use client";

import React from "react";

const NotFound = () => {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center gap-4 p-6">
      <p className="text-5xl font-bold">404 :(</p>
      <h1 className="text-2xl font-bold">존재하지 않는 방이에요.</h1>
      <p className="text-lg text-key/40">
        코드를 다시 확인해보거나, 방이 삭제되었는지 확인해주세요.
      </p>
    </div>
  );
};

export default NotFound;