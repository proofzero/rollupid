/**
 * @file app/shared/components/EmptyPrompt/index.tsx
 */

import { Link } from "@remix-run/react";

// EmptyPrompt
// -----------------------------------------------------------------------------
// A widget to display when there are no "items" to interact with, to
// prompt to user to do something.

type EmptyPromptProps = {
  // Icon to display
  icon: string,
  // Icon alt text
  alt: string,
  // Title text
  title: string,
  // More detailed description
  description: string,
  // Call to action text
  prompt: string,
  // Link target
  link: string,
};

export default function EmptyPrompt(props: EmptyPromptProps) {
  return (
    <div className="text-center mt-24">
      <img className="inline-block" src={props.icon} alt="Wallet icon" />
      <div className="text-black mt-4">{props.title}</div>
      <p className="text-slate-500">{props.description}</p>
      <Link to={props.link}><button className="bg-indigo-500 text-white px-4 py-2 mt-4">{props.prompt}</button></Link>
    </div>
  );
};
