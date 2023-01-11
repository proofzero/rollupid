import { FaCheckCircle } from 'react-icons/fa'

export const Links = ({ links }: any) =>
  links && (
    <div
      className="flex flex-col 
      sm:flex-row sm:flex-wrap
    justify-start lg:items-center text-gray-500 font-size-lg"
    >
      {links.map((link: any, i: number) => (
        <button
          key={`${link.name}-${link.url}-${i}`}
          className="
          bg-gray-100 hover:bg-gray-200
          transition-colors
          rounded-full
          text-gray-[#4b5563]
          flex
          justify-center
          items-center
          mt-[1.625rem] sm:mr-[16px]
          w-full sm:w-[131px] 
          h-[40px]"
        >
          <a href={link.url} className="flex flex-row items-center">
            {link.verified && <FaCheckCircle className="mr-[0.5rem]" />}
            {link.name}
          </a>
        </button>
      ))}
    </div>
  )
