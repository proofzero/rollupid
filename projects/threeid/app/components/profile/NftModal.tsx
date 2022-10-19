import { Transition, Dialog } from "@headlessui/react";
import { Fragment } from "react";

import Text, {
  TextColor,
  TextSize,
  TextWeight,
} from "~/components/typography/Text";

const NftModal = ({
  isOpen,
  nft,
  handleClose,
}: {
  isOpen: boolean;
  nft: any;
  handleClose: (evt: any) => void;
}) => {
  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={handleClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel
                className="relative transform rounded-lg bg-white px-4 pt-5 pb-4 text-left shadow-xl transition-all sm:p-6"
                style={{
                  maxWidth: "80vw",
                }}
              >
                {nft && (
                  <div className="flex flex-col lg:flex-row max-w-full">
                    <div className="max-w-full lg:max-w-sm flex justify-center items-center">
                      <img className="object-cover rounded" src={nft.url} />
                    </div>

                    <div className="p-4 max-w-full lg:max-w-md">
                      <Text
                        className="mb-2"
                        size={TextSize.LG}
                        weight={TextWeight.Medium500}
                        color={TextColor.Gray900}
                      >
                        {nft.collectionTitle}
                      </Text>
                      <Text
                        className="mb-10"
                        size={TextSize.XL4}
                        weight={TextWeight.SemiBold600}
                        color={TextColor.Gray900}
                      >
                        {nft.title}
                      </Text>

                      <hr />

                      {nft.properties?.length && (
                        <div className="mt-8">
                          <Text
                            className="ml-1 mb-4"
                            size={TextSize.LG}
                            weight={TextWeight.SemiBold600}
                            color={TextColor.Gray900}
                          >
                            Properties
                          </Text>

                          <div className="flex flex-row max-w-md flex-wrap overflow-hidden">
                            {nft.properties.map(
                              (p: {
                                name: string;
                                value: any;
                                display: string;
                              }) => (
                                <div
                                  key={p.name}
                                  className="m-1 py-2 px-4 border rounded-md"
                                >
                                  <Text
                                    size={TextSize.XS}
                                    weight={TextWeight.Medium500}
                                    color={TextColor.Gray400}
                                  >
                                    {p.name.toUpperCase()}
                                  </Text>
                                  <Text
                                    size={TextSize.SM}
                                    weight={TextWeight.SemiBold600}
                                    color={TextColor.Gray700}
                                  >
                                    {p.value}
                                  </Text>
                                </div>
                              )
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
};

export default NftModal;
