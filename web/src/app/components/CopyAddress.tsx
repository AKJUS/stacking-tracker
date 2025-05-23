"use client";
import { useState } from "react";
import { shortAddress } from "../common/utils";

type Props = {
  address: string;
};

export function CopyAddress({ address }: Props) {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
    }, 1000);
  };

  return (
    <button
      onClick={copyToClipboard}
      className="w-full md:w-auto mt-4 md:mt-0 flex justify-center md:inline-flex items-center gap-x-1 rounded-md bg-orange/10 text-orange stroke-orange px-2 py-2 text-sm hover:bg-orange hover:text-black hover:stroke-black"
    >
      {copied ? "Copied" : <>{shortAddress(address)}</>}

      <svg
        width="14"
        height="14"
        viewBox="0 0 14 14"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <g clipPath="url(#clip0_89_2661)">
          <path
            d="M11.667 4.6665H5.83366C5.18933 4.6665 4.66699 5.18884 4.66699 5.83317V11.6665C4.66699 12.3108 5.18933 12.8332 5.83366 12.8332H11.667C12.3113 12.8332 12.8337 12.3108 12.8337 11.6665V5.83317C12.8337 5.18884 12.3113 4.6665 11.667 4.6665Z"
            strokeWidth="1.25"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M2.33366 9.33317C1.69199 9.33317 1.16699 8.80817 1.16699 8.1665V2.33317C1.16699 1.6915 1.69199 1.1665 2.33366 1.1665H8.16699C8.80866 1.1665 9.33366 1.6915 9.33366 2.33317"
            strokeWidth="1.25"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>
        <defs>
          <clipPath id="clip0_89_2661">
            <rect width="14" height="14" fill="white" />
          </clipPath>
        </defs>
      </svg>
    </button>
  );
}
