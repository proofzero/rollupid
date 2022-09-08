import { useEffect, useState } from "react";
import { RiArrowDropDownLine, RiArrowDropUpLine } from "react-icons/ri";

const dropdown = require("../../assets/dropdown.png");

type options = {
  content: {
    defaultExpanded: boolean;
    question: string;
    answer: any;
  };
};

const AccordionComponent = ({ content }: options) => {
  const [expanded, setExpanded] = useState(content.defaultExpanded);

  const borderStyle =
    content.question === "Who is behind this project?" ? "" : "border-down";

  const [imageCss, setImageCss] = useState({
    width: "14",
    height: "7",
    transform: expanded ? "rotate(0deg)" : "rotate(180deg)",
  });

  useEffect(() => {
    setImageCss({
      width: "14",
      height: "7",
      transform: expanded ? "rotate(0deg)" : "rotate(180deg)",
    });
  }, [expanded]);

  return (
    <div className={`py-3 ${borderStyle}`}>
      <div className="mb-3">
        <button
          onClick={() => {
            setExpanded(!expanded);
          }}
          className="faq-button"
        >
          <div className="dropdown">
            <h3 className="faq-header-question">{content.question}</h3>

            {expanded ? (
              <RiArrowDropDownLine className="faq-header-arrow" />
            ) : (
              <RiArrowDropUpLine className="faq-header-arrow" />
            )}
          </div>
        </button>
        {expanded && content.answer}
      </div>
    </div>
  );
};

export default AccordionComponent;
