"use client";

import React from "react";

import Label from "../label";

import { SelectProps } from ".";

const Row = ({
  value,
  label,
  options = [],
  values,
  onClick = () => { },
}: SelectProps) => {
  const [selected, setSelected] = React.useState(
    value ? values ? values.indexOf(value) : options.indexOf(value) : 0
  );
  return (
    <Label text={label}>
      <div className="w-full rounded-xl border border-key/20 p-1 flex flex-row items-center justify-center relative">
        <div className="absolute left-0 top-0 w-full h-full p-1 -z-10">
          <div
            className="h-full rounded-xl bg-key -z-10"
            style={{
              transform: `translateX(${selected * 100}%)`,
              transition: "transform 0.1s ease-out",
              width: `${100 / options.length}%`
            }}
          />
        </div>
        {
          options.map((item, index) => (
            <div
              key={index}
              className={[
                "w-full p-2 flex flex-row items-center justify-center rounded-lg cursor-pointer transition-all ease-out duration-200",
              ].join(" ")}
              onClick={async () => {
                setSelected(index);
                await onClick(item, index, values ? values[index] : undefined);
              }}
            >
              <p className={[
                "font-semibold text-center transition-all ease-out duration-200",
                selected === index ? "text-background" : "text-key/20",
              ].join(" ")}>
                {item}
              </p>
            </div>
          ))
        }
      </div>
    </Label>
  );
};

export default Row;