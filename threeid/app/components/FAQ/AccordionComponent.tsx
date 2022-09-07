import { useEffect, useState } from "react";

const dropdown = require("../../assets/dropdown.png");

type options = {
  content: {
    defaultExpanded: boolean;
    question: string;
    answer: any;
  };
};

const imageCss = { height: "100%" };

const AccordionComponent = ({ content }: options) => {
  const [expanded, setExpanded] = useState(content.defaultExpanded);
  const [imageCss, setImageCss] = useState({
    width: "14",
    height: "7",
    transform: content.defaultExpanded ? "rotate(0deg)" : "rotate(180deg)",
  });

  useEffect(() => {
    setImageCss({
      width: "14",
      height: "7",
      transform: expanded ? "rotate(0deg)" : "rotate(180deg)",
    });
  }, [expanded]);

  return (
    <div>
      <div className="dropdown">
        <h3 className="faq-header-question">{content.question}</h3>
        <button
          onClick={() => {
            setExpanded(!expanded);
          }}
        >
          <img style={imageCss} src={dropdown} alt="dropdown arrow" />
        </button>
      </div>
      {expanded && content.answer}
    </div>
  );
};

export default AccordionComponent;
