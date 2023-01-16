const LoadingGrid = ({ numberOfCells = 10 }) => {
  const performer = Array.from(Array(numberOfCells))

  return (
    <>
      <div className="mt-[92px] grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-10">
        {performer.map((item: any, i: number) => {
          return (
            <div
              key={i}
              className="w-full h-[550px] sm:h-80 md:h-72 lg:h-56 bg-gray-200 animate-pulse rounded-lg"
            ></div>
          )
        })}
      </div>
    </>
  )
}

export default LoadingGrid

export const LoadingGridSquares = ({ numberOfCells = 10 }) => {
  const performer = Array.from(Array(numberOfCells))

  return (
    <>
      <div
        className="mt-[82px] mx-[32px] grid 
      grid-cols-5 
      max-[1280px]:grid-cols-4
      max-[1024px]:grid-cols-3
      max-[768px]:grid-cols-2
      max-[640px]:grid-cols-1
      gap-10"
      >
        {performer.map((item: any, i: number) => {
          return (
            <div
              key={i}
              className="w-full lg:h-[8rem]
              md:h-[11rem] sm:h-[12rem] h-[20rem]
              bg-gray-200 animate-pulse rounded-lg"
            ></div>
          )
        })}
      </div>
    </>
  )
}

export const LoadingGridSquaresGallery = ({ numberOfCells = 10 }) => {
  const performer = Array.from(Array(numberOfCells))

  return (
    <>
      {performer.map((item: any, i: number) => {
        return (
          <div
            key={i}
            className="w-full 
            h-[12rem] md:h-72 lg:h-56 
              bg-gray-200 animate-pulse rounded-lg"
          ></div>
        )
      })}
    </>
  )
}
