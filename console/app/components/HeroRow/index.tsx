/**
 * @file app/shared/components/HeroRow/index.tsx
 */

import community from "~/images/community.svg";
import discord from "~/images/discord.svg";
import docs from "~/images/docs.svg";
import github from "~/images/github.svg";
import learn from "~/images/learn.svg";
import twitter from "~/images/twitter.svg";

// LinkButton
// -----------------------------------------------------------------------------

type LinkButtonProps = {
  // Icon to display
  icon: string,
  // Button display text
  text: string,
};

const LinkButton = (props: LinkButtonProps) => {
  return (
    <button className="w-1/2 md:w-auto md:mr-2 border border-slate-300 text-slate-500 background-transparent font-bold px-4 py-2 text-sm outline-none focus:outline-none ease-linear transition-all duration-150" type="button"><img className="align-baseline inline-block mr-2" src={props.icon} alt={`${props.text} icon`} />{props.text}</button>
  );
};

// ButtonGroup
// -----------------------------------------------------------------------------

type ButtonGroupProps = {
  // Buttons to organize.
  children: Array<typeof LinkButton>;
};

const ButtonGroup = (props: ButtonGroupProps) => {
  return (
    <div className="flex flex-col items-center gap-2 md:flex-row">
      {props.children}
    </div>
  );
};

// LearnBox
// -----------------------------------------------------------------------------

type LearnBoxProps = {
  // The icon to display
  icon: string,
  // The title to display
  title: string,
  // The text to display
  children: React.ReactNode
};

const LearnBox = (props: LearnBoxProps) => {
  return (
    <div className="bg-white p-4">
      <img className="inline-block mb-2 bg-indigo-200" src={props.icon} />
      <h4 className="text-xl font-bold mb-2">{props.title}</h4>
      <div className="text-slate-500">{props.children}</div>
    </div>
  );
};

// HeroRow
// -----------------------------------------------------------------------------

type HeroRowProps = {

};

export default function HeroRow(props: HeroRowProps) {
 return (
   <div className="flex flex-col gap-2 md:flex-row">
     <LearnBox icon={community} title="Join our community">
       <p className="mb-2">Doloribus dolores nostrum quia qui natus officia quod et dolorem. Sit repellendus qui ut at banditiis et quo et molestiae.</p>
       <ButtonGroup>
         <LinkButton icon={twitter} text="Twitter" />
         <LinkButton icon={discord} text="Discord" />
       </ButtonGroup>
     </LearnBox>

     <LearnBox icon={learn} title="Learn best practices">
       <p className="mb-2">Doloribus dolores nostrum quia qui natus officia quod et dolorem. Sit repellendus qui ut at banditiis et quo et molestiae.</p>
       <ButtonGroup>
         <LinkButton icon={github} text="GitHub" />
         <LinkButton icon={docs} text="Docs" />
       </ButtonGroup>
     </LearnBox>
   </div>
 );
}
