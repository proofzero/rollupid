import { Link } from "@react-navigation/native";
import { To } from "@react-navigation/native/lib/typescript/src/useLinkTo";

import React from "react";

type TradLinkProps = {
  screen: string;
  text: string;
};

const TradLink = ({ screen, text }: TradLinkProps) => {
  return (
    <Link
      style={{
        marginBottom: 8,
        fontFamily: "Inter_600SemiBold",
        fontSize: 12,
        fontWeight: "600",
        lineHeight: 15,
        textDecorationLine: "underline",
        color: "#3B63FF",
        flex: 1,
      }}
      // Can't get types to behave without cast
      to={{ screen } as any}
    >
      {text}
    </Link>
  );
};

export default TradLink;
