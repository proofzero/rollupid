import EarlyAccessPanel from '~/components/EarlyAccess/EarlyAccessPanel'
import blockchainSVG from '~/assets/early/blockchain.svg'

export default () => (
  <EarlyAccessPanel
    title="Blockchain"
    subtitle="Onboard users to blockchain"
    copy="Ethereum account abstraction and user deposit vault accounts provide secure and flexible management of funds on the Ethereum blockchain. With this feature, apps can sponsor gas fees can interact with a smart contract wallet using the Galaxy API, while each user's funds are kept in a separate deposit vault account, reducing the risk of unauthorized access or loss of funds."
    imgSrc={blockchainSVG}
    url={'https://docs.rollup.id/platform/console/blockchain'}
  />
)
