import { Button, ButtonSize, ButtonType } from "~/components/buttons";
import Text, {
  TextColor,
  TextSize,
  TextWeight,
} from "~/components/typography/Text";

const Kitchensink = () => {
  const textColorKeys = Object.keys(TextColor).filter((v) => isNaN(Number(v)));
  const textWeightKeys = Object.keys(TextWeight).filter((v) =>
    isNaN(Number(v))
  );
  const textSizeKeys = Object.keys(TextSize).filter((v) => isNaN(Number(v)));
  const buttonTypeKeys = Object.keys(ButtonType).filter((v) =>
    isNaN(Number(v))
  );
  const buttonSizeKeys = Object.keys(ButtonSize).filter((v) =>
    isNaN(Number(v))
  );

  const textColorValues = Object.values(TextColor).filter(
    (v) => !isNaN(Number(v))
  );
  const textWeightValues = Object.values(TextWeight).filter(
    (v) => !isNaN(Number(v))
  );
  const textSizeValues = Object.values(TextSize).filter(
    (v) => !isNaN(Number(v))
  );
  const buttonTypeValues = Object.values(ButtonType).filter(
    (v) => !isNaN(Number(v))
  );
  const buttonSizeValues = Object.values(ButtonSize).filter(
    (v) => !isNaN(Number(v))
  );

  let textElements = [];
  for (let i = 0; i < textColorKeys.length; i++) {
    for (let j = 0; j < textWeightKeys.length; j++) {
      for (let k = 0; k < textSizeKeys.length; k++) {
        const key = `${textColorKeys[i]}_${textWeightKeys[j]}_${textSizeKeys[k]}`;

        textElements.push(
          <Text
            color={textColorValues[i] as TextColor}
            weight={textWeightValues[j] as TextWeight}
            size={textSizeValues[k] as TextSize}
            key={key}
          >
            {key}
          </Text>
        );
      }
    }
  }

  let btnElements = [];
  for (let i = 0; i < buttonTypeKeys.length; i++) {
    for (let j = 0; j < buttonSizeKeys.length; j++) {
      const key = `${buttonTypeKeys[i]}_${buttonSizeKeys[j]}`;

      btnElements.push(
        <Button
          disabled={(buttonTypeValues[i] as ButtonType) === ButtonType.Disabled}
          type={buttonTypeValues[i] as ButtonType}
          size={buttonSizeValues[j] as ButtonSize}
          key={key}
        >
          {key}
        </Button>
      );
    }
  }

  return (
    <div className="overflow-hidden flex flex-col space-y-4 p-4">
      <section className="flex flex-row flex-wrap space-y-4 lg:space-x-4 justify-evenly items-baseline">
        {btnElements}
      </section>

      <section className="flex flex-row flex-wrap space-y-4 lg:space-x-4 justify-evenly items-baseline">
        {textElements}
      </section>
    </div>
  );
};

export default Kitchensink;
