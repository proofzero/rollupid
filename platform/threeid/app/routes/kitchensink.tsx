import { FaTwitter } from "react-icons/fa";
import { Button, ButtonSize, ButtonType } from "~/components/buttons";
import InputText from "~/components/inputs/InputText";
import ProfileCard from "~/components/profile/ProfileCard";
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

  const sectionClasses =
    "flex flex-row flex-wrap space-y-4 lg:space-x-4 justify-evenly items-end";

  return (
    <div className="overflow-hidden flex flex-col space-y-4 p-4">
      <section className={sectionClasses}>
        <ProfileCard
          account="0x6c60Da9471181Aa54C648c6e201263A5501363F3"
          displayName="Foobar"
          avatarUrl="https://picsum.photos/200"
        />
        <ProfileCard
          account="0x6c60Da9471181Aa54C648c6e201263A5501363F3"
          displayName="Foobar"
          avatarUrl="https://picsum.photos/200"
          isNft={true}
        />
        <ProfileCard
          account="0x6c60Da9471181Aa54C648c6e201263A5501363F3"
          displayName="Foobar"
          avatarUrl="https://picsum.photos/200"
          isNft={true}
          claimed={new Date(2022, 8, 1)}
        />
        <ProfileCard
          account="0x6c60Da9471181Aa54C648c6e201263A5501363F3"
          displayName="Foobar"
          avatarUrl="https://picsum.photos/200"
          isNft={true}
          claimed={new Date(2022, 8, 1)}
          webUrl={"https://www.kubelt.com"}
        />
      </section>

      <section className={sectionClasses}>
        <InputText heading={"Empty"} />

        <InputText heading={"Placeholder"} placeholder="Placeholder Text" />

        <InputText heading={"Filled"} defaultValue="John Doe" />

        <InputText heading={"Leading Icon"} Icon={FaTwitter} />

        <InputText
          heading={"Trailing Icon"}
          Icon={FaTwitter}
          iconPosition="trailing"
        />

        <InputText heading={"Addon"} addon={"http://"} />

        <InputText
          heading={"Addon and icon"}
          addon={"http://"}
          Icon={FaTwitter}
        />

        <InputText heading={"Error"} defaultValue="John Doe" error={true} />
        <InputText
          heading={"Error"}
          Icon={FaTwitter}
          defaultValue="John Doe"
          error={true}
        />
        <InputText
          heading={"Error"}
          Icon={FaTwitter}
          iconPosition="trailing"
          defaultValue="John Doe"
          error={true}
        />
        <InputText
          heading={"Error"}
          addon={"http://"}
          Icon={FaTwitter}
          iconPosition="trailing"
          defaultValue="John Doe"
          error={true}
        />
      </section>

      <section className={sectionClasses}>{btnElements}</section>

      <section className={sectionClasses}>{textElements}</section>
    </div>
  );
};

export default Kitchensink;
